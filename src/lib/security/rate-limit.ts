import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

type Kind = "login_ip" | "login_email" | "signup_ip" | "recover_ip" | "recover_email" | "reauth_user";

/** Límites por tipo: ventana en segundos y máximo de intentos en esa ventana. */
const LIMITS: Record<Kind, { windowSeconds: number; max: number }> = {
  login_ip: { windowSeconds: 15 * 60, max: 30 },
  login_email: { windowSeconds: 15 * 60, max: 8 },
  signup_ip: { windowSeconds: 60 * 60, max: 5 },
  recover_ip: { windowSeconds: 60 * 60, max: 6 },
  recover_email: { windowSeconds: 60 * 60, max: 3 },
  reauth_user: { windowSeconds: 15 * 60, max: 5 },
};

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

function hashKey(kind: Kind, value: string) {
  // HMAC con la clave secreta del servidor: no se guarda la IP ni el email en claro.
  const secret = process.env.SUPABASE_SECRET_KEY ?? "";
  return createHmac("sha256", secret).update(`${kind}:${value.trim().toLowerCase()}`).digest("hex");
}

/**
 * Registra el intento y devuelve false si alguna de las claves supera su límite.
 * value "ip" usa la IP del cliente. Si el registro falla, se permite (fail-open)
 * para no bloquear el acceso; Supabase Auth mantiene sus propios límites.
 */
export async function authRateAllowed(keys: { kind: Kind; value: string }[]) {
  try {
    const admin = createAdminClient();
    const ip = await clientIp();
    for (const { kind, value } of keys) {
      const { windowSeconds, max } = LIMITS[kind];
      const { data, error } = await admin.rpc("auth_rate_hit", {
        p_kind: kind,
        p_key_hash: hashKey(kind, value === "ip" ? ip : value),
        p_window_seconds: windowSeconds,
        p_max: max,
      });
      if (error) {
        console.error("auth rate limit", error.code);
        continue;
      }
      if (data === false) return false;
    }
    return true;
  } catch (error) {
    console.error("auth rate limit", error instanceof Error ? error.name : "unknown");
    return true;
  }
}
