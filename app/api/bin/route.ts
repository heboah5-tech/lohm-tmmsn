import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { data: any; expiresAt: number }>();
const TTL_MS = 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const bin = request.nextUrl.searchParams.get("bin");

  if (!bin || bin.replace(/\D/g, "").length < 6) {
    return NextResponse.json({ error: "BIN يجب أن يكون 6 أرقام على الأقل" }, { status: 400 });
  }

  const cleanBin = bin.replace(/\D/g, "").slice(0, 8);

  const cached = cache.get(cleanBin);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data);
  }

  try {
    const response = await fetch(`https://lookup.binlist.net/${cleanBin}`, {
      headers: {
        Accept: "application/json",
        "Accept-Version": "3",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "فشل الاستعلام عن BIN" }, { status: response.status });
    }

    const data = await response.json();
    const responseData = { ...data, valid: true };
    cache.set(cleanBin, { data: responseData, expiresAt: Date.now() + TTL_MS });
    return NextResponse.json(responseData);
  } catch {
    return NextResponse.json({ error: "خطأ في الاتصال بخدمة BIN" }, { status: 500 });
  }
}
