"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Markdown } from "@/components/ui/markdown";
import { es } from "@/lib/i18n/es";
import type { ResourceFormState } from "../actions";

const r = es.resources;

export function ResourceView({
  title,
  content,
  createdLabel,
  updateAction,
  deleteAction,
}: {
  title: string;
  content: string;
  createdLabel: string;
  updateAction: (prev: ResourceFormState, formData: FormData) => Promise<ResourceFormState>;
  deleteAction: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(updateAction, { values: { title, content } });
  const v = state.values ?? { title, content };
  const lastSuccess = useRef(state.success);

  useEffect(() => {
    if (state.success && state.success !== lastSuccess.current) setEditing(false);
    lastSuccess.current = state.success;
  }, [state]);

  if (editing) {
    return (
      <form
        action={action}
        className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6"
      >
        {state.privacyWarning ? <Alert tone="warning">{state.privacyWarning}</Alert> : null}
        {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
        <Field label={r.titleLabel} name="title" defaultValue={v.title} maxLength={200} />
        <label className="flex flex-col gap-1 text-label text-ink">
          {r.contentLabel}
          <textarea
            name="content"
            defaultValue={v.content}
            rows={20}
            maxLength={60000}
            className="w-full rounded-md border-2 border-border-strong bg-surface px-4 py-3 font-mono text-body-sm text-ink"
          />
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? r.saving : r.save}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
            {r.cancel}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
          {r.edit}
        </Button>
        <Button type="button" variant="secondary" onClick={() => window.print()}>
          {r.print}
        </Button>
        {confirming ? (
          <form action={deleteAction} className="flex items-center gap-3 text-label">
            <span className="text-danger">{r.confirmDelete}</span>
            <button type="submit" className="text-danger hover:underline">
              {r.confirm}
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="text-ink-muted hover:text-ink">
              {r.cancel}
            </button>
          </form>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="text-label text-ink-muted hover:text-danger">
            {r.delete}
          </button>
        )}
      </div>
      <article className="rounded-lg border border-border bg-surface p-8 print:border-0 print:p-0">
        <h2 className="font-serif text-title text-ink">{v.title}</h2>
        <p className="mt-1 text-caption text-ink-muted print:hidden">{createdLabel}</p>
        <div className="mt-6">
          <Markdown>{v.content}</Markdown>
        </div>
      </article>
    </div>
  );
}
