import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 z-[2000] flex justify-end backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      
      {/* ✨ 패널 배경(bg-main-bg)과 테두리(border-border-color) 테마 교체 */}
      <div 
        className="w-[300px] max-w-[80vw] h-full bg-main-bg border-l border-border-color flex flex-col animate-[slideInRight_0.2s_ease-out] shadow-[-5px_0_20px_rgba(0,0,0,0.2)] transition-colors duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-[20px] flex justify-end items-center gap-[8px] border-b border-border-color">
          {/* 닫기 버튼 텍스트 색상 */}
          <button onClick={onClose} className="text-main-text/60 bg-transparent border-none p-[8px] cursor-pointer hover:text-main-text transition-colors" title="닫기">
            <X size={28} strokeWidth={2} />
          </button>
        </div>

        {/* 상단: 주요 라우팅 링크 */}
        <div className="flex-1 flex flex-col p-[25px] gap-[25px]">
          <button onClick={() => go('/')} className="text-left text-[1.2rem] font-bold text-main-text/80 bg-transparent border-none cursor-pointer hover:text-[#0d6efd] transition-colors">CROP & COMPILE</button>
          <button onClick={() => go('/calculator')} className="text-left text-[1.2rem] font-bold text-main-text/80 bg-transparent border-none cursor-pointer hover:text-[#0d6efd] transition-colors">CALCULATOR</button>
          <button onClick={() => go('/portfolio')} className="text-left text-[1.2rem] font-bold text-main-text/80 bg-transparent border-none cursor-pointer hover:text-[#0d6efd] transition-colors">PORTFOLIO</button>
          <button onClick={() => go('/info')} className="text-left text-[1.2rem] font-bold text-main-text/80 bg-transparent border-none cursor-pointer hover:text-[#0d6efd] transition-colors">ETC INFO</button>
        </div>

        {/* ✨ 하단 배경(bg-sub-bg) 및 텍스트 색상 테마 교체 */}
        <div className="p-[20px] border-t border-border-color bg-sub-bg flex flex-col gap-[15px] transition-colors duration-300">
          <button onClick={() => { onClose(); openModal(<ContactModal />); }} className="flex items-center gap-[12px] text-main-text/90 text-[14px] bg-transparent border-none cursor-pointer hover:text-[#0d6efd] transition-colors">
            <span className="text-[18px]">📧</span> Contact Us
          </button>
          <a href="https://github.com/unbeatable-bot/mongsl" target="_blank" rel="noreferrer" className="flex items-center gap-[12px] text-main-text/90 text-[14px] no-underline hover:text-[#0d6efd] transition-colors">
            <span className="text-[18px]">🐙</span> GitHub
          </a>
          <button onClick={() => { onClose(); openModal(<PrivacyPolicyModal onClose={closeModal} />); }} className="flex items-center gap-[12px] text-main-text/90 text-[14px] bg-transparent border-none cursor-pointer hover:text-[#0d6efd] transition-colors">
            <span className="text-[18px]">🛡️</span> 개인정보처리방침
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;