import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages sirve el sitio en /english-tenses-trainer/
  base: '/english-tenses-trainer/',
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
