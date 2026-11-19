import { es } from "@/lib/i18n/es";

/**
 * Detección básica de datos que podrían identificar a un paciente.
 * Si detecta algo, el guardado se bloquea.
 * Es una capa de apoyo, no una garantía: no detecta nombres propios ni direcciones.
 * Punto de inserción único para ampliar la detección más adelante.
 */
export type PiiKind = "email" | "phone" | "idDocument";

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
// DNI (8 dígitos + letra) y NIE (X/Y/Z + 7 dígitos + letra)
const ID_DOCUMENT = /\b(?:\d{8}|[XYZ]\d{7})[-\s]?[A-Z]\b/i;
// Secuencias de 9 o más dígitos, con espacios, puntos, guiones o prefijo +
const PHONE_CANDIDATE = /\+?\d[\d\s.-]{7,}\d/g;

export function detectPii(text: string): PiiKind[] {
  const found = new Set<PiiKind>();
  if (EMAIL.test(text)) found.add("email");
  if (ID_DOCUMENT.test(text)) found.add("idDocument");
  for (const match of text.match(PHONE_CANDIDATE) ?? []) {
    const digits = match.replace(/\D/g, "");
    // Listas de años ("2022 2023 2024") no son teléfonos.
    const groups = match.trim().split(/[\s.-]+/);
    const onlyYears = groups.every((g) => /^(19|20)\d{2}$/.test(g));
    if (!onlyYears && digits.length >= 9 && digits.length <= 15) {
      found.add("phone");
      break;
    }
  }
  return [...found];
}


/**
 * Devuelve el mensaje de bloqueo si alguno de los textos parece contener datos
 * identificativos, o undefined si se puede guardar.
 */
export function privacyBlockMessage(...texts: string[]): string | undefined {
  const kinds = detectPii(texts.join("\n"));
  if (kinds.length === 0) return undefined;
  const labels = kinds.map((k) => es.privacy.kinds[k]).join(", ");
  return es.privacy.blocked(labels);
}
