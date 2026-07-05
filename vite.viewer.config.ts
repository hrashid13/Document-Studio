import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Viewer bundle build: the same shared render components compiled to a single
// IIFE script + css. Exported articles copy viewer-dist/viewer.js|css next to
// an index.html that inlines the project JSON. IIFE (not ES modules) so the
// exported article works when opened directly via file://.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'viewer-dist',
    emptyOutDir: true,
    lib: {
      entry: 'src/viewer/viewer.tsx',
      name: 'ArticleViewer',
      formats: ['iife'],
      fileName: () => 'viewer.js',
    },
    rollupOptions: {
      output: {
        assetFileNames: 'viewer.[ext]',
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
})
