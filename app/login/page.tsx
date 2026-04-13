"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
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
  CheckCircle2,
  Inbox,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

type Tab = "email" | "phone";
type EmailStep = "input" | "sent";
type PhoneStep = "number" | "otp";

const EMAIL_KEY = "bcare_signin_email";

const iStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#e2e8f0",
  caretColor: "#6366f1",
};
const iFocus = { borderColor: "rgba(99,102,241,0.5)", background: "rgba(99,102,241,0.08)" };
const iBlur  = { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" };

export default function LoginPage() {
  const [tab, setTab]               = useState<Tab>("email");
  const [email, setEmail]           = useState("");
  const [emailStep, setEmailStep]   = useState<EmailStep>("input");
  const [phone, setPhone]           = useState("");
  const [otp, setOtp]               = useState("");
  const [phoneStep, setPhoneStep]   = useState<PhoneStep>("number");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const verifierRef                 = useRef<RecaptchaVerifier | null>(null);

  const navigate = useRouter();
  const { user, loading: authLoading } = useAuth();

  // ── Handle email-link callback (when user clicks link in their inbox) ──────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    setLinkLoading(true);
    let savedEmail = localStorage.getItem(EMAIL_KEY) ?? "";

    if (!savedEmail) {
      savedEmail = window.prompt("أدخل بريدك الإلكتروني لتأكيد الدخول:") ?? "";
    }

    if (!savedEmail) { setLinkLoading(false); return; }

    signInWithEmailLink(auth, savedEmail, window.location.href)
      .then(() => {
        localStorage.removeItem(EMAIL_KEY);
        navigate.replace("/");
      })
      .catch(() => {
        setError("رابط الدخول غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.");
        setLinkLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!authLoading && user) navigate.replace("/");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    setError("");
    setEmailStep("input");
    setPhoneStep("number");
    setPhone(""); setOtp("");
    setConfirmation(null);
  }, [tab]);

  // ── Send magic link ────────────────────────────────────────────────────────
  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = `${window.location.origin}/login`;
      await sendSignInLinkToEmail(auth, email, {
        url,
        handleCodeInApp: true,
      });
      localStorage.setItem(EMAIL_KEY, email);
      setEmailStep("sent");
    } catch (err: any) {
      if (err?.code === "auth/invalid-email") {
        setError("البريد الإلكتروني غير صحيح.");
      } else if (err?.code === "auth/user-not-found") {
        setError("لا يوجد حساب بهذا البريد الإلكتروني.");
      } else {
        setError("حدث خطأ أثناء إرسال الرابط. يرجى المحاولة مجدداً.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Phone helpers ──────────────────────────────────────────────────────────
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
      setPhoneStep("otp");
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

  // ── Full-screen spinner while completing link sign-in ─────────────────────
  if (linkLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" dir="rtl"
        style={{ background: "linear-gradient(135deg, #060918 0%, #0d1535 40%, #0a1628 70%, #060c1a 100%)" }}>
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm" style={{ color: "rgba(148,163,184,0.8)" }}>جاري تسجيل الدخول...</p>
      </div>
    );
  }

  if (!authLoading && user) return null;

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
                {tab === "email"
                  ? emailStep === "sent"
                    ? "تحقق من بريدك الإلكتروني"
                    : "سنرسل لك رابط الدخول مباشرةً"
                  : phoneStep === "otp"
                    ? "أدخل الرمز المرسل إلى هاتفك"
                    : "أدخل رقم هاتفك لتلقّي رمز التحقق"}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex rounded-xl overflow-hidden mb-6"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {(["email", "phone"] as Tab[]).map((t) => (
                <button key={t} type="button" onClick={() => setTab(t)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all duration-200"
                  style={tab === t
                    ? { background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff" }
                    : { color: "rgba(148,163,184,0.7)" }}>
                  {t === "email"
                    ? <><Mail className="w-3.5 h-3.5" />البريد الإلكتروني</>
                    : <><Phone className="w-3.5 h-3.5" />رقم الهاتف</>}
                </button>
              ))}
            </div>

            {/* ── Email tab ─────────────────────────────────────────────── */}
            {tab === "email" && (
              <>
                {emailStep === "input" ? (
                  <form onSubmit={handleSendLink} className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="block text-xs font-semibold tracking-wide uppercase"
                        style={{ color: "rgba(148,163,184,0.7)" }}>البريد الإلكتروني</label>
                      <div className="relative">
                        <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                          style={{ color: "rgba(99,102,241,0.7)" }} />
                        <input id="email" type="email" value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required disabled={loading} autoComplete="email"
                          placeholder="admin@example.com"
                          className="w-full pr-10 pl-4 py-3.5 text-sm rounded-xl outline-none transition-all duration-200 disabled:opacity-50"
                          style={iStyle}
                          onFocus={(e) => Object.assign(e.target.style, iFocus)}
                          onBlur={(e) => Object.assign(e.target.style, iBlur)} />
                      </div>
                    </div>

                    {error && <ErrorBox message={error} />}

                    <SubmitBtn loading={loading} label="إرسال رابط الدخول" />
                  </form>
                ) : (
                  /* ── Sent confirmation ─────────────────────────────── */
                  <div className="space-y-5">
                    <div className="flex flex-col items-center gap-3 py-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                        <Inbox className="w-7 h-7" style={{ color: "rgba(134,239,172,0.9)" }} />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-semibold" style={{ color: "rgba(134,239,172,0.95)" }}>
                          تم إرسال الرابط بنجاح!
                        </p>
                        <p className="text-xs" style={{ color: "rgba(148,163,184,0.7)" }}>
                          افتح بريدك <span className="font-semibold text-indigo-300" dir="ltr">{email}</span> وانقر على رابط الدخول
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs"
                      style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", color: "rgba(165,180,252,0.8)" }}>
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-400" />
                      الرابط صالح لمدة 10 دقائق ويمكن استخدامه مرة واحدة فقط
                    </div>

                    {error && <ErrorBox message={error} />}

                    <button type="button" onClick={() => { setEmailStep("input"); setError(""); }}
                      className="flex items-center justify-center gap-1.5 w-full text-xs py-2 transition-colors"
                      style={{ color: "rgba(99,102,241,0.7)" }}>
                      <ArrowLeft className="w-3.5 h-3.5" />
                      تغيير البريد الإلكتروني / إعادة الإرسال
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── Phone tab ─────────────────────────────────────────────── */}
            {tab === "phone" && (
              <>
                {phoneStep === "number" ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
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
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <button type="button"
                      onClick={() => { setPhoneStep("number"); setError(""); setOtp(""); }}
                      className="flex items-center gap-1.5 text-xs mb-1 transition-colors"
                      style={{ color: "rgba(148,163,184,0.6)" }}>
                      <ArrowLeft className="w-3.5 h-3.5" />
                      تغيير الرقم
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
                        required disabled={loading} placeholder="------" maxLength={6}
                        className="w-full px-4 py-3.5 text-sm rounded-xl outline-none transition-all duration-200 disabled:opacity-50 text-center tracking-[0.4em] font-mono text-lg"
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
              </>
            )}

            {/* Footer */}
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
