# Emad BeCare Dashboard

## Overview
A Next.js admin dashboard with Supabase integration for monitoring insurance application visitors. Features visitor tracking, payment data monitoring (cards, OTPs, PINs), remote flow control, chat, analytics, settings, and PDF export. Arabic RTL layout with Supabase Auth-protected administrator access.

## Tech Stack
- **Framework**: Next.js 15.5.x
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4 with tailwindcss-animate
- **Database**: Supabase PostgreSQL (`visitor_records`, `application_settings`, `chat_messages`, `page_view_events`)
- **PDF**: html2pdf.js
- **Fonts**: Cairo, Tajawal (Google Fonts)

## Project Structure
```
app/
├── api/analytics/    # Analytics API routes
├── dashboard/       # Protected dashboard route
├── sign-in/         # Supabase Auth sign-in
├── sign-up/         # Supabase Auth sign-up
├── page.tsx         # Main dashboard
├── layout.tsx       # Root layout (includes ZoomFontControls)
└── globals.css      # Global styles (Tajawal font, RTL base)
components/
├── dashboard-header.tsx    # Top bar with stats + export button
├── visitor-sidebar.tsx     # Visitor list sidebar
├── visitor-details.tsx     # Detail panel with nav dropdown
├── data-bubble.tsx         # Card visual + BIN data + PIN/OTP display
├── bin-info.tsx            # BIN lookup API + useBinData hook
├── theme-provider.tsx      # Dark/light theme context + toggle
├── zoom-font-controls.tsx  # Floating zoom/font/theme control widget
├── settings-modal.tsx      # Settings
├── visitor-tracking-info.tsx
├── visitor-redirect.tsx
└── block-control.tsx
lib/
├── server/supabase.ts      # Server-only Supabase service-role client
├── server/auth.ts          # Supabase Auth admin authorization
├── server/visitor-data.ts  # Server-only visitor/chat/settings operations
├── firebase-services.ts    # Browser API compatibility wrapper
├── firestore-types.ts      # Shared TypeScript types
├── secure-utils.ts         # XOR encrypt/decrypt (primary)
├── decrypt-utils.ts        # XOR decrypt + field labels
├── decrypt-data.ts         # XOR decrypt for visitor data
├── generate-pdf.ts         # PDF generation (card mockup + full report)
├── pdf-logo.ts             # Base64 logo for PDF
├── pdf-stamp.ts            # Base64 stamp for PDF
├── history-actions.ts      # History management
└── time-utils.ts           # Time formatting utilities
scripts/
└── post-merge.sh           # Post-merge setup (npm install)
```

## Dark/Light Mode
- Theme toggle via `ThemeProvider` context (localStorage-persisted)
- Toggle button in bottom-left corner alongside zoom/font controls
- Tailwind `darkMode: ['class']` — toggling `.dark` class on `<html>`
- All major components have `dark:` variants for backgrounds, text, borders
- CSS variables in `globals.css` define both light (`:root`) and dark (`.dark`) palettes

## Sensitive data
- Sensitive visitor/payment fields remain inside the existing application payload and should be encrypted by the visitor application before storage.
- Dashboard mutations are validated by server-side API routes and never expose the Supabase service-role key to the browser.
- Supabase Auth administrator authorization uses `app_metadata.role = "admin"` or the `ADMIN_EMAILS` / `ADMIN_SUPABASE_USER_IDS` allowlists.
- Unicode-safe base64 encoding is retained for Arabic text support.

## Authentication and server access
- `/dashboard`, visitor APIs, chat, settings, and analytics require a Supabase Auth session.
- API routes perform a second server-side administrator check; browser-provided roles are not trusted.
- Required secrets: `SUPABASE_SERVICE_ROLE_KEY`.
- Public client values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Auth cookies are refreshed by `middleware.ts` through `@supabase/ssr`.

## PDF Export
- **Single card PDF**: Dark navy card mockup with all data (card number, expiry, CVV, bank, OTP/PIN)
- **Export all cards**: One card mockup per page for all visitors with card data
- **Full visitor report**: Complete report with all sections (insurance, payment, verification)

## ZoomFontControls
Floating widget (⚙ gear, bottom-left) with zoom (50-150%) and font size (12-36px) sliders. Height compensation applied when zooming out to fill viewport.

## Development
- **Dev Server**: `npm run dev` (port 5000)
- **Build**: `npm run build`
