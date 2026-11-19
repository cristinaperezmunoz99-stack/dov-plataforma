"use client";

import { useState } from "react";
import { es } from "@/lib/i18n/es";

const t = es.conversations;

export function DeleteConversation({ action }: { action: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="text-label text-ink-muted hover:text-danger">
        {t.delete}
      </button>
    );
  }
  return (
    <form action={action} className="flex flex-wrap items-center gap-3 text-label">
      <span className="text-danger">{t.confirmDelete}</span>
      <button type="submit" className="text-danger hover:underline">
        {t.confirm}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="text-ink-muted hover:text-ink">
        {t.cancel}
      </button>
    </form>
  );
}
