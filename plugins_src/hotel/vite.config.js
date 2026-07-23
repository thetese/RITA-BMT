import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: 'src/index.tsx', name: 'hotelPlugin', formats: ['iife'], fileName: () => 'plugin.js' },
    rollupOptions: { external: ['react', 'react-dom'], output: { globals: { react: 'React', 'react-dom': 'ReactDOM' } } }
  },
  define: { 'process.env.NODE_ENV': '"production"' }
});