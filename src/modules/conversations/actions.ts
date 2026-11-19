"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const uuid = z.string().uuid();

export async function startConversation(caseId: string, assistantId: string) {
  await requireUser();
  if (!uuid.safeParse(caseId).success || !uuid.safeParse(assistantId).success) {
    redirect(`/casos`);
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .insert({ case_id: caseId, assistant_id: assistantId })
    .select("id")
    .single();
  if (error || !data) {
    console.error("startConversation", error?.code);
    redirect(`/casos/${caseId}/asistentes`);
  }
  revalidatePath(`/casos/${caseId}/conversaciones`);
  redirect(`/casos/${caseId}/conversaciones/${data.id}`);
}

export async function deleteConversation(caseId: string, conversationId: string) {
  await requireUser();
  if (!uuid.safeParse(caseId).success || !uuid.safeParse(conversationId).success) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId)
    .eq("case_id", caseId);
  if (error) console.error("deleteConversation", error.code);
  revalidatePath(`/casos/${caseId}/conversaciones`);
  redirect(`/casos/${caseId}/conversaciones`);
}
