"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
} from "firebase/auth";
import {
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

type Tab = "email" | "phone";
type PhoneStep = "number" | "otp";

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#e2e8f0",
  caretColor: "#6366f1",
};
const inputFocus = {
  borderColor: "rgba(99,102,241,0.5)",
  background: "rgba(99,102,241,0.08)",
};
const inputBlur = {
  borderColor: "rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
};

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("email");

  // Email/password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Phone state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("number");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  const navigate = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) navigate.replace("/");
  }, [user, authLoading, navigate]);

  // Reset phone state when switching tabs
  useEffect(() => {
    setError("");
    setPhoneStep("number");
    setPhone("");
    setOtp("");
    setConfirmation(null);
  }, [tab]);

  const setupRecaptcha = () => {
    if (verifierRef.current) return verifierRef.current;
    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {},
    });
    verifierRef.current = verifier;
    return verifier;
  };

  // --- Email/Password login ---
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate.replace("/");
    } catch {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    } finally {
      setLoading(false);
    }
  };

  // --- Phone: send OTP ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const verifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, phone, verifier);
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
      // Reset verifier on error
      verifierRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  // --- Phone: verify OTP ---
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#060918" }}>
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans overflow-hidden relative"
      dir="rtl"
      style={{ background: "linear-gradient(135deg, #060918 0%, #0d1535 40%, #0a1628 70%, #060c1a 100%)" }}
    >
      {/* Ambient orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-15%] left-[-8%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Invisible reCAPTCHA anchor */}
      <div id="recaptcha-container" ref={recaptchaRef} />

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
              <p className="text-sm" style={{ color: "rgba(148,163,184,0.9)" }}>
                {tab === "email" ? "أدخل بياناتك للدخول إلى لوحة التحكم" : "أدخل رقم هاتفك لتلقّي رمز التحقق"}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex rounded-xl overflow-hidden mb-6"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                type="button"
                onClick={() => setTab("email")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all duration-200"
                style={tab === "email"
                  ? { background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff" }
                  : { color: "rgba(148,163,184,0.7)" }}
              >
                <Mail className="w-3.5 h-3.5" />
                البريد الإلكتروني
              </button>
              <button
                type="button"
                onClick={() => setTab("phone")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all duration-200"
                style={tab === "phone"
                  ? { background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff" }
                  : { color: "rgba(148,163,184,0.7)" }}
              >
                <Phone className="w-3.5 h-3.5" />
                رقم الهاتف
              </button>
            </div>

            {/* Email/Password form */}
            {tab === "email" && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-semibold tracking-wide uppercase"
                    style={{ color: "rgba(148,163,184,0.7)" }}>البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "rgba(99,102,241,0.7)" }} />
                    <input id="email" type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)} required disabled={loading}
                      autoComplete="email" placeholder="admin@example.com"
                      className="w-full pr-10 pl-4 py-3.5 text-sm rounded-xl outline-none transition-all duration-200 disabled:opacity-50"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                      onBlur={(e) => Object.assign(e.target.style, inputBlur)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-xs font-semibold tracking-wide uppercase"
                    style={{ color: "rgba(148,163,184,0.7)" }}>كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "rgba(99,102,241,0.7)" }} />
                    <input id="password" type={showPassword ? "text" : "password"}
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      required disabled={loading} autoComplete="current-password" placeholder="••••••••"
                      className="w-full pr-10 pl-10 py-3.5 text-sm rounded-xl outline-none transition-all duration-200 disabled:opacity-50"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                      onBlur={(e) => Object.assign(e.target.style, inputBlur)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: "rgba(99,102,241,0.5)" }}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && <ErrorBox message={error} />}

                <SubmitButton loading={loading} label="تسجيل الدخول" />
              </form>
            )}

            {/* Phone form */}
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
                          onChange={(e) => setPhone(e.target.value)} required disabled={loading}
                          autoComplete="tel" placeholder="+966xxxxxxxxx"
                          className="w-full pr-10 pl-4 py-3.5 text-sm rounded-xl outline-none transition-all duration-200 disabled:opacity-50"
                          style={{ ...inputStyle, direction: "ltr", textAlign: "left" }}
                          onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                          onBlur={(e) => Object.assign(e.target.style, inputBlur)} />
                      </div>
                      <p className="text-[11px]" style={{ color: "rgba(100,116,139,0.7)" }}>
                        أدخل الرقم بالصيغة الدولية: +966xxxxxxxxx
                      </p>
                    </div>

                    {error && <ErrorBox message={error} />}

                    <SubmitButton loading={loading} label="إرسال رمز التحقق" />
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    {/* Back button */}
                    <button type="button" onClick={() => { setPhoneStep("number"); setError(""); setOtp(""); }}
                      className="flex items-center gap-1.5 text-xs mb-2 transition-colors"
                      style={{ color: "rgba(148,163,184,0.6)" }}>
                      <ArrowLeft className="w-3.5 h-3.5" />
                      تغيير الرقم
                    </button>

                    {/* Sent confirmation */}
                    <div className="px-4 py-3 rounded-xl text-sm text-right"
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
                        style={inputStyle}
                        onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                        onBlur={(e) => Object.assign(e.target.style, inputBlur)} />
                    </div>

                    {error && <ErrorBox message={error} />}

                    <SubmitButton loading={loading} label="تأكيد الدخول" />

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

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
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
