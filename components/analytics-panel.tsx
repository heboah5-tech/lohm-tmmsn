"use client";

import { useEffect, useState } from "react";
import { Activity, Eye, MousePointerClick, RefreshCw, Users } from "lucide-react";

type AnalyticsResponse = {
  pageViews: number;
  todayPageViews: number;
  uniqueVisitors: number;
  activeUsers: number;
  todayVisitors: number;
  totalVisitors: number;
  visitorsWithCard: number;
  visitorsWithPhone: number;
  devices: Array<{ device: string; users: number }>;
  countries: Array<{ country: string; users: number }>;
  viewsByPage: Array<{ page: string; views: number }>;
  eventCounts: Array<{ event: string; count: number }>;
};

const emptyAnalytics: AnalyticsResponse = {
  pageViews: 0,
  todayPageViews: 0,
  uniqueVisitors: 0,
  activeUsers: 0,
  todayVisitors: 0,
  totalVisitors: 0,
  visitorsWithCard: 0,
  visitorsWithPhone: 0,
  devices: [],
  countries: [],
  viewsByPage: [],
  eventCounts: [],
};

const formatNumber = (value: number) => new Intl.NumberFormat("ar-SA").format(value);

function BarList({
  title,
  rows,
  label,
}: {
  title: string;
  rows: Array<{ name: string; value: number }>;
  label: string;
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{title}</h3>
        <span className="text-[11px] text-slate-400">{label}</span>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-xl bg-slate-50 py-8 text-center text-xs text-slate-400 dark:bg-slate-950">
          لا توجد بيانات كافية بعد
        </p>
      ) : (
        <div className="space-y-3">
          {rows.slice(0, 8).map((row) => (
            <div key={row.name}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-semibold text-slate-600 dark:text-slate-300">{row.name}</span>
                <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                  {formatNumber(row.value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-blue-500 to-indigo-500 transition-all"
                  style={{ width: `${Math.max((row.value / max) * 100, 3)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function AnalyticsPanel() {
  const [data, setData] = useState(emptyAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/analytics", { credentials: "same-origin" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "تعذر تحميل التحليلات");
      setData({ ...emptyAnalytics, ...payload });
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر تحميل التحليلات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, []);

  if (loading && data.pageViews === 0) {
    return (
      <div className="grid flex-1 place-items-center p-6" dir="rtl">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          جاري تحميل التحليلات...
        </div>
      </div>
    );
  }

  if (error && data.pageViews === 0) {
    return (
      <div className="grid flex-1 place-items-center p-6" dir="rtl">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm dark:border-red-900/50 dark:bg-slate-900">
          <p className="font-bold text-red-600">{error}</p>
          <button onClick={() => void load()} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "مشاهدات الصفحات", value: data.pageViews, icon: Eye, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
    { label: "مشاهدات اليوم", value: data.todayPageViews, icon: Activity, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
    { label: "زوار فريدون", value: data.uniqueVisitors, icon: Users, color: "text-violet-600 bg-violet-50 dark:bg-violet-950/40" },
    { label: "الأحداث المسجلة", value: data.eventCounts.reduce((sum, item) => sum + item.count, 0), icon: MousePointerClick, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5" dir="rtl">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-blue-600">مركز البيانات</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">التحليلات والتقارير</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">بيانات مباشرة من سجلات الزيارات والأحداث.</p>
          </div>
          <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </button>
        </div>
        {error && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span>
                <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">{formatNumber(value)}</span>
              </div>
              <p className="mt-3 text-xs font-bold text-slate-500">{label}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <BarList title="أكثر الصفحات زيارة" label="page_view_events" rows={data.viewsByPage.map((item) => ({ name: item.page, value: item.views }))} />
          <BarList title="الأحداث الأكثر تكرارًا" label="event_name" rows={data.eventCounts.map((item) => ({ name: item.event, value: item.count }))} />
          <BarList title="الأجهزة" label="زوار" rows={data.devices.map((item) => ({ name: item.device, value: item.users }))} />
          <BarList title="الدول" label="زوار" rows={data.countries.map((item) => ({ name: item.country, value: item.users }))} />
        </div>
      </div>
    </div>
  );
}