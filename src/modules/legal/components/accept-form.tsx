"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { es } from "@/lib/i18n/es";
import { acceptCurrentLegal } from "../actions";

const t = es.legal;

export function AcceptLegalForm() {
  const [state, action, pending] = useActionState(acceptCurrentLegal, {});
  return (
    <>
      <h1 className="mb-2 font-serif text-title text-ink">{t.gateTitle}</h1>
      <p className="mb-4 text-body-sm text-ink-muted">{t.gateDescription}</p>
      <form action={action} className="flex flex-col gap-4" noValidate>
        {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
        <label className="flex items-start gap-2 text-body-sm text-ink">
          <input type="checkbox" name="acceptLegal" required className="mt-1 size-4 accent-primary" />
          <span>
            {t.acceptPrefix}{" "}
            <a href="/legal/terminos" target="_blank" className="text-primary underline">{t.terms}</a>,{" "}
            <a href="/legal/privacidad" target="_blank" className="text-primary underline">{t.privacy}</a>{" "}
            {t.and}{" "}
            <a href="/legal/encargo" target="_blank" className="text-primary underline">{t.dpa}</a>.
          </span>
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? t.gatePending : t.gateSubmit}
        </Button>
      </form>
    </>
  );
}
