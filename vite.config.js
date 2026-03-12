import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Provide a stub for tslib which @supabase/functions-js requires
      'tslib': resolve(__dirname, 'src/lib/tslib-stub.js'),
    }
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
  },
})
