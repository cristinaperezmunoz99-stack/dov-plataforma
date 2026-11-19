"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { es } from "@/lib/i18n/es";
import { formatDate } from "@/modules/cases/format";
import { addMemory, deleteMemory, updateMemory } from "../actions";
import type { MemoryCategory, MemoryEntry } from "../queries";
import type { MemoryFormState } from "../schemas";

const m = es.memory;

const textareaClass =
  "min-h-24 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-body text-ink placeholder:text-ink-muted";

function FormMessages({ state }: { state: MemoryFormState }) {
  if (state.privacyWarning) return <Alert tone="warning">{state.privacyWarning}</Alert>;
  if (state.error) return <Alert tone="danger">{state.error}</Alert>;
  return null;
}

function AddForm({ caseId, category }: { caseId: string; category: MemoryCategory }) {
  const [state, action, pending] = useActionState(addMemory.bind(null, caseId, category.id), {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <FormMessages state={state} />
      <label htmlFor={`add-${category.id}`} className="sr-only">
        {m.addPlaceholder(category.name)}
      </label>
      {/* key: tras guardar, se vacía el campo */}
      <textarea
        key={state.savedAt ?? "new"}
        id={`add-${category.id}`}
        name="content"
        rows={3}
        maxLength={10000}
        defaultValue={state.savedAt ? "" : state.value}
        placeholder={m.addPlaceholder(category.name)}
        className={textareaClass}
      />
      <div>
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? m.adding : m.add}
        </Button>
      </div>
    </form>
  );
}

function Entry({ caseId, entry }: { caseId: string; entry: MemoryEntry }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(updateMemory.bind(null, caseId, entry.id), {
    value: entry.content,
  });
  const lastSaved = useRef(state.savedAt);

  useEffect(() => {
    if (state.savedAt && state.savedAt !== lastSaved.current) {
      lastSaved.current = state.savedAt;
      setEditing(false);
    }
  }, [state.savedAt]);

  if (editing) {
    return (
      <form action={action} className="flex flex-col gap-2">
        <FormMessages state={state} />
        <textarea
          name="content"
          rows={4}
          maxLength={10000}
          defaultValue={state.value ?? entry.content}
          className={textareaClass}
          aria-label={m.edit}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? m.saving : m.save}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
            {m.cancel}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="whitespace-pre-wrap text-body text-ink">{entry.content}</p>
      <div className="flex flex-wrap items-center gap-3 text-caption text-ink-muted">
        <span>{m.updated(formatDate(entry.updated_at))}</span>
        {confirming ? (
          <span className="flex items-center gap-2">
            <span className="text-danger">{m.confirmDelete}</span>
            <form action={deleteMemory.bind(null, caseId, entry.id)}>
              <button type="submit" className="text-label text-danger hover:underline">
                {m.confirm}
              </button>
            </form>
            <button type="button" onClick={() => setConfirming(false)} className="text-label hover:text-ink">
              {m.cancel}
            </button>
          </span>
        ) : (
          <>
            <button type="button" onClick={() => setEditing(true)} className="text-label text-primary hover:underline">
              {m.edit}
            </button>
            <button type="button" onClick={() => setConfirming(true)} className="text-label hover:text-danger">
              {m.delete}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function MemoryCategorySection({
  caseId,
  category,
  entries,
}: {
  caseId: string;
  category: MemoryCategory;
  entries: MemoryEntry[];
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-heading text-ink">{category.name}</h2>
      {category.description ? (
        <p className="mt-1 text-body-sm text-ink-muted">{category.description}</p>
      ) : null}
      <div className="mt-4 flex flex-col gap-4">
        {entries.length === 0 ? (
          <p className="text-body-sm text-ink-muted">{m.empty}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {entries.map((entry) => (
              <li key={entry.id} className="py-3 first:pt-0">
                <Entry caseId={caseId} entry={entry} />
              </li>
            ))}
          </ul>
        )}
        <AddForm caseId={caseId} category={category} />
      </div>
    </section>
  );
}
