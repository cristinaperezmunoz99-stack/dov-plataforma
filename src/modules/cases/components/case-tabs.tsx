"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { es } from "@/lib/i18n/es";

const t = es.cases.tabs;

export function CaseTabs({ caseId }: { caseId: string }) {
  const pathname = usePathname();
  const base = `/casos/${caseId}`;
  const tabs = [
    { label: t.summary, href: base, enabled: true },
    { label: t.memory, href: `${base}/memoria`, enabled: true },
    { label: t.sessions, href: `${base}/sesiones`, enabled: true },
    { label: t.conversations, href: `${base}/conversaciones`, enabled: false },
    { label: t.assistants, href: `${base}/asistentes`, enabled: false },
  ];

  return (
    <nav aria-label="Secciones del caso" className="flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((tab) => {
        const active = tab.href === base ? pathname === base : pathname.startsWith(tab.href);
        if (!tab.enabled) {
          return (
            <span
              key={tab.label}
              title={t.soon}
              aria-disabled="true"
              className="cursor-not-allowed whitespace-nowrap px-3 py-2 text-label text-ink-muted opacity-60"
            >
              {tab.label}
            </span>
          );
        }
        return (
          <Link
            key={tab.label}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-label transition-colors ${
              active ? "border-primary text-primary" : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
