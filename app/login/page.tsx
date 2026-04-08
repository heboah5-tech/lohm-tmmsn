"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
} from "firebase/auth";
import {
  ShieldCheck,
  Mail,
  Phone,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

type Step = "email" | "phone" | "otp";

const STEP_LABELS: Record<Step, number> = { email: 1, phone: 2, otp: 2 };
const EMAIL_STORE = "bcare_admin_email";

const iStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#e2e8f0",
  caretColor: "#6366f1",
};
const iFocus = { borderColor: "rgba(99,102,241,0.5)", background: "rgba(99,102,241,0.08)" };
const iBlur  = { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" };

export default function LoginPage() {
  const [step, setStep]                 = useState<Step>("email");
  const [email, setEmail]               = useState("");
  const [phone, setPhone]               = useState("");
  const [otp, setOtp]                   = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const verifierRef                     = useRef<RecaptchaVerifier | null>(null);

  const navigate = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) navigate.replace("/");
  }, [user, authLoading, navigate]);

  // ── Step 1: advance from email to phone ──────────────────────────────────
  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(EMAIL_STORE, email);
    }
    setStep("phone");
  };

  // ── Step 2a: send OTP ─────────────────────────────────────────────────────
  const setupRecaptcha = () => {
    if (verifierRef.current) return verifierRef.current;
    const v = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {},
    });
    verifierRef.current = v;
    return v;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPhoneNumber(auth, phone, setupRecaptcha());
      setConfirmation(result);
      setStep("otp");
    } catch (err: any) {
      if (err?.code === "auth/invalid-phone-number") {
        setError("رقم الهاتف غير صحيح. يرجى إدخاله بالصيغة الدولية مثل: +966xxxxxxxxx");
      } else if (err?.code === "auth/too-many-requests") {
        setError("تم إرسال طلبات كثيرة. يرجى المحاولة لاحقاً.");
      } else {
        setError("حدث خطأ أثناء إرسال الرمز. تحقق من رقم الهاتف وحاول مرة أخرى.");
      }
      verifierRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2b: verify OTP → sign in ─────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmation) return;
    setError("");
    setLoading(true);
    try {
      await confirmation.confirm(otp);
      navigate.replace("/");
    } catch {
      setError("الرمز غير صحيح أو منتهي الصلاحية. يرجى المحاولة مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && user) return null;

  const stepNum = STEP_LABELS[step];

  return (
    <div className="min-h-screen flex items-center justify-center font-sans overflow-hidden relative" dir="rtl"
      style={{ background: "linear-gradient(135deg, #060918 0%, #0d1535 40%, #0a1628 70%, #060c1a 100%)" }}>

      {/* Ambient orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-15%] left-[-8%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div id="recaptcha-container" />

      <div className="relative z-10 w-full max-w-[420px] mx-4">
        <div className="absolute -inset-px rounded-3xl pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(99,102,241,0.2), transparent 60%)", filter: "blur(1px)" }} />

        <div className="relative rounded-3xl overflow-hidden"
          style={{ background: "rgba(13,20,44,0.85)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(24px)" }}>

          <div className="h-px w-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(59,130,246,0.8), transparent)" }} />

          <div className="p-8 sm:p-10">

            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-2xl blur-xl opacity-60"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }} />
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", boxShadow: "0 8px 32px rgba(99,102,241,0.4)" }}>
                  <ShieldCheck className="w-7 h-7 text-white" strokeWidth={1.8} />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">مرحباً بعودتك</h1>
              <p className="text-sm" style={{ color: "rgba(148,163,184,0.8)" }}>
                {step === "email" ? "أدخل بريدك الإلكتروني للمتابعة" :
                 step === "phone" ? "أدخل رقم هاتفك لإرسال رمز التحقق" :
                 "أدخل الرمز المرسل إلى هاتفك"}
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-3 mb-7">
              {[1, 2].map((n) => (
                <React.Fragment key={n}>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      n < stepNum
                        ? "bg-green-500 text-white"
                        : n === stepNum
                          ? "text-white"
                          : "text-white/30"
                    }`}
                      style={n === stepNum ? { background: "linear-gradient(135deg, #3b82f6, #6366f1)" } :
                             n < stepNum  ? {} :
                             { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {n < stepNum ? "✓" : n}
                    </div>
                    <span className={`text-xs font-medium ${n === stepNum ? "text-white" : n < stepNum ? "text-green-400" : "text-white/30"}`}>
                      {n === 1 ? "البريد الإلكتروني" : "رقم الهاتف"}
                    </span>
                  </div>
                  {n < 2 && (
                    <div className="flex-1 h-px max-w-[40px]"
                      style={{ background: stepNum > 1 ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.1)" }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* ── Step 1: Email ──────────────────────────────────────────── */}
            {step === "email" && (
              <form onSubmit={handleEmailNext} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-semibold tracking-wide uppercase"
                    style={{ color: "rgba(148,163,184,0.7)" }}>البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "rgba(99,102,241,0.7)" }} />
                    <input id="email" type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required autoComplete="email" placeholder="admin@example.com"
                      className="w-full pr-10 pl-4 py-3.5 text-sm rounded-xl outline-none transition-all duration-200"
                      style={iStyle}
                      onFocus={(e) => Object.assign(e.target.style, iFocus)}
                      onBlur={(e) => Object.assign(e.target.style, iBlur)} />
                  </div>
                </div>

                {error && <ErrorBox message={error} />}

                <button type="submit"
                  className="w-full mt-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 group relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", boxShadow: "0 4px 24px rgba(99,102,241,0.4), 0 1px 0 rgba(255,255,255,0.1) inset" }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)" }} />
                  <span className="relative flex items-center gap-2">
                    التالي
                    <ArrowLeft className="w-4 h-4" />
                  </span>
                </button>
              </form>
            )}

            {/* ── Step 2a: Phone number ──────────────────────────────────── */}
            {step === "phone" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <button type="button"
                  onClick={() => { setStep("email"); setError(""); }}
                  className="flex items-center gap-1.5 text-xs mb-1 transition-colors"
                  style={{ color: "rgba(148,163,184,0.5)" }}>
                  <ArrowRight className="w-3.5 h-3.5" />
                  تغيير البريد الإلكتروني
                </button>

                {/* Email summary pill */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(165,180,252,0.7)" }} />
                  <span className="text-xs truncate" style={{ color: "rgba(165,180,252,0.8)" }} dir="ltr">{email}</span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="phone" className="block text-xs font-semibold tracking-wide uppercase"
                    style={{ color: "rgba(148,163,184,0.7)" }}>رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "rgba(99,102,241,0.7)" }} />
                    <input id="phone" type="tel" value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required disabled={loading} autoComplete="tel"
                      placeholder="+966xxxxxxxxx"
                      className="w-full pr-10 pl-4 py-3.5 text-sm rounded-xl outline-none transition-all duration-200 disabled:opacity-50"
                      style={{ ...iStyle, direction: "ltr", textAlign: "left" }}
                      onFocus={(e) => Object.assign(e.target.style, iFocus)}
                      onBlur={(e) => Object.assign(e.target.style, iBlur)} />
                  </div>
                  <p className="text-[11px]" style={{ color: "rgba(100,116,139,0.7)" }}>
                    أدخل الرقم بالصيغة الدولية: +966xxxxxxxxx
                  </p>
                </div>

                {error && <ErrorBox message={error} />}
                <SubmitBtn loading={loading} label="إرسال رمز التحقق" />
              </form>
            )}

            {/* ── Step 2b: OTP ───────────────────────────────────────────── */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <button type="button"
                  onClick={() => { setStep("phone"); setError(""); setOtp(""); }}
                  className="flex items-center gap-1.5 text-xs mb-1 transition-colors"
                  style={{ color: "rgba(148,163,184,0.5)" }}>
                  <ArrowRight className="w-3.5 h-3.5" />
                  تغيير رقم الهاتف
                </button>

                <div className="px-4 py-3 rounded-xl text-sm"
                  style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", color: "rgba(134,239,172,0.9)" }}>
                  تم إرسال رمز التحقق إلى <span className="font-bold" dir="ltr">{phone}</span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="otp" className="block text-xs font-semibold tracking-wide uppercase"
                    style={{ color: "rgba(148,163,184,0.7)" }}>رمز التحقق</label>
                  <input id="otp" type="text" inputMode="numeric" value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required disabled={loading} placeholder="— — — — — —" maxLength={6}
                    className="w-full px-4 py-3.5 text-sm rounded-xl outline-none transition-all duration-200 disabled:opacity-50 text-center tracking-[0.5em] font-mono text-xl"
                    style={iStyle}
                    onFocus={(e) => Object.assign(e.target.style, iFocus)}
                    onBlur={(e) => Object.assign(e.target.style, iBlur)} />
                </div>

                {error && <ErrorBox message={error} />}
                <SubmitBtn loading={loading} label="تأكيد الدخول" />

                <button type="button" onClick={handleSendOtp} disabled={loading}
                  className="w-full text-xs py-2 transition-colors disabled:opacity-40"
                  style={{ color: "rgba(99,102,241,0.7)" }}>
                  إعادة إرسال الرمز
                </button>
              </form>
            )}

            {/* Footer */}
            <div className="mt-8 pt-5 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
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

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full mt-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", boxShadow: "0 4px 24px rgba(99,102,241,0.4), 0 1px 0 rgba(255,255,255,0.1) inset" }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)" }} />
      {loading ? (
        <span className="relative flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          جاري المعالجة...
        </span>
      ) : (
        <span className="relative">{label}</span>
      )}
    </button>
  );
}
