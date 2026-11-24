import "server-only";
import { headers } from "next/headers";
import { isIP } from "node:net";
import { createAdminClient } from "@/lib/supabase/admin";

export type SecurityEventType =
  | "login"
  | "logout"
  | "password_changed"
  | "password_reset_requested"
  | "mfa_enabled"
  | "mfa_disabled"
  | "mfa_verified"
  | "case_deleted"
  | "account_exported"
  | "account_deletion_requested";

/**
 * Registra un evento de seguridad (sin contenido clínico).
 * Nunca interrumpe la acción del usuario si el registro falla.
 */
export async function logSecurityEvent(userId: string, eventType: SecurityEventType) {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
    const ip = isIP(forwarded) ? forwarded : null;
    const userAgent = (h.get("user-agent") ?? "").slice(0, 300) || null;
    const { error } = await createAdminClient()
      .from("security_events")
      .insert({ user_id: userId, event_type: eventType, ip, user_agent: userAgent });
    if (error) console.error("security event", eventType, error.code);
  } catch (error) {
    console.error("security event", eventType, error instanceof Error ? error.name : "unknown");
  }
}
