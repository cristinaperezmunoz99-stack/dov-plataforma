"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";
import { privacyBlockMessage } from "@/lib/privacy/pii-check";
import { createClient } from "@/lib/supabase/server";

const uuid = z.string().uuid();
const r = es.resources;

const resourceSchema = z.object({
  title: z.string().trim().min(1, r.titleRequired).max(200, r.tooLong),
  content: z.string().trim().min(1).max(60000, r.tooLong),
});

export type ResourceFormState = {
  error?: string;
  privacyWarning?: string;
  success?: string;
  values?: { title: string; content: string };
};

export async function updateResource(
  caseId: string,
  resourceId: string,
  _prev: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  await requireUser();
  const values = {
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
  };
  if (!uuid.safeParse(caseId).success || !uuid.safeParse(resourceId).success) {
    return { values, error: r.notFound };
  }
  const parsed = resourceSchema.safeParse(values);
  if (!parsed.success) return { values, error: parsed.error.issues[0]?.message };
  const privacyWarning = privacyBlockMessage(parsed.data.title, parsed.data.content);
  if (privacyWarning) return { values, privacyWarning };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_resources")
    .update(parsed.data)
    .eq("id", resourceId)
    .eq("case_id", caseId)
    .select("id");
  if (error || !data?.length) {
    if (error) console.error("updateResource", error.code);
    return { values, error: es.common.genericError };
  }
  revalidatePath(`/casos/${caseId}/recursos`);
  revalidatePath(`/casos/${caseId}/recursos/${resourceId}`);
  return { values: parsed.data, success: r.saved };
}

export async function deleteResource(caseId: string, resourceId: string) {
  await requireUser();
  if (!uuid.safeParse(caseId).success || !uuid.safeParse(resourceId).success) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("case_resources")
    .delete()
    .eq("id", resourceId)
    .eq("case_id", caseId);
  if (error) console.error("deleteResource", error.code);
  revalidatePath(`/casos/${caseId}/recursos`);
  redirect(`/casos/${caseId}/recursos`);
}
