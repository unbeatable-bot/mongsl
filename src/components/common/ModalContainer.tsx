import React from 'react';

// ModalContext 내부에서 렌더링하도록 래핑했으므로, 
// 디자인적인 배경 처리나 포탈(Portal) 적용 시 이 컴포넌트를 확장하여 사용하면 됩니다.
// (현재는 ModalProvider 내부에 직접 마운트되도록 구성하여 생략 가능하지만, 확장성을 위해 남겨둡니다.)
const ModalContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="fixed inset-0 z-[3000] flex justify-center items-center">
      {children}
    </div>
  );
};

export default ModalContainer;