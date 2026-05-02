import React from 'react';
import Rule72Calculator from './Rule72Calculator';
import { USStockTaxCalculator, RecoveryCalculator, ReturnMultipleCalculator } from './StockYieldCalculators';

const YieldTab: React.FC = () => {
  return (
    // ✨ 핵심: xl 화면에서는 2칸(2x2), 작은 화면에서는 1칸으로 반응형 처리되며 전체 너비(w-full)를 차지합니다.
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-[20px] items-stretch">
      <Rule72Calculator />
      <USStockTaxCalculator />
      <RecoveryCalculator />
      <ReturnMultipleCalculator />
    </div>
  );
};

export default YieldTab;