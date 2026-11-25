/**
 * Interfaz común para proveedores de IA. La plataforma solo depende de esto,
 * así que cambiar de proveedor o de modelo no afecta al resto del código.
 */
export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
  /** Punto de caché: todo lo anterior (incluido este turno) se reutiliza en la siguiente llamada. */
  cache?: boolean;
};

export type SystemBlock = {
  text: string;
  /** Marca el bloque como cacheable (contenido que se repite entre mensajes). */
  cache?: boolean;
};

export type ChatRequest = {
  model: string;
  maxTokens: number;
  system: SystemBlock[];
  messages: ChatTurn[];
};

export type ChatUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
};

export type ChatResult = { text: string; usage: ChatUsage; stopReason: string | null };

export interface AIProvider {
  /** Emite el texto según se genera y resuelve con el resultado completo. */
  streamChat(request: ChatRequest, onText: (delta: string) => void): Promise<ChatResult>;
}
