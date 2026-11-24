"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { es } from "@/lib/i18n/es";
import { deleteAccount } from "../actions";

const t = es.account;

export function ExportData() {
  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h3 className="text-heading text-ink">{t.export.title}</h3>
      <p className="mt-1 text-body-sm text-ink-muted">{t.export.description}</p>
      <a
        href="/api/cuenta/exportar"
        className="mt-4 inline-flex h-10 items-center rounded-md border border-border-strong bg-surface px-4 text-label text-ink hover:bg-surface-sunken"
      >
        {t.export.submit}
      </a>
    </section>
  );
}

export function DeleteAccountForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(deleteAccount, {});
  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h3 className="text-heading text-ink">{t.delete.title}</h3>
      <p className="mt-1 text-body-sm text-ink-muted">{t.delete.description}</p>
      <form action={action} className="mt-4 flex flex-col gap-4" noValidate>
        {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
        <Field label={t.delete.emailLabel(email)} name="confirmEmail" type="email" autoComplete="off" />
        <Field label={es.common.password} name="password" type="password" autoComplete="current-password" />
        <div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center rounded-md border border-danger bg-surface px-4 text-label text-danger hover:bg-danger-soft disabled:opacity-60"
          >
            {pending ? t.delete.deleting : t.delete.submit}
          </button>
        </div>
      </form>
    </section>
  );
}
