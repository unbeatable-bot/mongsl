import React from 'react';
import { useModal } from '../../contexts/ModalContext';

interface Props {
  title?: string;
  message: string;
  onClose?: () => void;
}

const AlertModal: React.FC<Props> = ({ title = '알림', message, onClose }) => {
  const { closeModal } = useModal();

  const handleClose = () => {
    if (onClose) onClose();
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[4000] p-[20px] backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={handleClose}>
      <div className="bg-[#1e1e1e] border border-[#444] w-full max-w-[320px] rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-[slideUp_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="p-[20px] text-center">
          <h3 className="m-0 mb-[10px] text-[1.2rem] text-white font-bold">{title}</h3>
          <p className="m-0 text-[#bdc3c7] text-[0.95rem] whitespace-pre-wrap leading-[1.5]">{message}</p>
        </div>
        <div className="border-t border-[#333] flex">
          <button 
            onClick={handleClose} 
            className="flex-1 py-[12px] bg-transparent border-none text-[#0d6efd] font-bold text-[1rem] cursor-pointer hover:bg-[#2a2a2a] transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

// (참고) 향후 Alert / Confirm 모달 사용 방법
// export default AlertModal;

// import { useModal } from '../../contexts/ModalContext';
// import AlertModal from '../common/AlertModal';
// import ConfirmModal from '../common/ConfirmModal';

// const MyComponent = () => {
//   const { openModal } = useModal();

//   // Alert 띄우기 예시
//   const handleAlert = () => {
//     openModal(<AlertModal message="처리가 완료되었습니다!" />);
//   };

//   // Confirm 띄우기 예시 (예: 초기화 버튼 클릭 시)
//   const handleResetClick = () => {
//     openModal(
//       <ConfirmModal 
//         title="초기화" 
//         message="정말로 모든 작업을 초기화 하시겠습니까?" 
//         onConfirm={() => {
//           // 실제 초기화 로직 실행
//           setImages([]);
//           setCrop(undefined);
//         }} 
//       />
//     );
//   };
  
//   // ...
// }