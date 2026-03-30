import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Wasm 로딩이 실패하더라도 앱의 다른 부분이 죽지 않도록 감쌉니다.
try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (error) {
  // 만약 앱 초기화 자체에 문제가 있다면 body에 직접 오류를 표시합니다.
  document.body.innerHTML = `<div style="color: red; padding: 20px;">앱을 시작하는 중 치명적인 오류가 발생했습니다: ${error}</div>`;
}