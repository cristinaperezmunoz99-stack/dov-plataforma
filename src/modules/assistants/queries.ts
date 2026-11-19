import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Solo datos públicos del asistente. Los prompts nunca salen de assistant_versions. */
export async function listActiveAssistants() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assistants")
    .select("id, slug, name, description")
    .eq("active", true)
    .order("sort_order");
  if (error) {
    console.error("listActiveAssistants", error.code);
    throw new Error("No se pudieron cargar los asistentes");
  }
  return data;
}
