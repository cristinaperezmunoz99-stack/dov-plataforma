import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Construye el bloque de contexto del caso que recibe el asistente.
 * Se lee con el cliente del usuario: RLS garantiza que solo entra información suya.
 * El contenido va delimitado por etiquetas para separarlo de las instrucciones.
 */
export async function buildCaseContext(
  supabase: SupabaseClient<Database>,
  caseId: string,
): Promise<string> {
  const [caseRes, catRes, memRes, resRes] = await Promise.all([
    supabase.from("cases").select("case_code, title, general_context").eq("id", caseId).single(),
    supabase.from("memory_categories").select("id, name").order("sort_order"),
    supabase
      .from("case_memory")
      .select("category_id, content")
      .eq("case_id", caseId)
      .order("created_at"),
    supabase
      .from("case_resources")
      .select("title, created_at")
      .eq("case_id", caseId)
      .order("created_at"),
  ]);

  if (caseRes.error || !caseRes.data) throw new Error("No se pudo cargar el caso");
  const c = caseRes.data;
  const parts: string[] = [];

  parts.push(`## Caso\nCódigo: ${c.case_code}${c.title ? `\nTítulo interno: ${c.title}` : ""}`);
  parts.push(`## Contexto general\n${c.general_context || "(sin contexto general)"}`);

  const memory = memRes.data ?? [];
  const memorySections = (catRes.data ?? [])
    .map((cat) => {
      const entries = memory.filter((m) => m.category_id === cat.id);
      if (entries.length === 0) return null;
      return `### ${cat.name}\n${entries.map((e) => e.content).join("\n\n---\n\n")}`;
    })
    .filter(Boolean);
  parts.push(
    `## Trabajo clínico del caso\n${memorySections.length ? memorySections.join("\n\n") : "(sin entradas)"}`,
  );

  const resources = resRes.data ?? [];
  parts.push(
    `## Recursos ya preparados para este caso\n${
      resources.length
        ? resources.map((r) => `- ${r.title} (${r.created_at.slice(0, 10)})`).join("\n")
        : "(ninguno)"
    }`,
  );

  return [
    "<informacion_del_caso>",
    "Información registrada por el psicólogo en la plataforma sobre este caso.",
    "Úsala como punto de partida: no vuelvas a pedir datos que ya aparezcan aquí.",
    "Si en la conversación el psicólogo aporta datos que actualizan o contradicen esta información, prevalece lo que diga en la conversación.",
    "",
    parts.join("\n\n"),
    "</informacion_del_caso>",
  ].join("\n");
}
