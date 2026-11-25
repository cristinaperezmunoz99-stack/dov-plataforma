/**
 * Configuración centralizada de planes. Única fuente de verdad para límites y funciones.
 * Los price_id de Stripe se leen de variables de entorno (fase 6).
 *
 * messagesPerMonth: respuestas de asistente incluidas por periodo (lo que ve el usuario).
 * costCapUsd: tope interno de gasto en IA por periodo. Protege frente a usos con
 * mensajes muy largos aunque no se llegue al número de mensajes. No se muestra.
 */
export type PlanId = "beta" | "profesional";

export type Plan = {
  id: PlanId;
  name: string;
  messagesPerMonth: number;
  costCapUsd: number;
  stripePriceEnv: string | null;
};

export const PLANS: Record<PlanId, Plan> = {
  beta: {
    id: "beta",
    name: "Beta",
    messagesPerMonth: 60,
    costCapUsd: 4,
    stripePriceEnv: null,
  },
  profesional: {
    id: "profesional",
    name: "Profesional",
    messagesPerMonth: 150,
    costCapUsd: 8,
    stripePriceEnv: "STRIPE_PRICE_PROFESIONAL",
  },
};

/** A partir de este porcentaje del límite se avisa en la interfaz. */
export const USAGE_WARNING_RATIO = 0.8;

/** Estados de Stripe que dan acceso a los asistentes. */
export const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export function getPlan(id: string | null | undefined): Plan | null {
  if (!id) return null;
  return (PLANS as Record<string, Plan>)[id] ?? null;
}

/**
 * Plan para usuarios sin suscripción mientras no haya pagos (beta cerrada).
 * Se activa con la variable de entorno BETA_PLAN_ID. Sin ella, sin suscripción no hay asistentes.
 */
export function fallbackPlan(): Plan | null {
  return getPlan(process.env.BETA_PLAN_ID);
}
