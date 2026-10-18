// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 47231,
  },
  preview: {
    host: '0.0.0.0',
    port: 47231,
  },
  vite: {
    server: {
      strictPort: true,
    },
  },
});
