"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { es } from "@/lib/i18n/es";
import { STREAM_ERROR_MARKER } from "../stream";
import { type CategoryOption, SaveToMemory } from "./save-to-memory";

type Message = { id: string; role: "user" | "assistant"; content: string };

const c = es.chat;

export function Chat({
  caseId,
  conversationId,
  assistantName,
  initialMessages,
  categories,
  disabled,
}: {
  caseId: string;
  conversationId: string;
  assistantName: string;
  initialMessages: Message[];
  categories: CategoryOption[];
  disabled?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ text: string; tone: "danger" | "warning" } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || pending) return;
    setError(null);
    setPending(true);

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text };
    const replyId = `a-${Date.now()}`;
    setMessages((prev) => [...prev, userMsg, { id: replyId, role: "assistant", content: "" }]);
    setInput("");

    const removePlaceholders = (restoreInput: boolean) => {
      setMessages((prev) => prev.filter((m) => m.id !== replyId && (!restoreInput || m.id !== userMsg.id)));
      if (restoreInput) setInput(text);
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: text }),
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        removePlaceholders(true);
        const fallback = res.status === 401 ? c.errors.unauthorized : c.errors.generic;
        setError({
          text: res.status === 401 ? c.errors.unauthorized : (data?.error ?? fallback),
          tone: res.status === 422 || res.status === 429 ? "warning" : "danger",
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        const visible = full.replace(STREAM_ERROR_MARKER, "");
        setMessages((prev) => prev.map((m) => (m.id === replyId ? { ...m, content: visible } : m)));
      }

      if (full.includes(STREAM_ERROR_MARKER)) {
        const visible = full.replace(STREAM_ERROR_MARKER, "").trim();
        if (!visible) removePlaceholders(false);
        setError({ text: visible ? c.errors.interrupted : c.errors.generic, tone: "danger" });
      }
    } catch {
      setError({ text: c.errors.interrupted, tone: "danger" });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-64 flex-col gap-4 rounded-lg border border-border bg-surface p-6">
        {messages.length === 0 ? (
          <p className="text-body-sm text-ink-muted">{c.empty}</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={`max-w-[85%] rounded-md px-4 py-3 ${
                  m.role === "user" ? "bg-primary-soft text-ink" : "bg-surface-sunken text-ink"
                }`}
              >
                <p className="mb-1 text-caption text-ink-muted">{m.role === "user" ? c.you : assistantName}</p>
                {m.role === "assistant" ? (
                  m.content ? (
                    <>
                      <Markdown>{m.content}</Markdown>
                      {!(pending && m.id === messages[messages.length - 1]?.id) ? (
                        <SaveToMemory caseId={caseId} content={m.content} categories={categories} />
                      ) : null}
                    </>
                  ) : (
                    <p className="text-body text-ink-muted">…</p>
                  )
                ) : (
                  <p className="whitespace-pre-wrap text-body">{m.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {error ? <Alert tone={error.tone}>{error.text}</Alert> : null}

      {disabled ? null : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="flex flex-col gap-2"
        >
          <label htmlFor="chat-input" className="sr-only">
            {c.placeholder}
          </label>
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            rows={3}
            maxLength={20000}
            placeholder={c.placeholder}
            disabled={pending}
            className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-body text-ink placeholder:text-ink-muted"
          />
          <div className="flex items-center justify-between gap-4">
            <p className="text-caption text-ink-muted">{c.disclaimer}</p>
            <Button type="submit" disabled={pending || !input.trim()}>
              {pending ? c.sending : c.send}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
