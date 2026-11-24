"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { es } from "@/lib/i18n/es";
import { logSecurityEvent } from "@/lib/security/events";
import { authRateAllowed } from "@/lib/security/rate-limit";
import {
  type FormState,
  loginSchema,
  recoverSchema,
  signupSchema,
  toFieldErrors,
  updatePasswordSchema,
} from "./schemas";

async function getOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  if (
    !(await authRateAllowed([
      { kind: "login_ip", value: "ip" },
      { kind: "login_email", value: parsed.data.email },
    ]))
  ) {
    return { error: es.rateLimit.tooMany };
  }

  const supabase = await createClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: es.auth.login.notConfirmed };
    }
    return { error: es.auth.login.invalid };
  }
  if (signInData.user) await logSecurityEvent(signInData.user.id, "login");
  redirect("/dashboard");
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  if (!(await authRateAllowed([{ kind: "signup_ip", value: "ip" }]))) {
    return { error: es.rateLimit.tooMany };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: parsed.data.name },
      emailRedirectTo: `${await getOrigin()}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    if (error.code === "weak_password") {
      return { fieldErrors: { password: es.auth.validation.passwordMin } };
    }
    // No revelamos si el email ya existe.
    if (error.code !== "user_already_exists") {
      return { error: es.common.genericError };
    }
  }
  return { success: es.auth.signup.checkEmail };
}

export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = recoverSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  const allowed = await authRateAllowed([
    { kind: "recover_ip", value: "ip" },
    { kind: "recover_email", value: parsed.data.email },
  ]);
  // Si se supera el límite no se envía nada, pero la respuesta es la misma.
  if (!allowed) return { success: es.auth.recover.sent };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await getOrigin()}/auth/confirm?next=/actualizar-contrasena`,
  });
  // Misma respuesta exista o no la cuenta.
  return { success: es.auth.recover.sent };
}

export async function updatePassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = updatePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/login");

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (!error) await logSecurityEvent(data.claims.sub, "password_changed");
  if (error) {
    if (error.code === "weak_password" || error.code === "same_password") {
      return { fieldErrors: { password: es.auth.validation.passwordMin } };
    }
    return { error: es.common.genericError };
  }
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims?.sub) await logSecurityEvent(data.claims.sub, "logout");
  await supabase.auth.signOut();
  redirect("/login");
}
