"use client";

import { useActionState, useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { es } from "@/lib/i18n/es";
import { disableMfa, type EnrollState, startEnrollment, verifyEnrollment } from "../actions";

const t = es.mfa;

function CodeField() {
  return (
    <Field
      label={t.codeLabel}
      name="code"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]{6}"
      maxLength={6}
      required
    />
  );
}

function Enroll({ enroll }: { enroll: EnrollState }) {
  const [state, action, pending] = useActionState(verifyEnrollment.bind(null, enroll.factorId ?? ""), {});
  if (state.success) return <Alert tone="success">{state.success}</Alert>;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-body-sm text-ink">{t.scan}</p>
      {/* El QR es un SVG en data: URL generado por Supabase */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={enroll.qrCode} alt="" width={180} height={180} className="rounded-md border border-border bg-surface p-2" />
      <div>
        <p className="text-body-sm text-ink-muted">{t.manual}</p>
        <code className="mt-1 block break-all rounded-sm bg-surface-sunken px-2 py-1 text-body-sm">{enroll.secret}</code>
      </div>
      <form action={action} className="flex max-w-xs flex-col gap-3">
        <p className="text-body-sm text-ink">{t.enterCode}</p>
        {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
        <CodeField />
        <Button type="submit" disabled={pending}>
          {pending ? t.verifying : t.verify}
        </Button>
      </form>
    </div>
  );
}

export function MfaSettings({ enabled }: { enabled: boolean }) {
  const [enroll, setEnroll] = useState<EnrollState | null>(null);
  const [starting, startTransition] = useTransition();
  const [disableState, disableAction, disabling] = useActionState(disableMfa, {});
  const [showDisable, setShowDisable] = useState(false);

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-heading text-ink">{t.title}</h2>
      <p className="mt-1 text-body-sm text-ink-muted">{t.description}</p>
      <div className="mt-4 flex flex-col gap-4">
        {disableState.success ? <Alert tone="success">{disableState.success}</Alert> : null}
        {enabled && !disableState.success ? (
          <>
            <p className="text-label text-success">{t.enabled}</p>
            {showDisable ? (
              <form action={disableAction} className="flex max-w-xs flex-col gap-3">
                <p className="text-body-sm text-ink">{t.disableConfirm}</p>
                {disableState.error ? <Alert tone="danger">{disableState.error}</Alert> : null}
                <CodeField />
                <Button type="submit" variant="secondary" disabled={disabling}>
                  {t.disable}
                </Button>
              </form>
            ) : (
              <button type="button" onClick={() => setShowDisable(true)} className="self-start text-label text-ink-muted hover:text-danger">
                {t.disable}
              </button>
            )}
            <p className="text-caption text-ink-muted">{t.lostDevice}</p>
          </>
        ) : enroll?.factorId ? (
          <Enroll enroll={enroll} />
        ) : (
          <>
            <p className="text-label text-ink-muted">{t.disabled}</p>
            {enroll?.error ? <Alert tone="danger">{enroll.error}</Alert> : null}
            <div>
              <Button
                type="button"
                disabled={starting}
                onClick={() => startTransition(async () => setEnroll(await startEnrollment()))}
              >
                {starting ? t.starting : t.enable}
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
