"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { es } from "@/lib/i18n/es";
import type { DeleteCaseState } from "../schemas";

const d = es.cases.delete;

export function DeleteCaseForm({
  action,
  caseCode,
}: {
  action: (prev: DeleteCaseState, formData: FormData) => Promise<DeleteCaseState>;
  caseCode: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-heading text-ink">{d.title}</h2>
      <p className="mt-1 text-body-sm text-ink-muted">{d.description}</p>
      <form action={formAction} className="mt-4 flex flex-col gap-4" noValidate>
        {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
        <Field label={d.confirmLabel(caseCode)} name="confirmCode" autoComplete="off" />
        <div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center rounded-md border border-danger bg-surface px-4 text-label text-danger hover:bg-danger-soft disabled:opacity-60"
          >
            {pending ? d.deleting : d.submit}
          </button>
        </div>
      </form>
    </section>
  );
}
