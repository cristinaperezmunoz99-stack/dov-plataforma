import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonBase, buttonVariants } from "./button";

type Variant = keyof typeof buttonVariants;

export function LinkButton({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${buttonBase} ${buttonVariants[variant]} ${className}`} {...props} />;
}
