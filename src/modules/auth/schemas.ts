import { z } from "zod";
import { es } from "@/lib/i18n/es";

const v = es.auth.validation;

const email = z.string().trim().toLowerCase().email(v.email).max(254, v.email);
const password = z.string().min(10, v.passwordMin).max(72, v.passwordMax);

export const loginSchema = z.object({
  email,
  password: z.string().min(1, v.required).max(72, v.passwordMax),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1, v.required).max(120, v.nameMax),
  email,
  password,
  acceptLegal: z.literal("on", { error: es.legal.acceptRequired }),
});

export const recoverSchema = z.object({ email });

export const updatePasswordSchema = z.object({ password });

export type FormState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export function toFieldErrors(error: z.ZodError): Partial<Record<string, string>> {
  const out: Partial<Record<string, string>> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
