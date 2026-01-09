import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3001,
    https: false,
    strictPort: true,
    proxy: {
  '/api/ingredients': {
    target: 'http://backend:8000',
    changeOrigin: true,
    secure: false,
  },
  '/api/random-pizza': {
    target: 'http://backend:8000',
    changeOrigin: true,
    secure: false,
  },
  '/api/save-recipe': {
    target: 'http://backend:8000',
    changeOrigin: true,
    secure: false,
  },
  '/api/user-recipes/{user_id}': {
    target: 'http://backend:8000',
    changeOrigin: true,
    secure: false,
  }
  }
    }
      }
        )