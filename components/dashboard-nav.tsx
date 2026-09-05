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
      className="border-b border-slate-200/80 bg-white/85 px-3 py-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85 sm:px-5"
    >
      <div className="mx-auto flex max-w-[1800px] items-center gap-1 overflow-x-auto scrollbar-thin">
        {items.map(({ id, label, icon: Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 sm:px-4 ${
                active
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}