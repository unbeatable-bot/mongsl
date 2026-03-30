import React from 'react';
import './InfoPage.css'; // 새로 생성할 CSS 파일
import { Link } from 'react-router-dom';

const InfoPage: React.FC = () => {
  return (
    <div className="info-page-container">
      <header className="info-header">
        <div className="info-header-content">
          <Link to="/" className="info-home-link" title="홈으로 가기">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.2em"
              height="1.2em"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </Link>
          <h1 className="info-page-title">MongSl 사용 안내</h1>
        </div>
        <p>쉽고 빠르게 이미지를 PDF로 변환하세요!</p>
      </header>

      {/* 1. 사용 방법 안내 섹션 */}
      <section className="section-guide">
        <h2>사용 방법</h2>
        <ol>
          <li>
            <h3>1단계: 이미지 업로드</h3>
            <p>메인 페이지에서 "이미지 업로드" 버튼을 클릭하여 PDF로 변환할 이미지 파일을 선택합니다. 여러 이미지를 한 번에 선택할 수 있습니다.</p>
            {/* <h4>스크린샷 예시:</h4> */}
            {/* <img src="/images/guide_upload.png" alt="이미지 업로드 스크린샷" /> */}
          </li>
          <li>
            <h3>2단계: 크롭 영역 선택</h3>
            <p>업로드된 이미지 중 하나를 선택하여 미리보기 영역에 표시합니다. 마우스를 드래그하여 PDF에 포함될 이미지 영역을 자유롭게 자를 수 있습니다.</p>
            {/* <h4>스크린샷 예시:</h4> */}
            {/* <img src="/images/guide_crop.png" alt="크롭 영역 선택 스크린샷" /> */}
          </li>
          <li>
            <h3>3단계: PDF 생성</h3>
            <p>"선택 영역 PDF로 다운로드" 버튼을 클릭하면, 선택된 크롭 영역에 따라 모든 이미지가 자동으로 잘려 PDF 파일로 변환됩니다. 변환이 완료되면 PDF 파일이 자동으로 다운로드됩니다.</p>
            {/* <h4>스크린샷 예시:</h4> */}
            {/* <img src="/images/guide_generate.png" alt="PDF 생성 스크린샷" /> */}
          </li>
        </ol>
      </section>

      {/* 2. 주요 기능 소개 섹션 */}
      <section className="section-features">
        <h2>주요 기능</h2>
        <ul>
          <li><strong>여러 이미지 한 번에 업로드:</strong> 여러 장의 사진을 동시에 업로드하여 한 번에 PDF로 묶을 수 있습니다.</li>
          <li><strong>직관적인 자르기(크롭) 기능:</strong> 원하는 부분만 정확하게 선택하여 잘라낼 수 있는 사용자 친화적인 인터페이스를 제공합니다.</li>
          <li><strong>워터마크 없음:</strong> 변환된 PDF 파일에 워터마크가 전혀 추가되지 않아 깔끔하게 사용할 수 있습니다.</li>
          <li><strong>빠른 변환 속도:</strong> 최적화된 WebAssembly(Wasm) 기술과 효율적인 서버 처리를 통해 빠르고 신속하게 PDF를 생성합니다. (※ 서버 분리 후 적용될 내용)</li>
          <li><strong>개인정보 보호:</strong> 업로드된 모든 이미지는 PDF 변환 즉시 서버에서 자동 삭제되어 개인정보 유출 걱정 없이 안심하고 사용할 수 있습니다.</li>
          {/* <li><strong>모바일 앱 호환:</strong> 안드로이드 웹뷰 앱에서도 완벽하게 동작하며, 파일 업로드 및 PDF 다운로드를 지원합니다.</li> */}
        </ul>
      </section>

      {/* 3. 자주 묻는 질문 (FAQ) 섹션 */}
      <section className="section-faq">
        <h2>자주 묻는 질문 (FAQ)</h2>
        <div className="faq-item">
          <h3>Q: MongSl은 어떤 서비스인가요?</h3>
          <p>A: MongSl은 여러 이미지 파일을 한 번에 업로드하여 원하는 부분만 잘라내고, 워터마크 없이 깨끗한 PDF 파일로 변환해주는 웹 기반 서비스입니다.</p>
        </div>
        <div className="faq-item">
          <h3>Q: 파일 용량이나 개수 제한이 있나요?</h3>
          <p>A: 현재는 한 번에 업로드할 수 있는 파일 개수나 전체 용량에 명확한 제한은 없지만, 너무 많은 파일이나 고용량 파일을 한 번에 처리하면 변환 속도가 느려지거나 기기 성능에 따라 오류가 발생할 수 있습니다. 최적의 경험을 위해 적절한 양의 파일을 사용하는 것을 권장합니다.</p>
        </div>
        <div className="faq-item">
          <h3>Q: 제 개인 정보는 안전한가요?</h3>
          <p>A: 네, 매우 안전합니다. 사용자가 업로드한 모든 이미지 파일은 PDF 변환이 완료되는 즉시 서버에서 자동 삭제됩니다. 어떠한 개인 정보도 저장하거나 재사용하지 않습니다.</p>
        </div>
        {/* <div className="faq-item">
          <h3>Q: PDF 변환 속도가 느려요. 개선 방법이 있나요?</h3>
          <p>A: 기기의 성능이나 업로드하는 이미지의 개수 및 해상도에 따라 속도가 달라질 수 있습니다. 현재 서비스는 속도 개선을 위해 Web Worker와 WebAssembly(Wasm) 기술을 도입하여 최적화 작업을 진행 중입니다. 또한, 향후 서버 처리 방식을 도입하여 더욱 빠르게 변환될 수 있도록 할 예정입니다.</p>
        </div> */}
        <div className="faq-item">
          <h3>Q: 모바일에서도 사용할 수 있나요?</h3>
          <p>A: 네, PC 웹 브라우저뿐만 아니라 모바일 웹 브라우저에서도 동일하게 모든 기능을 사용하실 수 있습니다. 단, 이미지 처리 속도로 인해 PC사용이 권장됩니다.</p>
        </div>
      </section>
    </div>
  );
};

export default InfoPage;