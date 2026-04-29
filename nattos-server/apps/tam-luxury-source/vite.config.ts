import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
export default defineConfig({
  resolve: { extensions: ['.na', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'] },
  plugins: [
    {
      name: 'nauion-na-as-tsx',
      enforce: 'pre',
      async transform(code, id) {
        if (!id.endsWith('.na')) return null;
        return transformWithEsbuild(code, id, {
          loader: 'tsx',
          jsx: 'automatic',
        });
      },
    },
react()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  build: {
    outDir: '../../apps/tam-luxury',
    emptyOutDir: false,
    rollupOptions: {
      external: ['superdictionary.ts']
    }
  }
})
