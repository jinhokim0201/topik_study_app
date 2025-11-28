import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Vercel: base는 '/', GitHub Pages: base는 '/korean-study-app/'
  // 환경 변수 VITE_BASE_URL로 제어 (Vercel에서는 자동으로 '/' 사용)
  base: process.env.VITE_BASE_URL || (command === 'serve' ? '/' : '/'),
}))
