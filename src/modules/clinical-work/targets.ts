import { es } from "@/lib/i18n/es";

export const RESOURCES_TARGET = "recursos";

export type SaveTarget = { slug: string; label: string; replaces: boolean };

/** Traduce los destinos de guardado de un asistente a etiquetas para la interfaz. */
export function resolveTargets(
  slugs: string[],
  categories: { slug: string; name: string; mode: string }[],
): SaveTarget[] {
  return slugs
    .map((slug) => {
      if (slug === RESOURCES_TARGET) return { slug, label: es.resources.label, replaces: false };
      const cat = categories.find((c) => c.slug === slug);
      return cat ? { slug, label: cat.name, replaces: cat.mode === "single" } : null;
    })
    .filter((t): t is SaveTarget => t !== null);
}

/** Título de un recurso: primer encabezado o primera línea del texto. */
export function deriveTitle(content: string): string | null {
  for (const raw of content.split("\n")) {
    const line = raw.replace(/^#+\s*/, "").replace(/\*\*/g, "").replace(/^[-*]\s+/, "").trim();
    if (line.length >= 3) return line.slice(0, 120);
  }
  return null;
}
