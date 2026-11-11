import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // O PGlite carrega o próprio WebAssembly; o Vite não deve pré-empacotar
  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },
})
