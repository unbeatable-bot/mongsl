import React, { useState } from 'react';
import { useModal } from '../../contexts/ModalContext';
import { Copy, Check } from 'lucide-react';

const ContactModal: React.FC = () => {
  const { closeModal } = useModal();
  const [copied, setCopied] = useState(false);
  
  // 사용하실 실제 이메일 주소로 변경해주세요
  const emailAddress = "LangPotterTeam@gmail.com";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[4000] p-[20px] backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={closeModal}>
      <div className="bg-[#1e1e1e] border border-[#444] w-full max-w-[350px] rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col p-[25px] items-center animate-[slideUp_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <span className="text-[40px] mb-[10px]">📬</span>
        <h3 className="m-0 mb-[15px] text-[1.3rem] text-white font-bold">Contact Us</h3>
        <p className="m-0 mb-[20px] text-[#bdc3c7] text-[0.95rem] text-center leading-[1.5]">
          문의사항이나 제안이 있으신가요?<br/>아래 이메일로 연락해 주세요.
        </p>
        
        <div className="w-full flex items-center justify-between bg-[#2a2a2a] border border-[#444] rounded-[8px] p-[10px_15px] mb-[20px]">
          <span className="text-[#0d6efd] font-semibold tracking-wide">{emailAddress}</span>
          <button 
            onClick={handleCopy}
            className="bg-transparent border-none cursor-pointer flex items-center justify-center p-[5px] text-[#bdc3c7] hover:text-white transition-colors"
            title="이메일 복사하기"
          >
            {copied ? <Check size={18} color="#198754" /> : <Copy size={18} />}
          </button>
        </div>

        <button 
          onClick={closeModal} 
          className="w-full py-[10px] bg-[#333] hover:bg-[#444] text-white border-none rounded-[6px] font-medium cursor-pointer transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default ContactModal;