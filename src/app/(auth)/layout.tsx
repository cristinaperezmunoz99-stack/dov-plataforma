import { es } from "@/lib/i18n/es";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <p className="mb-8 font-serif text-title text-ink">{es.app.name}</p>
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 sm:p-8">
        {children}
      </div>
    </main>
  );
}
