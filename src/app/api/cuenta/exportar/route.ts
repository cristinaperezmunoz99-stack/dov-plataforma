import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logSecurityEvent } from "@/lib/security/events";

export const dynamic = "force-dynamic";

/**
 * Exportación de todos los datos del usuario en JSON.
 * Usa el cliente con la identidad del usuario: RLS limita cada consulta a sus datos.
 * Nunca incluye system_prompt (assistant_versions no es legible por el usuario).
 */
export async function GET() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [profile, cases, memory, resources, conversations, messages, usage, security, categories, assistants] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("cases").select("*").order("created_at"),
      supabase.from("case_memory").select("*").order("created_at"),
      supabase.from("case_resources").select("*").order("created_at"),
      supabase.from("conversations").select("*").order("created_at"),
      supabase.from("messages").select("id, conversation_id, role, content, created_at").order("created_at"),
      supabase.from("usage_events").select("*").order("created_at"),
      supabase.from("security_events").select("event_type, ip, user_agent, created_at").order("created_at"),
      supabase.from("memory_categories").select("id, slug, name"),
      supabase.from("assistants").select("id, slug, name"),
    ]);

  const failed = [profile, cases, memory, resources, conversations, messages, usage, security, categories, assistants].find(
    (r) => r.error,
  );
  if (failed?.error) {
    console.error("account export", failed.error.code);
    return NextResponse.json({ error: "export_failed" }, { status: 500 });
  }

  await logSecurityEvent(userId, "account_exported");

  const body = {
    exported_at: new Date().toISOString(),
    format_version: 1,
    profile: profile.data,
    cases: cases.data,
    clinical_work: memory.data,
    resources: resources.data,
    conversations: conversations.data,
    messages: messages.data,
    usage_events: usage.data,
    security_events: security.data,
    reference: { memory_categories: categories.data, assistants: assistants.data },
  };
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="asistentes-export-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
