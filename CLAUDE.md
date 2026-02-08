# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

A client-side profile photo frame generator. Users upload a photo, customize circular frame text/colors, and download the result as a PNG. All processing happens in the browser — no backend.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build to `dist/open-to/`
- `npm run preview` — Preview production build
- `npx eslint open-to/src/` — Lint JS files

## Architecture

This is a vanilla JS + Vite project (no framework). The app lives under the `open-to/` directory:

- `index.html` — Main page entry point (root level), references assets via `/open-to/src/` paths
- `open-to/src/assets/main.js` — All application logic in a single file: photo upload via FileReader, SVG manipulation for the circular text frame, color picker syncing, and SVG-to-PNG export via Canvas
- `open-to/src/assets/style.css` — Custom styles + Tailwind directives
- `open-to/privacy-policy/index.html` — Static privacy policy page (currently commented out)

The frame rendering uses an inline SVG in `index.html` with a `foreignObject` for the user photo, a circular `<path>` for text placement, and a `linearGradient` for the color ring. The JS dynamically adjusts `startOffset` and gradient coordinates based on text length.

## Build Configuration

- **Vite** with `base: './'` for relative asset paths. Build expects entry points at `src/index.html` and `src/privacy-policy/index.html` (configured in `vite.config.js` `rollupOptions.input`)
- **Tailwind CSS v3** via PostCSS, with content scanning `./index.html` and `./src/**/*.{js,ts,jsx,tsx}`
- **PostCSS** plugins: tailwindcss, autoprefixer, cssnano
- **Terser** minification with console stripping in production

## Code Style

Prettier is configured: single quotes, semicolons, 2-space tabs, trailing commas (es5), 100 char print width. ESLint uses flat config (`eslint.config.js`) with recommended rules + browser globals.
