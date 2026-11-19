import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";
import { createCase } from "@/modules/cases/actions";
import { CaseForm } from "@/modules/cases/components/case-form";

export default async function NewCasePage() {
  await requireUser();
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="font-serif text-display text-ink">{es.cases.form.newTitle}</h1>
        <p className="mt-2 text-body text-ink-muted">{es.cases.form.newDescription}</p>
      </div>
      <div className="rounded-lg border border-border bg-surface p-6">
        <CaseForm action={createCase} mode="create" />
      </div>
    </main>
  );
}
