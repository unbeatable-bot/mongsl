import React from 'react';
import { useModal } from '../../contexts/ModalContext';
import InfoPage from './UsageGuideModal';

interface Props {
  imageCount: number; isProcessing: boolean; processingType: string | null; quality: number; hasSelection: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onResetCrop: () => void; onPreview: () => void; onProcess: (format: 'pdf' | 'zip') => void; setQuality: (val: number) => void;
}

const ActionSidebar: React.FC<Props> = ({ imageCount, isProcessing, processingType, quality, hasSelection, onFileChange, onResetCrop, onPreview, onProcess, setQuality }) => {
  const { openModal, closeModal } = useModal();
  // ✨ disabled 시 배경색 및 텍스트 색상을 테마에 맞게 조정
  const btnClass = "hover:-translate-y-[1px] disabled:bg-border-color disabled:text-main-text/50 disabled:cursor-not-allowed disabled:shadow-none py-[8px] px-[15px] text-[14px] cursor-pointer text-white border-none rounded-[5px] transition-all whitespace-nowrap shadow-[0_2px_5px_rgba(0,0,0,0.3)] text-center max-md:px-[10px] max-md:text-[12px] max-md:flex-1";

  return (
    <div className="flex flex-col items-stretch justify-start gap-[10px] ml-[15px] shrink-0 max-md:flex-row max-md:flex-wrap max-md:justify-between max-md:ml-0 max-md:w-full">
      <label htmlFor="file-upload" className={`bg-[#0d6efd] hover:bg-[#0b5ed7] ${btnClass}`}>이미지 업로드 ({imageCount}장)</label>
      <input id="file-upload" type="file" multiple accept="image/*" onChange={onFileChange} className="hidden" />
      
      <button onClick={onResetCrop} disabled={!hasSelection || isProcessing} className={`bg-[#6c757d] hover:bg-[#5c636a] ${btnClass}`}>크롭 영역 초기화</button>
      <button onClick={onPreview} disabled={!hasSelection || isProcessing} className={`bg-[#f39c12] hover:bg-[#e67e22] ${btnClass}`}>결과 미리보기 👀</button>
      
      {/* ✨ 배경과 테두리를 테마 변수로 교체 */}
      <div className="flex flex-col gap-[5px] bg-sub-bg p-[10px] rounded-[5px] border border-border-color mt-[5px] max-md:w-full max-md:flex-[1_1_100%] transition-colors duration-300">
        <label className="text-[12px] text-main-text/80">압축 품질 (용량)</label>
        {/* ✨ select 태그의 색상 교체 */}
        <select value={quality} onChange={(e) => setQuality(Number(e.target.value))} disabled={isProcessing} className="bg-main-bg text-main-text border border-border-color p-[6px] rounded-[4px] text-[13px] cursor-pointer outline-none focus:border-[#0d6efd]">
          <option value={0.95}>고화질 (권장)</option>
          <option value={0.7}>보통 (용량 절약)</option>
          <option value={0.4}>저화질 (최대 압축)</option>
        </select>
      </div>
      
      <button onClick={() => onProcess('pdf')} disabled={!hasSelection || isProcessing} className={`bg-[#198754] hover:bg-[#157347] ${btnClass}`}>{isProcessing && processingType === 'pdf' ? '생성 중...' : 'PDF 다운로드'}</button>
      <button onClick={() => onProcess('zip')} disabled={!hasSelection || isProcessing} className={`bg-[#dc3545] hover:bg-[#bb2d3b] ${btnClass}`}>{isProcessing && processingType === 'zip' ? '생성 중...' : '이미지(ZIP) 다운로드'}</button>
      <button onClick={() => openModal(<InfoPage onClose={closeModal} />)} disabled={isProcessing} className={`bg-[#6c757d] hover:bg-[#5c636a] flex justify-center items-center gap-[4px] ${btnClass}`}>사용 안내</button>
    </div>
  );
};

export default ActionSidebar;