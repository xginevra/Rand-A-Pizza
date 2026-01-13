import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      'rand-a-pizza-frontend.onrender.com',
      'rand-a-pizza-backend.onrender.com' 
    ],
  proxy: {
  '/api': {
    target: 'https://rand-a-pizza-backend.onrender.com',
    changeOrigin: true,
    secure: true,
      },
    },
  },
});