import Link from "next/link";
import { es } from "@/lib/i18n/es";
import { formatDate } from "@/modules/cases/format";
import { listConversations } from "@/modules/conversations/queries";

export default async function ConversationsPage({ params }: PageProps<"/casos/[caseId]/conversaciones">) {
  const { caseId } = await params;
  const conversations = await listConversations(caseId);

  if (conversations.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface px-6 py-8">
        <p className="text-body text-ink-muted">{es.conversations.empty}</p>
        <Link href={`/casos/${caseId}/asistentes`} className="mt-2 inline-block text-label text-primary hover:underline">
          {es.conversations.toAssistants}
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
      {conversations.map((cv) => (
        <li key={cv.id}>
          <Link
            href={`/casos/${caseId}/conversaciones/${cv.id}`}
            className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-surface-sunken"
          >
            <div className="min-w-0">
              <p className="text-label text-ink">{cv.assistant_name}</p>
              <p className="truncate text-body-sm text-ink-muted">{cv.title || es.conversations.untitled}</p>
            </div>
            <p className="shrink-0 text-caption text-ink-muted">{es.conversations.updated(formatDate(cv.updated_at))}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
