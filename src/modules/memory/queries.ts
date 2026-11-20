import "server-only";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "./schemas";

export type MemoryCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  mode: string;
};
export type MemoryEntry = {
  id: string;
  category_id: string;
  content: string;
  updated_at: string;
};

export async function listMemoryCategories(): Promise<MemoryCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memory_categories")
    .select("id, slug, name, description, mode")
    .order("sort_order");
  if (error) {
    console.error("listMemoryCategories", error.code);
    throw new Error("No se pudieron cargar las categorías");
  }
  return data;
}

export async function listMemory(caseId: string): Promise<MemoryEntry[]> {
  if (!uuidSchema.safeParse(caseId).success) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_memory")
    .select("id, category_id, content, updated_at")
    .eq("case_id", caseId)
    .order("created_at");
  if (error) {
    console.error("listMemory", error.code);
    throw new Error("No se pudo cargar la memoria");
  }
  return data;
}
