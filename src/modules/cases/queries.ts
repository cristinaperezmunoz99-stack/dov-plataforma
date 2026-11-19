import "server-only";
import { createClient } from "@/lib/supabase/server";
import { caseIdSchema, sanitizeSearch } from "./schemas";

const LIST_COLUMNS = "id, case_code, title, updated_at" as const;

export type CaseListItem = {
  id: string;
  case_code: string;
  title: string;
  updated_at: string;
};

export async function listCases({ query, limit = 100 }: { query?: string; limit?: number } = {}) {
  const supabase = await createClient();
  let request = supabase
    .from("cases")
    .select(LIST_COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(limit);

  const q = query ? sanitizeSearch(query) : "";
  if (q) {
    request = request.or(`case_code.ilike.%${q}%,title.ilike.%${q}%`);
  }

  const { data, error } = await request;
  if (error) {
    console.error("listCases", error.code);
    throw new Error("No se pudieron cargar los casos");
  }
  return data satisfies CaseListItem[];
}

export async function getCase(id: string) {
  if (!caseIdSchema.safeParse(id).success) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .select("id, case_code, title, general_context, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getCase", error.code);
    throw new Error("No se pudo cargar el caso");
  }
  return data;
}
