import type { TextareaHTMLAttributes } from "react";

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
};

export function TextareaField({ label, name, error, hint, id, ...props }: TextareaFieldProps) {
  const inputId = id ?? name;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-label text-ink">
        {label}
      </label>
      <textarea
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`min-h-40 rounded-md border bg-surface px-3 py-2 text-body text-ink placeholder:text-ink-muted ${
          error ? "border-danger" : "border-border-strong"
        }`}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-body-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-body-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
