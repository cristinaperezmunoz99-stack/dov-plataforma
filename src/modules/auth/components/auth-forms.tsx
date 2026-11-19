"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { es } from "@/lib/i18n/es";
import {
  requestPasswordReset,
  signIn,
  signUp,
  updatePassword,
} from "@/modules/auth/actions";
import type { FormState } from "@/modules/auth/schemas";

const initial: FormState = {};
const t = es.auth;

function Title({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-6 text-heading text-ink">{children}</h1>;
}

export function LoginForm({ linkError, confirmed }: { linkError?: boolean; confirmed?: boolean }) {
  const [state, action, pending] = useActionState(signIn, initial);
  return (
    <>
      <Title>{t.login.title}</Title>
      <form action={action} className="flex flex-col gap-4" noValidate>
        {linkError && !state.error ? <Alert tone="danger">{t.confirmError}</Alert> : null}
        {confirmed && !state.error ? <Alert tone="success">{t.confirmed}</Alert> : null}
        {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
        <Field label={es.common.email} name="email" type="email" autoComplete="email" required error={state.fieldErrors?.email} />
        <Field label={es.common.password} name="password" type="password" autoComplete="current-password" required error={state.fieldErrors?.password} />
        <Button type="submit" disabled={pending}>
          {pending ? t.login.pending : t.login.submit}
        </Button>
      </form>
      <div className="mt-6 flex flex-col gap-2 text-body-sm">
        <Link href="/recuperar" className="text-primary hover:underline">
          {t.login.forgot}
        </Link>
        <p className="text-ink-muted">
          {t.login.noAccount}{" "}
          <Link href="/registro" className="text-primary hover:underline">
            {t.login.toSignup}
          </Link>
        </p>
      </div>
    </>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signUp, initial);
  if (state.success) {
    return (
      <>
        <Title>{t.signup.title}</Title>
        <Alert tone="success">{state.success}</Alert>
      </>
    );
  }
  return (
    <>
      <Title>{t.signup.title}</Title>
      <form action={action} className="flex flex-col gap-4" noValidate>
        {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
        <Field label={es.common.name} name="name" autoComplete="name" required error={state.fieldErrors?.name} />
        <Field label={es.common.email} name="email" type="email" autoComplete="email" required error={state.fieldErrors?.email} />
        <Field label={es.common.password} name="password" type="password" autoComplete="new-password" required hint={t.signup.passwordHint} error={state.fieldErrors?.password} />
        <p className="text-body-sm text-ink-muted">{t.signup.privacyNote}</p>
        <Button type="submit" disabled={pending}>
          {pending ? t.signup.pending : t.signup.submit}
        </Button>
      </form>
      <p className="mt-6 text-body-sm text-ink-muted">
        {t.signup.hasAccount}{" "}
        <Link href="/login" className="text-primary hover:underline">
          {t.signup.toLogin}
        </Link>
      </p>
    </>
  );
}

export function RecoverForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);
  return (
    <>
      <Title>{t.recover.title}</Title>
      {state.success ? (
        <Alert tone="success">{state.success}</Alert>
      ) : (
        <form action={action} className="flex flex-col gap-4" noValidate>
          <p className="text-body-sm text-ink-muted">{t.recover.description}</p>
          <Field label={es.common.email} name="email" type="email" autoComplete="email" required error={state.fieldErrors?.email} />
          <Button type="submit" disabled={pending}>
            {pending ? t.recover.pending : t.recover.submit}
          </Button>
        </form>
      )}
      <Link href="/login" className="mt-6 inline-block text-body-sm text-primary hover:underline">
        {t.recover.back}
      </Link>
    </>
  );
}

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initial);
  return (
    <>
      <Title>{t.update.title}</Title>
      <form action={action} className="flex flex-col gap-4" noValidate>
        {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
        <Field label={es.common.password} name="password" type="password" autoComplete="new-password" required hint={t.signup.passwordHint} error={state.fieldErrors?.password} />
        <Button type="submit" disabled={pending}>
          {pending ? t.update.pending : t.update.submit}
        </Button>
      </form>
    </>
  );
}
