import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // 개발 환경에서는 '/', 프로덕션에서는 '/korean-study-app/'
  base: command === 'serve' ? '/' : '/korean-study-app/',
}))
