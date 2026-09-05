"use client";

import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  MessageCircle,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type DashboardView =
  | "overview"
  | "applications"
  | "chat"
  | "analytics"
  | "settings";

const items: Array<{ id: DashboardView; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "applications", label: "التطبيقات", icon: ClipboardList },
  { id: "chat", label: "المحادثات", icon: MessageCircle },
  { id: "analytics", label: "التحليلات", icon: BarChart3 },
  { id: "settings", label: "الإعدادات", icon: Settings },
];

export function DashboardNav({
  activeView,
  onChange,
}: {
  activeView: DashboardView;
  onChange: (view: DashboardView) => void;
}) {
  return (
    <nav
      aria-label="أقسام لوحة الإدارة"
      className="border-b border-[#e5e8ee] bg-white px-3 dark:border-slate-800 dark:bg-slate-950 sm:px-5"
    >
      <div className="flex h-9 items-center gap-1 overflow-x-auto scrollbar-thin">
        {items.map(({ id, label, icon: Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-full shrink-0 items-center gap-1.5 border-b-2 px-3 text-[10px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                active
                  ? "border-[#0b72ce] text-[#0b72ce]"
                  : "border-transparent text-slate-400 hover:border-slate-300 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}