import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";
import { CaseTabs } from "@/modules/cases/components/case-tabs";
import { caseAccent } from "@/modules/cases/format";
import { getCase } from "@/modules/cases/queries";

export default async function CaseLayout({ children, params }: LayoutProps<"/casos/[caseId]">) {
  await requireUser();
  const { caseId } = await params;
  const caseData = await getCase(caseId);
  if (!caseData) notFound();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:px-12">
      <div className="flex flex-col gap-3 print:hidden">
        <nav aria-label={es.cases.breadcrumb} className="flex gap-2 text-label text-ink-muted">
          <Link href="/casos" className="hover:text-ink">
            {es.cases.title}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">{caseData.case_code}</span>
        </nav>
        <span className="flex items-center gap-2 text-label font-semibold tracking-wide text-ink">
          <span aria-hidden="true" className={`size-2.5 rounded-full ${caseAccent(caseData.case_code)}`} />
          {caseData.case_code}
        </span>
        <h1 className="font-serif text-display text-ink">{caseData.title || es.cases.untitled}</h1>
      </div>
      <CaseTabs caseId={caseData.id} />
      {children}
    </main>
  );
}
