import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 추가된 부분

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    
  ],
  server: {
    port: 3000, // 원하시는 포트 번호로 변경
  },
  worker: {
    plugins: () => [react()], // 워커에도 React 플러그인을 적용하여 TSX 등을 처리할 수 있게 함 (선택적)
    format: 'es'
  },
  build: {
    target: 'esnext', //최신 브라우저를 기준으로 빌드
  },
  optimizeDeps: {
    // 워커 스크립트를 Vite가 제대로 처리하도록 명시적으로 추가합니다.
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'], // 기존 exclude가 있다면 그대로 둡니다.
  },
})