import { defineConfig, loadEnv } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Normalize a base path so it always has exactly one leading and trailing slash.
// '' / '/' -> '/', 'mini-apps/open-for' -> '/mini-apps/open-for/'
function normalizeBase(p) {
  if (!p || p === '/') return '/';
  return `/${p.replace(/^\/+/, '').replace(/\/+$/, '')}/`;
}

export default defineConfig(({ mode }) => {
  // Load .env files (committed defaults). CLI/process env always wins so that
  // `BASE_PATH=/example/open-for/ npm run build` overrides the .env default.
  const env = loadEnv(mode, __dirname, '');
  const base = normalizeBase(process.env.BASE_PATH || env.BASE_PATH || '/');
  const siteUrl = (process.env.SITE_URL || env.SITE_URL || 'https://example.com').replace(
    /\/+$/,
    ''
  );

  // Output mirrors the route: '/' -> dist, '/example/open-for/' -> dist/example/open-for
  const outDir = resolve(__dirname, `dist${base}`.replace(/\/$/, '') || 'dist');

  // Resolve {{BASE}} / {{SITE_URL}} tokens in HTML (anchor hrefs + absolute SEO URLs that
  // Vite does not rewrite), and emit a sitemap.xml whose <loc>s match the configured URLs.
  const baseConfigPlugin = {
    name: 'openfor-base-config',
    transformIndexHtml(html) {
      return html.replace(/\{\{BASE\}\}/g, base).replace(/\{\{SITE_URL\}\}/g, siteUrl);
    },
    generateBundle() {
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}${base}</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}${base}privacy-policy/</loc>
    <priority>0.3</priority>
  </url>
</urlset>
`;
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
    },
  };

  return {
    root: 'open-to',
    base,
    plugins: [baseConfigPlugin],
    server: {
      port: 5173,
      open: base,
    },
    build: {
      outDir,
      emptyOutDir: true,
      minify: 'terser',
      sourcemap: false,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log'],
        },
        mangle: true,
        format: {
          comments: false,
        },
      },
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'open-to/index.html'),
          'privacy-policy': resolve(__dirname, 'open-to/privacy-policy/index.html'),
        },
        output: {
          manualChunks: undefined,
        },
      },
      cssMinify: true,
      assetsDir: 'assets',
      reportCompressedSize: false,
    },
  };
});
