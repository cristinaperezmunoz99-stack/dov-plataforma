import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";
import { CaseTabs } from "@/modules/cases/components/case-tabs";
import { getCase } from "@/modules/cases/queries";

export default async function CaseLayout({ children, params }: LayoutProps<"/casos/[caseId]">) {
  await requireUser();
  const { caseId } = await params;
  const caseData = await getCase(caseId);
  if (!caseData) notFound();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <div className="print:hidden">
        <Link href="/casos" className="text-label text-ink-muted hover:text-ink">
          ← {es.cases.back}
        </Link>
        <h1 className="mt-3 font-serif text-title text-ink">{caseData.case_code}</h1>
        <p className="text-body text-ink-muted">{caseData.title || es.cases.untitled}</p>
      </div>
      <CaseTabs caseId={caseData.id} />
      {children}
    </main>
  );
}
