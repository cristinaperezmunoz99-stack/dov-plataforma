import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, ChatRequest, ChatResult } from "./provider";

let client: Anthropic | null = null;

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("Falta ANTHROPIC_API_KEY");
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 2 });
  return client;
}

export const anthropicProvider: AIProvider = {
  async streamChat(request: ChatRequest, onText): Promise<ChatResult> {
    const stream = getClient().messages.stream({
      model: request.model,
      max_tokens: request.maxTokens,
      system: request.system.map((b) => ({
        type: "text" as const,
        text: b.text,
        ...(b.cache ? { cache_control: { type: "ephemeral" as const } } : {}),
      })),
      messages: request.messages.map((m) =>
        m.cache
          ? {
              role: m.role,
              content: [{ type: "text" as const, text: m.content, cache_control: { type: "ephemeral" as const } }],
            }
          : { role: m.role, content: m.content },
      ),
    });

    stream.on("text", (delta) => onText(delta));
    const message = await stream.finalMessage();

    const text = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");

    return {
      text,
      stopReason: message.stop_reason ?? null,
      usage: {
        inputTokens: message.usage.input_tokens ?? 0,
        outputTokens: message.usage.output_tokens ?? 0,
        cacheCreationInputTokens: message.usage.cache_creation_input_tokens ?? 0,
        cacheReadInputTokens: message.usage.cache_read_input_tokens ?? 0,
      },
    };
  },
};
