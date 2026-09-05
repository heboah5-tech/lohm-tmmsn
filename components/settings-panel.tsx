"use client";

import { useEffect, useState } from "react";
import { Check, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { getSettings, updateSettings, type Settings } from "@/lib/supabase/settings";

export function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({ blockedCardBins: [], allowedCountries: [] });
  const [bins, setBins] = useState("");
  const [countries, setCountries] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    void getSettings().then((value) => {
      setSettings(value);
      setBins(value.blockedCardBins.join(", "));
      setCountries(value.allowedCountries.join(", "));
    }).catch((error) => {
      setState({ type: "error", text: error instanceof Error ? error.message : "تعذر تحميل الإعدادات" });
    }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setState(null);
    const next: Settings = {
      blockedCardBins: [...new Set(bins.split(",").map((value) => value.trim()).filter(Boolean))],
      allowedCountries: [...new Set(countries.split(",").map((value) => value.trim().toUpperCase()).filter(Boolean))],
    };
    try {
      await updateSettings(next);
      setSettings(next);
      setState({ type: "success", text: "تم حفظ الإعدادات بنجاح" });
    } catch (error) {
      setState({ type: "error", text: error instanceof Error ? error.message : "تعذر حفظ الإعدادات" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5" dir="rtl">
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <p className="text-xs font-bold text-blue-600">إدارة النظام</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">الإعدادات</h2>
          <p className="mt-1 text-sm text-slate-500">التحكم في قواعد الحماية والدول المسموحة.</p>
        </div>
        {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">جاري تحميل الإعدادات...</div> : (
          <div className="grid gap-5 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40"><ShieldCheck className="h-5 w-5" /></span><div><h3 className="text-sm font-black text-slate-900 dark:text-white">حظر BIN البطاقات</h3><p className="text-xs text-slate-500">افصل القيم بفاصلة، 4-6 أرقام.</p></div></div>
              <textarea value={bins} onChange={(event) => setBins(event.target.value)} rows={5} className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" placeholder="4111, 5200" />
              <p className="mt-2 text-[11px] text-slate-400">{settings.blockedCardBins.length} قيمة محفوظة</p>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40"><SlidersHorizontal className="h-5 w-5" /></span><div><h3 className="text-sm font-black text-slate-900 dark:text-white">الدول المسموحة</h3><p className="text-xs text-slate-500">استخدم رموز ISO من 3 أحرف.</p></div></div>
              <textarea value={countries} onChange={(event) => setCountries(event.target.value)} rows={5} className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm uppercase outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" placeholder="JOR, SAU, ARE" />
              <p className="mt-2 text-[11px] text-slate-400">{settings.allowedCountries.length} دولة محفوظة — القائمة الفارغة تسمح للجميع</p>
            </section>
          </div>
        )}
        {state && <div className={`rounded-xl border px-4 py-3 text-sm font-bold ${state.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>{state.text}</div>}
        <div className="flex justify-end"><button disabled={saving || loading} onClick={() => void save()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"><Check className="h-4 w-4" />{saving ? "جاري الحفظ..." : "حفظ الإعدادات"}</button></div>
      </div>
    </div>
  );
}