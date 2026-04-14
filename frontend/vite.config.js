import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@glideapps')) return 'glide-grid';
          if (id.includes('@radix-ui')) return 'radix-ui';
          if (id.includes('xlsx')) return 'xlsx';
          if (id.includes('react') || id.includes('scheduler')) return 'react-vendor';
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
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
