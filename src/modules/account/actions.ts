"use server";

import { createClient as createPlainClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type DeleteAccountState = { error?: string };

const schema = z.object({
  confirmEmail: z.string().trim().toLowerCase().max(320),
  password: z.string().min(1).max(200),
});

/**
 * Borrado completo de la cuenta. Pide email y contraseña de nuevo.
 * Al borrar el usuario de auth.users, todas las tablas caen en cascada
 * (perfil, casos, trabajo clínico, recursos, conversaciones, mensajes, uso, eventos).
 */
export async function deleteAccount(
  _prev: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const user = await requireUser();
  const parsed = schema.safeParse({
    confirmEmail: formData.get("confirmEmail"),
    password: formData.get("password"),
  });
  if (!parsed.success || parsed.data.confirmEmail !== user.email.toLowerCase()) {
    return { error: es.account.delete.mismatch };
  }

  // Reautenticación en un cliente aislado, sin tocar la sesión actual.
  const { url, publishableKey } = getSupabaseEnv();
  const verifier = createPlainClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: authError } = await verifier.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.password,
  });
  if (authError) return { error: es.account.delete.wrongPassword };
  await verifier.auth.signOut({ scope: "local" });

  const { error } = await createAdminClient().auth.admin.deleteUser(user.id);
  if (error) {
    console.error("account delete", error.code ?? error.status);
    return { error: es.common.genericError };
  }

  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login?cuenta=borrada");
}
