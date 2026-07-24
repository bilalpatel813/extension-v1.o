# Pursuit — Website

The companion website for the Pursuit browser extension: a landing page,
account creation, and a dashboard for reviewing every job application
you've tracked.

This is **frontend-only for now**. All data currently lives in the
browser's `localStorage` via a mock API layer, so every page — signup,
login, dashboard, profile — is fully clickable without a backend. See
`BACKEND_INTEGRATION.md` for the exact Django contract to build against
when you're ready to add one.

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- Framer Motion for animation
- Self-hosted fonts via `@fontsource` (Cormorant Garamond + DM Mono) —
  no runtime dependency on Google Fonts

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```
src/
├── app/
│   ├── layout.tsx                 # root layout, fonts, AuthProvider
│   ├── globals.css                # design tokens (colors, motion, focus states)
│   ├── (marketing)/
│   │   ├── layout.tsx             # navbar + footer shell
│   │   ├── page.tsx               # landing page
│   │   └── privacy-policy/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   └── (app)/
│       ├── layout.tsx             # sidebar shell, redirects to /login if signed out
│       ├── dashboard/page.tsx
│       └── profile/page.tsx
├── components/                    # Navbar, Footer, Sidebar, HeroMock, etc.
└── lib/
    ├── api.ts                     # mock API — swap for real fetch calls, see BACKEND_INTEGRATION.md
    ├── auth-context.tsx           # React context wrapping api.ts
    └── mock-data.ts               # demo applications shown on first dashboard visit
```

## Design system

Matches the Pursuit browser extension exactly:

| Token | Value |
|---|---|
| Background | `#0a0a0a` |
| Accent | `#f7600a` |
| Display face | Cormorant Garamond |
| Utility face | DM Mono |

Status colors: `applied` (neutral), `interview` (`#d9a441`), `offer`
(`#7a9b6e`), `rejected` (`#a85c4d`). Source colors: LinkedIn (`#4a8fd9`),
Indeed (`#7fb0e0`), Naukri (`#d97757`).

## Deploying

Any Next.js host works (Vercel is the path of least resistance). Once the
Django backend exists, point `api.ts`'s real fetch calls at its URL via an
environment variable, e.g. `NEXT_PUBLIC_API_URL`.
