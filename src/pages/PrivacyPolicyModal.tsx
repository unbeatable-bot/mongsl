import React, { useEffect } from 'react';

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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[2000] p-[20px] box-border backdrop-blur-sm animate-[fadeIn_0.25s_ease-out]" onClick={onClose}>
      <div className="bg-white w-full max-w-[680px] max-h-[85vh] rounded-2xl flex flex-col shadow-[0_15px_35px_rgba(0,0,0,0.2)] overflow-hidden border border-[#eaeaea] animate-[slideUp_0.3s_ease-out] max-md:max-h-[90vh] max-md:max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        
        <header className="bg-white text-[#333] p-[25px_30px] flex flex-col items-center shrink-0 border-b border-[#f0f0f0] max-md:p-[20px]">
          <div className="w-full flex justify-center items-center relative mb-[8px]">
            <h1 className="m-0 text-[1.8em] font-extrabold text-[#00a896] tracking-[-0.5px] max-md:text-[1.5em]">개인정보처리방침</h1>
            <button className="absolute right-[-5px] bg-transparent border-none text-[#999] cursor-pointer p-[8px] flex items-center justify-center rounded-full transition-all duration-200 hover:bg-[#f5f5f5] hover:text-[#333]" onClick={onClose} title="닫기">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <p className="text-[1em] text-[#666] m-0 font-normal">MongTool 서비스 이용을 위한 프라이버시 정책</p>
        </header>

        <div className="overflow-y-auto p-[30px] text-[#444] leading-[1.6] bg-[#fafafa] max-md:p-[20px] [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-[#fafafa] [&::-webkit-scrollbar-thumb]:bg-[#ddd] [&::-webkit-scrollbar-thumb]:rounded-[4px] hover:[&::-webkit-scrollbar-thumb]:bg-[#ccc]">
          
          <section className="bg-transparent p-0 mb-[35px] shadow-none">
            <div className="flex items-center gap-[10px] mb-[20px] border-b-2 border-[#eaeaea] pb-[10px]">
              <span className="text-[1.3em]">🔒</span>
              <h2 className="text-[1.4em] font-bold text-[#222] m-0 text-left">1. 이미지 처리 및 데이터 수집</h2>
            </div>
            <div className="bg-transparent border-none overflow-hidden">
              <p className="m-0 text-[#666] text-[0.95em]">
                <strong>MongTool은 사용자의 이미지를 서버로 전송하거나 저장하지 않습니다.</strong><br />
                모든 이미지 업로드, 크롭(자르기), 그리고 파일 변환(PDF/ZIP) 과정은 오직 사용자의 웹 브라우저 내부(로컬 환경)에서만 처리됩니다. 따라서 개인적인 사진이나 민감한 문서가 외부로 유출될 위험이 없으며, 당사는 사용자의 원본 및 변환된 이미지 데이터에 접근할 수 없습니다.
              </p>
            </div>
          </section>

          <section className="bg-transparent p-0 mb-[35px] shadow-none">
            <div className="flex items-center gap-[10px] mb-[20px] border-b-2 border-[#eaeaea] pb-[10px]">
              <span className="text-[1.3em]">🍪</span>
              <h2 className="text-[1.4em] font-bold text-[#222] m-0 text-left">2. 쿠키(Cookies) 및 광고 게재</h2>
            </div>
            <div className="bg-transparent border-none overflow-hidden">
              <p className="m-0 text-[#666] text-[0.95em]">
                본 웹사이트는 서비스 유지 및 제공을 위해 <strong>구글 애드센스(Google AdSense)</strong>와 같은 타사 광고 서비스를 사용할 수 있습니다.
              </p>
              <ul className="pl-[20px] text-[#666] text-[0.95em] mt-[10px]">
                <li>타사 공급업체(Google 포함)는 쿠키를 사용하여 사용자가 본 웹사이트 또는 다른 웹사이트를 방문한 기록을 기반으로 맞춤 광고를 게재합니다.</li>
                <li>Google의 광고 쿠키를 사용하면 Google 및 Google 파트너가 인터넷에서 사이트 방문 기록을 기반으로 사용자에게 적절한 광고를 제공할 수 있습니다.</li>
                <li>사용자는 <a href="https://myadcenter.google.com/" target="_blank" rel="noreferrer" className="text-[#00a896] no-underline font-bold">Google 광고 설정</a>을 방문하여 맞춤 광고를 해제할 수 있습니다. 또는 <a href="https://optout.aboutads.info/" target="_blank" rel="noreferrer" className="text-[#00a896] no-underline font-bold">aboutads.info</a>를 방문하여 맞춤 광고에 사용되는 타사 공급업체의 쿠키를 해제할 수 있습니다.</li>
              </ul>
            </div>
          </section>

          <section className="bg-transparent p-0 mb-[35px] shadow-none">
            <div className="flex items-center gap-[10px] mb-[20px] border-b-2 border-[#eaeaea] pb-[10px]">
              <span className="text-[1.3em]">📊</span>
              <h2 className="text-[1.4em] font-bold text-[#222] m-0 text-left">3. 웹 로그 분석</h2>
            </div>
            <div className="bg-transparent border-none overflow-hidden">
              <p className="m-0 text-[#666] text-[0.95em]">
                사이트의 트래픽 분석 및 서비스 개선을 위해 Google Analytics와 같은 도구를 사용할 수 있으며, 이 과정에서 IP 주소, 브라우저 유형, 접속 시간 등의 익명화된 표준 웹 로그 정보가 수집될 수 있습니다. 이 데이터는 개인을 식별하는 데 사용되지 않습니다.
              </p>
            </div>
          </section>

          <section className="bg-transparent p-0 mb-[10px] shadow-none">
            <div className="flex items-center gap-[10px] mb-[20px] border-b-2 border-[#eaeaea] pb-[10px]">
              <span className="text-[1.3em]">📬</span>
              <h2 className="text-[1.4em] font-bold text-[#222] m-0 text-left">4. 문의처</h2>
            </div>
            <div className="bg-transparent border-none overflow-hidden">
              <p className="m-0 text-[#666] text-[0.95em]">
                개인정보처리방침과 관련된 문의사항이 있으신 경우, 설정의 'Contact Us' 메뉴를 통해 문의해 주시기 바랍니다.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;