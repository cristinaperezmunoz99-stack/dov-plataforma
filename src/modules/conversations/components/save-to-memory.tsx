"use client";

import { useActionState, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { es } from "@/lib/i18n/es";
import { addMemoryFromChat } from "@/modules/memory/actions";
import type { MemoryFormState } from "@/modules/memory/schemas";

const m = es.memory;

export type CategoryOption = { id: string; name: string };

export function SaveToMemory({
  caseId,
  content,
  categories,
}: {
  caseId: string;
  content: string;
  categories: CategoryOption[];
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<MemoryFormState, FormData>(
    addMemoryFromChat.bind(null, caseId),
    {},
  );

  if (state.savedAt && !pending) {
    return <p className="mt-2 text-caption text-success">{m.savedFromChat}</p>;
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-2 text-label text-primary hover:underline">
        {m.saveFromChat}
      </button>
    );
  }

  return (
    <form action={action} className="mt-3 flex flex-col gap-2 rounded-md border border-border bg-surface p-3">
      {state.privacyWarning ? <Alert tone="warning">{state.privacyWarning}</Alert> : null}
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      <label className="flex flex-col gap-1 text-label text-ink">
        {m.categoryLabel}
        <select
          name="categoryId"
          required
          className="h-10 rounded-md border border-border-strong bg-surface px-2 text-body text-ink"
          defaultValue={categories[0]?.id}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <p className="text-caption text-ink-muted">{m.saveFromChatHint}</p>
      <textarea
        name="content"
        defaultValue={state.value ?? content}
        rows={8}
        maxLength={20000}
        aria-label={m.saveFromChat}
        className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-body-sm text-ink"
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? m.saving : m.save}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {m.cancel}
        </Button>
      </div>
    </form>
  );
}
