---
name: Supabase visitor mapping
description: The dashboard's PostgreSQL storage contract for visitor records and legacy-compatible application payloads.
---

Visitor records use `visitor_id` plus indexed operational columns for online, blocked, unread, current page/step, redirect page, and timestamps. The complete visitor/application object remains in `data` JSONB, including values that may be strings or legacy fields.

**Why:** The dashboard supports several visitor-site payload shapes and some flow steps are strings such as `compar`; dropping those fields while populating indexed columns loses data and breaks the existing UI.

**How to apply:** When changing persistence or adding queries, update both the row-column mapping and `data` payload handling. Treat the indexed columns as query-friendly mirrors, not a replacement for the JSONB application data.