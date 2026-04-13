"use client";

import { useEffect, useState } from "react";

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

      {open && (
        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(229,231,235,0.8)",
            borderRadius: "16px",
            padding: "14px 16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            minWidth: "180px",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", marginBottom: "6px", direction: "rtl" }}>
              تكبير / تصغير العرض
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Btn onClick={() => changeZoom(-ZOOM_STEP)} disabled={zoom <= ZOOM_MIN} title="تصغير">−</Btn>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#111827", minWidth: "38px", textAlign: "center", direction: "ltr" }}>
                {Math.round(zoom * 100)}%
              </span>
              <Btn onClick={() => changeZoom(ZOOM_STEP)} disabled={zoom >= ZOOM_MAX} title="تكبير">+</Btn>
              <Btn onClick={() => setZoom(1)} title="إعادة تعيين" small>↺</Btn>
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
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", marginBottom: "6px", direction: "rtl" }}>
              حجم الخط
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Btn onClick={() => changeFont(-FONT_STEP)} disabled={fontSize <= FONT_MIN} title="تصغير الخط">A−</Btn>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#111827", minWidth: "38px", textAlign: "center", direction: "ltr" }}>
                {fontSize}px
              </span>
              <Btn onClick={() => changeFont(FONT_STEP)} disabled={fontSize >= FONT_MAX} title="تكبير الخط">A+</Btn>
              <Btn onClick={() => setFontSize(FONT_DEFAULT)} title="إعادة تعيين" small>↺</Btn>
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
              background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: 700,
              color: "#374151",
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
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  small?: boolean;
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
        border: "1px solid #e5e7eb",
        background: disabled ? "#f9fafb" : "#fff",
        color: disabled ? "#d1d5db" : "#111827",
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
