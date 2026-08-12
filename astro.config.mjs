// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Needed so social tags can emit absolute URLs; scrapers ignore relative ones.
  site: 'https://sethuc.com',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
