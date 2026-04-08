"use client";
import React, { useState, useEffect } from "react";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { ShieldCheck, Mail, AlertCircle, Inbox, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

const EMAIL_KEY = "bcare_signin_email";

const iStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#e2e8f0",
  caretColor: "#6366f1",
};

export default function LoginPage() {
  const [email, setSentEmail]   = useState("");
  const [sent, setSent]         = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const navigate = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) navigate.replace("/");
  }, [user, authLoading, navigate]);

  // Complete sign-in when user returns via the email link
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    setCompleting(true);
    const saved = localStorage.getItem(EMAIL_KEY) ?? "";
    const addr  = saved || (window.prompt("أدخل بريدك الإلكتروني لتأكيد الدخول:") ?? "");

    if (!addr) { setCompleting(false); return; }

    signInWithEmailLink(auth, addr, window.location.href)
      .then(() => {
        localStorage.removeItem(EMAIL_KEY);
        navigate.replace("/");
      })
      .catch(() => {
        setError("رابط الدخول غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.");
        setCompleting(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendSignInLinkToEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });
      localStorage.setItem(EMAIL_KEY, email);
      setSent(true);
    } catch (err: any) {
      if (err?.code === "auth/invalid-email") {
        setError("البريد الإلكتروني غير صحيح.");
      } else if (err?.code === "auth/user-not-found") {
        setError("لا يوجد حساب بهذا البريد الإلكتروني.");
      } else {
        setError("تعذّر إرسال الرابط. يرجى المحاولة مجدداً.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (completing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" dir="rtl"
        style={{ background: "linear-gradient(135deg, #060918 0%, #0d1535 40%, #060c1a 100%)" }}>
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm" style={{ color: "rgba(148,163,184,0.8)" }}>جاري تسجيل الدخول…</p>
      </div>
    );
  }

  if (!authLoading && user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center font-sans overflow-hidden relative" dir="rtl"
      style={{ background: "linear-gradient(135deg, #060918 0%, #0d1535 40%, #0a1628 70%, #060c1a 100%)" }}>

      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-15%] left-[-8%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative z-10 w-full max-w-[420px] mx-4">
        <div className="absolute -inset-px rounded-3xl pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(99,102,241,0.2), transparent 60%)", filter: "blur(1px)" }} />

        <div className="relative rounded-3xl overflow-hidden"
          style={{ background: "rgba(13,20,44,0.85)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(24px)" }}>

          <div className="h-px w-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(59,130,246,0.8), transparent)" }} />

          <div className="p-8 sm:p-10">

            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-2xl blur-xl opacity-60"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }} />
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", boxShadow: "0 8px 32px rgba(99,102,241,0.4)" }}>
                  <ShieldCheck className="w-8 h-8 text-white" strokeWidth={1.8} />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1.5 tracking-tight">مرحباً بعودتك</h1>
              <p className="text-sm text-center" style={{ color: "rgba(148,163,184,0.9)" }}>
                {sent ? "تحقق من صندوق بريدك" : "سنرسل لك رابط الدخول فوراً"}
              </p>
            </div>

            {!sent ? (
              /* ── Send link form ─────────────────────────────────────── */
              <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-semibold tracking-wide uppercase"
                    style={{ color: "rgba(148,163,184,0.7)" }}>البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "rgba(99,102,241,0.7)" }} />
                    <input id="email" type="email" value={email}
                      onChange={(e) => setSentEmail(e.target.value)}
                      required disabled={loading} autoComplete="email"
                      placeholder="admin@example.com"
                      className="w-full pr-10 pl-4 py-3.5 text-sm rounded-xl outline-none transition-all duration-200 disabled:opacity-50"
                      style={iStyle}
                      onFocus={(e) => Object.assign(e.target.style, { borderColor: "rgba(99,102,241,0.5)", background: "rgba(99,102,241,0.08)" })}
                      onBlur={(e) => Object.assign(e.target.style, { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" })} />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", boxShadow: "0 4px 24px rgba(99,102,241,0.4), 0 1px 0 rgba(255,255,255,0.1) inset" }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)" }} />
                  {loading ? (
                    <span className="relative flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري الإرسال…
                    </span>
                  ) : (
                    <span className="relative">إرسال رابط الدخول</span>
                  )}
                </button>
              </form>
            ) : (
              /* ── Sent confirmation ──────────────────────────────────── */
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-3 py-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <Inbox className="w-7 h-7" style={{ color: "rgba(134,239,172,0.9)" }} />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold" style={{ color: "rgba(134,239,172,0.95)" }}>
                      تم إرسال الرابط بنجاح!
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(148,163,184,0.7)" }}>
                      افتح بريدك <span className="font-semibold text-indigo-300" dir="ltr">{email}</span> وانقر على رابط الدخول
                    </p>
                  </div>
                </div>

                <div className="px-4 py-3 rounded-xl text-xs"
                  style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", color: "rgba(165,180,252,0.75)" }}>
                  الرابط صالح لمدة 10 دقائق ولمرة واحدة فقط
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button type="button" onClick={() => { setSent(false); setError(""); }}
                  className="flex items-center justify-center gap-1.5 w-full text-xs py-2 transition-colors"
                  style={{ color: "rgba(99,102,241,0.7)" }}>
                  <ArrowLeft className="w-3.5 h-3.5" />
                  إعادة الإرسال أو تغيير البريد
                </button>
              </div>
            )}

            <div className="mt-8 pt-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-xs" style={{ color: "rgba(100,116,139,0.7)" }}>
                © 2026 BCare — جميع الحقوق محفوظة
              </p>
            </div>
          </div>

          <div className="h-px w-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)" }} />
        </div>
      </div>
    </div>
  );
}
