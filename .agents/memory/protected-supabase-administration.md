---
name: Protected Supabase administration
description: Why dashboard administration uses a server-only Supabase service-role client after Clerk authorization.
---

The dashboard must perform visitor, chat, settings, and analytics reads/writes through server-only API routes. Those routes first verify the Supabase Auth session and administrator authorization, then use the Supabase service-role key; the browser must never receive that key.

**Why:** The Supabase anon client is subject to RLS and cannot reliably perform administrator settings/mutation writes. Moving privileged access behind authenticated API routes preserves RLS boundaries while keeping payment and visitor data out of browser-side database clients.

**How to apply:** Any new dashboard data operation belongs in `lib/server/visitor-data.ts` and a protected route, with input validation before the database call. Use `@supabase/ssr` cookie sessions for auth and trust admin status only from Supabase `app_metadata` or a server-side allowlist. Do not import the service-role client into client components.