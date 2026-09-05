---
name: Protected Supabase administration
description: Why dashboard administration uses a server-only Supabase service-role client after Clerk authorization.
---

The dashboard must perform visitor, chat, settings, and analytics reads/writes through server-only API routes. Those routes first verify the Clerk session and administrator authorization, then use the Supabase service-role key; the browser must never receive that key.

**Why:** The Supabase anon client is subject to RLS and cannot reliably perform administrator settings/mutation writes. Moving privileged access behind authenticated API routes preserves RLS boundaries while keeping payment and visitor data out of browser-side database clients.

**How to apply:** Any new dashboard data operation belongs in `lib/server/visitor-data.ts` and a protected route, with input validation before the database call. Do not import `@supabase/supabase-js` into client components.