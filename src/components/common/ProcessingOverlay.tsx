import React from 'react';

interface Props {
  isVisible: boolean;
  type: 'pdf' | 'zip' | 'preview' | 'upload' | null;
}

const ProcessingOverlay: React.FC<Props> = ({ isVisible, type }) => {
  if (!isVisible) return null;

  const getMessage = () => {
    switch (type) {
      case 'pdf': return 'PDF를 생성 중입니다...';
      case 'zip': return 'ZIP 파일을 생성 중입니다...';
      case 'preview': return '미리보기를 생성 중입니다...';
      case 'upload': return '이미지를 준비 중입니다...';
      default: return '처리 중입니다...';
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/70 flex flex-col justify-center items-center text-white text-[1.2em] z-[1000] cursor-not-allowed">
      <div className="border-[8px] border-white/30 border-t-white rounded-full w-[60px] h-[60px] animate-spin mb-[15px]"></div>
      <p>{getMessage()} 잠시만 기다려 주세요.</p>
    </div>
  );
};

export default ProcessingOverlay;