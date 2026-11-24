import Link from "next/link";
import { redirect } from "next/navigation";
import { missingLegalAcceptances } from "@/modules/legal/queries";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";
import { signOut } from "@/modules/auth/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if ((await missingLegalAcceptances(user.id)).length > 0) redirect("/condiciones");
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border bg-surface print:hidden">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-serif text-heading text-ink">
              {es.app.name}
            </Link>
            <nav className="flex gap-4 text-label">
              <Link href="/dashboard" className="text-ink-muted hover:text-ink">
                {es.nav.home}
              </Link>
              <Link href="/casos" className="text-ink-muted hover:text-ink">
                {es.nav.cases}
              </Link>
              <Link href="/ajustes" className="text-ink-muted hover:text-ink">
                {es.nav.settings}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-body-sm text-ink-muted sm:inline">{user.email}</span>
            <form action={signOut}>
              <Button type="submit" variant="ghost">
                {es.auth.signOut}
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
