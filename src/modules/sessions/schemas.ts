import { z } from "zod";
import { es } from "@/lib/i18n/es";

const f = es.sessions.form;

export const uuidSchema = z.string().uuid();

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, f.invalidDate)
  .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), f.invalidDate);

export const sessionInputSchema = z.object({
  date: isoDate,
  summary: z.string().trim().max(5000, f.tooLong),
  notes: z.string().trim().max(20000, f.tooLong),
  relevant_info: z.string().trim().max(5000, f.tooLong),
  changes: z.string().trim().max(5000, f.tooLong),
});

export type SessionFormValues = z.infer<typeof sessionInputSchema>;

export type SessionFormState = {
  error?: string;
  success?: string;
  privacyWarning?: string;
  fieldErrors?: Partial<Record<keyof SessionFormValues, string>>;
  values?: SessionFormValues;
};

export type DeleteSessionState = { error?: string };

export function todayInMadrid() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}
