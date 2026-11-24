import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { DPA_MD, PRIVACY_MD, TERMS_MD } from "@/content/legal/documents";
import { SUBPROCESSORS } from "@/content/legal/subprocessors";
import { es } from "@/lib/i18n/es";
import { LEGAL_IS_DRAFT, LEGAL_PAGES, LEGAL_VERSIONS, type LegalSlug } from "@/lib/legal/documents";

const t = es.legal;

const CONTENT: Record<Exclude<LegalSlug, "proveedores">, string> = {
  terminos: TERMS_MD,
  privacidad: PRIVACY_MD,
  encargo: DPA_MD,
};

const components: Components = {
  h2: ({ children }) => <h2 className="mt-8 text-heading text-ink">{children}</h2>,
  p: ({ children }) => <p className="mt-3">{children}</p>,
  ul: ({ children }) => <ul className="mt-3 list-disc space-y-1 pl-5">{children}</ul>,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  table: ({ children }) => (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-body-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border-strong px-2 py-2 text-left text-label text-ink">{children}</th>
  ),
  td: ({ children }) => <td className="border-b border-border px-2 py-2 align-top">{children}</td>,
};

function isSlug(slug: string): slug is LegalSlug {
  return slug in LEGAL_PAGES;
}

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: isSlug(slug) ? `${t.titles[slug]} · ${es.app.name}` : es.app.name };
}

export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();
  const doc = LEGAL_PAGES[slug];
  const version = doc === "subprocessors" ? LEGAL_VERSIONS.privacy : LEGAL_VERSIONS[doc];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link href="/" className="font-serif text-heading text-ink">
        {es.app.name}
      </Link>
      <h1 className="mt-8 font-serif text-display text-ink">{t.titles[slug]}</h1>
      <p className="mt-2 text-body-sm text-ink-muted">{t.version(version)}</p>
      {LEGAL_IS_DRAFT ? (
        <p className="mt-4 rounded-md bg-warning-soft px-3 py-2 text-body-sm text-warning">{t.draft}</p>
      ) : null}

      <div className="mt-6 text-body text-ink-muted">
        {slug === "proveedores" ? (
          <>
            <p>{t.providersIntro}</p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-body-sm">
                <thead>
                  <tr>
                    {Object.values(t.providersColumns).map((c) => (
                      <th key={c} className="border-b border-border-strong px-2 py-2 text-left text-label text-ink">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SUBPROCESSORS.map((s) => (
                    <tr key={s.name}>
                      <td className="border-b border-border px-2 py-2 align-top text-ink">
                        {s.name}
                        {s.status === "planned" ? (
                          <span className="block text-body-sm text-ink-muted">{t.planned}</span>
                        ) : null}
                      </td>
                      <td className="border-b border-border px-2 py-2 align-top">{s.purpose}</td>
                      <td className="border-b border-border px-2 py-2 align-top">{s.location}</td>
                      <td className="border-b border-border px-2 py-2 align-top">{s.safeguards}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
            {CONTENT[slug]}
          </ReactMarkdown>
        )}
      </div>

      <nav className="mt-12 flex flex-wrap gap-4 border-t border-border pt-6 text-body-sm">
        <Link href="/legal/terminos" className="text-ink-muted hover:text-ink">{t.footer.terms}</Link>
        <Link href="/legal/privacidad" className="text-ink-muted hover:text-ink">{t.footer.privacy}</Link>
        <Link href="/legal/encargo" className="text-ink-muted hover:text-ink">{t.footer.dpa}</Link>
        <Link href="/legal/proveedores" className="text-ink-muted hover:text-ink">{t.footer.providers}</Link>
      </nav>
    </main>
  );
}
