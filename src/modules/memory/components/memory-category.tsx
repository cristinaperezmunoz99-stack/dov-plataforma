"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { es } from "@/lib/i18n/es";
import { formatDate } from "@/modules/cases/format";
import { startConversation } from "@/modules/conversations/actions";
import { addMemory, deleteMemory, updateMemory } from "../actions";
import type { MemoryCategory, MemoryEntry } from "../queries";
import type { MemoryFormState } from "../schemas";

const m = es.memory;

const textareaClass =
  "min-h-24 w-full rounded-md border-2 border-border-strong bg-surface px-4 py-3 text-body text-ink placeholder:text-ink-muted";

function FormMessages({ state }: { state: MemoryFormState }) {
  if (state.privacyWarning) return <Alert tone="warning">{state.privacyWarning}</Alert>;
  if (state.error) return <Alert tone="danger">{state.error}</Alert>;
  return null;
}

function AddForm({ caseId, category }: { caseId: string; category: MemoryCategory }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(addMemory.bind(null, caseId, category.id), {});
  if (!open && !state.error && !state.privacyWarning) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="self-start text-label text-ink-muted hover:text-ink">
        {m.addManually}
      </button>
    );
  }
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
        maxLength={60000}
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
          maxLength={60000}
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
      <Markdown>{entry.content}</Markdown>
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
  assistants,
}: {
  caseId: string;
  category: MemoryCategory;
  entries: MemoryEntry[];
  assistants: { id: string; name: string }[];
}) {
  const single = category.mode === "single";
  const shown = single ? entries.slice(-1) : entries;
  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-title text-ink">{category.name}</h2>
        {single && shown.length > 0 ? (
          <span className="rounded-full bg-success-soft px-3 py-1 text-caption font-semibold text-success">{m.current}</span>
        ) : null}
      </div>
      {category.description ? (
        <p className="mt-1 text-body-sm text-ink-muted">{category.description}</p>
      ) : null}
      <div className="mt-4 flex flex-col gap-4">
        {shown.length === 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-body-sm text-ink-muted">
              {assistants.length > 0 ? m.builtWith(assistants.map((a) => a.name).join(", ")) : m.empty}
            </p>
            {assistants.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {assistants.map((a) => (
                  <form key={a.id} action={startConversation.bind(null, caseId, a.id)}>
                    <Button type="submit" variant="secondary">
                      {m.openAssistant(a.name)}
                    </Button>
                  </form>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {shown.map((entry) => (
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
