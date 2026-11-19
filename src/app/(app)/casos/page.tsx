import { LinkButton } from "@/components/ui/link-button";
import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";
import { CaseList } from "@/modules/cases/components/case-list";
import { CaseSearch } from "@/modules/cases/components/case-search";
import { listCases } from "@/modules/cases/queries";

export default async function CasesPage({ searchParams }: PageProps<"/casos">) {
  await requireUser();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const cases = await listCases({ query });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-display text-ink">{es.cases.title}</h1>
        <LinkButton href="/casos/nuevo">{es.cases.new}</LinkButton>
      </div>
      <CaseSearch defaultValue={query} />
      {cases.length > 0 ? (
        <CaseList cases={cases} />
      ) : (
        <p className="rounded-lg border border-border bg-surface px-6 py-8 text-body text-ink-muted">
          {query ? es.cases.noResults(query) : es.cases.empty}
        </p>
      )}
    </main>
  );
}
