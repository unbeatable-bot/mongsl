import React from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  suffix?: string;
  focusColorClass?: string; // 예: 'focus-within:border-[#faad14]'
  fontSizeClass?: string;   // 예: 'text-[24px]'
}

const ClearableInput: React.FC<Props> = ({
  value, 
  onChange, 
  placeholder = '0', 
  suffix, 
  focusColorClass = 'focus-within:border-[#0d6efd]', 
  fontSizeClass = 'text-[24px]'
}) => {
  return (
    // ✨ 밑줄 색상 변경: border-[#555] -> border-border-color
    <div className={`flex items-end border-b-2 border-border-color transition-colors pb-[5px] ${focusColorClass}`}>
      {/* ✨ 입력 텍스트 색상 변경: text-white -> text-main-text */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-transparent text-main-text font-bold outline-none ${fontSizeClass}`}
        placeholder={placeholder}
      />
      {/* 값이 있을 때만 X 버튼 표시 */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="mb-[4px] mr-[8px] flex items-center justify-center w-[20px] h-[20px] rounded-full bg-border-color hover:bg-main-text/30 text-main-text text-[12px] transition-colors shrink-0"
          title="지우기"
        >
          ✕
        </button>
      )}
      {/* ✨ 우측 접미사(%, 원 등) 색상 변경 */}
      {suffix && <span className="text-main-text/60 text-[16px] mb-[4px] shrink-0">{suffix}</span>}
    </div>
  );
};

export default ClearableInput;