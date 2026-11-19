import type { ChatUsage } from "./provider";

/**
 * Precios estimados en USD por millón de tokens (API estándar de Anthropic,
 * consultados en noviembre de 2026). Revisar cuando Anthropic cambie tarifas.
 * Haiku 5.5: tarifa para prompts de hasta 100.000 tokens.
 */
type Price = { input: number; output: number; cacheWrite: number; cacheRead: number };

const PRICES: Record<string, Price> = {
  "claude-opus-5-5": { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.1 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheWrite: 0.125, cacheRead: 0.01 },
};

/** Si el modelo no está en la tabla, se usa la tarifa más cara para no subestimar. */
const FALLBACK: Price = PRICES["claude-opus-5-5"];

export function estimateCostUsd(model: string, usage: ChatUsage): number {
  const p = PRICES[model] ?? FALLBACK;
  const cost =
    (usage.inputTokens * p.input +
      usage.outputTokens * p.output +
      usage.cacheCreationInputTokens * p.cacheWrite +
      usage.cacheReadInputTokens * p.cacheRead) /
    1_000_000;
  return Math.round(cost * 1_000_000) / 1_000_000;
}
