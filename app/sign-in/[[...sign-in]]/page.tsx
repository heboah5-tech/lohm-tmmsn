"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

function getSafeRedirectUrl() {
  const redirectUrl = new URLSearchParams(window.location.search).get("redirect_url");
  return redirectUrl?.startsWith("/") && !redirectUrl.startsWith("//")
    ? redirectUrl
    : "/dashboard";
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    void getBrowserSupabaseClient()
      .auth.getUser()
      .then(({ data }) => {
        if (active && data.user) {
          router.replace(getSafeRedirectUrl());
          router.refresh();
        }
      });

    return () => {
      active = false;
    };
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = getBrowserSupabaseClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError("تم تسجيل الدخول لكن لم يتم تثبيت الجلسة. أعد المحاولة.");
      setLoading(false);
      return;
    }

    router.replace(getSafeRedirectUrl());
    router.refresh();
  };

  return (
    <main dir="rtl" className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/40 px-4 py-10 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl dark:bg-blue-950/50">🔐</div>
        <h1 className="mt-5 text-center text-2xl font-extrabold text-slate-900 dark:text-white">تسجيل الدخول</h1>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">الدخول إلى لوحة إدارة BCare</p>

        <label className="mt-7 block text-sm font-bold text-slate-700 dark:text-slate-200">
          البريد الإلكتروني
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            dir="ltr"
          />
        </label>
        <label className="mt-4 block text-sm font-bold text-slate-700 dark:text-slate-200">
          كلمة المرور
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            dir="ltr"
          />
        </label>

        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
        </button>

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          لا تملك حسابًا؟{" "}
          <Link href="/sign-up" className="font-bold text-blue-600 hover:text-blue-700">
            إنشاء حساب
          </Link>
        </p>
      </form>
    </main>
  );
}