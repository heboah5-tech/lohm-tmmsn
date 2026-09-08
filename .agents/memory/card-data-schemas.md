---
name: Card data schema compatibility
description: Visitor card records may use current history entries, legacy cardHistory arrays, or direct document fields.
---

The dashboard must normalize card data from all supported visitor schemas: typed or untyped `history` entries, JSON-string or nested `cardHistory`/`oldCards` values, and direct fields such as `cardNumber`, `cvv`, `cardMonth`, and `cardYear`.

**Why:** Multiple visitor-site projects have written different Firestore shapes over time, so assuming only the newest history format makes valid card submissions disappear from the dashboard.

**How to apply:** Keep extraction centralized and reuse it for card display, filtering, sorting, and notifications. Prefer history entries over fallback fields and deduplicate equivalent records across sources.