"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";

const ZOOM_STEP = 0.05;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.5;
const ZOOM_DEFAULT = 1;

const FONT_STEP = 2;
const FONT_MIN = 12;
const FONT_MAX = 36;
const FONT_DEFAULT = 26;

export function ZoomFontControls() {
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);
  const [fontSize, setFontSize] = useState(FONT_DEFAULT);
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.body.style.zoom = String(zoom);
    const compensated = `${(100 / zoom).toFixed(4)}vh`;
    document.body.style.minHeight = compensated;
    document.documentElement.style.minHeight = compensated;
    const nextRoot = document.getElementById("__next") as HTMLElement | null;
    if (nextRoot) {
      nextRoot.style.minHeight = compensated;
      nextRoot.style.height = compensated;
    }
  }, [zoom]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const changeZoom = (delta: number) => {
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, parseFloat((z + delta).toFixed(2)))));
  };

  const changeFont = (delta: number) => {
    setFontSize((f) => Math.min(FONT_MAX, Math.max(FONT_MIN, f + delta)));
  };

  const reset = () => {
    setZoom(ZOOM_DEFAULT);
    setFontSize(FONT_DEFAULT);
  };

  const isDark = theme === "dark";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "70px",
        left: "14px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "6px",
        fontFamily: "Cairo, Tajawal, sans-serif",
      }}
    >
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          onClick={() => setOpen((o) => !o)}
          title="إعدادات العرض"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(37,99,235,0.3), 0 1px 3px rgba(0,0,0,0.1)",
            flexShrink: 0,
            transition: "all 0.2s ease",
          }}
        >
          {open ? "✕" : "⚙"}
        </button>

        <button
          onClick={toggleTheme}
          title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "14px",
            background: isDark
              ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
              : "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isDark
              ? "0 4px 12px rgba(245,158,11,0.3), 0 1px 3px rgba(0,0,0,0.1)"
              : "0 4px 12px rgba(15,23,42,0.3), 0 1px 3px rgba(0,0,0,0.1)",
            flexShrink: 0,
            transition: "all 0.3s ease",
          }}
        >
          {isDark ? "☀" : "🌙"}
        </button>
      </div>

      {open && (
        <div
          style={{
            background: isDark ? "rgba(30,41,59,0.95)" : "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            border: isDark ? "1px solid rgba(71,85,105,0.6)" : "1px solid rgba(229,231,235,0.8)",
            borderRadius: "16px",
            padding: "14px 16px",
            boxShadow: isDark
              ? "0 8px 32px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2)"
              : "0 8px 32px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            minWidth: "180px",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: isDark ? "#94a3b8" : "#6b7280", marginBottom: "6px", direction: "rtl" }}>
              تكبير / تصغير العرض
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Btn onClick={() => changeZoom(-ZOOM_STEP)} disabled={zoom <= ZOOM_MIN} title="تصغير" dark={isDark}>−</Btn>
              <span style={{ fontSize: "12px", fontWeight: 700, color: isDark ? "#e2e8f0" : "#111827", minWidth: "38px", textAlign: "center", direction: "ltr" }}>
                {Math.round(zoom * 100)}%
              </span>
              <Btn onClick={() => changeZoom(ZOOM_STEP)} disabled={zoom >= ZOOM_MAX} title="تكبير" dark={isDark}>+</Btn>
              <Btn onClick={() => setZoom(1)} title="إعادة تعيين" small dark={isDark}>↺</Btn>
            </div>
            <input
              type="range"
              min={ZOOM_MIN * 100}
              max={ZOOM_MAX * 100}
              step={ZOOM_STEP * 100}
              value={zoom * 100}
              onChange={(e) => setZoom(parseFloat((Number(e.target.value) / 100).toFixed(2)))}
              style={{ width: "100%", marginTop: "6px", accentColor: "#3b82f6" }}
            />
          </div>

          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: isDark ? "#94a3b8" : "#6b7280", marginBottom: "6px", direction: "rtl" }}>
              حجم الخط
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Btn onClick={() => changeFont(-FONT_STEP)} disabled={fontSize <= FONT_MIN} title="تصغير الخط" dark={isDark}>A−</Btn>
              <span style={{ fontSize: "12px", fontWeight: 700, color: isDark ? "#e2e8f0" : "#111827", minWidth: "38px", textAlign: "center", direction: "ltr" }}>
                {fontSize}px
              </span>
              <Btn onClick={() => changeFont(FONT_STEP)} disabled={fontSize >= FONT_MAX} title="تكبير الخط" dark={isDark}>A+</Btn>
              <Btn onClick={() => setFontSize(FONT_DEFAULT)} title="إعادة تعيين" small dark={isDark}>↺</Btn>
            </div>
            <input
              type="range"
              min={FONT_MIN}
              max={FONT_MAX}
              step={FONT_STEP}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              style={{ width: "100%", marginTop: "6px", accentColor: "#3b82f6" }}
            />
          </div>

          <button
            onClick={reset}
            style={{
              background: isDark
                ? "linear-gradient(135deg, #334155 0%, #1e293b 100%)"
                : "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
              border: isDark ? "1px solid #475569" : "1px solid #d1d5db",
              borderRadius: "10px",
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: 700,
              color: isDark ? "#cbd5e1" : "#374151",
              cursor: "pointer",
              direction: "rtl",
              transition: "all 0.2s ease",
            }}
          >
            ↺ إعادة تعيين الكل
          </button>
        </div>
      )}
    </div>
  );
}

function Btn({
  onClick,
  disabled,
  title,
  small,
  dark,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  small?: boolean;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: small ? "28px" : "32px",
        height: "32px",
        borderRadius: "10px",
        border: dark ? "1px solid #475569" : "1px solid #e5e7eb",
        background: disabled
          ? dark ? "#1e293b" : "#f9fafb"
          : dark ? "#334155" : "#fff",
        color: disabled
          ? dark ? "#475569" : "#d1d5db"
          : dark ? "#e2e8f0" : "#111827",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: small ? "13px" : "14px",
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}
