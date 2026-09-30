import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Demo publicat pe GitHub Pages: https://rtr-tech-solutions.github.io/persky-demo/
// Local (npm run dev) rulează la rădăcină; build-ul pentru Pages setează GH_PAGES=1.
// TODO(real): output hybrid/SSR (catalog, produs, coș) pe VPS + Coolify, la domeniul clientului.
const pages = process.env.GH_PAGES === '1';

export default defineConfig({
  site: pages ? 'https://rtr-tech-solutions.github.io' : undefined,
  base: pages ? '/persky-demo' : undefined,
  integrations: [react()],
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
});
