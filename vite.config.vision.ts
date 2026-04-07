import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'src/ui-vision',
  build: {
    outDir: '../../nattos-server/nattos-ui/vision',
    emptyOutDir: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/ui-vision'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@cells': path.resolve(__dirname, 'src/cells'),
    }
  }
});
