import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface ModalContextType {
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  return (
    <ModalContext.Provider value={{ openModal: setModalContent, closeModal: () => setModalContent(null) }}>
      {children}
      {/* 실제 렌더링은 아래 ModalContainer에서 수행합니다. */}
      {modalContent && <div id="modal-root">{modalContent}</div>}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within a ModalProvider');
  return context;
};