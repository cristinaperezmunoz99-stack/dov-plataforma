"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { es } from "@/lib/i18n/es";
import { createClient } from "@/lib/supabase/server";

const codeSchema = z.string().trim().regex(/^\d{6}$/);
const uuid = z.string().uuid();

export type EnrollState = {
  factorId?: string;
  qrCode?: string;
  secret?: string;
  error?: string;
};

export type CodeState = { error?: string; success?: string };

async function getVerifiedTotp() {
  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.listFactors();
  return { supabase, factor: data?.totp?.find((f) => f.status === "verified") ?? null, all: data?.all ?? [] };
}

/** Inicia el alta: crea un factor TOTP y devuelve el QR. */
export async function startEnrollment(): Promise<EnrollState> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) redirect("/login");

  // Limpia altas anteriores sin terminar.
  const { data: factors } = await supabase.auth.mfa.listFactors();
  for (const f of factors?.all ?? []) {
    if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `App de autenticación ${Date.now()}`,
  });
  if (error || !data) {
    console.error("mfa enroll", error?.code);
    return { error: es.common.genericError };
  }
  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

/** Termina el alta verificando el primer código. La sesión pasa a nivel aal2. */
export async function verifyEnrollment(
  factorId: string,
  _prev: CodeState,
  formData: FormData,
): Promise<CodeState> {
  const code = codeSchema.safeParse(formData.get("code"));
  if (!code.success || !uuid.safeParse(factorId).success) return { error: es.mfa.invalidCode };
  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.data });
  if (error) return { error: es.mfa.invalidCode };
  revalidatePath("/ajustes");
  return { success: es.mfa.activated };
}

/** Desactiva la verificación en dos pasos. Exige un código válido (sesión aal2). */
export async function disableMfa(_prev: CodeState, formData: FormData): Promise<CodeState> {
  const code = codeSchema.safeParse(formData.get("code"));
  if (!code.success) return { error: es.mfa.invalidCode };
  const { supabase, factor } = await getVerifiedTotp();
  if (!factor) return {};
  const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
    factorId: factor.id,
    code: code.data,
  });
  if (verifyError) return { error: es.mfa.invalidCode };
  const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
  if (error) {
    console.error("mfa unenroll", error.code);
    return { error: es.common.genericError };
  }
  revalidatePath("/ajustes");
  return { success: es.mfa.disabledOk };
}

/** Paso de verificación al iniciar sesión. */
export async function verifyLoginCode(_prev: CodeState, formData: FormData): Promise<CodeState> {
  const code = codeSchema.safeParse(formData.get("code"));
  if (!code.success) return { error: es.mfa.invalidCode };
  const { supabase, factor } = await getVerifiedTotp();
  if (!factor) redirect("/dashboard");
  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: factor.id,
    code: code.data,
  });
  if (error) return { error: es.mfa.invalidCode };
  redirect("/dashboard");
}

/** ¿Tiene el usuario la verificación en dos pasos activada? */
export async function hasMfa(): Promise<boolean> {
  const { factor } = await getVerifiedTotp();
  return Boolean(factor);
}
