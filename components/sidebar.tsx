"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx, Badge } from "@/components/ui";

const links = [
  { href: "/", label: "Today" },
  { href: "/weekly", label: "Weekly" },
  { href: "/monthly", label: "Monthly" },
  { href: "/goals", label: "2026 Goals" },
  { href: "/calendar", label: "Calendar" },
  { href: "/timer", label: "Timer" },
  { href: "/settings", label: "Settings" }
];


export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-full md:w-[280px] shrink-0">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[22px] font-semibold tracking-tight">Discipline Tracker</div>
            <div className="text-white/60 text-[14px]">2026 • local-only</div>
          </div>
          <Badge className="hidden md:inline-flex">Strict</Badge>
        </div>

        <nav className="mt-5 grid gap-2">
          {links.map(l => {
            const active = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cx(
                  "rounded-xl border px-4 py-3 text-[18px] font-semibold transition",
                  active
                    ? "border-white/20 bg-white text-neutral-950"
                    : "border-white/10 bg-white/0 text-white hover:bg-white/10"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 text-white/60 text-[14px] leading-relaxed">
          Rule: if it’s written, it’s required.
        </div>
      </div>
    </aside>
  );
}
