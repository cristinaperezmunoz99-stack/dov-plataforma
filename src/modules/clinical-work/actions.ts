"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";
import { privacyBlockMessage } from "@/lib/privacy/pii-check";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/modules/cases/format";
import { RESOURCES_TARGET, deriveTitle } from "./targets";

const inputSchema = z.object({
  caseId: z.string().uuid(),
  conversationId: z.string().uuid(),
  target: z.string().regex(/^[a-z0-9-]{2,40}$/),
  content: z.string().trim().min(1).max(60000),
});

export type SaveResult = { ok?: true; href?: string; error?: string; privacyWarning?: string };

/**
 * Guarda una respuesta de un asistente en una sección de trabajo clínico o en Recursos.
 * Secciones de versión única: sustituye la entrada vigente.
 */
export async function saveFromChat(input: {
  caseId: string;
  conversationId: string;
  target: string;
  content: string;
}): Promise<SaveResult> {
  await requireUser();
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { error: es.memory.max };
  const { caseId, conversationId, target, content } = parsed.data;

  const privacyWarning = privacyBlockMessage(content);
  if (privacyWarning) return { privacyWarning };

  const supabase = await createClient();
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, assistant_id")
    .eq("id", conversationId)
    .eq("case_id", caseId)
    .maybeSingle();
  if (!conversation) return { error: es.conversations.notFound };

  if (target === RESOURCES_TARGET) {
    const { data: assistant } = await supabase
      .from("assistants")
      .select("name")
      .eq("id", conversation.assistant_id)
      .maybeSingle();
    const title =
      deriveTitle(content) ??
      es.resources.fallbackTitle(assistant?.name ?? "", formatDate(new Date().toISOString()));
    const { data, error } = await supabase
      .from("case_resources")
      .insert({ case_id: caseId, title, content, source_assistant_id: conversation.assistant_id })
      .select("id")
      .single();
    if (error || !data) {
      console.error("saveFromChat resource", error?.code);
      return { error: es.common.genericError };
    }
    revalidatePath(`/casos/${caseId}/recursos`);
    return { ok: true, href: `/casos/${caseId}/recursos/${data.id}` };
  }

  const { data: category } = await supabase
    .from("memory_categories")
    .select("id, mode")
    .eq("slug", target)
    .maybeSingle();
  if (!category) return { error: es.common.genericError };

  let error: { code?: string } | null = null;
  if (category.mode === "single") {
    const { data: existing } = await supabase
      .from("case_memory")
      .select("id")
      .eq("case_id", caseId)
      .eq("category_id", category.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing) {
      ({ error } = await supabase.from("case_memory").update({ content }).eq("id", existing.id));
    } else {
      ({ error } = await supabase
        .from("case_memory")
        .insert({ case_id: caseId, category_id: category.id, content }));
    }
  } else {
    ({ error } = await supabase
      .from("case_memory")
      .insert({ case_id: caseId, category_id: category.id, content }));
  }

  if (error) {
    console.error("saveFromChat memory", error.code);
    return { error: es.common.genericError };
  }
  revalidatePath(`/casos/${caseId}/memoria`);
  return { ok: true, href: `/casos/${caseId}/memoria` };
}
