---
name: Card data schema compatibility
description: Visitor card records may use current history entries, legacy cardHistory arrays, or direct document fields.
---

The dashboard must normalize card data from all supported Firebase visitor schemas: `history` entries with `card`/`_t1` types, legacy `cardHistory` arrays, and direct fields such as `cardNumber`, `cvv`, `cardMonth`, and `cardYear`.

**Why:** Multiple visitor-site projects have written different Firestore shapes over time, so assuming only the newest history format makes valid card submissions disappear from the dashboard.

**How to apply:** When changing card display, filtering, sorting, or notifications, keep all three storage formats covered and verify the active Firebase project before diagnosing missing data.