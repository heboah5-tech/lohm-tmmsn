"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await getBrowserSupabaseClient().auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.assign("/dashboard");
      return;
    }

    setMessage("تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيد الحساب ثم سجّل الدخول.");
    setLoading(false);
  };

  return (
    <main dir="rtl" className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/40 px-4 py-10 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl dark:bg-blue-950/50">✨</div>
        <h1 className="mt-5 text-center text-2xl font-extrabold text-slate-900 dark:text-white">إنشاء حساب</h1>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">إنشاء حساب Supabase Auth للوحة الإدارة</p>

        <label className="mt-7 block text-sm font-bold text-slate-700 dark:text-slate-200">
          البريد الإلكتروني
          <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white" dir="ltr" />
        </label>
        <label className="mt-4 block text-sm font-bold text-slate-700 dark:text-slate-200">
          كلمة المرور
          <input type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white" dir="ltr" />
        </label>
        <label className="mt-4 block text-sm font-bold text-slate-700 dark:text-slate-200">
          تأكيد كلمة المرور
          <input type="password" required minLength={6} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white" dir="ltr" />
        </label>

        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
        {message && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{message}</p>}

        <button type="submit" disabled={loading} className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
        </button>
        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          لديك حساب؟{" "}
          <Link href="/sign-in" className="font-bold text-blue-600 hover:text-blue-700">تسجيل الدخول</Link>
        </p>
      </form>
    </main>
  );
}