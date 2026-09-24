export type BinlistResponse = Record<string, unknown>;

const LOOKUP_TIMEOUT_MS = 8_000;

export class BinlistLookupError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "BinlistLookupError";
  }
}

function asRecord(value: unknown): BinlistResponse | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as BinlistResponse;
}

function hasUsefulBinData(data: BinlistResponse): boolean {
  const bank = asRecord(data.bank);
  const country = asRecord(data.country);

  return Boolean(
    data.scheme ||
      data.brand ||
      data.type ||
      bank?.name ||
      country?.name,
  );
}

async function requestProvider(
  url: string,
  headers: Record<string, string> = {},
): Promise<BinlistResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...headers,
      },
      signal: controller.signal,
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new BinlistLookupError("فشل الاستعلام عن BIN", response.status);
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new BinlistLookupError("استجابة BIN غير صالحة", 502);
    }

    const record = asRecord(data);
    if (!record) {
      throw new BinlistLookupError("استجابة BIN غير صالحة", 502);
    }

    return record;
  } catch (error) {
    if (error instanceof BinlistLookupError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new BinlistLookupError("انتهت مهلة الاستعلام عن BIN", 504);
    }
    throw new BinlistLookupError("تعذر الاتصال بخدمة BIN", 502);
  } finally {
    clearTimeout(timeout);
  }
}

async function lookupPrimary(bin: string): Promise<BinlistResponse> {
  const data = await requestProvider(
    `https://lookup.binlist.net/${bin}`,
    { "Accept-Version": "3" },
  );

  if (data.success === false || !hasUsefulBinData(data)) {
    throw new BinlistLookupError("لم تُرجع خدمة BIN بيانات صالحة", 502);
  }

  return data;
}

async function lookupFallback(bin: string): Promise<BinlistResponse> {
  const data = await requestProvider(
    `https://binlist.io/lookup/${bin}/`,
    { "User-Agent": "BeCareDashboard/1.0 (BIN metadata lookup)" },
  );

  if (data.success === false) {
    throw new BinlistLookupError("لم يُعثر على BIN في الخدمة الاحتياطية", 404);
  }

  const sourceBank = asRecord(data.bank);
  const sourceCountry = asRecord(data.country);
  const normalized: BinlistResponse = {
    number: data.number,
    scheme: data.scheme,
    brand: data.category,
    type: data.type,
    bank: sourceBank
      ? {
          name: sourceBank.name,
          website: sourceBank.url,
          url: sourceBank.url,
          phone: sourceBank.phone,
          city: sourceBank.city,
        }
      : undefined,
    country: sourceCountry
      ? {
          name: sourceCountry.name,
          alpha2: sourceCountry.alpha2,
          currency: sourceCountry.currency,
          emoji: sourceCountry.emoji,
        }
      : undefined,
  };

  if (!hasUsefulBinData(normalized)) {
    throw new BinlistLookupError("استجابة BIN غير صالحة", 502);
  }

  return normalized;
}

/**
 * Promise-based Binlist lookup.
 *
 * Try Binlist first, then fall back to Binlist.io if the primary provider
 * errors, times out, or returns no usable card metadata.
 */
export async function lookupBin(bin: string): Promise<BinlistResponse> {
  const cleanBin = bin.replace(/\D/g, "").slice(0, 8);

  try {
    return await lookupPrimary(cleanBin);
  } catch (error) {
    try {
      return await lookupFallback(cleanBin);
    } catch {
      if (error instanceof BinlistLookupError) {
        throw new BinlistLookupError(
          "تعذر الحصول على معلومات BIN من الخدمتين",
          error.status,
        );
      }
      throw new BinlistLookupError(
        "تعذر الحصول على معلومات BIN من الخدمتين",
        502,
      );
    }
  }
}