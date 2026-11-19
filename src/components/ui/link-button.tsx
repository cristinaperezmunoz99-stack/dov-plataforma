import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "border border-border-strong bg-surface text-ink hover:bg-surface-sunken",
};

export function LinkButton({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link
      className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-label transition-colors ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
