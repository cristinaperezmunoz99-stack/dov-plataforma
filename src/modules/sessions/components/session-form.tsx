"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { TextareaField } from "@/components/ui/textarea";
import { es } from "@/lib/i18n/es";
import type { SessionFormState, SessionFormValues } from "../schemas";

const f = es.sessions.form;

export function SessionForm({
  action,
  initialValues,
  mode,
  cancelHref,
}: {
  action: (prev: SessionFormState, formData: FormData) => Promise<SessionFormState>;
  initialValues: SessionFormValues;
  mode: "create" | "edit";
  cancelHref?: string;
}) {
  const [state, formAction, pending] = useActionState(action, { values: initialValues });
  const v = state.values ?? initialValues;
  const err = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.success && !pending ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="max-w-xs">
        <Field label={f.date} name="date" type="date" defaultValue={v.date} required error={err.date} />
      </div>
      <TextareaField label={f.summary} name="summary" defaultValue={v.summary} maxLength={5000} rows={5} hint={f.summaryHint} error={err.summary} />
      <TextareaField label={f.notes} name="notes" defaultValue={v.notes} maxLength={20000} rows={8} error={err.notes} />
      <TextareaField label={f.relevant} name="relevant_info" defaultValue={v.relevant_info} maxLength={5000} rows={4} error={err.relevant_info} />
      <TextareaField label={f.changes} name="changes" defaultValue={v.changes} maxLength={5000} rows={4} error={err.changes} />

      {state.privacyWarning ? <Alert tone="warning">{state.privacyWarning}</Alert> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {mode === "create" ? (pending ? f.creating : f.create) : pending ? f.saving : f.save}
        </Button>
        {cancelHref ? (
          <Link href={cancelHref} className="text-label text-ink-muted hover:text-ink">
            {f.cancel}
          </Link>
        ) : null}
      </div>
    </form>
  );
}
