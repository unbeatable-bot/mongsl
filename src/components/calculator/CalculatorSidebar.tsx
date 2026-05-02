import React from 'react';

interface Props {
  mainTabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabIcons: Record<string, string> = {
  '복리/연금': '💰',
  '대출 이자': '🏦',
  '주식 계산': '📈',
  '기타 계산': '🧮',
};

const CalculatorSidebar: React.FC<Props> = ({ mainTabs, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-col items-stretch justify-start gap-[10px] w-[180px] shrink-0 max-md:flex-row max-md:flex-wrap max-md:justify-between max-md:w-full">
      {mainTabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`py-[12px] px-[15px] text-[14px] cursor-pointer text-white border-none rounded-[5px] transition-all duration-300 shadow-[0_2px_5px_rgba(0,0,0,0.3)] text-left flex items-center gap-[8px] max-md:px-[10px] max-md:text-[13px] max-md:flex-1 max-md:justify-center ${
              isActive 
                ? 'bg-[#0d6efd] font-bold hover:bg-[#0b5ed7] hover:-translate-y-[1px]' 
                : 'bg-[#444] text-[#bdc3c7] hover:bg-[#555] hover:-translate-y-[1px]'
            }`}
          >
            <span className="text-[16px]">{tabIcons[tab]}</span>
            {tab}
          </button>
        );
      })}
    </div>
  );
};

export default CalculatorSidebar;