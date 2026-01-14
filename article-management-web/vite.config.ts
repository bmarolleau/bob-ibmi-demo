import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Proxy IBM i Web Services requests
      '/web': {
        target: 'http://10.3.61.2:10026',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

// Made with Bob
