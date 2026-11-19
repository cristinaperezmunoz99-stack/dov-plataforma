const dateFormat = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Madrid",
});

export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}
