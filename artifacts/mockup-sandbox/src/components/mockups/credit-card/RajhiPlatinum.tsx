export function RajhiPlatinum() {
  const cardNumber = "5413  7800  0000  0000"
  const expiry = "08/28"
  const cvv = "734"
  const holder = "محمد عبدالله الراشد"
  const bankName = "بنك الراجحي"
  const cardType = "MADA"
  const cardLevel = "PLATINUM"

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
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: "#f0f2f5", fontFamily: "Cairo, Tajawal, sans-serif" }}
    >
      <div style={{ width: 380 }}>
        {/* Card */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            aspectRatio: "1.78 / 1",
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          {/* Subtle sheen */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)" }}
          />

          {/* Gold stripe accent */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: "linear-gradient(90deg, #c9a227, #f5d77e, #c9a227)" }}
          />

          <div className="relative h-full flex flex-col px-6 py-5">

            {/* Top row: bank name + SAR */}
            <div className="flex items-start justify-between">
              <div>
                <div
                  className="font-bold leading-tight"
                  style={{ color: "#f5d77e", fontSize: 15, direction: "rtl" }}
                >
                  {bankName}
                </div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, letterSpacing: "0.08em", marginTop: 1 }}>
                  AL RAJHI BANK
                </div>
              </div>
              <div
                style={{
                  border: "1.5px solid rgba(245,215,126,0.6)",
                  borderRadius: 7,
                  padding: "2px 10px",
                  color: "#f5d77e",
                  fontSize: 11,
                  fontWeight: 700,
                  background: "rgba(245,215,126,0.08)",
                }}
              >
                SAR
              </div>
            </div>

            {/* Type + Level badges */}
            <div className="flex items-center gap-2 mt-2">
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.7)",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 20,
                  padding: "2px 8px",
                }}
              >
                {cardType}
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  color: "#f5d77e",
                  background: "rgba(245,215,126,0.12)",
                  border: "1px solid rgba(245,215,126,0.35)",
                  borderRadius: 20,
                  padding: "2px 8px",
                }}
              >
                {cardLevel}
              </span>
            </div>

            {/* Chip */}
            <div className="mt-auto mb-1">
              <div
                style={{
                  width: 34,
                  height: 26,
                  borderRadius: 5,
                  background: "linear-gradient(135deg, #c9a227, #f5d77e, #c9a227)",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gridTemplateRows: "1fr 1fr",
                  gap: "1.5px",
                  padding: "3px",
                }}
              >
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ background: "rgba(150,100,0,0.4)", borderRadius: 2 }} />
                ))}
              </div>
            </div>

            {/* Card number */}
            <div
              className="font-mono font-bold tracking-widest"
              style={{ color: "#ffffff", fontSize: 20, direction: "ltr", letterSpacing: "0.2em" }}
            >
              {cardNumber}
            </div>

            {/* Bottom row: flag + expiry + cvv + network */}
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

        {/* Info tags below */}
        <div className="flex flex-wrap gap-2 mt-4 justify-end" dir="rtl">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700 shadow-sm">{bankName}</span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 shadow-sm">{cardLevel}</span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600 shadow-sm">{cardType}</span>
        </div>

        {/* Holder name */}
        <div className="mt-3 text-center text-sm font-semibold text-gray-500" dir="rtl">{holder}</div>
      </div>
    </div>
  )
}
