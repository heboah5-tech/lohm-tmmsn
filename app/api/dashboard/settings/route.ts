import { NextRequest, NextResponse } from "next/server";

import { authorizationResponse, requireAdmin } from "@/lib/server/auth";
import {
  getApplicationSettings,
  saveApplicationSettings,
} from "@/lib/server/visitor-data";

const normalizeStringArray = (value: unknown, maxItems: number, maxLength: number) => {
  if (!Array.isArray(value) || value.length > maxItems) return null;
  const values = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  if (values.length !== value.length || values.some((item) => item.length > maxLength)) {
    return null;
  }
  return [...new Set(values)];
};

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ data: await getApplicationSettings() });
  } catch (error) {
    if (error instanceof Error && "status" in error) return authorizationResponse(error);
    console.error("Settings lookup failed:", error);
    return NextResponse.json({ error: "Unable to load settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const blockedCardBins = normalizeStringArray(body?.blockedCardBins, 500, 6);
    const allowedCountries = normalizeStringArray(body?.allowedCountries, 250, 3);

    if (!blockedCardBins || !allowedCountries) {
      return NextResponse.json({ error: "Invalid settings format" }, { status: 400 });
    }
    if (blockedCardBins.some((bin) => !/^\d{4,6}$/.test(bin))) {
      return NextResponse.json({ error: "Card BINs must contain 4-6 digits" }, { status: 400 });
    }
    if (allowedCountries.some((country) => !/^[A-Za-z]{3}$/.test(country))) {
      return NextResponse.json({ error: "Countries must use ISO 3-letter codes" }, { status: 400 });
    }

    await saveApplicationSettings({
      blockedCardBins,
      allowedCountries: allowedCountries.map((country) => country.toUpperCase()),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && "status" in error) return authorizationResponse(error);
    console.error("Settings update failed:", error);
    return NextResponse.json({ error: "Unable to save settings" }, { status: 500 });
  }
}