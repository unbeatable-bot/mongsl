import React, { useEffect } from 'react';
import './InfoPage.css';

interface InfoPageProps {
  onClose: () => void;
}

const InfoPage: React.FC<InfoPageProps> = ({ onClose }) => {
  // ESC 키를 누르면 팝업이 닫히도록 설정
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="info-modal-overlay" onClick={onClose}>
      <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="info-header">
          <div className="info-header-content">
            <h1 className="info-page-title">MongSl 사용 안내</h1>
            <button className="info-close-btn" onClick={onClose} title="닫기">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <p className="info-subtitle">이미지 자르기 및 파일 변환을 한 번에!</p>
        </header>

        <div className="info-scroll-area">
          <section className="section-guide">
            <div className="section-title-wrapper">
              <span className="title-icon">🚀</span>
              <h2>빠른 시작 가이드</h2>
            </div>
            <div className="guide-steps">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-text">
                  <h3>이미지 선택</h3>
                  <p>"이미지 업로드" 버튼을 눌러 처리할 파일들을 한 번에 추가하세요.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-text">
                  <h3>영역 지정</h3>
                  <p>미리보기 화면에서 마우스를 드래그하여 자를 영역을 선택합니다.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-text">
                  <h3>파일 다운로드</h3>
                  <p>원하는 버튼(PDF/ZIP)을 클릭하면 변환된 파일이 자동 다운로드됩니다.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="section-features">
            <div className="section-title-wrapper">
              <span className="title-icon">✨</span>
              <h2>MongSl의 특징</h2>
            </div>
            <div className="feature-grid">
              <div className="feature-item">
                <div className="feature-icon">🛡️</div>
                <div className="feature-text">
                  <strong>개인정보 보호</strong>
                  <p>모든 처리는 브라우저에서 이루어지며, 서버로 이미지가 전송되지 않습니다.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <div className="feature-text">
                  <strong>빠른 성능</strong>
                  <p>최적화된 Wasm 기술로 대량의 이미지도 신속하게 처리합니다.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💎</div>
                <div className="feature-text">
                  <strong>깔끔한 결과물</strong>
                  <p>워터마크 없이 원본 화질을 최대한 유지하여 결과물을 생성합니다.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="section-faq">
            <div className="section-title-wrapper">
              <span className="title-icon">❓</span>
              <h2>자주 묻는 질문</h2>
            </div>
            <div className="faq-list">
              <details className="faq-item">
                <summary>파일 용량이나 개수 제한이 있나요?</summary>
                <p>명확한 제한은 없으나, 기기 성능에 따라 대량의 고해상도 이미지 처리 시 속도가 느려질 수 있습니다.</p>
              </details>
              <details className="faq-item">
                <summary>변환된 파일은 어디에 저장되나요?</summary>
                <p>브라우저의 기본 다운로드 폴더에 저장됩니다. (모바일의 경우 '다운로드' 앱 등에서 확인 가능)</p>
              </details>
            </div>
          </section>
        </div>
        
        <footer className="modal-footer">
          <p>사용 중 불편한 점은 푸터의 'Contact Us'로 문의해주세요.</p>
        </footer>
      </div>
    </div>
  );
};

export default InfoPage;