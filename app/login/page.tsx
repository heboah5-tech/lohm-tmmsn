"use client";
import React, { useState, useEffect } from "react";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
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
      await sendSignInLinkToEmail(auth, email, {
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
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailToUse = window.localStorage.getItem("emailForSignIn");
      if (!emailToUse) {
        emailToUse = window.prompt("يرجى إدخال بريدك الإلكتروني للتأكيد:");
      }
      if (emailToUse) {
        setLoading(true);
        signInWithEmailLink(auth, emailToUse, window.location.href)
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
      dir="rtl"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Cairo, Tajawal, sans-serif",
        background: "#f0f4f8",
        padding: "16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background shapes */}
      <div style={{
        position: "absolute", top: "-80px", right: "-80px",
        width: "340px", height: "340px", borderRadius: "50%",
        background: "linear-gradient(135deg, #0e3840, #134e58)",
        opacity: 0.18, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-100px", left: "-60px",
        width: "280px", height: "280px", borderRadius: "50%",
        background: "linear-gradient(135deg, #0a2a2e, #0e3840)",
        opacity: 0.12, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "40%", left: "10%",
        width: "120px", height: "120px", borderRadius: "50%",
        background: "#134e58", opacity: 0.07, pointerEvents: "none",
      }} />

      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: "420px",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
      }}>

        {/* ── Top brand panel ── */}
        <div style={{
          background: "linear-gradient(160deg, #0a2a2e 0%, #0e3840 55%, #134e58 100%)",
          padding: "36px 32px 32px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* decorative circle */}
          <div style={{
            position: "absolute", top: "-40px", left: "-40px",
            width: "180px", height: "180px", borderRadius: "50%",
            background: "rgba(255,255,255,0.04)", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-60px", right: "-20px",
            width: "140px", height: "140px", borderRadius: "50%",
            background: "rgba(255,255,255,0.03)", pointerEvents: "none",
          }} />

          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Icon */}
            <div style={{
              width: "52px", height: "52px", borderRadius: "16px", flexShrink: 0,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "24px",
            }}>
              🛡️
            </div>
            <div>
              <div style={{ color: "#fff", fontSize: "20px", fontWeight: 800, lineHeight: 1.2 }}>
                BCare Dashboard
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginTop: "3px" }}>
                نظام إدارة الزوار
              </div>
            </div>
          </div>

          <div style={{ position: "relative", marginTop: "24px" }}>
            <div style={{ color: "#fff", fontSize: "26px", fontWeight: 800, lineHeight: 1.3 }}>
              {sent ? "تحقق من بريدك" : "تسجيل الدخول"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", marginTop: "4px" }}>
              {sent
                ? `تم إرسال رابط الدخول إلى ${email}`
                : "أدخل بريدك الإلكتروني لتلقّي رابط الدخول الآمن"}
            </div>
          </div>

          {/* Thin teal line at bottom */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(20,200,180,0.5), transparent)",
          }} />
        </div>

        {/* ── Form panel ── */}
        <div style={{
          background: "#ffffff",
          padding: "32px",
        }}>
          {!sent ? (
            <form onSubmit={handleSendLink}>
              {/* Email field */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "block", fontSize: "12px", fontWeight: 700,
                  color: "#64748b", marginBottom: "8px", letterSpacing: "0.04em",
                }}>
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="admin@example.com"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1.5px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#1e293b",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    direction: "ltr",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0e3840";
                    e.target.style.boxShadow = "0 0 0 3px rgba(14,56,64,0.08)";
                    e.target.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                    e.target.style.background = "#f8fafc";
                  }}
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: "#fef2f2", border: "1px solid #fecaca",
                  borderRadius: "10px", padding: "10px 14px",
                  color: "#dc2626", fontSize: "13px", marginBottom: "16px",
                  display: "flex", alignItems: "center", gap: "8px",
                }}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "12px",
                  border: "none",
                  background: loading
                    ? "rgba(14,56,64,0.5)"
                    : "linear-gradient(135deg, #0a2a2e 0%, #134e58 100%)",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: loading ? "none" : "0 4px 14px rgba(14,56,64,0.3)",
                  transition: "all 0.2s",
                  marginBottom: "20px",
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid #fff", borderRadius: "50%",
                      display: "inline-block", animation: "spin 0.8s linear infinite",
                    }} />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <span>إرسال رابط الدخول</span>
                    <span style={{ fontSize: "16px" }}>←</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div style={{
                display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px",
              }}>
                <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
                <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>دخول آمن بدون كلمة مرور</span>
                <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
              </div>

              {/* Security badges */}
              <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                {["🔒 مشفّر", "⚡ سريع", "✅ آمن"].map((badge) => (
                  <div key={badge} style={{
                    fontSize: "11px", color: "#64748b", fontWeight: 600,
                  }}>
                    {badge}
                  </div>
                ))}
              </div>
            </form>
          ) : (
            /* Success state */
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 16px",
                background: "linear-gradient(135deg, #0a2a2e, #134e58)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "28px",
              }}>
                ✉️
              </div>
              <div style={{ color: "#1e293b", fontSize: "17px", fontWeight: 700, marginBottom: "8px" }}>
                تحقق من بريدك الإلكتروني
              </div>
              <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "6px" }}>
                أرسلنا رابط الدخول إلى
              </div>
              <div style={{
                color: "#0e3840", fontWeight: 700, fontSize: "14px",
                background: "#f0f9ff", borderRadius: "8px", padding: "6px 12px",
                display: "inline-block", marginBottom: "20px", direction: "ltr",
              }}>
                {email}
              </div>
              <div style={{
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: "10px", padding: "12px 16px",
                color: "#16a34a", fontSize: "13px", marginBottom: "20px",
              }}>
                {message}
              </div>
              <button
                type="button"
                onClick={() => { setSent(false); setEmail(""); setMessage(""); setError(""); }}
                style={{
                  background: "none", border: "1.5px solid #e2e8f0",
                  borderRadius: "10px", padding: "9px 20px",
                  color: "#64748b", fontSize: "13px", fontWeight: 600,
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                إرسال إلى بريد آخر
              </button>
            </div>
          )}

          {/* Footer */}
          <div style={{
            marginTop: "24px", paddingTop: "16px",
            borderTop: "1px solid #f1f5f9",
            textAlign: "center",
          }}>
            <span style={{ fontSize: "11px", color: "#cbd5e1" }}>
              © 2026 BCare — جميع الحقوق محفوظة
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #94a3b8; }
      `}</style>
    </div>
  );
}
