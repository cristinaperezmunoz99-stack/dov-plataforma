import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";
import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";
import { CaseList } from "@/modules/cases/components/case-list";
import { CaseSearch } from "@/modules/cases/components/case-search";
import { listCases } from "@/modules/cases/queries";
import { hasMfa } from "@/modules/mfa/actions";

export default async function DashboardPage() {
  const user = await requireUser();
  const [recent, mfaEnabled] = await Promise.all([listCases({ limit: 5 }), hasMfa()]);

  return (
    <main className="bg-paper min-h-full">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <span className="eyebrow text-primary">{es.dashboard.greeting(user.name)}</span>
            <h1 className="font-serif text-hero text-ink">
              {es.dashboard.title} <em className="text-primary">{es.dashboard.titleAccent}</em>
            </h1>
          </div>
          <LinkButton href="/casos/nuevo" variant="dark">
            {es.cases.new}
          </LinkButton>
        </div>

        {!mfaEnabled ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-warning-soft px-5 py-4">
            <p className="text-body-sm text-warning">{es.mfa.banner}</p>
            <Link href="/ajustes" className="text-label font-semibold text-warning underline">
              {es.mfa.bannerCta}
            </Link>
          </div>
        ) : null}

        <CaseSearch />

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="eyebrow text-ink-muted">{es.dashboard.recent}</h2>
            {recent.length > 0 ? (
              <Link href="/casos" className="text-label font-semibold text-primary hover:underline">
                {es.dashboard.viewAll}
              </Link>
            ) : null}
          </div>
          {recent.length > 0 ? (
            <CaseList cases={recent} showCreate />
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-lg border-2 border-dashed border-lavender bg-surface px-8 py-10">
              <p className="max-w-md font-serif text-title text-ink">{es.dashboard.empty}</p>
              <LinkButton href="/casos/nuevo">{es.cases.new}</LinkButton>
            </div>
          )}
        </section>

        <p className="text-body-sm text-ink-muted">{es.app.supportNote}</p>
      </div>
    </main>
  );
}
