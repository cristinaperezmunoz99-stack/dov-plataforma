import { es } from "@/lib/i18n/es";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-12">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8">
        <p className="text-caption text-ink-muted">{es.setup.status}</p>
        <h1 className="mt-2 font-serif text-display text-ink">{es.app.name}</h1>
        <p className="mt-1 text-body-sm text-ink-muted">{es.app.tagline}</p>
        <p className="mt-6 text-body text-ink">{es.setup.description}</p>
      </div>
    </main>
  );
}
