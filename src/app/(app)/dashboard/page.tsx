import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";

export default async function DashboardPage() {
  const user = await requireUser();
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="font-serif text-display text-ink">{es.dashboard.greeting(user.name)}</h1>
      <p className="mt-2 text-body text-ink-muted">{es.dashboard.placeholder}</p>
    </main>
  );
}
