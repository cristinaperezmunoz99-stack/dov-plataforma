"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { es } from "@/lib/i18n/es";
import type { DeleteSessionState } from "../schemas";

const d = es.sessions.delete;

export function DeleteSessionForm({
  action,
}: {
  action: (prev: DeleteSessionState, formData: FormData) => Promise<DeleteSessionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-heading text-ink">{d.title}</h2>
      <p className="mt-1 text-body-sm text-ink-muted">{d.description}</p>
      <form action={formAction} className="mt-4 flex flex-col gap-4">
        {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
        <label className="flex items-center gap-2 text-body-sm text-ink">
          <input type="checkbox" name="confirm" className="size-4 accent-danger" />
          {d.confirmLabel}
        </label>
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
