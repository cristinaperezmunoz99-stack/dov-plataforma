"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";
import { privacyBlockMessage } from "@/lib/privacy/pii-check";
import { createClient } from "@/lib/supabase/server";
import {
  type CaseFormState,
  type CaseFormValues,
  type DeleteCaseState,
  caseIdSchema,
  caseInputSchema,
} from "./schemas";

function readValues(formData: FormData): CaseFormValues {
  return {
    title: String(formData.get("title") ?? ""),
    general_context: String(formData.get("general_context") ?? ""),
  };
}

/** Bloquea el guardado si el texto parece contener datos identificativos. */
function privacyCheck(values: CaseFormValues): string | undefined {
  return privacyBlockMessage(values.title, values.general_context);
}

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
  const out: CaseFormState["fieldErrors"] = {};
  for (const issue of issues) {
    const key = issue.path[0] as keyof CaseFormValues;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

export async function createCase(_prev: CaseFormState, formData: FormData): Promise<CaseFormState> {
  await requireUser();
  const values = readValues(formData);
  const parsed = caseInputSchema.safeParse(values);
  if (!parsed.success) return { values, fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const privacyWarning = privacyCheck(values);
  if (privacyWarning) return { values, privacyWarning };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error || !data) {
    console.error("createCase", error?.code);
    return { values, error: es.common.genericError };
  }

  revalidatePath("/casos");
  redirect(`/casos/${data.id}`);
}

export async function updateCase(
  caseId: string,
  _prev: CaseFormState,
  formData: FormData,
): Promise<CaseFormState> {
  await requireUser();
  const values = readValues(formData);
  if (!caseIdSchema.safeParse(caseId).success) return { values, error: es.cases.notFound };

  const parsed = caseInputSchema.safeParse(values);
  if (!parsed.success) return { values, fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const privacyWarning = privacyCheck(values);
  if (privacyWarning) return { values, privacyWarning };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .update(parsed.data)
    .eq("id", caseId)
    .select("id");

  if (error) {
    console.error("updateCase", error.code);
    return { values, error: es.common.genericError };
  }
  if (!data || data.length === 0) return { values, error: es.cases.notFound };

  revalidatePath(`/casos/${caseId}`);
  revalidatePath("/casos");
  return { values: parsed.data, success: es.cases.form.saved };
}

export async function deleteCase(
  caseId: string,
  _prev: DeleteCaseState,
  formData: FormData,
): Promise<DeleteCaseState> {
  await requireUser();
  if (!caseIdSchema.safeParse(caseId).success) return { error: es.cases.notFound };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("cases")
    .select("case_code")
    .eq("id", caseId)
    .maybeSingle();
  if (!existing) return { error: es.cases.notFound };

  const typed = String(formData.get("confirmCode") ?? "").trim().toUpperCase();
  if (typed !== existing.case_code) return { error: es.cases.delete.mismatch };

  const { error } = await supabase.from("cases").delete().eq("id", caseId);
  if (error) {
    console.error("deleteCase", error.code);
    return { error: es.common.genericError };
  }

  revalidatePath("/casos");
  redirect("/casos");
}
