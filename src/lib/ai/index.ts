import { anthropicProvider } from "./anthropic";
import type { AIProvider } from "./provider";

/** Proveedor activo. Para cambiar de proveedor, solo se toca esta línea. */
export const aiProvider: AIProvider = anthropicProvider;
