const dateFormat = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Madrid",
});

export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}

/** Color de acento estable por caso (solo decorativo, se deriva del código). */
const ACCENTS = ["bg-lavender", "bg-lime", "bg-primary", "bg-lavender-soft"] as const;

export function caseAccent(code: string) {
  let h = 0;
  for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}
