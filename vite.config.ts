import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Use relative paths for assets
  build: {
    outDir: 'dist', // The output directory for the build
  },
});
