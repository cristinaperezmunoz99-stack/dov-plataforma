import Link from "next/link";
import { es } from "@/lib/i18n/es";
import { caseAccent, formatDate } from "../format";
import type { CaseListItem } from "../queries";

export function CaseList({ cases, showCreate = false }: { cases: CaseListItem[]; showCreate?: boolean }) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
      {cases.map((c) => (
        <li key={c.id}>
          <Link
            href={`/casos/${c.id}`}
            className="flex h-full flex-col gap-4 rounded-lg border border-border bg-surface p-6 transition-colors hover:border-border-strong"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-label font-semibold tracking-wide text-ink">
                <span aria-hidden="true" className={`size-2.5 rounded-full ${caseAccent(c.case_code)}`} />
                {c.case_code}
              </span>
              <span className="text-caption text-ink-muted">{formatDate(c.updated_at)}</span>
            </span>
            <span className="font-serif text-title text-ink">{c.title || es.cases.untitled}</span>
          </Link>
        </li>
      ))}
      {showCreate ? (
        <li>
          <Link
            href="/casos/nuevo"
            className="flex h-full min-h-40 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-lavender p-6 text-label text-ink-muted transition-colors hover:bg-primary-soft hover:text-ink"
          >
            <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            {es.dashboard.createCard}
          </Link>
        </li>
      ) : null}
    </ul>
  );
}
