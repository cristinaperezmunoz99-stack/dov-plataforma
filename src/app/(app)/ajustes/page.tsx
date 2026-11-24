import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";
import { hasMfa } from "@/modules/mfa/actions";
import { MfaSettings } from "@/modules/mfa/components/mfa-settings";

export default async function SettingsPage() {
  await requireUser();
  const mfaEnabled = await hasMfa();
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <h1 className="font-serif text-display text-ink">{es.settings.title}</h1>
      <h2 className="text-label text-ink-muted">{es.settings.security}</h2>
      <MfaSettings enabled={mfaEnabled} />
    </main>
  );
}
