import "server-only";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const uuid = z.string().uuid();

export async function listConversations(caseId: string) {
  if (!uuid.safeParse(caseId).success) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, updated_at, assistant_id")
    .eq("case_id", caseId)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("listConversations", error.code);
    throw new Error("No se pudieron cargar las conversaciones");
  }
  const { data: assistants } = await supabase.from("assistants").select("id, name");
  const names = new Map((assistants ?? []).map((a) => [a.id, a.name]));
  return data.map((c) => ({ ...c, assistant_name: names.get(c.assistant_id) ?? "" }));
}

export async function getConversation(caseId: string, conversationId: string) {
  if (!uuid.safeParse(caseId).success || !uuid.safeParse(conversationId).success) return null;
  const supabase = await createClient();
  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("id, title, assistant_id")
    .eq("id", conversationId)
    .eq("case_id", caseId)
    .maybeSingle();
  if (error) {
    console.error("getConversation", error.code);
    throw new Error("No se pudo cargar la conversación");
  }
  if (!conversation) return null;

  const [{ data: assistant }, { data: messages }] = await Promise.all([
    supabase
      .from("assistants")
      .select("name, active, save_targets")
      .eq("id", conversation.assistant_id)
      .single(),
    supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at"),
  ]);

  return {
    ...conversation,
    assistant_name: assistant?.name ?? "",
    assistant_active: assistant?.active ?? false,
    assistant_save_targets: assistant?.save_targets ?? [],
    messages: (messages ?? []).map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  };
}
