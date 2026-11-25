import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "dark" | "secondary" | "ghost";

export const buttonVariants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  dark: "bg-night text-on-night hover:bg-ink-muted",
  secondary: "border-2 border-border-strong bg-transparent text-ink hover:bg-surface-sunken",
  ghost: "text-ink-muted hover:bg-surface-sunken hover:text-ink",
};

export const buttonBase =
  "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-label font-semibold transition-colors";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`${buttonBase} disabled:cursor-not-allowed disabled:opacity-60 ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  );
}
