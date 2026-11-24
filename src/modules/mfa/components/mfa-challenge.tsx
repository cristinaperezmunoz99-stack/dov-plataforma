"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { es } from "@/lib/i18n/es";
import { signOut } from "@/modules/auth/actions";
import { verifyLoginCode } from "../actions";

const t = es.mfa;

export function MfaChallenge() {
  const [state, action, pending] = useActionState(verifyLoginCode, {});
  return (
    <>
      <h1 className="mb-2 text-heading text-ink">{t.challengeTitle}</h1>
      <p className="mb-6 text-body-sm text-ink-muted">{t.challengeDescription}</p>
      <form action={action} className="flex flex-col gap-4">
        {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
        <Field
          label={t.codeLabel}
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          autoFocus
          required
        />
        <Button type="submit" disabled={pending}>
          {pending ? t.verifying : t.challengeSubmit}
        </Button>
      </form>
      <form action={signOut} className="mt-6">
        <button type="submit" className="text-body-sm text-ink-muted hover:text-ink">
          {es.auth.signOut}
        </button>
      </form>
      <p className="mt-4 text-caption text-ink-muted">{t.lostDevice}</p>
    </>
  );
}
