import "server-only";
import { ACTIVE_STATUSES, USAGE_WARNING_RATIO, fallbackPlan, getPlan, type Plan } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export type UsageStatus = {
  plan: Plan | null;
  periodStart: string;
  periodEnd: string | null;
  used: number;
  limit: number;
  remaining: number;
  nearLimit: boolean;
  /** true si no puede usar los asistentes (sin plan, límite o tope de gasto). */
  blocked: boolean;
  reason: "no_plan" | "limit" | null;
};

/** Inicio del mes natural en UTC: periodo por defecto sin suscripción de Stripe. */
function monthStart(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

function nextMonthStart(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
}

/** Plan, periodo y consumo del usuario actual. Todo con su identidad (RLS). */
export async function getUsageStatus(): Promise<UsageStatus> {
  const supabase = await createClient();
  const { data: sub, error: subError } = await supabase
    .from("subscriptions")
    .select("plan_id, status, current_period_start, current_period_end")
    .maybeSingle();
  if (subError) console.error("usage subscription", subError.code);

  const subscribed = sub && ACTIVE_STATUSES.has(sub.status) ? getPlan(sub.plan_id) : null;
  const plan = subscribed ?? fallbackPlan();
  const periodStart = (subscribed && sub?.current_period_start) || monthStart();
  const periodEnd = (subscribed && sub?.current_period_end) || nextMonthStart();

  if (!plan) {
    return { plan: null, periodStart, periodEnd, used: 0, limit: 0, remaining: 0, nearLimit: false, blocked: true, reason: "no_plan" };
  }

  const { data, error } = await supabase.rpc("my_usage_since", { p_since: periodStart });
  if (error) {
    console.error("usage totals", error.code);
    // Si no se puede medir, se bloquea: es el lado seguro para el gasto.
    return { plan, periodStart, periodEnd, used: 0, limit: plan.messagesPerMonth, remaining: 0, nearLimit: false, blocked: true, reason: "limit" };
  }
  const used = Number(data?.[0]?.messages ?? 0);
  const cost = Number(data?.[0]?.cost_usd ?? 0);
  const limit = plan.messagesPerMonth;
  const overCost = cost >= plan.costCapUsd;
  const remaining = overCost ? 0 : Math.max(0, limit - used);
  const blocked = remaining === 0;

  return {
    plan,
    periodStart,
    periodEnd,
    used,
    limit,
    remaining,
    nearLimit: !blocked && (used >= limit * USAGE_WARNING_RATIO || cost >= plan.costCapUsd * USAGE_WARNING_RATIO),
    blocked,
    reason: blocked ? "limit" : null,
  };
}
