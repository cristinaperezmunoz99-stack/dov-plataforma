import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";
import { signOut } from "@/modules/auth/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
        <span className="font-serif text-heading text-ink">{es.app.name}</span>
        <div className="flex items-center gap-4">
          <span className="text-body-sm text-ink-muted">{user.email}</span>
          <form action={signOut}>
            <Button type="submit" variant="ghost">
              {es.auth.signOut}
            </Button>
          </form>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
