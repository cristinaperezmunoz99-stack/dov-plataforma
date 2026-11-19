import { z } from "zod";
import { es } from "@/lib/i18n/es";

const f = es.cases.form;

export const caseIdSchema = z.string().uuid();

export const caseInputSchema = z.object({
  title: z.string().trim().max(120, f.titleMax),
  general_context: z.string().trim().max(20000, f.contextMax),
});

export type CaseFormValues = { title: string; general_context: string };

export type CaseFormState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<keyof CaseFormValues, string>>;
  privacyWarning?: string;
  values?: CaseFormValues;
};

export type DeleteCaseState = { error?: string };

/** Elimina caracteres con significado especial en filtros de búsqueda. */
export function sanitizeSearch(q: string) {
  return q.replace(/[^\p{L}\p{N}\s-]/gu, "").trim().slice(0, 60);
}
