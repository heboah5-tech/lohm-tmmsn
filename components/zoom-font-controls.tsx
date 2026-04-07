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
    // Compensate height so body always fills the full viewport after zoom
    const compensated = `${(100 / zoom).toFixed(4)}vh`;
    document.body.style.minHeight = compensated;
    document.documentElement.style.minHeight = compensated;
    // Also fix the Next.js root container
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
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="إعدادات العرض"
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          background: "#1e40af",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
          flexShrink: 0,
        }}
      >
        {open ? "✕" : "⚙"}
      </button>

      {open && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "12px 14px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            minWidth: "170px",
          }}
        >
          {/* Zoom row */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "5px", direction: "rtl" }}>
              تكبير / تصغير العرض
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Btn onClick={() => changeZoom(-ZOOM_STEP)} disabled={zoom <= ZOOM_MIN} title="تصغير">−</Btn>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", minWidth: "38px", textAlign: "center", direction: "ltr" }}>
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
              style={{ width: "100%", marginTop: "4px", accentColor: "#1e40af" }}
            />
          </div>

          {/* Font row */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "5px", direction: "rtl" }}>
              حجم الخط
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Btn onClick={() => changeFont(-FONT_STEP)} disabled={fontSize <= FONT_MIN} title="تصغير الخط">A−</Btn>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", minWidth: "38px", textAlign: "center", direction: "ltr" }}>
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
              style={{ width: "100%", marginTop: "4px", accentColor: "#1e40af" }}
            />
          </div>

          {/* Reset all */}
          <button
            onClick={reset}
            style={{
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "5px 10px",
              fontSize: "11px",
              fontWeight: 700,
              color: "#475569",
              cursor: "pointer",
              direction: "rtl",
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
        width: small ? "26px" : "30px",
        height: "30px",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        background: disabled ? "#f8fafc" : "#fff",
        color: disabled ? "#cbd5e1" : "#1e293b",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: small ? "13px" : "14px",
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}
