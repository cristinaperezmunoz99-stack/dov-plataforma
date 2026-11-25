import Link from "next/link";
import { es } from "@/lib/i18n/es";

/**
 * Logotipo provisional: nombre en mayúsculas estrechas y submarca.
 * PENDIENTE: sustituir el círculo por el símbolo de Darle Otra Vuelta cuando llegue el SVG.
 */
export function BrandMark({ tone = "light", href = "/dashboard" }: { tone?: "light" | "night"; href?: string }) {
  const night = tone === "night";
  return (
    <Link href={href} className="flex flex-col gap-0.5 px-2">
      <span className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={`flex size-8 items-center justify-center rounded-full ${night ? "bg-on-night" : "bg-night"}`}
        >
          <span className="size-2.5 rounded-full bg-lime" />
        </span>
        <span className={`wordmark ${night ? "text-on-night" : "text-ink"}`}>{es.app.name}</span>
      </span>
      <span className={`pl-10.5 text-caption ${night ? "text-on-night/70" : "text-ink-muted"}`}>{es.nav.brandBy}</span>
    </Link>
  );
}
