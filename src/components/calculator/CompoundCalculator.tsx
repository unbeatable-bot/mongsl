import React, { useState } from 'react';
import ClearableInput from '../common/ClearableInput';

const formatComma = (val: string | number) => {
  const str = String(val).replace(/,/g, '');
  return isNaN(Number(str)) ? '' : Number(str).toLocaleString('ko-KR');
};
const parseNum = (val: string) => Number(val.replace(/,/g, '')) || 0;

const CompoundCalculator: React.FC = () => {
  const [monthlyDeposit, setMonthlyDeposit] = useState('');
  const [returnRate, setReturnRate] = useState('8.0');
  const [years, setYears] = useState('20');

  const addDeposit = (amount: number) => setMonthlyDeposit(formatComma(parseNum(monthlyDeposit) + amount));

  const pmt = parseNum(monthlyDeposit);
  const rate = parseNum(returnRate);
  const y = parseNum(years);

  const n = y * 12;
  const r = (rate / 100) / 12;
  const futureValue = r === 0 ? pmt * n : pmt * (Math.pow(1 + r, n) - 1) / r;
  
  const totalInv = pmt * n;
  const finalAmt = Math.floor(futureValue);
  const profit = finalAmt - totalInv;

  return (
    // ✨ 배경 및 테두리 테마 적용
    <div className="bg-main-bg p-[24px] rounded-[16px] border border-border-color flex flex-col h-full hover:border-[#444] transition-colors duration-300 w-full">
      <div className="mb-[20px]">
        <h3 className="text-[#faad14] font-bold text-[18px] m-0 mb-[8px]">💰 복리 계산기</h3>
        {/* ✨ 설명 텍스트 색상 적용 */}
        <p className="text-main-text/60 text-[13px] m-0 leading-relaxed">꾸준한 적립과 시간, 그리고 복리가 만들어내는 자산 증식의 마법을 확인하세요.</p>
      </div>

      <div className="mb-[15px]">
        <label className="block text-[12px] text-main-text/80 mb-[5px]">월 적립금 (원)</label>
        <ClearableInput 
          value={monthlyDeposit} 
          onChange={(val) => setMonthlyDeposit(formatComma(val.replace(/[^0-9]/g, '')))} 
          focusColorClass="focus-within:border-[#faad14]" 
        />
      </div>
      
      <div className="flex gap-[8px] flex-wrap mb-[30px]">
        {/* ✨ 퀵 버튼 테마 적용 */}
        <button onClick={() => addDeposit(10000)} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#faad14] hover:text-[#faad14] text-[12px] transition-colors">+1만</button>
        <button onClick={() => addDeposit(100000)} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#faad14] hover:text-[#faad14] text-[12px] transition-colors">+10만</button>
        <button onClick={() => addDeposit(1000000)} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#faad14] hover:text-[#faad14] text-[12px] transition-colors">+100만</button>
      </div>

      <div className="grid grid-cols-2 gap-[20px] mb-[30px]">
        <div>
          <label className="block text-[12px] text-main-text/80 mb-[5px]">연 수익률 (%)</label>
          <ClearableInput value={returnRate} onChange={(val) => setReturnRate(val.replace(/[^0-9.]/g, ''))} focusColorClass="focus-within:border-[#faad14]" fontSizeClass="text-[20px]" />
        </div>
        <div>
          <label className="block text-[12px] text-main-text/80 mb-[5px]">투자 기간 (년)</label>
          <ClearableInput value={years} onChange={(val) => setYears(val.replace(/[^0-9]/g, ''))} focusColorClass="focus-within:border-[#faad14]" fontSizeClass="text-[20px]" />
        </div>
      </div>

      {/* ✨ 하단 결과 영역 라인 테마 적용 */}
      <div className="mt-auto pt-[20px] border-t border-border-color flex flex-col gap-[10px]">
        <div className="flex justify-between items-end text-main-text">
          <span className="text-main-text/80 text-[14px]">투자 원금</span>
          <span className="text-main-text/90 font-bold text-[18px]">{formatComma(totalInv)} 원</span>
        </div>
        <div className="flex justify-between items-end text-main-text">
          <span className="text-main-text/60 text-[14px]">예상 수익</span>
          <span className="text-[#faad14] font-bold text-[16px]">+{formatComma(profit)} 원</span>
        </div>
        <div className="flex justify-between items-end text-main-text mt-[10px] pt-[10px] border-t border-border-color border-dashed">
          <span className="font-bold text-main-text text-[18px]">최종 자산</span>
          <span className="text-[#faad14] font-bold text-[32px]">{formatComma(finalAmt)} <span className="text-[20px]">원</span></span>
        </div>
      </div>
    </div>
  );
};

export default CompoundCalculator;