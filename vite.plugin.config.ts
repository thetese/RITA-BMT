import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const pluginName = process.env.PLUGIN_NAME || 'retail';

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: `dist_plugins/rita-plugin-${pluginName}`,
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, `src/plugins/${pluginName}.tsx`),
      name: `${pluginName}Plugin`,
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
