import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    react(),
    // ## 레거시 플러그인에 옵션을 추가하여 호환성을 극대화합니다. ##
    legacy({
      // 'dead'는 더 이상 공식 지원되지 않는 브라우저를 의미합니다.
      // 이 설정을 통해 가장 광범위한 호환성을 확보할 수 있습니다.
      targets: ['defaults', 'not IE 11', 'dead']
    }),
    
  ],
  server: {
    port: 3000, // 원하시는 포트 번호로 변경
  },
  worker: {
    // Vite에게 .ts 파일을 워커 스크립트로 처리하도록 명시적으로 알립니다.
    // 'module' 타입 워커에 대한 지원을 강화합니다.
    plugins: () => [react()], // 워커에도 React 플러그인을 적용하여 TSX 등을 처리할 수 있게 함 (선택적)
    format: 'es'
  },
  build: {
    // rollupOptions: {
    //   output: {
    //     // Wasm 파일의 경로를 정확하게 설정합니다.
    //     // 이 부분은 기존에 이미 있을 수 있으며, WASM 파일이 assets 폴더에 제대로 있는지 확인해야 합니다.
    //     assetFileNames: (assetInfo) => {
    //       // 예를 들어, wasm_image_cropper_bg.wasm이 직접 assets 폴더에 복사되는 경우
    //       if (assetInfo.name && assetInfo.name.includes('wasm_image_cropper_bg.wasm')) {
    //         return `assets/[name][extname]`; // 해시 없이 원본 이름 유지
    //       }
    //       return 'assets/[name]-[hash][extname]'; // 그 외 파일은 해시 적용
    //     },
    //   },
    // },
  },
  optimizeDeps: {
    // 워커 스크립트를 Vite가 제대로 처리하도록 명시적으로 추가합니다.
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'], // 기존 exclude가 있다면 그대로 둡니다.
  },
})