import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy /api to XAMPP so cookies stay same-origin (no CORS setup needed).
// Change the path if your folder isn't htdocs/login_system/api.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, '/login_system/api'),
      },
    },
  },
})
