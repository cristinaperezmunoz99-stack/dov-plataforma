import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";
import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";
import { CaseList } from "@/modules/cases/components/case-list";
import { CaseSearch } from "@/modules/cases/components/case-search";
import { listCases } from "@/modules/cases/queries";

export default async function DashboardPage() {
  const user = await requireUser();
  const recent = await listCases({ limit: 5 });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-display text-ink">{es.dashboard.greeting(user.name)}</h1>
        <LinkButton href="/casos/nuevo">{es.cases.new}</LinkButton>
      </div>

      <CaseSearch />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-heading text-ink">{es.dashboard.recent}</h2>
          {recent.length > 0 ? (
            <Link href="/casos" className="text-label text-primary hover:underline">
              {es.dashboard.viewAll}
            </Link>
          ) : null}
        </div>
        {recent.length > 0 ? (
          <CaseList cases={recent} />
        ) : (
          <p className="rounded-lg border border-border bg-surface px-6 py-8 text-body text-ink-muted">
            {es.dashboard.empty}
          </p>
        )}
      </section>
    </main>
  );
}
