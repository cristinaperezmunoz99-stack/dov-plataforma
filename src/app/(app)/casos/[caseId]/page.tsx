import { notFound } from "next/navigation";
import { deleteCase, updateCase } from "@/modules/cases/actions";
import { CaseForm } from "@/modules/cases/components/case-form";
import { DeleteCaseForm } from "@/modules/cases/components/delete-case-form";
import { getCase } from "@/modules/cases/queries";

export default async function CaseSummaryPage({ params }: PageProps<"/casos/[caseId]">) {
  const { caseId } = await params;
  const caseData = await getCase(caseId);
  if (!caseData) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-surface p-6">
        <CaseForm
          action={updateCase.bind(null, caseData.id)}
          mode="edit"
          initialValues={{ title: caseData.title, general_context: caseData.general_context }}
        />
      </div>
      <DeleteCaseForm action={deleteCase.bind(null, caseData.id)} caseCode={caseData.case_code} />
    </div>
  );
}
