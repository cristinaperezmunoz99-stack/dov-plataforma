"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";
import { privacyBlockMessage } from "@/lib/privacy/pii-check";
import { createClient } from "@/lib/supabase/server";
import {
  type DeleteSessionState,
  type SessionFormState,
  type SessionFormValues,
  sessionInputSchema,
  uuidSchema,
} from "./schemas";

function readValues(formData: FormData): SessionFormValues {
  const get = (k: string) => String(formData.get(k) ?? "");
  return {
    date: get("date"),
    summary: get("summary"),
    notes: get("notes"),
    relevant_info: get("relevant_info"),
    changes: get("changes"),
  };
}

function check(values: SessionFormValues): SessionFormState | { data: SessionFormValues } {
  const parsed = sessionInputSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: SessionFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof SessionFormValues;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { values, fieldErrors };
  }
  const d = parsed.data;
  const privacyWarning = privacyBlockMessage(d.summary, d.notes, d.relevant_info, d.changes);
  if (privacyWarning) return { values, privacyWarning };
  return { data: d };
}

export async function createSession(
  caseId: string,
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  await requireUser();
  const values = readValues(formData);
  if (!uuidSchema.safeParse(caseId).success) return { values, error: es.cases.notFound };
  const result = check(values);
  if (!("data" in result)) return result;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .insert({ case_id: caseId, ...result.data })
    .select("id")
    .single();
  if (error || !data) {
    console.error("createSession", error?.code);
    return { values, error: es.common.genericError };
  }
  revalidatePath(`/casos/${caseId}/sesiones`);
  redirect(`/casos/${caseId}/sesiones/${data.id}`);
}

export async function updateSession(
  caseId: string,
  sessionId: string,
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  await requireUser();
  const values = readValues(formData);
  if (!uuidSchema.safeParse(caseId).success || !uuidSchema.safeParse(sessionId).success) {
    return { values, error: es.sessions.notFound };
  }
  const result = check(values);
  if (!("data" in result)) return result;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .update(result.data)
    .eq("id", sessionId)
    .eq("case_id", caseId)
    .select("id");
  if (error || !data?.length) {
    if (error) console.error("updateSession", error.code);
    return { values, error: error ? es.common.genericError : es.sessions.notFound };
  }
  revalidatePath(`/casos/${caseId}/sesiones`);
  revalidatePath(`/casos/${caseId}/sesiones/${sessionId}`);
  return { values: result.data, success: es.sessions.form.saved };
}

export async function deleteSession(
  caseId: string,
  sessionId: string,
  _prev: DeleteSessionState,
  formData: FormData,
): Promise<DeleteSessionState> {
  await requireUser();
  if (!uuidSchema.safeParse(caseId).success || !uuidSchema.safeParse(sessionId).success) {
    return { error: es.sessions.notFound };
  }
  if (formData.get("confirm") !== "on") return { error: es.sessions.delete.notConfirmed };

  const supabase = await createClient();
  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId)
    .eq("case_id", caseId);
  if (error) {
    console.error("deleteSession", error.code);
    return { error: es.common.genericError };
  }
  revalidatePath(`/casos/${caseId}/sesiones`);
  redirect(`/casos/${caseId}/sesiones`);
}
