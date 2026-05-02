import React from 'react';

interface Props { isOpen: boolean; onClose: () => void; previewImages: string[]; }

const PreviewModal: React.FC<Props> = ({ isOpen, onClose, previewImages }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.85)] flex justify-center items-center z-[2000] backdrop-blur-[5px]">
      <div className="bg-[#1e1e1e] w-[90%] max-w-[800px] h-[85vh] rounded-[12px] flex flex-col border border-[#444] shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="flex justify-between items-center py-[15px] px-[20px] bg-[#2a2a2a] border-b border-[#444]">
          <h2 className="m-0 text-[1.2rem] text-white">PDF 페이지 미리보기 ({previewImages.length}장)</h2>
          <button onClick={onClose} className="bg-transparent border-none text-[#bbb] text-[1.2rem] cursor-pointer hover:text-white">닫기 ✕</button>
        </div>
        <div className="flex-1 p-[20px] overflow-y-auto grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[20px] content-start max-md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
          {previewImages.map((src, idx) => (
            <div key={idx} className="relative bg-white rounded-[4px] p-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex justify-center items-center">
              <span className="absolute top-[5px] left-[5px] bg-[rgba(0,0,0,0.6)] text-white text-[12px] py-[2px] px-[6px] rounded-[10px]">{idx + 1}</span>
              <img src={src} alt={`preview-${idx}`} className="max-w-full max-h-[250px] object-contain" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;