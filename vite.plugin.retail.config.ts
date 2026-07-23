import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist_plugins/rita-plugin-retail',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/plugins/retail.tsx'),
      name: 'RetailPlugin',
      formats: ['iife'],
      fileName: () => 'plugin.js'
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
