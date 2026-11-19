import Link from "next/link";
import { notFound } from "next/navigation";
import { es } from "@/lib/i18n/es";
import { deleteSession, updateSession } from "@/modules/sessions/actions";
import { DeleteSessionForm } from "@/modules/sessions/components/delete-session-form";
import { SessionForm } from "@/modules/sessions/components/session-form";
import { getSession } from "@/modules/sessions/queries";

export default async function SessionPage({ params }: PageProps<"/casos/[caseId]/sesiones/[sessionId]">) {
  const { caseId, sessionId } = await params;
  const session = await getSession(caseId, sessionId);
  if (!session) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href={`/casos/${caseId}/sesiones`} className="text-label text-ink-muted hover:text-ink">
          ← {es.sessions.back}
        </Link>
        <h2 className="mt-2 text-heading text-ink">{es.sessions.number(session.session_number)}</h2>
      </div>
      <div className="rounded-lg border border-border bg-surface p-6">
        <SessionForm
          action={updateSession.bind(null, caseId, session.id)}
          mode="edit"
          initialValues={{
            date: session.date,
            summary: session.summary,
            notes: session.notes,
            relevant_info: session.relevant_info,
            changes: session.changes,
          }}
        />
      </div>
      <DeleteSessionForm action={deleteSession.bind(null, caseId, session.id)} />
    </div>
  );
}
