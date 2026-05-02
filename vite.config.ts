import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import tailwindcss from '@tailwindcss/vite' // 추가된 부분

export default defineConfig({
  plugins: [
    react(),
    // ## 레거시 플러그인에 옵션을 추가하여 호환성을 극대화합니다. ##
    legacy({
      // 'dead'는 더 이상 공식 지원되지 않는 브라우저를 의미합니다.
      // 이 설정을 통해 가장 광범위한 호환성을 확보할 수 있습니다.
      targets: ['defaults', 'not IE 11', 'dead']
    }),
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