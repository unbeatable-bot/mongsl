import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import InfoPage from '../../pages/InfoPage';
import PrivacyPolicyModal from '../../pages/PrivacyPolicyModal';
import ContactModal from '../common/ContactModal';

interface Props {
  onClose: () => void;
}

const SideMenu: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  // ESC 키를 누르면 사이드 메뉴가 닫히도록 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    // 배경 오버레이 (클릭 시 닫힘)
    <div className="fixed inset-0 bg-black/60 z-[2000] flex justify-end backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      
      {/* 우측 사이드 패널 (이벤트 전파 방지) */}
      <div 
        className="w-[300px] max-w-[80vw] h-full bg-[#1a1a1a] border-l border-[#333] flex flex-col animate-[slideInRight_0.2s_ease-out] shadow-[-5px_0_20px_rgba(0,0,0,0.5)]" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 영역 */}
        <div className="p-[20px] flex justify-end border-b border-[#333]">
          <button onClick={onClose} className="text-[#bdc3c7] bg-transparent border-none p-[8px] cursor-pointer hover:text-white transition-colors" title="닫기">
            <X size={28} strokeWidth={2} />
          </button>
        </div>

        {/* 상단: 주요 라우팅 링크 */}
        <div className="flex-1 flex flex-col p-[25px] gap-[25px]">
          <button onClick={() => go('/')} className="text-left text-[1.2rem] font-bold text-[#bdc3c7] bg-transparent border-none cursor-pointer hover:text-white transition-colors">🏠 홈 (메인 화면)</button>
          <button onClick={() => go('/crop')} className="text-left text-[1.2rem] font-bold text-[#bdc3c7] bg-transparent border-none cursor-pointer hover:text-white transition-colors">✂️ CROP & COMPILE</button>
          <button onClick={() => go('/calculator')} className="text-left text-[1.2rem] font-bold text-[#bdc3c7] bg-transparent border-none cursor-pointer hover:text-white transition-colors">🧮 계산기</button>
          <button onClick={() => go('/portfolio')} className="text-left text-[1.2rem] font-bold text-[#bdc3c7] bg-transparent border-none cursor-pointer hover:text-white transition-colors">📈 포트폴리오</button>
        </div>

        {/* 하단: 설정 및 정보 링크 */}
        <div className="p-[20px] border-t border-[#333] bg-[#1e1e1e] flex flex-col gap-[15px]">
          <button onClick={() => { onClose(); openModal(<InfoPage onClose={closeModal} />); }} className="flex items-center gap-[12px] text-[#ececec] text-[14px] bg-transparent border-none cursor-pointer hover:text-[#0d6efd] transition-colors">
            <span className="text-[18px]">❓</span> 사용 안내
          </button>
          <button onClick={() => { onClose(); openModal(<ContactModal />); }} className="flex items-center gap-[12px] text-[#ececec] text-[14px] bg-transparent border-none cursor-pointer hover:text-[#0d6efd] transition-colors">
            <span className="text-[18px]">📧</span> Contact Us
          </button>
          <a href="https://github.com/unbeatable-bot/mongsl" target="_blank" rel="noreferrer" className="flex items-center gap-[12px] text-[#ececec] text-[14px] no-underline hover:text-[#0d6efd] transition-colors">
            <span className="text-[18px]">🐙</span> GitHub
          </a>
          <button onClick={() => { onClose(); openModal(<PrivacyPolicyModal onClose={closeModal} />); }} className="flex items-center gap-[12px] text-[#ececec] text-[14px] bg-transparent border-none cursor-pointer hover:text-[#0d6efd] transition-colors">
            <span className="text-[18px]">🛡️</span> 개인정보처리방침
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;