import Link from "next/link";
import { es } from "@/lib/i18n/es";

export default function CaseNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
      <p className="text-body text-ink">{es.cases.notFound}</p>
      <Link href="/casos" className="text-label text-primary hover:underline">
        {es.cases.back}
      </Link>
    </main>
  );
}
