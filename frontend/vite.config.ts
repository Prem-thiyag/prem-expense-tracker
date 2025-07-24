// File: frontend/vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This is the proxy configuration
    proxy: {
      // Any request from the frontend that starts with '/api' 
      // will be forwarded to the backend server.
      '/api': {
        target: 'http://localhost:8000', // Your FastAPI backend
        changeOrigin: true, // Recommended for avoiding certain proxy issues
      }
    }
  }
})