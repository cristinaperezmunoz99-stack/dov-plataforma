import Link from "next/link";
import { es } from "@/lib/i18n/es";

/** Formulario GET: la búsqueda queda en la URL (?q=) y se resuelve en el servidor. */
export function CaseSearch({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/casos" method="get" role="search" className="flex gap-2">
      <label htmlFor="q" className="sr-only">
        {es.cases.searchLabel}
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={es.cases.searchPlaceholder}
        maxLength={60}
        className="h-12 w-full max-w-sm rounded-full border-2 border-border-strong bg-surface px-5 text-body text-ink placeholder:text-ink-muted"
      />
      <button
        type="submit"
        className="inline-flex h-11 items-center rounded-full border-2 border-border-strong bg-surface px-4 text-label text-ink hover:bg-surface-sunken"
      >
        {es.cases.search}
      </button>
      {defaultValue ? (
        <Link href="/casos" className="inline-flex h-10 items-center px-2 text-label text-ink-muted hover:text-ink">
          {es.cases.clear}
        </Link>
      ) : null}
    </form>
  );
}
