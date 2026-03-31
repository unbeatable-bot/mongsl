import React, { useEffect } from 'react';
import './InfoPage.css'; // 디자인을 동일하게 유지하기 위해 InfoPage의 CSS를 함께 사용합니다.

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
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
            <h1 className="info-page-title">개인정보처리방침</h1>
            <button className="info-close-btn" onClick={onClose} title="닫기">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <p className="info-subtitle">MongSl 서비스 이용을 위한 프라이버시 정책</p>
        </header>

        <div className="info-scroll-area">
          <section className="section-guide">
            <div className="section-title-wrapper">
              <span className="title-icon">🔒</span>
              <h2>1. 이미지 처리 및 데이터 수집</h2>
            </div>
            <div className="faq-item" style={{ border: 'none', background: 'transparent' }}>
              <p>
                <strong>MongSl은 사용자의 이미지를 서버로 전송하거나 저장하지 않습니다.</strong><br />
                모든 이미지 업로드, 크롭(자르기), 그리고 파일 변환(PDF/ZIP) 과정은 오직 사용자의 웹 브라우저 내부(로컬 환경)에서만 처리됩니다. 따라서 개인적인 사진이나 민감한 문서가 외부로 유출될 위험이 없으며, 당사는 사용자의 원본 및 변환된 이미지 데이터에 접근할 수 없습니다.
              </p>
            </div>
          </section>

          <section className="section-features">
            <div className="section-title-wrapper">
              <span className="title-icon">🍪</span>
              <h2>2. 쿠키(Cookies) 및 광고 게재</h2>
            </div>
            <div className="faq-item" style={{ border: 'none', background: 'transparent' }}>
              <p>
                본 웹사이트는 서비스 유지 및 제공을 위해 <strong>구글 애드센스(Google AdSense)</strong>와 같은 타사 광고 서비스를 사용할 수 있습니다.
              </p>
              <ul style={{ paddingLeft: '20px', color: '#666', fontSize: '0.95em', marginTop: '10px' }}>
                <li>타사 공급업체(Google 포함)는 쿠키를 사용하여 사용자가 본 웹사이트 또는 다른 웹사이트를 방문한 기록을 기반으로 맞춤 광고를 게재합니다.</li>
                <li>Google의 광고 쿠키를 사용하면 Google 및 Google 파트너가 인터넷에서 사이트 방문 기록을 기반으로 사용자에게 적절한 광고를 제공할 수 있습니다.</li>
                <li>사용자는 <a href="https://myadcenter.google.com/" target="_blank" rel="noreferrer" style={{ color: '#00a896', textDecoration: 'none', fontWeight: 'bold' }}>Google 광고 설정</a>을 방문하여 맞춤 광고를 해제할 수 있습니다. 또는 <a href="https://optout.aboutads.info/" target="_blank" rel="noreferrer" style={{ color: '#00a896', textDecoration: 'none', fontWeight: 'bold' }}>aboutads.info</a>를 방문하여 맞춤 광고에 사용되는 타사 공급업체의 쿠키를 해제할 수 있습니다.</li>
              </ul>
            </div>
          </section>

          <section className="section-faq">
            <div className="section-title-wrapper">
              <span className="title-icon">📊</span>
              <h2>3. 웹 로그 분석</h2>
            </div>
            <div className="faq-item" style={{ border: 'none', background: 'transparent' }}>
              <p>
                사이트의 트래픽 분석 및 서비스 개선을 위해 Google Analytics와 같은 도구를 사용할 수 있으며, 이 과정에서 IP 주소, 브라우저 유형, 접속 시간 등의 익명화된 표준 웹 로그 정보가 수집될 수 있습니다. 이 데이터는 개인을 식별하는 데 사용되지 않습니다.
              </p>
            </div>
          </section>

          <section className="section-faq" style={{ marginBottom: '10px' }}>
            <div className="section-title-wrapper">
              <span className="title-icon">📬</span>
              <h2>4. 문의처</h2>
            </div>
            <div className="faq-item" style={{ border: 'none', background: 'transparent' }}>
              <p>
                개인정보처리방침과 관련된 문의사항이 있으신 경우, 화면 하단의 'Contact Us' 메뉴를 통해 문의해 주시기 바랍니다.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;