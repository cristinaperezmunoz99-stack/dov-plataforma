import { z } from "zod";
import { es } from "@/lib/i18n/es";

export const uuidSchema = z.string().uuid();

export const memoryContentSchema = z
  .string()
  .trim()
  .min(1, es.memory.required)
  .max(10000, es.memory.max);

export type MemoryFormState = {
  error?: string;
  privacyWarning?: string;
  value?: string;
  /** Cambia en cada guardado correcto para que el formulario pueda reiniciarse. */
  savedAt?: number;
};
