import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Assicura che i percorsi in index.html siano relativi (necessario per Chrome Extension)
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
