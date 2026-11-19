import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

/**
 * Cliente con la clave secreta: SE SALTA RLS.
 * Usar solo en servidor, solo para operaciones que el usuario no puede hacer por sí
 * mismo (leer system_prompt, guardar respuestas de la IA, registrar uso) y SIEMPRE
 * después de haber verificado al usuario y la propiedad del recurso.
 */
export function createAdminClient() {
  const { url } = getSupabaseEnv();
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) throw new Error("Falta SUPABASE_SECRET_KEY");
  return createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
