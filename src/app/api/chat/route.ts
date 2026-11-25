import { after, NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { aiProvider } from "@/lib/ai";
import { estimateCostUsd } from "@/lib/ai/pricing";
import type { ChatTurn } from "@/lib/ai/provider";
import { es } from "@/lib/i18n/es";
import { missingLegalAcceptances } from "@/modules/legal/queries";
import { formatDate } from "@/modules/cases/format";
import { getUsageStatus } from "@/modules/usage/queries";
import { privacyBlockMessage } from "@/lib/privacy/pii-check";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { buildCaseContext } from "@/modules/conversations/context";
import { STREAM_ERROR_MARKER } from "@/modules/conversations/stream";

// Respuestas largas (formulaciones completas) pueden tardar más de un minuto.
export const maxDuration = 300;

const HISTORY_MAX = 40;
const HISTORY_STEP = 10;
const HISTORY_FETCH = 200;
const HISTORY_TOKEN_BUDGET = 60_000;
const RATE_LIMIT_PER_MINUTE = 8;

const bodySchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().trim().min(1).max(20000),
});

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Caché incremental de la conversación: marca el último turno anterior al mensaje nuevo.
 * En la siguiente llamada, instrucciones + contexto del caso + historial se leen de caché
 * (10 % del precio de entrada) y solo se paga completo lo nuevo.
 */
function withHistoryCache(turns: ChatTurn[]): ChatTurn[] {
  return turns.map((t, i) => (i === turns.length - 1 ? { ...t, cache: true } : t));
}

/**
 * Ventana de historial estable: se descartan los mensajes más antiguos en bloques de
 * HISTORY_STEP para que el comienzo del historial no cambie en cada turno (si cambiara,
 * la caché no serviría). Además se respeta un presupuesto aproximado de tokens.
 */
function stableWindow<T extends { content: string }>(all: T[]): T[] {
  let start = 0;
  if (all.length > HISTORY_MAX) {
    start = Math.ceil((all.length - HISTORY_MAX) / HISTORY_STEP) * HISTORY_STEP;
  }
  const approxTokens = (from: number) =>
    all.slice(from).reduce((n, m) => n + Math.ceil(m.content.length / 3.5), 0);
  while (start < all.length - 2 && approxTokens(start) > HISTORY_TOKEN_BUDGET) start += HISTORY_STEP;
  return all.slice(Math.min(start, Math.max(0, all.length - 2)));
}

/** Une mensajes consecutivos del mismo rol y garantiza que empieza por el usuario. */
function normalizeTurns(turns: ChatTurn[]): ChatTurn[] {
  const out: ChatTurn[] = [];
  for (const t of turns) {
    const last = out[out.length - 1];
    if (last && last.role === t.role) last.content += `\n\n${t.content}`;
    else out.push({ ...t });
  }
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}

export async function POST(request: NextRequest) {
  const t = es.chat.errors;

  // 1. Autenticación
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return fail(401, t.unauthorized);
  if ((await missingLegalAcceptances(userId)).length > 0) return fail(403, es.legal.gateDescription);

  // 1b. Suscripción y límites del plan (antes de cualquier gasto)
  const usage = await getUsageStatus();
  if (usage.blocked) {
    return usage.reason === "no_plan"
      ? fail(402, es.usage.noPlan)
      : fail(429, es.usage.limitReached(formatDate(usage.periodEnd ?? usage.periodStart)));
  }

  // 2. Validación de la entrada
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const tooLong = parsed.error.issues.some((i) => i.code === "too_big");
    return fail(400, tooLong ? t.tooLong : t.generic);
  }
  const { conversationId, message } = parsed.data;

  // 3. La conversación (y por tanto el caso) pertenece al usuario: RLS
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, case_id, assistant_id, title")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conversation) return fail(404, t.notFound);

  // 4. Privacidad
  const privacyWarning = privacyBlockMessage(message);
  if (privacyWarning) return fail(422, privacyWarning);

  // 5. Límite de frecuencia
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("role", "user")
    .gte("created_at", since);
  if ((count ?? 0) >= RATE_LIMIT_PER_MINUTE) return fail(429, t.rateLimited);

  // 6. Configuración del asistente (solo servidor)
  const admin = createAdminClient();
  const { data: assistant, error: assistantError } = await admin
    .from("assistants")
    .select("id, active")
    .eq("id", conversation.assistant_id)
    .maybeSingle();
  if (assistantError) {
    console.error("chat load assistant", assistantError.code, assistantError.message);
    return fail(503, t.unavailable);
  }
  if (!assistant?.active) return fail(409, t.unavailable);

  const { data: version, error: versionError } = await admin
    .from("assistant_versions")
    .select("id, system_prompt, model, max_tokens")
    .eq("assistant_id", assistant.id)
    .eq("is_current", true)
    .maybeSingle();
  if (versionError) console.error("chat load version", versionError.code, versionError.message);
  if (!version) return fail(503, t.unavailable);

  // 7. Contexto del caso e historial (cliente del usuario: RLS)
  const [caseContext, historyRes] = await Promise.all([
    buildCaseContext(supabase, conversation.case_id),
    supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(HISTORY_FETCH),
  ]);
  const history = stableWindow((historyRes.data ?? []).reverse()).map((m) => ({
    role: m.role as ChatTurn["role"],
    content: m.content,
  }));

  // 8. Guardar el mensaje del usuario
  const { error: insertError } = await admin.from("messages").insert({
    conversation_id: conversation.id,
    user_id: userId,
    role: "user",
    content: message,
  });
  if (insertError) {
    console.error("chat insert user message", insertError.code);
    return fail(500, t.generic);
  }

  // Título automático y marca de actualización
  await supabase
    .from("conversations")
    .update({ title: conversation.title || message.slice(0, 80) })
    .eq("id", conversation.id);

  // 9. Llamada a la IA en streaming. El trabajo continúa aunque el cliente se desconecte.
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const send = (text: string) => {
    writer.write(encoder.encode(text)).catch(() => {
      // El cliente se ha desconectado: seguimos generando para guardar la respuesta.
    });
  };

  const work = (async () => {
    try {
      const result = await aiProvider.streamChat(
        {
          model: version.model,
          maxTokens: version.max_tokens,
          system: [{ text: version.system_prompt }, { text: caseContext, cache: true }],
          messages: withHistoryCache(normalizeTurns([...history, { role: "user", content: message }])),
        },
        send,
      );

      if (result.text.trim()) {
        const { error } = await admin.from("messages").insert({
          conversation_id: conversation.id,
          user_id: userId,
          role: "assistant",
          content: result.text,
          assistant_version_id: version.id,
        });
        if (error) console.error("chat insert assistant message", error.code);
      }

      const { error: usageError } = await admin.from("usage_events").insert({
        user_id: userId,
        case_id: conversation.case_id,
        conversation_id: conversation.id,
        assistant_id: assistant.id,
        assistant_version_id: version.id,
        model: version.model,
        input_tokens: result.usage.inputTokens,
        output_tokens: result.usage.outputTokens,
        cache_creation_input_tokens: result.usage.cacheCreationInputTokens,
        cache_read_input_tokens: result.usage.cacheReadInputTokens,
        estimated_cost_usd: estimateCostUsd(version.model, result.usage),
      });
      if (usageError) console.error("chat insert usage", usageError.code);
    } catch (error) {
      const name = error instanceof Error ? error.name : "unknown";
      const status = (error as { status?: number })?.status;
      console.error("chat ai error", name, status ?? "");
      send(STREAM_ERROR_MARKER);
    } finally {
      writer.close().catch(() => {});
    }
  })();

  after(() => work);

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
