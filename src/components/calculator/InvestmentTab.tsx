import React, { useState } from 'react';
import ClearableInput from '../common/ClearableInput';

const formatComma = (val: string | number) => {
  const str = String(val).replace(/,/g, '');
  if (isNaN(Number(str))) return '';
  return Number(str).toLocaleString('ko-KR');
};
const parseNum = (val: string) => Number(val.replace(/,/g, '')) || 0;

// 1. 평단가 계산기
const AveragePriceWidget: React.FC = () => {
  const [currPrice, setCurrPrice] = useState('');
  const [currQty, setCurrQty] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addQty, setAddQty] = useState('');

  const cPrice = parseNum(currPrice); const cQty = parseNum(currQty);
  const aPrice = parseNum(addPrice); const aQty = parseNum(addQty);
  
  const totalQty = cQty + aQty;
  const totalAmt = (cPrice * cQty) + (aPrice * aQty);
  const finalPrice = totalQty > 0 ? totalAmt / totalQty : 0;
  const changeRate = cPrice > 0 ? ((finalPrice - cPrice) / cPrice) * 100 : 0;

  return (
    // ✨ 배경 및 테두리 테마 적용
    <div className="bg-main-bg p-[24px] rounded-[16px] border border-border-color flex flex-col h-full hover:border-[#444] transition-colors duration-300 w-full">
      <div className="mb-[20px]">
        <h3 className="text-[#ff7a45] font-bold text-[18px] m-0 mb-[8px]">⚖️ 평단가 (물타기/불타기)</h3>
        <p className="text-main-text/60 text-[13px] m-0 leading-relaxed">추가 매수 시 최종 평단가와 수량이 어떻게 변하는지 미리 시뮬레이션 합니다.</p>
      </div>

      <div className="grid grid-cols-2 gap-[15px] mb-[20px]">
        <div>
          <label className="block text-[12px] text-main-text/80 mb-[5px]">현재 평단가 (원)</label>
          <ClearableInput value={currPrice} onChange={(val) => setCurrPrice(formatComma(val.replace(/[^0-9]/g, '')))} focusColorClass="focus-within:border-[#ff7a45]" fontSizeClass="text-[20px]" />
        </div>
        <div>
          <label className="block text-[12px] text-main-text/80 mb-[5px]">현재 보유 수량 (주)</label>
          <ClearableInput value={currQty} onChange={(val) => setCurrQty(formatComma(val.replace(/[^0-9]/g, '')))} focusColorClass="focus-within:border-[#ff7a45]" fontSizeClass="text-[20px]" />
        </div>
        <div>
          <label className="block text-[12px] text-main-text/80 mb-[5px]">추가 매수 단가 (원)</label>
          <ClearableInput value={addPrice} onChange={(val) => setAddPrice(formatComma(val.replace(/[^0-9]/g, '')))} focusColorClass="focus-within:border-[#ff7a45]" fontSizeClass="text-[20px]" />
        </div>
        <div>
          <label className="block text-[12px] text-main-text/80 mb-[5px]">추가 매수 수량 (주)</label>
          <ClearableInput value={addQty} onChange={(val) => setAddQty(formatComma(val.replace(/[^0-9]/g, '')))} focusColorClass="focus-within:border-[#ff7a45]" fontSizeClass="text-[20px]" />
        </div>
      </div>

      <div className="mt-auto pt-[20px] border-t border-border-color flex flex-col gap-[8px]">
        <div className="flex justify-between items-end text-main-text">
          <span className="font-bold text-main-text/90 text-[13px]">최종 평단가</span>
          <span className="text-[#ff7a45] font-bold text-[24px]">
            {changeRate !== 0 && <span className={`text-[14px] mr-[8px] ${changeRate > 0 ? 'text-[#ff4d4f]' : 'text-[#4096ff]'}`}>({changeRate > 0 ? '+' : ''}{changeRate.toFixed(2)}%)</span>}
            {formatComma(finalPrice.toFixed(0))} <span className="text-[16px]">원</span>
          </span>
        </div>
        <div className="flex justify-between items-end text-main-text">
          <span className="font-bold text-main-text/90 text-[13px]">최종 수량 / 총 금액</span>
          <span className="text-main-text/80 font-bold text-[16px]">{formatComma(totalQty)} 주 / {formatComma(totalAmt)} 원</span>
        </div>
      </div>
    </div>
  );
};

// 2. 목표가/손절가 계산기
const TargetStopLossWidget: React.FC = () => {
  const [basePrice, setBasePrice] = useState('');
  const [profitRate, setProfitRate] = useState('');
  const [lossRate, setLossRate] = useState('');

  const bPrice = parseNum(basePrice);
  const pRate = parseNum(profitRate);
  const lRate = parseNum(lossRate);

  const targetPrice = bPrice * (1 + (pRate / 100));
  const stopLossPrice = bPrice * (1 - (lRate / 100));

  return (
    <div className="bg-main-bg p-[24px] rounded-[16px] border border-border-color flex flex-col h-full hover:border-[#444] transition-colors duration-300 w-full">
      <div className="mb-[20px]">
        <h3 className="text-[#748ffc] font-bold text-[18px] m-0 mb-[8px]">🎯 목표가 / 손절가</h3>
        <p className="text-main-text/60 text-[13px] m-0 leading-relaxed">뇌동매매를 방지하기 위해 기계적인 목표 매도가와 손절가를 계산합니다.</p>
      </div>

      <div className="mb-[15px]">
        <label className="block text-[12px] text-main-text/80 mb-[5px]">매수 단가 (원)</label>
        <ClearableInput value={basePrice} onChange={(val) => setBasePrice(formatComma(val.replace(/[^0-9]/g, '')))} focusColorClass="focus-within:border-[#748ffc]" fontSizeClass="text-[20px]" />
      </div>

      <div className="grid grid-cols-2 gap-[15px] mb-[20px]">
        <div>
          <label className="block text-[12px] text-main-text/80 mb-[5px]">목표 수익률 (%)</label>
          <ClearableInput value={profitRate} onChange={(val) => setProfitRate(val.replace(/[^0-9.]/g, ''))} focusColorClass="focus-within:border-[#ff4d4f]" fontSizeClass="text-[20px]" />
        </div>
        <div>
          <label className="block text-[12px] text-main-text/80 mb-[5px]">손절 기준률 (%)</label>
          <ClearableInput value={lossRate} onChange={(val) => setLossRate(val.replace(/[^0-9.]/g, ''))} focusColorClass="focus-within:border-[#4096ff]" fontSizeClass="text-[20px]" />
        </div>
      </div>

      <div className="mt-auto pt-[20px] border-t border-border-color flex flex-col gap-[12px]">
        <div className="flex justify-between items-end text-main-text">
          <span className="font-bold text-main-text/90 text-[13px]">익절 목표가 <span className="text-[#ff4d4f]">+{pRate}%</span></span>
          <span className="text-[#ff4d4f] font-bold text-[24px]">{formatComma(targetPrice.toFixed(0))} <span className="text-[16px]">원</span></span>
        </div>
        <div className="flex justify-between items-end text-main-text">
          <span className="font-bold text-main-text/90 text-[13px]">기계적 손절가 <span className="text-[#4096ff]">-{lRate}%</span></span>
          <span className="text-[#4096ff] font-bold text-[24px]">{formatComma(stopLossPrice.toFixed(0))} <span className="text-[16px]">원</span></span>
        </div>
      </div>
    </div>
  );
};

const InvestmentTab: React.FC = () => (
  <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-[20px] items-stretch">
    <AveragePriceWidget />
    <TargetStopLossWidget />
  </div>
);

export default InvestmentTab;