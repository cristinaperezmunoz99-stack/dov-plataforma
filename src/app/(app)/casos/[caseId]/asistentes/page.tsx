import { Button } from "@/components/ui/button";
import { es } from "@/lib/i18n/es";
import { listActiveAssistants } from "@/modules/assistants/queries";
import { startConversation } from "@/modules/conversations/actions";

export default async function AssistantsPage({ params }: PageProps<"/casos/[caseId]/asistentes">) {
  const { caseId } = await params;
  const assistants = await listActiveAssistants();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body-sm text-ink-muted">{es.assistants.description}</p>
      {assistants.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface px-6 py-8 text-body text-ink-muted">
          {es.assistants.empty}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {assistants.map((a) => (
            <li key={a.id} className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-surface p-6">
              <div>
                <h2 className="text-heading text-ink">{a.name}</h2>
                <p className="mt-1 text-body-sm text-ink-muted">{a.description}</p>
              </div>
              <form action={startConversation.bind(null, caseId, a.id)}>
                <Button type="submit" variant="secondary">
                  {es.assistants.start}
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
