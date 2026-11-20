import Link from "next/link";
import { es } from "@/lib/i18n/es";
import { formatDate } from "@/modules/cases/format";
import { listResources } from "@/modules/resources/queries";

export default async function ResourcesPage({ params }: PageProps<"/casos/[caseId]/recursos">) {
  const { caseId } = await params;
  const resources = await listResources(caseId);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body-sm text-ink-muted">{es.resources.description}</p>
      {resources.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface px-6 py-8 text-body text-ink-muted">
          {es.resources.empty}
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {resources.map((res) => (
            <li key={res.id}>
              <Link
                href={`/casos/${caseId}/recursos/${res.id}`}
                className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-surface-sunken"
              >
                <span className="min-w-0 truncate text-label text-ink">{res.title || es.resources.untitled}</span>
                <span className="shrink-0 text-caption text-ink-muted">{formatDate(res.created_at)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
