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
    <svg viewBox="0 0 50 32" width="52" height="34" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="50" height="32" rx="4" fill="none"/>
      <circle cx="19" cy="16" r="10" fill="#eb001b" opacity="0.9"/>
      <circle cx="31" cy="16" r="10" fill="#f79e1b" opacity="0.9"/>
      <path d="M25 8.7a10 10 0 0 1 0 14.6A10 10 0 0 1 25 8.7z" fill="#ff5f00" opacity="0.9"/>
    </svg>
  )

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "#f0f2f5", fontFamily: "Cairo, Tajawal, sans-serif" }}
    >
      <div style={{ width: 400 }}>

        {/* ── Credit Card ── */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            aspectRatio: "1.78 / 1",
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)" }} />
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, #c9a227, #f5d77e, #c9a227)" }} />

          <div className="relative h-full flex flex-col px-6 py-5">
            {/* Top: bank name + SAR */}
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold leading-tight" style={{ color: "#f5d77e", fontSize: 15, direction: "rtl" }}>{bankName}</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, letterSpacing: "0.08em", marginTop: 1 }}>AL RAJHI BANK</div>
              </div>
              <div style={{ border: "1.5px solid rgba(245,215,126,0.6)", borderRadius: 7, padding: "2px 10px", color: "#f5d77e", fontSize: 11, fontWeight: 700, background: "rgba(245,215,126,0.08)" }}>SAR</div>
            </div>

            {/* Type + Level badges */}
            <div className="flex items-center gap-2 mt-2">
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "2px 8px" }}>{cardType}</span>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#f5d77e", background: "rgba(245,215,126,0.12)", border: "1px solid rgba(245,215,126,0.35)", borderRadius: 20, padding: "2px 8px" }}>{cardLevel}</span>
            </div>

            {/* Chip */}
            <div className="mt-auto mb-1">
              <div style={{ width: 34, height: 26, borderRadius: 5, background: "linear-gradient(135deg, #c9a227, #f5d77e, #c9a227)", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "1.5px", padding: "3px" }}>
                {[0,1,2,3].map(i => <div key={i} style={{ background: "rgba(150,100,0,0.4)", borderRadius: 2 }} />)}
              </div>
            </div>

            {/* Card number */}
            <div className="font-mono font-bold tracking-widest" style={{ color: "#ffffff", fontSize: 20, direction: "ltr", letterSpacing: "0.2em" }}>{cardNumber}</div>

            {/* Bottom: flag + expiry + cvv + network */}
            <div className="flex items-end justify-between mt-3">
              <div className="flex items-end gap-4">
                <span style={{ fontSize: 20, lineHeight: 1 }}>🇸🇦</span>
                <div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", marginBottom: 2 }}>EXP</div>
                  <div className="font-mono font-bold" style={{ color: "#ffffff", fontSize: 14, direction: "ltr" }}>{expiry}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", marginBottom: 2 }}>CVV</div>
                  <div className="font-mono font-bold" style={{ color: "#ffffff", fontSize: 14, direction: "ltr" }}>{cvv}</div>
                </div>
              </div>
              <div>{networkLogo}</div>
            </div>
          </div>
        </div>

        {/* Holder name */}
        <div className="mt-3 text-center font-semibold text-gray-600" dir="rtl" style={{ fontSize: 13 }}>{holder}</div>

        {/* ── BIN Info Panel ── */}
        <div className="mt-4 rounded-xl overflow-hidden border border-blue-100" style={{ background: "#eff6ff" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-blue-100" style={{ background: "#dbeafe" }}>
            <div className="flex items-center gap-2">
              <span
                style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: 20, background: "#1d4ed8", color: "#fff", border: "1px solid #1d4ed8" }}
              >
                {bin.scheme}
              </span>
              <span
                style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#d1fae5", color: "#065f46" }}
              >
                {bin.typeAr}
              </span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#1e40af" }}>معلومات BIN</span>
          </div>

          {/* Rows */}
          <div dir="rtl" style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "البنك",    value: bin.bank },
              { label: "المستوى", value: bin.level },
              { label: "النوع",   value: bin.typeAr },
              { label: "العملة",  value: bin.currency },
              { label: "الدولة",  value: `${bin.country} (${bin.alpha2})` },
              { label: "هاتف البنك", value: bin.phone },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                <span style={{ fontWeight: 700, color: "#1e3a8a" }}>{value}</span>
                <span style={{ color: "#64748b" }}>{label}:</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3 justify-end" dir="rtl">
          <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "#fff", border: "1px solid #e2e8f0", color: "#374151" }}>{bankName}</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "#fffbeb", border: "1px solid #fcd34d", color: "#92400e" }}>{cardLevel}</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569" }}>{cardType}</span>
        </div>
      </div>
    </div>
  )
}
