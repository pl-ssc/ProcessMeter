import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: [
      'lodash',
      'lodash/clamp.js',
      'lodash/uniq.js',
      'lodash/flatten.js',
      'lodash/range.js',
      'lodash/debounce.js',
      'lodash/has.js',
      'lodash/throttle.js',
      '@glideapps/glide-data-grid',
      '@glideapps/glide-data-grid-cells',
      'react-responsive-carousel'
    ],
  },
});
