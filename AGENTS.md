# indie.site

A simple micro-SaaS where indie hackers create a public profile page that shows their websites and Google Search Console traffic.

Originally generated with Figma Make (Vite), now migrated to **Next.js (App Router) with plain JavaScript**. Keep the existing Figma design; do not redesign the UI unless required for functionality.

## Running locally

- `npm install` – install packages
- `npm run dev` – start the dev server at http://localhost:3000
- `npm run build` – production build (use it to check for errors)

## Project structure

- `app/layout.js` – Root layout shared by every page (fonts, global CSS, default metadata)
- `app/globals.css` – Tailwind CSS v4 + daisyUI (themes disabled) and global styles
- `app/page.js` – Landing page `/`
- `app/login/page.js`, `app/signup/page.js` – Auth pages
- `app/admin/page.js` – Dashboard: profile editor with live preview
- `app/settings/page.js` – Dashboard: account, billing, public page settings, delete account
- `app/[username]/page.js` – Public profile page (`indie.site/<username>`)
- `components/DashboardLayout.js` – Dashboard sidebar / mobile nav
- `components/AnalyticsCard.js` – Website traffic card with clicks/impressions chart
- `public/` – Static images

## Stack

- Next.js 16, React 19, JavaScript only (no TypeScript)
- Tailwind CSS v4 via `@tailwindcss/postcss` (`postcss.config.mjs`); no Tailwind config file
- daisyUI 5, loaded with `@plugin "daisyui"` in `app/globals.css`
- Fonts: Inter and DM Mono via `next/font` in `app/layout.js`
- Planned: Supabase (Auth, Postgres, Storage), Google Search Console API, Dodo Payments, Chart.js

## Code rules

- JavaScript (`.js`) only. Use `"use client"` only for components that need browser interactivity.
- Keep secrets server-side; only `NEXT_PUBLIC_*` env vars may be used in client code.
- Use the `@/` import alias for the project root (configured in `jsconfig.json`).
- Use double quotes for strings containing apostrophes, or escape them.
- Export components as default exports.
- Do not add libraries or features that were not requested.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
