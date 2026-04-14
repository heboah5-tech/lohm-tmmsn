"use client";
import React, { useState, useEffect } from "react";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import {
  ShieldCheck,
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate.replace("/");
    }
  }, [user, authLoading, navigate]);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await sendSignInLinkToEmail(getFirebaseAuth(), email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });
      window.localStorage.setItem("emailForSignIn", email);
      setSent(true);
      setMessage("تم إرسال رابط تسجيل الدخول. يرجى التحقق من بريدك الإلكتروني.");
    } catch {
      setError("حدث خطأ أثناء إرسال الرابط. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignInWithEmailLink(getFirebaseAuth(), window.location.href)) {
      let emailToUse = window.localStorage.getItem("emailForSignIn");
      if (!emailToUse) {
        emailToUse = window.prompt("يرجى إدخال بريدك الإلكتروني للتأكيد:");
      }
      if (emailToUse) {
        setLoading(true);
        signInWithEmailLink(getFirebaseAuth(), emailToUse, window.location.href)
          .then(() => {
            window.localStorage.removeItem("emailForSignIn");
            navigate.push("/");
          })
          .catch(() => {
            setError("رابط تسجيل الدخول غير صالح أو منتهي الصلاحية.");
            setLoading(false);
          });
      }
    }
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans overflow-hidden relative"
      dir="rtl"
      style={{ background: "linear-gradient(135deg, #050816 0%, #0a1230 35%, #0d1a3d 60%, #060c1a 100%)" }}
    >
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-15%] left-[-8%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)" }} />

      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative z-10 w-full max-w-[420px] mx-4">
        <div className="absolute -inset-px rounded-3xl pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.15), transparent 60%)", filter: "blur(1px)" }} />

        <div className="relative rounded-3xl overflow-hidden"
          style={{ background: "rgba(13,20,44,0.9)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(24px)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>

          <div className="h-px w-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(59,130,246,0.6), transparent)" }} />

          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center mb-10">
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-2xl blur-xl opacity-50"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }} />
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", boxShadow: "0 8px 32px rgba(99,102,241,0.35)" }}>
                  <ShieldCheck className="w-8 h-8 text-white" strokeWidth={1.8} />
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-1.5 tracking-tight">مرحباً بعودتك</h1>
              <p className="text-sm" style={{ color: "rgba(148,163,184,0.8)" }}>
                أدخل بريدك الإلكتروني لتلقّي رابط الدخول
              </p>
            </div>

            {!sent ? (
              <form onSubmit={handleSendLink} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-semibold tracking-wide uppercase"
                    style={{ color: "rgba(148,163,184,0.6)" }}>
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "rgba(99,102,241,0.6)" }} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="admin@example.com"
                      className="w-full pr-10 pl-4 py-3.5 text-sm rounded-xl outline-none transition-all duration-200 disabled:opacity-50"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        color: "#e2e8f0",
                        caretColor: "#6366f1",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgba(99,102,241,0.4)";
                        e.target.style.background = "rgba(99,102,241,0.06)";
                        e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.08)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(255,255,255,0.06)";
                        e.target.style.background = "rgba(255,255,255,0.03)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
                    style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#fca5a5" }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                    boxShadow: "0 4px 20px rgba(99,102,241,0.35), 0 1px 0 rgba(255,255,255,0.08) inset",
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)" }} />
                  {loading ? (
                    <span className="relative flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري الإرسال...
                    </span>
                  ) : (
                    <span className="relative flex items-center gap-2">
                      إرسال رابط الدخول
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </button>

              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto"
                  style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}>
                  <CheckCircle2 className="w-7 h-7" style={{ color: "#4ade80" }} />
                </div>
                <div>
                  <p className="text-white font-bold text-base mb-1">تم إرسال الرابط</p>
                  <p className="text-sm" style={{ color: "rgba(148,163,184,0.7)" }}>
                    تحقق من بريدك الإلكتروني
                  </p>
                  <p className="text-xs mt-1 font-medium" style={{ color: "rgba(99,102,241,0.8)" }}>
                    {email}
                  </p>
                </div>
                <div className="px-4 py-3 rounded-xl text-sm text-right"
                  style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.1)", color: "rgba(134,239,172,0.85)" }}>
                  {message}
                </div>
                <button
                  type="button"
                  onClick={() => { setSent(false); setEmail(""); setMessage(""); }}
                  className="text-xs underline-offset-2 hover:underline transition-all"
                  style={{ color: "rgba(148,163,184,0.4)" }}
                >
                  إرسال إلى بريد آخر
                </button>
              </div>
            )}

            <div className="mt-8 pt-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <p className="text-xs" style={{ color: "rgba(100,116,139,0.5)" }}>
                © 2026 BCare — جميع الحقوق محفوظة
              </p>
            </div>
          </div>

          <div className="h-px w-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)" }} />
        </div>
      </div>
    </div>
  );
}
