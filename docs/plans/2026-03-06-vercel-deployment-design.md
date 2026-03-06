# Vercel Deployment Design

**Goal:** Deploy the Bun-built frontend to Vercel as a static SPA with minimal project changes.

## Context

- The app is frontend-only.
- Production assets are generated into `dist/` via `bun run build`.
- Routing is client-side, so deep links must resolve to `index.html`.

## Decision

- Use a root `vercel.json`.
- Keep the existing Bun build pipeline.
- Configure Vercel to deploy `dist/`.
- Rewrite non-file requests to `index.html`.

## Result

- Vercel stops looking for `public/`.
- Refreshing routes like `/auth` or `/admin` works.
- Deployment settings live in the repo instead of only in the dashboard.

## Notes

- `VITE_SITE_URL` remains optional for the first `*.vercel.app` deploy.
- When set, production builds can generate canonical URLs, `robots.txt`, and `sitemap.xml`.