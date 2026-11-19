/**
 * Detección básica de datos que podrían identificar a un paciente.
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
    if (digits.length >= 9 && digits.length <= 15) {
      found.add("phone");
      break;
    }
  }
  return [...found];
}
