import React from 'react';
import Header from '../components/layout/Header';
import TargetPortfolio from '../components/portfolio/TargetPortfolio';

const PortfolioPage: React.FC = () => {
  return (
    // ✨ 다른 페이지와 완벽히 동일한 최상위 레이아웃 및 테마 변수 적용
    <div className="w-full h-full mx-auto bg-main-bg border border-border-color p-[20px] rounded-[8px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex flex-col box-border max-md:h-auto max-md:min-h-[100dvh] max-md:overflow-y-auto transition-colors duration-300">
      
      {/* 공통 헤더 (다크모드 토글 및 햄버거 메뉴 포함) */}
      <Header />

      <div className="flex-1 flex flex-col overflow-visible min-h-0 relative max-md:h-auto mt-[15px]">
        {/* 안드로이드에서 이식한 '목표 포트폴리오' 기능 마운트 */}
        <TargetPortfolio />
      </div>
      
    </div>
  );
};

export default PortfolioPage;