import React from 'react';
import { useModal } from '../../contexts/ModalContext';

interface Props {
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<Props> = ({ title = '확인', message, onConfirm, onCancel, confirmText = '확인', cancelText = '취소' }) => {
  const { closeModal } = useModal();

  const handleConfirm = () => {
    onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[4000] p-[20px] backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={handleCancel}>
      <div className="bg-[#1e1e1e] border border-[#444] w-full max-w-[320px] rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-[slideUp_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="p-[20px] text-center">
          <h3 className="m-0 mb-[10px] text-[1.2rem] text-white font-bold">{title}</h3>
          <p className="m-0 text-[#bdc3c7] text-[0.95rem] whitespace-pre-wrap leading-[1.5]">{message}</p>
        </div>
        <div className="border-t border-[#333] flex">
          <button 
            onClick={handleCancel} 
            className="flex-1 py-[12px] bg-transparent border-none border-r border-[#333] text-[#bdc3c7] font-medium text-[1rem] cursor-pointer hover:bg-[#2a2a2a] transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={handleConfirm} 
            className="flex-1 py-[12px] bg-transparent border-none text-[#dc3545] font-bold text-[1rem] cursor-pointer hover:bg-[#2a2a2a] transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;