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
- `app/login/page.js` (+ `LoginForm.js`), `app/signup/page.js` – Auth pages
- `app/auth/actions.js` – Server actions: signup, login, logout
- `app/auth/confirm/route.js` – Email confirmation link handler (PKCE `code` or `token_hash`)
- `app/(dashboard)/layout.js` – Verifies the user with `getClaims()` and renders `DashboardLayout`
- `app/(dashboard)/admin/page.js` – Dashboard: profile editor with live preview
- `app/(dashboard)/sites/page.js` (+ `SitesManager.js`, `actions.js`) – Dashboard: connect Google Search Console, add/remove sites, 6–8 word description
- `app/(dashboard)/settings/page.js` – Dashboard: account, billing, public page settings, delete account
- `app/api/google/connect/route.js`, `app/api/google/callback/route.js` – Google OAuth start and return (state cookie check)
- `app/api/logo/route.js` + `lib/logo.js` – Public website icon for a site already saved in `sites` (fetched server-side, cached)
- `app/[username]/page.js` – Public profile page (`indie.site/<username>`)
- `components/DashboardLayout.js` – Dashboard sidebar / mobile nav (active link, user, logout)
- `lib/supabase/server.js` – Supabase client for server code (cookie-based session)
- `lib/supabase/admin.js` – Server-only Supabase client with the secret key (bypasses RLS; check the user first)
- `lib/google.js` – Server-only Google OAuth + Search Console API helpers and stored connections
- `lib/traffic.js` – Syncs daily Search Console traffic into `site_traffic_daily` (when older than 6h, via `after()`) and loads 90-day series for the public page
- `lib/encryption.js` – AES-256-GCM encryption for Google refresh tokens (`TOKEN_ENCRYPTION_KEY`)
- `supabase/migrations/` – SQL run manually in the Supabase SQL Editor
- `lib/supabase/proxy.js` + `proxy.js` – Refreshes the session on each request; redirects for protected/auth pages
- `components/AnalyticsCard.js` – Website traffic card (`name`, `days`) with clicks/impressions Chart.js chart and 28/90-day toggle
- `public/` – Static images

## Stack

- Next.js 16, React 19, JavaScript only (no TypeScript)
- Tailwind CSS v4 via `@tailwindcss/postcss` (`postcss.config.mjs`); no Tailwind config file
- daisyUI 5, loaded with `@plugin "daisyui"` in `app/globals.css`
- Fonts: Inter and DM Mono via `next/font` in `app/layout.js`
- Charts: Chart.js used directly (no React wrapper), registering only the pieces it needs
- Supabase Auth via `@supabase/ssr` (email + password). Always use `getClaims()` (never `getSession()`) to verify users on the server.
- Supabase Postgres + Storage (`profiles`, `avatars` bucket, `google_connections`, `sites`, `site_traffic_daily`)
- Google Search Console API via `google-auth-library` (read-only `webmasters.readonly` scope). Refresh tokens are encrypted and stored in `google_connections`, which has RLS with no policies (server/secret key only).
- Planned: Dodo Payments

## UI rules (daisyUI)

- Always build UI with daisyUI 5 components and classes (`btn`, `card`, `input`, `fieldset`, `badge`, `join`, `menu`, `avatar`, `toggle`, `alert`, `modal`, etc.) combined with Tailwind utilities, matching the existing Figma styling (stone palette, rounded-xl/3xl, soft shadows).
- Check the daisyUI 5 docs before using a component: https://daisyui.com/llms.txt
- daisyUI themes are disabled (`themes: false`), so theme colours like `badge-success`, `btn-primary` or `alert-error` have no colour. Use Tailwind colour classes instead (e.g. `border-emerald-300 text-emerald-700`).
- daisyUI's `--border` size is only defined for form fields in `app/globals.css`; give other bordered elements explicit Tailwind border classes.

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
