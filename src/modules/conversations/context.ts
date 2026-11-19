import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const RECENT_SESSIONS = 5;

/**
 * Construye el bloque de contexto del caso que recibe el asistente.
 * Se lee con el cliente del usuario: RLS garantiza que solo entra información suya.
 * El contenido va delimitado por etiquetas para separarlo de las instrucciones.
 */
export async function buildCaseContext(
  supabase: SupabaseClient<Database>,
  caseId: string,
): Promise<string> {
  const [caseRes, catRes, memRes, sesRes] = await Promise.all([
    supabase.from("cases").select("case_code, title, general_context").eq("id", caseId).single(),
    supabase.from("memory_categories").select("id, name").order("sort_order"),
    supabase
      .from("case_memory")
      .select("category_id, content")
      .eq("case_id", caseId)
      .order("created_at"),
    supabase
      .from("sessions")
      .select("session_number, date, summary, relevant_info, changes")
      .eq("case_id", caseId)
      .order("session_number", { ascending: false })
      .limit(RECENT_SESSIONS),
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
      return `### ${cat.name}\n${entries.map((e) => `- ${e.content}`).join("\n")}`;
    })
    .filter(Boolean);
  parts.push(
    `## Memoria del caso\n${memorySections.length ? memorySections.join("\n\n") : "(sin entradas)"}`,
  );

  const sessions = sesRes.data ?? [];
  if (sessions.length) {
    const lines = sessions.map((s) => {
      const fields = [
        s.summary && `Resumen: ${s.summary}`,
        s.relevant_info && `Información relevante: ${s.relevant_info}`,
        s.changes && `Cambios respecto a sesiones anteriores: ${s.changes}`,
      ].filter(Boolean);
      return `### Sesión ${s.session_number} (${s.date})\n${fields.join("\n") || "(sin resumen)"}`;
    });
    parts.push(`## Sesiones recientes (de la más reciente a la más antigua)\n${lines.join("\n\n")}`);
  } else {
    parts.push("## Sesiones recientes\n(sin sesiones registradas)");
  }

  return [
    "<informacion_del_caso>",
    "Información registrada por el psicólogo en la plataforma sobre este caso.",
    "",
    parts.join("\n\n"),
    "</informacion_del_caso>",
  ].join("\n");
}
