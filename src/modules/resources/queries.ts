import "server-only";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const uuid = z.string().uuid();

export async function listResources(caseId: string) {
  if (!uuid.safeParse(caseId).success) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_resources")
    .select("id, title, resource_type, created_at, source_assistant_id")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listResources", error.code);
    throw new Error("No se pudieron cargar los recursos");
  }
  return data;
}

export async function getResource(caseId: string, resourceId: string) {
  if (!uuid.safeParse(caseId).success || !uuid.safeParse(resourceId).success) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_resources")
    .select("id, title, resource_type, content, created_at, updated_at")
    .eq("id", resourceId)
    .eq("case_id", caseId)
    .maybeSingle();
  if (error) {
    console.error("getResource", error.code);
    throw new Error("No se pudo cargar el recurso");
  }
  return data;
}
