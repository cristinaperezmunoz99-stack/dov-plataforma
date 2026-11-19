import type { ReactNode } from "react";

type Tone = "danger" | "success" | "warning";

const tones: Record<Tone, string> = {
  danger: "bg-danger-soft text-danger",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
};

export function Alert({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`rounded-md px-4 py-3 text-body-sm ${tones[tone]}`}
    >
      {children}
    </div>
  );
}
