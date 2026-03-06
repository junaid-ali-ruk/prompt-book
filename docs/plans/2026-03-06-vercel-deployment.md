# Vercel Deployment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make this frontend deploy cleanly to Vercel with repo-owned configuration.

**Architecture:** Keep the current Bun static build, declare Vercel build/output settings in `vercel.json`, and add an SPA rewrite for client-side routes.

**Tech Stack:** Bun, React, static Vercel deployment, `vercel.json`

---

### Task 1: Add Vercel configuration

**Files:**
- Create: `vercel.json`

**Step 1:** Add `installCommand`, `buildCommand`, and `outputDirectory`.

**Step 2:** Add an SPA rewrite for non-file routes to `/index.html`.

**Step 3:** Keep the config minimal so it does not change app behavior outside deployment.

### Task 2: Document deployment steps

**Files:**
- Modify: `README.md`

**Step 1:** Add the exact Vercel dashboard settings.

**Step 2:** Document the optional `VITE_SITE_URL` flow for the first deploy.

**Step 3:** Mention that client-side routes depend on the rewrite rule.

### Task 3: Verify safely

**Files:**
- Test: `src/lib/router.test.ts`
- Test: `src/lib/site-config.test.ts`

**Step 1:** Run the relevant Bun tests.

**Step 2:** Run `bun run build`.

**Step 3:** Confirm the build succeeds and outputs `dist/`.