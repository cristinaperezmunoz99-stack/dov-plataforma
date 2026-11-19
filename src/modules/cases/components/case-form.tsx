"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { TextareaField } from "@/components/ui/textarea";
import { es } from "@/lib/i18n/es";
import type { CaseFormState, CaseFormValues } from "../schemas";

type Props = {
  action: (prev: CaseFormState, formData: FormData) => Promise<CaseFormState>;
  initialValues?: CaseFormValues;
  mode: "create" | "edit";
};

const f = es.cases.form;

export function CaseForm({ action, initialValues, mode }: Props) {
  const [state, formAction, pending] = useActionState(action, {
    values: initialValues ?? { title: "", general_context: "" },
  });
  const values = state.values ?? { title: "", general_context: "" };

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.success && !pending ? <Alert tone="success">{state.success}</Alert> : null}

      <Field
        label={f.titleLabel}
        name="title"
        defaultValue={values.title}
        maxLength={120}
        hint={f.titleHint}
        error={state.fieldErrors?.title}
      />
      <TextareaField
        label={f.contextLabel}
        name="general_context"
        defaultValue={values.general_context}
        maxLength={20000}
        rows={10}
        hint={f.contextHint}
        error={state.fieldErrors?.general_context}
      />

      {state.privacyWarning ? (
        <div className="flex flex-col gap-3 rounded-md bg-warning-soft p-4">
          <p className="text-body-sm text-warning" role="status">
            {state.privacyWarning}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" name="confirmPrivacy" value="1" variant="secondary" disabled={pending}>
              {es.cases.privacy.saveAnyway}
            </Button>
          </div>
          <p className="text-caption text-ink-muted">{es.cases.privacy.review}</p>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {mode === "create"
            ? pending ? f.creating : f.create
            : pending ? f.saving : f.save}
        </Button>
        {mode === "create" ? (
          <Link href="/casos" className="text-label text-ink-muted hover:text-ink">
            {f.cancel}
          </Link>
        ) : null}
      </div>
    </form>
  );
}
