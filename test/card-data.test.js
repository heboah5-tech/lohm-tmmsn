/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const test = require("node:test");
const {
  getNormalizedCardEntries,
  getNormalizedCardState,
  hasNormalizedCardData,
} = require("../.tmp/card-data-tests/card-data.js");

const card = (cardNumber, extra = {}) => ({
  cardNumber,
  cardHolderName: "Test Holder",
  ...extra,
});

test("normalizes typed and untyped history entries", () => {
  const entries = getNormalizedCardEntries({
    history: [
      {
        id: "typed",
        type: "card",
        timestamp: "2026-09-08T10:00:00.000Z",
        data: card("4111111111111111"),
      },
      {
        id: "untyped",
        timestamp: "2026-09-08T11:00:00.000Z",
        data: card("5555555555554444"),
      },
    ],
  });

  assert.deepEqual(
    entries.map(({ id, source, data }) => ({ id, source, cardNumber: data.cardNumber })),
    [
      { id: "typed", source: "history", cardNumber: "4111111111111111" },
      { id: "untyped", source: "history", cardNumber: "5555555555554444" },
    ],
  );
});

test("normalizes nested and JSON-string cardHistory plus oldCards", () => {
  const entries = getNormalizedCardEntries({
    cardHistory: JSON.stringify({
      attempts: [
        {
          entryId: "legacy-json",
          createdAt: "2026-09-08T12:00:00.000Z",
          payload: { card: card("4000000000000002") },
        },
      ],
    }),
    oldCards: {
      archived: {
        key: "legacy-old",
        value: card("6011111111111117"),
      },
    },
  });

  assert.deepEqual(
    entries.map(({ id, source, data }) => ({ id, source, cardNumber: data.cardNumber })),
    [
      { id: "legacy-json", source: "cardHistory", cardNumber: "4000000000000002" },
      { id: "oldCards-card-0", source: "oldCards", cardNumber: "6011111111111117" },
    ],
  );
});

test("normalizes direct card fields, including month/year expiry", () => {
  const entries = getNormalizedCardEntries({
    cardNumber: "4242424242424242",
    cvv: "123",
    cardMonth: "09",
    cardYear: "29",
    cardName: "Direct Holder",
  });

  assert.equal(entries.length, 1);
  assert.equal(entries[0].source, "direct");
  assert.equal(entries[0].data.expiryDate, "09/29");
  assert.equal(entries[0].data.cardHolderName, "Direct Holder");
});

test("deduplicates equivalent history and fallback records", () => {
  const visitor = {
    history: [{ id: "history-card", data: card("4111111111111111") }],
    cardHistory: [{ id: "card-history-card", data: card("4111111111111111") }],
    oldCards: [{ id: "old-card", data: card("4111111111111111") }],
    cardNumber: "4111111111111111",
    cardHolderName: "Test Holder",
  };

  const entries = getNormalizedCardEntries(visitor);

  assert.equal(entries.length, 1);
  assert.equal(entries[0].source, "history");
  assert.equal(entries[0].id, "history-card");
});

test("card filtering and notification state share the normalized result", () => {
  const visitor = {
    id: "visitor-1",
    cardHistory: JSON.stringify({
      data: card("4111111111111111"),
    }),
  };

  const entries = getNormalizedCardEntries(visitor);
  const state = getNormalizedCardState(visitor);

  assert.equal(hasNormalizedCardData(visitor), entries.length > 0);
  assert.deepEqual(state, {
    count: entries.length,
    key: `history|${entries[0].id}|${entries[0].timestamp || ""}|4111111111111111`,
  });
});