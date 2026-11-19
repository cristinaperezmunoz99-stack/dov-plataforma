import Link from "next/link";
import { es } from "@/lib/i18n/es";
import { formatDate } from "../format";
import type { CaseListItem } from "../queries";

export function CaseList({ cases }: { cases: CaseListItem[] }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
      {cases.map((c) => (
        <li key={c.id}>
          <Link
            href={`/casos/${c.id}`}
            className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-surface-sunken"
          >
            <div className="min-w-0">
              <p className="text-label text-ink">{c.case_code}</p>
              <p className="truncate text-body-sm text-ink-muted">
                {c.title || es.cases.untitled}
              </p>
            </div>
            <p className="shrink-0 text-caption text-ink-muted">
              {es.cases.updated(formatDate(c.updated_at))}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
