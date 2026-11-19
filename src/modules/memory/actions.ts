"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";
import { privacyBlockMessage } from "@/lib/privacy/pii-check";
import { createClient } from "@/lib/supabase/server";
import { type MemoryFormState, memoryContentSchema, uuidSchema } from "./schemas";

function memoryPath(caseId: string) {
  return `/casos/${caseId}/memoria`;
}

function validate(value: string): MemoryFormState | { content: string } {
  const parsed = memoryContentSchema.safeParse(value);
  if (!parsed.success) return { value, error: parsed.error.issues[0]?.message };
  const privacyWarning = privacyBlockMessage(parsed.data);
  if (privacyWarning) return { value, privacyWarning };
  return { content: parsed.data };
}

export async function addMemory(
  caseId: string,
  categoryId: string,
  _prev: MemoryFormState,
  formData: FormData,
): Promise<MemoryFormState> {
  await requireUser();
  const value = String(formData.get("content") ?? "");
  if (!uuidSchema.safeParse(caseId).success || !uuidSchema.safeParse(categoryId).success) {
    return { value, error: es.cases.notFound };
  }
  const result = validate(value);
  if (!("content" in result)) return result;

  const supabase = await createClient();
  const { error } = await supabase
    .from("case_memory")
    .insert({ case_id: caseId, category_id: categoryId, content: result.content });
  if (error) {
    console.error("addMemory", error.code);
    return { value, error: es.common.genericError };
  }
  revalidatePath(memoryPath(caseId));
  return { value: "", savedAt: Date.now() };
}

export async function updateMemory(
  caseId: string,
  entryId: string,
  _prev: MemoryFormState,
  formData: FormData,
): Promise<MemoryFormState> {
  await requireUser();
  const value = String(formData.get("content") ?? "");
  if (!uuidSchema.safeParse(caseId).success || !uuidSchema.safeParse(entryId).success) {
    return { value, error: es.cases.notFound };
  }
  const result = validate(value);
  if (!("content" in result)) return result;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_memory")
    .update({ content: result.content })
    .eq("id", entryId)
    .eq("case_id", caseId)
    .select("id");
  if (error || !data?.length) {
    if (error) console.error("updateMemory", error.code);
    return { value, error: es.common.genericError };
  }
  revalidatePath(memoryPath(caseId));
  return { value: result.content, savedAt: Date.now() };
}

export async function deleteMemory(caseId: string, entryId: string): Promise<void> {
  await requireUser();
  if (!uuidSchema.safeParse(caseId).success || !uuidSchema.safeParse(entryId).success) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("case_memory")
    .delete()
    .eq("id", entryId)
    .eq("case_id", caseId);
  if (error) console.error("deleteMemory", error.code);
  revalidatePath(memoryPath(caseId));
}
