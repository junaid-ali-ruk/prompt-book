# Prompt Gallery

Prompt Gallery is a Bun-powered React prompt gallery migrated from the legacy app in this repository. It uses Tailwind CSS v4, shadcn/ui primitives, and a lightweight custom URL router instead of `react-router-dom`.

## Scripts

- Install dependencies: `bun install`
- Start the development server: `bun run dev`
- Build for production: `bun run build`
- Start the production server: `bun run start`

## Notes

- The app is frontend-only; the original Bun starter API demo was removed.
- Prompt modal state is synced through the `?view=<id>` query parameter.
- Routing utilities live in `src/lib/router.ts` and are covered by `bun test src/lib/router.test.ts`.
- Set `VITE_SITE_URL` to generate `robots.txt`, `sitemap.xml`, and canonical URLs for production builds.
