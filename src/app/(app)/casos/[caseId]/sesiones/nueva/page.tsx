import { es } from "@/lib/i18n/es";
import { createSession } from "@/modules/sessions/actions";
import { SessionForm } from "@/modules/sessions/components/session-form";
import { todayInMadrid } from "@/modules/sessions/schemas";

export default async function NewSessionPage({ params }: PageProps<"/casos/[caseId]/sesiones/nueva">) {
  const { caseId } = await params;
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-heading text-ink">{es.sessions.new}</h2>
      <div className="rounded-lg border border-border bg-surface p-6">
        <SessionForm
          action={createSession.bind(null, caseId)}
          mode="create"
          cancelHref={`/casos/${caseId}/sesiones`}
          initialValues={{ date: todayInMadrid(), summary: "", notes: "", relevant_info: "", changes: "" }}
        />
      </div>
    </div>
  );
}
