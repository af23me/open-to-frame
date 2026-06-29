# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

A client-side profile photo frame generator. Users upload a photo, customize circular frame text/colors, and download the result as a PNG. All processing happens in the browser — no backend.

## Commands

- `npm run dev` — Start Vite dev server (opens at the configured `BASE_PATH`, default `/`)
- `npm run build` — Production build (default output `dist/`, served at site root `/`)
- `npm run preview` — Preview production build
- `npx eslint open-to/src/` — Lint JS files

### Configurable deploy route

The build is path-agnostic, driven by two env vars (committed defaults in `.env`):

- `BASE_PATH` (default `/`) — route the app is served from. Drives Vite `base`, the output
  directory (which **mirrors** the path), in-app crosslinks, and the SEO/sitemap path.
- `SITE_URL` (default `https://melnic.me`) — absolute origin for SEO tags + sitemap.

CLI/process env overrides the `.env` default:

```bash
BASE_PATH=/mini-apps/open-for/ npm run build   # -> dist/mini-apps/open-for/{index.html,privacy-policy/index.html,sitemap.xml,...}
```

## Architecture

This is a vanilla JS + Vite project (no framework). The app lives under the `open-to/` directory:

- `index.html` — Main page entry point (root level), references assets via `/open-to/src/` paths
- `open-to/src/assets/main.js` — All application logic in a single file: photo upload via FileReader, SVG manipulation for the circular text frame, color picker syncing, and SVG-to-PNG export via Canvas
- `open-to/src/assets/style.css` — Custom styles + Tailwind directives
- `open-to/privacy-policy/index.html` — Static privacy policy page (currently commented out)

The frame rendering uses an inline SVG in `index.html` with a `foreignObject` for the user photo, a circular `<path>` for text placement, and a `linearGradient` for the color ring. The JS dynamically adjusts `startOffset` and gradient coordinates based on text length.

## Build Configuration

- **Vite** root is `open-to/`; entry points are `open-to/index.html` and
  `open-to/privacy-policy/index.html` (configured in `vite.config.js` `rollupOptions.input`).
- **`base` / `outDir` are computed** from `BASE_PATH` (see above). `normalizeBase()` ensures a
  single leading+trailing slash. Vite auto-prepends `base` to asset/script `src`s, so those
  stay as `/src/assets/...` in source.
- **Non-asset URLs use tokens.** Anchor `href`s and absolute SEO URLs (which Vite does *not*
  rewrite) use `{{BASE}}` and `{{SITE_URL}}` placeholders in the HTML, resolved by the
  `openfor-base-config` plugin's `transformIndexHtml` hook (runs in dev **and** build).
- **`sitemap.xml` is generated** at build time by that same plugin (`generateBundle` +
  `emitFile`) from `SITE_URL` + `base` — it is *not* a static file in `public/`.
- **Tailwind CSS v3** via PostCSS, content scanning `./open-to/**/*.html` and
  `./open-to/src/**/*.{js,ts,jsx,tsx}`.
- **PostCSS** plugins: tailwindcss, autoprefixer, cssnano.
- **Terser** minification with console stripping in production.

## Code Style

Prettier is configured: single quotes, semicolons, 2-space tabs, trailing commas (es5), 100 char print width. ESLint uses flat config (`eslint.config.js`) with recommended rules + browser globals.
