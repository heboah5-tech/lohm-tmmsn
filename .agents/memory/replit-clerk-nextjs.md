---
name: Replit Clerk with Next.js
description: Environment-name compatibility between Replit-managed Clerk setup and Next.js client bootstrapping.
---

When Clerk is provisioned by the Replit-managed setup, the publishable key may exist as `CLERK_PUBLISHABLE_KEY` and `VITE_CLERK_PUBLISHABLE_KEY`, while Next.js expects `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` or an explicit `ClerkProvider` prop.

**Why:** Leaving the names unbridged causes a runtime “Missing publishableKey” error even though the Clerk secrets exist.

**How to apply:** Bridge the available publishable key in `next.config.ts`, pass it explicitly to `ClerkProvider`, and pass the same key to `clerkMiddleware` when using the Next.js App Router.