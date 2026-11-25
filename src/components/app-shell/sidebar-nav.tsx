"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { es } from "@/lib/i18n/es";

const icons = {
  home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  cases: <path d="M4 5h6l2 2h8v12H4z" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </>
  ),
};

const items = [
  { href: "/dashboard", label: es.nav.home, icon: icons.home },
  { href: "/casos", label: es.nav.cases, icon: icons.cases },
  { href: "/ajustes", label: es.nav.settings, icon: icons.settings },
];

export type RecentCase = { id: string; code: string; accent: string };

export function SidebarNav({ recent }: { recent: RecentCase[] }) {
  const pathname = usePathname();
  return (
    <>
      <nav aria-label={es.nav.main} className="flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-11 items-center gap-3 rounded-full px-4 text-body transition-colors ${
                active ? "bg-on-night font-semibold text-ink" : "text-on-night/85 hover:bg-on-night/10"
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
                className={active ? "text-primary" : undefined}
              >
                {item.icon}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
      {recent.length > 0 ? (
        <div className="flex flex-col gap-1">
          <span className="eyebrow px-4 pb-1 text-lavender">{es.nav.recent}</span>
          {recent.map((c) => {
            const active = pathname.startsWith(`/casos/${c.id}`);
            return (
              <Link
                key={c.id}
                href={`/casos/${c.id}`}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-full px-4 py-2 text-body-sm text-on-night transition-colors ${
                  active ? "bg-on-night/15" : "hover:bg-on-night/10"
                }`}
              >
                <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${c.accent}`} />
                {c.code}
              </Link>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
