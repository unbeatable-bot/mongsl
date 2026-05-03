import React, { useState } from 'react';
import Header from '../components/layout/Header';
import CalculatorSidebar from '../components/calculator/CalculatorSidebar';
import CompoundCalculator from '../components/calculator/CompoundCalculator';
import PensionCalculator from '../components/calculator/PensionCalculator';
import LoanCalculator from '../components/calculator/LoanCalculator';
import YieldTab from '../components/calculator/YieldTab';
import InvestmentTab from '../components/calculator/InvestmentTab';
import ValuationTab from '../components/calculator/ValuationTab';
import AllocationTab from '../components/calculator/AllocationTab';
import ExchangeCalculator from '../components/calculator/ExchangeCalculator';

const MAIN_TABS = ['복리/연금', '대출 이자', '주식 계산', '기타 계산'];
const SUB_TABS: Record<string, string[]> = {
  '복리/연금': ['복리 계산', '연금 수령액', '연금 목표자산'],
  '대출 이자': ['대출 이자'],
  '주식 계산': ['수익률', '주식 투자', '가치 평가', '자산 배분'],
  '기타 계산': ['환전수수료'],
};

const CalculatorPage: React.FC = () => {
  const [mainTab, setMainTab] = useState(MAIN_TABS[0]);
  const [subTab, setSubTab] = useState(SUB_TABS[MAIN_TABS[0]][0]);

  const handleMainTabChange = (tab: string) => {
    setMainTab(tab);
    setSubTab(SUB_TABS[tab][0]);
  };

  return (
    // ✨ 배경 및 테두리를 테마 변수로 교체
    <div className="w-full h-full mx-auto bg-main-bg border border-border-color p-[20px] rounded-[8px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex flex-col box-border max-md:h-auto max-md:min-h-[100dvh] max-md:overflow-y-auto transition-colors duration-300">
      <Header />

      <div className="flex-1 flex flex-row gap-[15px] overflow-visible min-h-0 relative max-md:flex-col max-md:gap-[10px] max-md:h-auto">
        <div className="flex-1 flex flex-col border border-border-color rounded-[8px] overflow-hidden min-w-0 bg-sub-bg max-md:order-1 max-md:w-full max-md:min-h-[400px] transition-colors duration-300">
          {SUB_TABS[mainTab].length > 1 && (
            // ✨ 서브 탭 배경 및 텍스트 색상 교체
            <div className="flex items-center gap-[10px] bg-main-bg border-b border-border-color px-[15px] pt-[10px] overflow-x-auto whitespace-nowrap shrink-0 [&::-webkit-scrollbar]:hidden transition-colors duration-300">
              {SUB_TABS[mainTab].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSubTab(tab)}
                  className={`bg-transparent border-b-[3px] py-[10px] px-[12px] text-[14px] cursor-pointer transition-all ${
                    subTab === tab ? 'border-[#0d6efd] text-[#0d6efd] font-bold' : 'border-transparent text-main-text/60 hover:text-main-text'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* 계산기 실제 렌더링 영역 */}
          {/* ✨ 스크롤바 색상 테마 변수 적용 */}
          <div className="flex-1 overflow-y-auto p-[20px] max-md:p-[15px] [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-color hover:[&::-webkit-scrollbar-thumb]:bg-main-text/30 [&::-webkit-scrollbar-thumb]:rounded-[4px]">
            
            {mainTab === '복리/연금' && subTab === '복리 계산' && <CompoundCalculator />}
            {mainTab === '복리/연금' && subTab === '연금 수령액' && <PensionCalculator isReverseMode={false} />}
            {mainTab === '복리/연금' && subTab === '연금 목표자산' && <PensionCalculator isReverseMode={true} />}
            {mainTab === '대출 이자' && subTab === '대출 이자' && <LoanCalculator />}
            
            {mainTab === '주식 계산' && subTab === '수익률' && <YieldTab />}
            {mainTab === '주식 계산' && subTab === '주식 투자' && <InvestmentTab />}
            {mainTab === '주식 계산' && subTab === '가치 평가' && <ValuationTab />}
            {mainTab === '주식 계산' && subTab === '자산 배분' && <AllocationTab />}

            {mainTab === '기타 계산' && subTab === '환전수수료' && <ExchangeCalculator />}

            {/* 미구현 탭 플레이스홀더 */}
            {(mainTab === '기타 계산' && subTab !== '환전수수료') ? (
              <div className="h-full flex flex-col justify-center items-center text-main-text/60 text-center p-[20px]">
                <span className="text-[40px] mb-[15px] opacity-70">🚧</span>
                <h2 className="m-0 text-main-text text-[18px]">[{mainTab} - {subTab}]</h2>
                <p className="mt-[10px] text-[14px]">해당 계산기 로직을 마이그레이션 중입니다.</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="max-md:order-2">
          <CalculatorSidebar mainTabs={MAIN_TABS} activeTab={mainTab} onTabChange={handleMainTabChange} />
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;