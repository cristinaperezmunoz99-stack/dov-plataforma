import "server-only";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "./schemas";

export async function listSessions(caseId: string) {
  if (!uuidSchema.safeParse(caseId).success) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("id, session_number, date, summary")
    .eq("case_id", caseId)
    .order("session_number", { ascending: false });
  if (error) {
    console.error("listSessions", error.code);
    throw new Error("No se pudieron cargar las sesiones");
  }
  return data;
}

export async function getSession(caseId: string, sessionId: string) {
  if (!uuidSchema.safeParse(caseId).success || !uuidSchema.safeParse(sessionId).success) {
    return null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("id, session_number, date, summary, notes, relevant_info, changes")
    .eq("id", sessionId)
    .eq("case_id", caseId)
    .maybeSingle();
  if (error) {
    console.error("getSession", error.code);
    throw new Error("No se pudo cargar la sesión");
  }
  return data;
}
