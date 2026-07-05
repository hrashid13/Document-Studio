import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Studio (Electron renderer) build. base './' so the built index.html
// loads correctly from the filesystem inside Electron.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
  },
})
