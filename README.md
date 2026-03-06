# Prompt Gallery

Prompt Gallery is a Bun-powered React prompt gallery migrated from the legacy app in this repository. It uses Tailwind CSS v4, shadcn/ui primitives, and a lightweight custom URL router instead of `react-router-dom`.

## Scripts

- Install dependencies: `bun install`
- Start the development server: `bun run dev`
- Build for production: `bun run build`
- Start the production server: `bun run start`

## Deploying to Vercel

This repo is configured for a static Vercel deployment through `vercel.json`.

### Recommended Vercel settings

- Framework Preset: `Other`
- Install Command: `bun install`
- Build Command: `bun run build`
- Output Directory: `dist`

### Why the repo needs `vercel.json`

- The app builds to `dist/`, not `public/`
- The app uses client-side routes like `/auth`, `/share`, `/me`, `/admin`, `/prompt`, and `/edit`
- Vercel rewrites non-file routes to `index.html` so refresh/deep links keep working

### Environment variables

- Optional for first deploy: `VITE_SITE_URL=https://your-project.vercel.app`
- Set `VITE_SITE_URL` later if you want canonical URLs, `robots.txt`, and `sitemap.xml` generated for production
- `VITE_INSFORGE_BASE_URL` and `VITE_INSFORGE_ANON_KEY` can also be set in Vercel if you want to override the defaults embedded in the app

### Deploy flow

1. Import the repo into Vercel
2. Confirm the build settings above
3. Add env vars if needed
4. Deploy
5. After the first deploy, set `VITE_SITE_URL` to your `*.vercel.app` URL and redeploy if you want production SEO files

### If Google OAuth returns a Vercel 404

- The app sends OAuth users back to `https://your-site/me`
- That return is a full-page navigation, so Vercel must rewrite the request to `index.html`
- If the deployed site still shows `404: NOT_FOUND`, your live Vercel project does not have the latest rewrite config yet
- Fix by either pushing this repo's `vercel.json` and redeploying, or by adding the same rewrite rule in Vercel Project Settings

## Notes

- The app is frontend-only; the original Bun starter API demo was removed.
- Prompt modal state is synced through the `?view=<id>` query parameter.
- Routing utilities live in `src/lib/router.ts` and are covered by `bun test src/lib/router.test.ts`.
- Set `VITE_SITE_URL` to generate `robots.txt`, `sitemap.xml`, and canonical URLs for production builds.
