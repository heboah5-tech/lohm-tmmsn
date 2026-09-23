export type BinlistResponse = Record<string, unknown>;

export class BinlistLookupError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "BinlistLookupError";
  }
}

/**
 * Promise-based Binlist lookup.
 *
 * This is the safe equivalent of `binlookup()(bin)` for the server route.
 * Keeping the request server-side avoids exposing provider behavior to the
 * browser and lets the dashboard retain its existing cache.
 */
export async function lookupBin(bin: string): Promise<BinlistResponse> {
  const cleanBin = bin.replace(/\D/g, "").slice(0, 8);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let response: Response;
  try {
    response = await fetch(`https://lookup.binlist.net/${cleanBin}`, {
      headers: {
        Accept: "application/json",
        "Accept-Version": "3",
      },
      signal: controller.signal,
      next: { revalidate: 86400 },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new BinlistLookupError("انتهت مهلة الاستعلام عن BIN", 504);
    }
    throw new BinlistLookupError("تعذر الاتصال بخدمة BIN", 502);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new BinlistLookupError("فشل الاستعلام عن BIN", response.status);
  }

  const data = (await response.json()) as unknown;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new BinlistLookupError("استجابة BIN غير صالحة", 502);
  }

  return data as BinlistResponse;
}