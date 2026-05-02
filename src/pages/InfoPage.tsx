import React, { useEffect } from 'react';

interface InfoPageProps {
  onClose: () => void;
}

const InfoPage: React.FC<InfoPageProps> = ({ onClose }) => {
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
            <h1 className="m-0 text-[1.8em] font-extrabold text-[#00a896] tracking-[-0.5px] max-md:text-[1.5em]">MongTool Crop & Compile 사용 안내</h1>
            <button className="absolute right-[-5px] bg-transparent border-none text-[#999] cursor-pointer p-[8px] flex items-center justify-center rounded-full transition-all duration-200 hover:bg-[#f5f5f5] hover:text-[#333]" onClick={onClose} title="닫기">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <p className="text-[1em] text-[#666] m-0 font-normal">이미지 자르기 및 파일 변환을 한 번에!</p>
        </header>

        <div className="overflow-y-auto p-[30px] text-[#444] leading-[1.6] bg-[#fafafa] max-md:p-[20px] [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-[#fafafa] [&::-webkit-scrollbar-thumb]:bg-[#ddd] [&::-webkit-scrollbar-thumb]:rounded-[4px] hover:[&::-webkit-scrollbar-thumb]:bg-[#ccc]">
          
          <section className="bg-transparent p-0 mb-[35px] shadow-none">
            <div className="flex items-center gap-[10px] mb-[20px] border-b-2 border-[#eaeaea] pb-[10px]">
              <span className="text-[1.3em]">🚀</span>
              <h2 className="text-[1.4em] font-bold text-[#222] m-0 text-left">빠른 시작 가이드</h2>
            </div>
            <div className="flex flex-col gap-[15px]">
              {[
                { step: 1, title: '이미지 선택', desc: '"이미지 업로드" 버튼을 눌러 처리할 파일들을 한 번에 추가하세요.' },
                { step: 2, title: '영역 지정', desc: '미리보기 화면에서 마우스를 드래그하여 자를 영역을 선택합니다.' },
                { step: 3, title: '파일 다운로드', desc: '원하는 버튼(PDF/ZIP)을 클릭하면 변환된 파일이 자동 다운로드됩니다.' }
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-[15px] bg-white p-[18px] rounded-[10px] border border-[#eee] shadow-[0_2px_5px_rgba(0,0,0,0.02)]">
                  <div className="bg-[#00a896] text-white font-bold w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0 text-[0.9em] mt-[3px]">{item.step}</div>
                  <div>
                    <h3 className="text-[1.1em] text-[#333] m-[0_0_5px_0] font-semibold max-md:text-[1em]">{item.title}</h3>
                    <p className="m-0 text-[#666] text-[0.95em] max-md:text-[0.9em]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-transparent p-0 mb-[35px] shadow-none">
            <div className="flex items-center gap-[10px] mb-[20px] border-b-2 border-[#eaeaea] pb-[10px]">
              <span className="text-[1.3em]">✨</span>
              <h2 className="text-[1.4em] font-bold text-[#222] m-0 text-left">MongTool의 특징</h2>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[15px]">
              {[
                { icon: '🛡️', title: '개인정보 보호', desc: '모든 처리는 브라우저에서 이루어지며, 서버로 이미지가 전송되지 않습니다.' },
                { icon: '⚡', title: '빠른 성능', desc: '최적화된 Wasm 기술로 대량의 이미지도 신속하게 처리합니다.' },
                { icon: '💎', title: '깔끔한 결과물', desc: '워터마크 없이 원본 화질을 최대한 유지하여 결과물을 생성합니다.' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-[20px] rounded-[10px] text-[#333] border border-[#eee] text-center flex flex-col items-center transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_5px_15px_rgba(0,0,0,0.05)]">
                  <div className="text-[2em] mb-[15px]">{item.icon}</div>
                  <div>
                    <strong className="text-[#00a896] block mb-[8px] text-[1.05em] font-semibold">{item.title}</strong>
                    <p className="m-0 text-[#666] text-[0.9em] leading-[1.5]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-transparent p-0 mb-[35px] shadow-none">
            <div className="flex items-center gap-[10px] mb-[20px] border-b-2 border-[#eaeaea] pb-[10px]">
              <span className="text-[1.3em]">❓</span>
              <h2 className="text-[1.4em] font-bold text-[#222] m-0 text-left">자주 묻는 질문</h2>
            </div>
            <div className="flex flex-col gap-[10px]">
              {/* ✨ details 태그에 group 클래스를 주어 열림 상태(group-open)를 감지하여 화살표 제어 */}
              {[
                { q: '파일 용량이나 개수 제한이 있나요?', a: '명확한 제한은 없으나, 기기 성능에 따라 대량의 고해상도 이미지 처리 시 속도가 느려질 수 있습니다.' },
                { q: '변환된 파일은 어디에 저장되나요?', a: '브라우저의 기본 다운로드 폴더에 저장됩니다. (모바일의 경우 \'다운로드\' 앱 등에서 확인 가능)' }
              ].map((item, idx) => (
                <details key={idx} className="group bg-white rounded-[8px] border border-[#eee] overflow-hidden">
                  <summary className="p-[15px_20px] font-semibold text-[#333] cursor-pointer list-none relative text-[0.95em] hover:bg-[#f9f9f9] after:content-['+'] after:absolute after:right-[20px] after:top-1/2 after:-translate-y-1/2 after:text-[#999] after:text-[1.2em] after:transition-transform after:duration-200 group-open:after:content-['-'] group-open:after:text-[#00a896] group-open:after:rotate-180 [&::-webkit-details-marker]:hidden">
                    {item.q}
                  </summary>
                  <p className="m-0 p-[0_20px_20px_20px] text-[#666] text-[0.9em] border-none pl-[20px]">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;