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
  const response = await fetch(`https://lookup.binlist.net/${cleanBin}`, {
    headers: {
      Accept: "application/json",
      "Accept-Version": "3",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new BinlistLookupError("فشل الاستعلام عن BIN", response.status);
  }

  return (await response.json()) as BinlistResponse;
}