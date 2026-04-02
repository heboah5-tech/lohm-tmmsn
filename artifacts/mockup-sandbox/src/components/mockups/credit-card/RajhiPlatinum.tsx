export function RajhiPlatinum() {
  const cardNumber = "5413  7800  0000  0000"
  const expiry = "08/28"
  const cvv = "734"
  const holder = "محمد عبدالله الراشد"
  const bankName = "بنك الراجحي"
  const cardType = "MADA"
  const cardLevel = "PLATINUM"

  const bin = {
    scheme: "MADA",
    type: "DEBIT",
    typeAr: "مدين",
    level: "PLATINUM",
    bank: "بنك الراجحي",
    currency: "SAR",
    country: "المملكة العربية السعودية",
    alpha2: "SA",
    phone: "+966920000322",
  }

  const networkLogo = (
    <svg viewBox="0 0 50 32" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <circle cx="19" cy="16" r="10" fill="#eb001b" opacity="0.9"/>
      <circle cx="31" cy="16" r="10" fill="#f79e1b" opacity="0.9"/>
      <path d="M25 8.7a10 10 0 0 1 0 14.6A10 10 0 0 1 25 8.7z" fill="#ff5f00" opacity="0.9"/>
    </svg>
  )

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(12px, 4vw, 32px)",
        background: "#f0f2f5",
        fontFamily: "Cairo, Tajawal, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* ── Credit Card ── */}
        <div
          style={{
            width: "100%",
            aspectRatio: "1.78 / 1",
            borderRadius: "clamp(12px, 3vw, 20px)",
            overflow: "hidden",
            position: "relative",
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
            boxShadow: "0 clamp(8px,3vw,20px) clamp(20px,6vw,60px) rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {/* Sheen */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)", pointerEvents: "none" }} />
          {/* Gold top stripe */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "clamp(3px,0.6vw,5px)", background: "linear-gradient(90deg, #c9a227, #f5d77e, #c9a227)" }} />

          <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", padding: "clamp(12px,3.5vw,24px)" }}>

            {/* Top: bank name + SAR */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ color: "#f5d77e", fontSize: "clamp(11px,2.8vw,16px)", fontWeight: 700, direction: "rtl" }}>{bankName}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "clamp(7px,1.5vw,10px)", letterSpacing: "0.08em", marginTop: 2 }}>AL RAJHI BANK</div>
              </div>
              <div style={{ border: "1.5px solid rgba(245,215,126,0.6)", borderRadius: 7, padding: "clamp(1px,0.4vw,3px) clamp(6px,1.5vw,12px)", color: "#f5d77e", fontSize: "clamp(9px,1.8vw,13px)", fontWeight: 700, background: "rgba(245,215,126,0.08)" }}>SAR</div>
            </div>

            {/* Type + Level badges */}
            <div style={{ display: "flex", gap: "clamp(4px,1vw,8px)", marginTop: "clamp(4px,1vw,8px)" }}>
              {[
                { label: cardType, color: "rgba(255,255,255,0.7)", bg: "rgba(255,255,255,0.1)", border: "rgba(255,255,255,0.2)" },
                { label: cardLevel, color: "#f5d77e", bg: "rgba(245,215,126,0.12)", border: "rgba(245,215,126,0.35)" },
              ].map(({ label, color, bg, border }) => (
                <span key={label} style={{ fontSize: "clamp(7px,1.4vw,10px)", fontWeight: 800, letterSpacing: "0.08em", color, background: bg, border: `1px solid ${border}`, borderRadius: 20, padding: "clamp(1px,0.3vw,3px) clamp(5px,1.2vw,9px)" }}>{label}</span>
              ))}
            </div>

            {/* Chip */}
            <div style={{ marginTop: "auto", marginBottom: "clamp(4px,1vw,8px)" }}>
              <div style={{ width: "clamp(24px,5vw,38px)", height: "clamp(18px,3.8vw,28px)", borderRadius: 4, background: "linear-gradient(135deg, #c9a227, #f5d77e, #c9a227)", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "1.5px", padding: 3 }}>
                {[0,1,2,3].map(i => <div key={i} style={{ background: "rgba(150,100,0,0.4)", borderRadius: 2 }} />)}
              </div>
            </div>

            {/* Card number */}
            <div style={{ color: "#fff", fontSize: "clamp(13px,3.5vw,22px)", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.18em", direction: "ltr" }}>{cardNumber}</div>

            {/* Bottom: flag + expiry + cvv + network */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "clamp(6px,1.5vw,12px)" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "clamp(8px,2vw,18px)" }}>
                <span style={{ fontSize: "clamp(14px,3.5vw,22px)", lineHeight: 1 }}>🇸🇦</span>
                {[["EXP", expiry], ["CVV", cvv]].map(([lbl, val]) => (
                  <div key={lbl}>
                    <div style={{ fontSize: "clamp(6px,1.2vw,9px)", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", marginBottom: 2 }}>{lbl}</div>
                    <div style={{ color: "#fff", fontSize: "clamp(11px,2.5vw,16px)", fontFamily: "monospace", fontWeight: 700, direction: "ltr" }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ width: "clamp(36px,8vw,56px)", height: "clamp(23px,5vw,36px)" }}>{networkLogo}</div>
            </div>
          </div>
        </div>

        {/* Holder name */}
        <div style={{ marginTop: "clamp(8px,2vw,14px)", textAlign: "center", fontWeight: 600, color: "#4b5563", fontSize: "clamp(11px,2.5vw,14px)", direction: "rtl" }}>{holder}</div>

        {/* ── BIN Info Panel ── */}
        <div style={{ marginTop: "clamp(10px,2.5vw,18px)", borderRadius: "clamp(10px,2.5vw,16px)", overflow: "hidden", border: "1px solid #bfdbfe", background: "#eff6ff" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "clamp(8px,2vw,12px) clamp(12px,3vw,18px)", borderBottom: "1px solid #bfdbfe", background: "#dbeafe" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "clamp(9px,1.8vw,11px)", fontWeight: 700, padding: "2px clamp(6px,1.5vw,10px)", borderRadius: 20, background: "#1d4ed8", color: "#fff" }}>{bin.scheme}</span>
              <span style={{ fontSize: "clamp(9px,1.8vw,11px)", fontWeight: 600, padding: "2px clamp(6px,1.5vw,10px)", borderRadius: 20, background: "#d1fae5", color: "#065f46" }}>{bin.typeAr}</span>
            </div>
            <span style={{ fontSize: "clamp(11px,2.5vw,14px)", fontWeight: 800, color: "#1e40af" }}>معلومات BIN</span>
          </div>

          {/* Rows */}
          <div dir="rtl" style={{ padding: "clamp(8px,2vw,14px) clamp(12px,3vw,18px)", display: "flex", flexDirection: "column", gap: "clamp(6px,1.5vw,10px)" }}>
            {[
              { label: "البنك",       value: bin.bank },
              { label: "المستوى",    value: bin.level },
              { label: "النوع",      value: bin.typeAr },
              { label: "العملة",     value: bin.currency },
              { label: "الدولة",     value: `${bin.country} (${bin.alpha2})` },
              { label: "هاتف البنك", value: bin.phone },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, color: "#1e3a8a", fontSize: "clamp(10px,2.2vw,13px)" }}>{value}</span>
                <span style={{ color: "#64748b", fontSize: "clamp(9px,2vw,12px)" }}>{label}:</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(5px,1.2vw,8px)", marginTop: "clamp(10px,2.5vw,16px)", justifyContent: "flex-end", direction: "rtl" }}>
          {[
            { label: bankName,  bg: "#fff",    border: "#e2e8f0", color: "#374151" },
            { label: cardLevel, bg: "#fffbeb", border: "#fcd34d", color: "#92400e" },
            { label: cardType,  bg: "#f1f5f9", border: "#cbd5e1", color: "#475569" },
          ].map(({ label, bg, border, color }) => (
            <span key={label} style={{ fontSize: "clamp(10px,2vw,12px)", fontWeight: 600, padding: "clamp(3px,0.7vw,5px) clamp(10px,2.5vw,14px)", borderRadius: 20, background: bg, border: `1px solid ${border}`, color }}>{label}</span>
          ))}
        </div>

      </div>
    </div>
  )
}
