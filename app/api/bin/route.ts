import { NextRequest, NextResponse } from "next/server";

const RAPIDAPI_KEY = "5c73c39f9fmsh657b606dfa61046p16d2c3jsn127ed336a63b";
const RAPIDAPI_HOST = "bin-ip-checker.p.rapidapi.com";

const cache = new Map<string, { data: any; expiresAt: number }>();
const TTL_MS = 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const bin = request.nextUrl.searchParams.get("bin");

  if (!bin || bin.replace(/\s/g, "").length < 6) {
    return NextResponse.json({ error: "BIN يجب أن يكون 6 أرقام على الأقل" }, { status: 400 });
  }

  const cleanBin = bin.replace(/\D/g, "").slice(0, 6);

  const cached = cache.get(cleanBin);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data);
  }

  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/?bin=${cleanBin}`,
      {
        method: "POST",
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bin: cleanBin }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "فشل الاستعلام عن BIN" }, { status: response.status });
    }

    const data = await response.json();
    cache.set(cleanBin, { data, expiresAt: Date.now() + TTL_MS });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "خطأ في الاتصال بخدمة BIN" }, { status: 500 });
  }
}
