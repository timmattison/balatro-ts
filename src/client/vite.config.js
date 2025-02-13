import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { server } from 'typescript'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/analyze": {
        target: "http://localhost:3000",
        changeOrigin: true,
      }
    }
  }
})
