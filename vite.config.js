import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'www',
    emptyOutDir: false,  // Preserve existing www/ assets
    minify: false,       // For easier debugging during development
  },
});
