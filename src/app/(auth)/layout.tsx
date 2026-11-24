import Link from "next/link";
import { es } from "@/lib/i18n/es";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <p className="mb-8 font-serif text-title text-ink">{es.app.name}</p>
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 sm:p-8">
        {children}
      </div>
      <nav className="mt-6 flex gap-4 text-body-sm">
        <Link href="/legal/terminos" className="text-ink-muted hover:text-ink">{es.legal.footer.terms}</Link>
        <Link href="/legal/privacidad" className="text-ink-muted hover:text-ink">{es.legal.footer.privacy}</Link>
        <Link href="/legal/proveedores" className="text-ink-muted hover:text-ink">{es.legal.footer.providers}</Link>
      </nav>
    </main>
  );
}
