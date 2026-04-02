# ✂️ MongSl (Crop & Compile)

> **클라이언트 자원만을 활용한 고성능 다중 이미지 편집 및 병합 웹 유틸리티** <br/>
> 서버 업로드 과정 없이, 브라우저 단에서 고해상도 이미지의 크롭, 필터 보정, 순서 재배열을 수행하고 `Web Worker`를 통해 PDF/ZIP으로 즉시 압축합니다.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

🔗 **[Live Demo 보러가기](https://mongsl.netlify.app/)**

---

## ✨ 핵심 기능 (Features)

* **🖼️ 스마트 이미지 크롭 & 보정:** 비율(1:1, 16:9, A4 등) 프리셋 지원 및 밝기/대비/흑백 실시간 CSS 필터링
* **📱 크로스 플랫폼 Drag & Drop:** PC(마우스)와 모바일(터치 Long Press) 환경을 모두 완벽하게 지원하는 썸네일 순서 재배열 (`@dnd-kit` 활용)
* **⚡ 메인 스레드 블로킹 없는 파일 생성:** 무거운 캔버스 렌더링 및 PDF/ZIP 인코딩 작업을 백그라운드(`Web Worker`)에서 처리하여 UI 프리징 100% 방지
* **🔒 100% 클라이언트 사이드 처리:** 사용자 이미지가 서버로 전송되지 않아 개인정보 유출 위험이 없으며 서버 유지비용 Zero

---

## 💡 기술적 해결 사례 (Troubleshooting & Architecture)

이 프로젝트는 브라우저 환경에서 대용량/고해상도 이미지를 다룰 때 발생하는 성능 및 UX/UI 한계를 극복하는 데 초점을 맞추었습니다.

### 1. Viewport 좌표계와 원본 해상도 매핑 연산
**[문제]** 고해상도나 세로로 긴 이미지가 브라우저 화면(Viewport)을 뚫고 나가 스크롤을 유발하는 UX 이슈 발생.
**[해결]** * 화면 높이를 `100dvh`로 고정하고 `object-fit: contain`을 적용하여 어떠한 해상도라도 **한눈에 들어오도록 강제 축소 렌더링**을 적용했습니다.
* 화면상의 축소된 이미지 사이즈와 원본 사이즈 간의 **비율(Scale)과 여백(Offset)을 계산하는 역산 알고리즘**을 구현했습니다. 이를 통해 사용자는 쾌적한 화면에서 크롭 영역을 지정하지만, 실제 파일 생성 시에는 원본 고해상도 기준의 좌표로 변환되어 화질 손실 없이 잘려 나가도록 아키텍처를 설계했습니다.

### 2. JS 기반 Clamping을 통한 크롭 영역 이탈 강제 방어
**[문제]** 이미지 밖의 빈 공간(검은 여백)까지 크롭 박스가 확장되면서 잘못된 좌표값이 도출되는 문제 발생.
**[해결]** * 크롭 박스의 `onChange` 이벤트에 **Clamping 알고리즘**을 추가했습니다. 
* 이미지가 렌더링 된 X, Y 시작점(Offset)을 실시간으로 추적하여 사용자가 드래그나 리사이즈를 할 때, 크롭 박스가 실제 픽셀 영역 밖으로 나가려 하면 강제로 모서리 끝에 고정되도록 브라우저 이벤트를 제어했습니다.

### 3. Web Worker + OffscreenCanvas를 활용한 렌더링 최적화
**[문제]** 수십 장의 이미지를 순회하며 Canvas에 그리고 PDF 인코딩을 수행할 때, 메인 스레드가 블로킹되어 브라우저가 멈추는(UI Freezing) 현상 발생.
**[해결]** * 무거운 이미지 처리(Pixel Manipulation) 로직과 `pdf-lib`, `jszip` 연산을 전담하는 `worker.ts`를 분리했습니다.
* 워커 내부에서 `OffscreenCanvas`를 활용하여 비동기적으로 필터(`ctx.filter`)를 굽고 이미지를 잘라내도록 처리했습니다. 결과적으로 파일이 컴파일되는 동안에도 로딩 스피너 애니메이션이 멈추지 않는 **60fps의 부드러운 사용자 경험(UX)**을 달성했습니다.
sequenceDiagram
    autonumber
    participant Main as Main Thread (React UI)
    participant Worker as Web Worker (worker.ts)
    participant Canvas as OffscreenCanvas
    participant Libs as pdf-lib / jszip

    Note over Main: 사용자 이미지 업로드 & 크롭/필터 설정 완료
    Main->>Main: 개별 이미지별 설정값(Scale, Crop, Filter) 취합
    
    Note over Main: "다운로드" 버튼 클릭
    Main->>Worker: postMessage({ type: 'PROCESS', images, settings })
    
    Note right of Main: UI 스레드 Free! 로딩 스피너 작동 중
    
    Worker->>Worker: message 이벤트 수신 및 Blob 데이터 준비
    
    loop 개별 이미지 처리
        Worker->>Canvas: OffscreenCanvas 생성 및 원본 Blob 그리기
        Canvas->>Canvas: (1) 크롭 좌표 기반 영역 추출
        Canvas->>Canvas: (2) ctx.filter 적용 (픽셀 굽기)
        Canvas->>Worker: 처리된 이미지 데이터 추출 (convertToBlob)
    end
    
    Worker->>Libs: 처리된 이미지 Blob들을 전달
    Libs->>Libs: PDF/ZIP 컴파일 수행 (가장 무거운 연산)
    Libs->>Worker: 최종 생성된 결과물 Blob 반환
    
    Worker->>Main: postMessage({ type: 'COMPLETE', finalBlob, filename })
    
    Note over Main: 결과 수신 및 로딩 스피너 종료
    Main->>Main: URL.createObjectURL() 기반 파일 다운로드 트리거

---

## 📸 스크린샷 및 시연

<details>
<summary><b>1. 화면을 벗어나지 않는 안전한 크롭 제어</b></summary>
<div markdown="1">
  <!-- <img src="https://via.placeholder.com/600x300?text=Insert+Crop+GIF+Here" alt="Crop Control"> -->
</div>
</details>

<details>
<summary><b>2. 자연스러운 Drag & Drop 순서 변경 (모바일/PC 지원)</b></summary>
<div markdown="1">
  <!-- <img src="https://via.placeholder.com/600x300?text=Insert+Drag+Drop+GIF+Here" alt="Drag and Drop"> -->
</div>
</details>

<details>
<summary><b>3. 실시간 이미지 필터 및 미리보기</b></summary>
<div markdown="1">
  <!-- <img src="https://via.placeholder.com/600x300?text=Insert+Filter+Preview+Here" alt="Filter Preview"> -->
</div>
</details>

---

## 🚀 로컬 실행 방법 (Local Installation)

```bash
# 1. 저장소 클론
$ git clone https://github.com/unbeatable-bot/mongsl.git

# 2. 프로젝트 폴더 진입
$ cd mongsl

# 3. 의존성 패키지 설치
$ npm install

# 4. 개발 서버 실행
$ npm run dev