import Link from "next/link";
import { BrandMark } from "@/components/app-shell/brand-mark";
import { es } from "@/lib/i18n/es";

const t = es.authShell;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <section className="bg-paper flex flex-col gap-10 px-6 py-8 lg:flex-1 lg:px-14 lg:py-10">
        <BrandMark href="/login" />
        <div className="hidden max-w-xl flex-col gap-6 lg:flex">
          <span className="eyebrow inline-flex items-center gap-2.5 self-start rounded-full bg-night px-4 py-2 text-on-night">
            <span aria-hidden="true" className="size-2 rounded-full bg-lime" />
            {t.eyebrow}
          </span>
          <p className="font-serif text-mega text-ink">
            {t.title} <em className="text-primary">{t.titleAccent}</em>
          </p>
          <p className="max-w-md text-body text-ink-muted">{t.lead}</p>
          <div aria-hidden="true" className="mt-4 flex flex-wrap items-start gap-3">
            <span className="-rotate-2 rounded-lg rounded-bl-sm bg-lime px-5 py-4 font-serif text-title italic text-ink">
              {t.bubble1}
            </span>
            <span className="rotate-1 rounded-lg rounded-br-sm bg-night px-5 py-4 font-serif text-title italic text-on-night">
              {t.bubble2}
            </span>
            <span className="rounded-lg bg-lavender-soft px-5 py-4 font-serif text-title italic text-primary-hover">
              {t.bubble3}
            </span>
          </div>
        </div>
      </section>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-primary px-4 py-12 lg:max-w-xl lg:px-10">
        <div className="w-full max-w-md rounded-lg bg-surface p-8 shadow-lg">{children}</div>
        <nav className="flex gap-4 text-body-sm">
          <Link href="/legal/terminos" className="text-on-primary/85 hover:text-on-primary">{es.legal.footer.terms}</Link>
          <Link href="/legal/privacidad" className="text-on-primary/85 hover:text-on-primary">{es.legal.footer.privacy}</Link>
          <Link href="/legal/proveedores" className="text-on-primary/85 hover:text-on-primary">{es.legal.footer.providers}</Link>
        </nav>
      </main>
    </div>
  );
}
