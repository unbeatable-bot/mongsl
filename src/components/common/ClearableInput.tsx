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
    <div className={`flex items-end border-b-2 border-[#555] transition-colors pb-[5px] ${focusColorClass}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-transparent text-white font-bold outline-none ${fontSizeClass}`}
        placeholder={placeholder}
      />
      {/* 값이 있을 때만 X 버튼 표시 */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="mb-[4px] mr-[8px] flex items-center justify-center w-[20px] h-[20px] rounded-full bg-[#555] hover:bg-[#888] text-white text-[12px] transition-colors shrink-0"
          title="지우기"
        >
          ✕
        </button>
      )}
      {suffix && <span className="text-[#888] text-[16px] mb-[4px] shrink-0">{suffix}</span>}
    </div>
  );
};

export default ClearableInput;