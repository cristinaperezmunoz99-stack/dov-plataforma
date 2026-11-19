import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
};

/**
 * Capa de acceso a la identidad. Verifica el token (getClaims) y lee el perfil
 * con RLS. Si no hay sesión válida, redirige al login.
 * cache() evita repetir la consulta dentro de una misma petición.
 */
export const requireUser = cache(async (): Promise<CurrentUser> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || !userId) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, name")
    .eq("id", userId)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return { id: profile.id, email: profile.email, name: profile.name };
});
