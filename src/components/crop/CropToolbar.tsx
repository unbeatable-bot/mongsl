import React from 'react';

export const ASPECT_RATIOS = [
  { label: '자유형', value: undefined },
  { label: '1:1 (정방형)', value: 1 / 1 },
  { label: '16:9 (가로형)', value: 16 / 9 },
  { label: '3:4 (증명사진)', value: 3 / 4 },
  { label: 'A4 비율', value: 1 / 1.414 },
];

interface Props {
  aspect: number | undefined;
  onAspectChange: (val: number | undefined) => void;
  brightness: number; setBrightness: (val: number) => void;
  contrast: number; setContrast: (val: number) => void;
  grayscale: number; setGrayscale: (val: number) => void;
}

const CropToolbar: React.FC<Props> = ({ aspect, onAspectChange, brightness, setBrightness, contrast, setContrast, grayscale, setGrayscale }) => {
  return (
    // ✨ bg, border 맵핑 및 커스텀 스크롤바 색상을 테마에 맞게 조정
    <div className="flex items-center bg-sub-bg py-[10px] px-[15px] rounded-[8px] mb-[15px] border border-border-color overflow-x-auto whitespace-nowrap gap-[15px] shrink-0 [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-color hover:[&::-webkit-scrollbar-thumb]:bg-main-text/30 [&::-webkit-scrollbar-thumb]:rounded-[4px] transition-colors duration-300">
      <div className="flex items-center gap-[10px]">
        {/* ✨ 텍스트 색상을 main-text/80 으로 조정하여 살짝 흐리게 처리 */}
        <span className="text-[13px] font-bold text-main-text/80">비율:</span>
        <div className="flex gap-[8px]">
          {ASPECT_RATIOS.map((ratio, idx) => (
            <button 
              key={idx} 
              className={`bg-main-bg text-main-text border border-border-color py-[6px] px-[12px] rounded-[20px] text-[13px] cursor-pointer transition-all hover:bg-sub-bg ${aspect === ratio.value ? '!bg-[#0d6efd] !text-white !border-[#0b5ed7] font-bold' : ''}`} 
              onClick={() => onAspectChange(ratio.value)}
            >
              {ratio.label}
            </button>
          ))}
        </div>
      </div>
      <div className="w-[2px] h-[20px] bg-border-color shrink-0 rounded-[2px]"></div>
      <div className="flex items-center gap-[10px]">
        <div className="flex items-center gap-[8px]">
          <span className="text-[13px] font-bold text-main-text/80">밝기</span>
          <input type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-[80px] cursor-pointer accent-[#0d6efd] m-0" />
          <span className="text-[12px] text-main-text/60 min-w-[35px] text-right">{brightness}%</span>
        </div>
        <div className="flex items-center gap-[8px]">
          <span className="text-[13px] font-bold text-main-text/80">대비</span>
          <input type="range" min="50" max="150" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-[80px] cursor-pointer accent-[#0d6efd] m-0" />
          <span className="text-[12px] text-main-text/60 min-w-[35px] text-right">{contrast}%</span>
        </div>
        <label className="flex items-center gap-[5px] cursor-pointer text-[13px] text-main-text/80 font-bold">
          <input type="checkbox" checked={grayscale === 100} onChange={(e) => setGrayscale(e.target.checked ? 100 : 0)} className="cursor-pointer w-[14px] h-[14px] m-0" /> 흑백
        </label>
        {/* ✨ 초기화 버튼 색상 맵핑 */}
        <button className="bg-main-bg text-main-text border border-border-color py-[5px] px-[12px] rounded-[4px] text-[12px] cursor-pointer hover:bg-sub-bg transition-colors" onClick={() => { setBrightness(100); setContrast(100); setGrayscale(0); }}>
          초기화
        </button>
      </div>
    </div>
  );
};

export default CropToolbar;