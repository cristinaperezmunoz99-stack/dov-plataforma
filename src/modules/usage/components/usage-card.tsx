import { es } from "@/lib/i18n/es";
import { formatDate } from "@/modules/cases/format";
import type { UsageStatus } from "../queries";

const t = es.usage;

export function UsageCard({ usage }: { usage: UsageStatus }) {
  const renewal = formatDate(usage.periodEnd ?? usage.periodStart);
  const ratio = usage.limit > 0 ? Math.min(1, usage.used / usage.limit) : 0;
  const barTone = usage.blocked ? "bg-danger" : usage.nearLimit ? "bg-warning" : "bg-primary";

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="eyebrow text-primary">{t.title}</h2>
        <span className="text-caption text-ink-muted">{usage.plan ? t.planName(usage.plan.name) : t.noPlanShort}</span>
      </div>
      {usage.plan ? (
        <>
          <p className="font-serif text-title text-ink">{t.count(usage.used, usage.limit)}</p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={usage.limit}
            aria-valuenow={usage.used}
            aria-label={t.title}
            className="h-2 overflow-hidden rounded-full bg-surface-sunken"
          >
            <div className={`h-full rounded-full ${barTone}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
          </div>
          <p className="text-body-sm text-ink-muted">
            {usage.blocked ? t.limitReached(renewal) : usage.nearLimit ? t.nearLimit(usage.remaining) : t.renews(renewal)}
          </p>
        </>
      ) : (
        <p className="text-body-sm text-ink-muted">{t.noPlan}</p>
      )}
    </section>
  );
}
