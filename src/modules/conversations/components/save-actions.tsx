"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { es } from "@/lib/i18n/es";
import { saveFromChat, type SaveResult } from "@/modules/clinical-work/actions";
import type { SaveTarget } from "@/modules/clinical-work/targets";

const m = es.memory;

export function SaveActions({
  caseId,
  conversationId,
  content,
  targets,
}: {
  caseId: string;
  conversationId: string;
  content: string;
  targets: SaveTarget[];
}) {
  const [showOthers, setShowOthers] = useState(false);
  const [result, setResult] = useState<(SaveResult & { label?: string }) | null>(null);
  const [pending, startTransition] = useTransition();

  if (targets.length === 0) return null;
  const [primary, ...others] = targets;

  const save = (target: SaveTarget) =>
    startTransition(async () => {
      const r = await saveFromChat({ caseId, conversationId, target: target.slug, content });
      setResult({ ...r, label: target.label });
      setShowOthers(false);
    });

  if (result?.ok) {
    return (
      <p className="mt-3 text-caption text-success">
        {m.savedIn(result.label ?? "")}{" "}
        {result.href ? (
          <Link href={result.href} className="text-primary hover:underline">
            {m.view}
          </Link>
        ) : null}
      </p>
    );
  }

  const buttonClass =
    "inline-flex h-9 items-center rounded-full border-2 border-border-strong bg-surface px-3 text-label text-ink hover:bg-surface-sunken disabled:opacity-60";

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => save(primary)}
          title={primary.replaces ? m.replaces : undefined}
          className={buttonClass}
        >
          {pending ? m.saving : m.saveTo(primary.label)}
        </button>
        {others.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowOthers((v) => !v)}
            className="text-label text-ink-muted hover:text-ink"
            aria-expanded={showOthers}
          >
            {m.otherSection}
          </button>
        ) : null}
      </div>
      {showOthers ? (
        <div className="flex flex-wrap gap-2">
          {others.map((t) => (
            <button
              key={t.slug}
              type="button"
              disabled={pending}
              onClick={() => save(t)}
              title={t.replaces ? m.replaces : undefined}
              className={buttonClass}
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : null}
      {result?.privacyWarning ? <p className="text-caption text-warning">{result.privacyWarning}</p> : null}
      {result?.error ? <p className="text-caption text-danger">{result.error}</p> : null}
    </div>
  );
}
