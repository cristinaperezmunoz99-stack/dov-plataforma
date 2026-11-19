import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";
import { es } from "@/lib/i18n/es";
import { formatDate } from "@/modules/cases/format";
import { listSessions } from "@/modules/sessions/queries";

export default async function SessionsPage({ params }: PageProps<"/casos/[caseId]/sesiones">) {
  const { caseId } = await params;
  const sessions = await listSessions(caseId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <LinkButton href={`/casos/${caseId}/sesiones/nueva`}>{es.sessions.new}</LinkButton>
      </div>
      {sessions.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface px-6 py-8 text-body text-ink-muted">
          {es.sessions.empty}
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {sessions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/casos/${caseId}/sesiones/${s.id}`}
                className="flex flex-col gap-1 px-6 py-4 transition-colors hover:bg-surface-sunken"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-label text-ink">{es.sessions.number(s.session_number)}</span>
                  <span className="text-caption text-ink-muted">{formatDate(`${s.date}T12:00:00Z`)}</span>
                </div>
                <p className="line-clamp-2 text-body-sm text-ink-muted">{s.summary || es.sessions.noSummary}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
