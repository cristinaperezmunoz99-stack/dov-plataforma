import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { BrandMark } from "@/components/app-shell/brand-mark";
import { signOut } from "@/modules/auth/actions";
import { caseAccent } from "@/modules/cases/format";
import { listCases } from "@/modules/cases/queries";
import { missingLegalAcceptances } from "@/modules/legal/queries";

function initials(name: string, email: string) {
  const source = name.trim() || email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if ((await missingLegalAcceptances(user.id)).length > 0) redirect("/condiciones");
  const recent = (await listCases({ limit: 5 })).map((c) => ({
    id: c.id,
    code: c.case_code,
    accent: caseAccent(c.case_code),
  }));

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <aside className="bg-night-dots flex shrink-0 flex-col gap-7 px-4 py-6 text-on-night md:sticky md:top-0 md:h-screen md:w-68 md:overflow-y-auto print:hidden">
        <BrandMark tone="night" />
        <SidebarNav recent={recent} />
        <div className="mt-auto flex items-center gap-3 border-t border-on-night/15 px-2 pt-4">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-lime text-caption font-bold text-ink"
          >
            {initials(user.name, user.email)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-semibold">{user.name || user.email}</p>
            <p className="truncate text-caption text-on-night/75">{user.email}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              aria-label={es.auth.signOut}
              title={es.auth.signOut}
              className="flex size-9 items-center justify-center rounded-full text-on-night/80 hover:bg-on-night/10 hover:text-on-night"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11" />
              </svg>
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
