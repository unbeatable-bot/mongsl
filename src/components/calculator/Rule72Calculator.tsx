import React, { useState } from 'react';
import ClearableInput from '../common/ClearableInput';

const parseNum = (val: string) => Number(val.replace(/,/g, '')) || 0;

const Rule72Calculator: React.FC = () => {
  const [rate, setRate] = useState('');
  
  const addRate = (amount: number) => setRate(String(parseNum(rate) + amount));

  const parsedRate = parseNum(rate);
  const years = parsedRate > 0 ? 72 / parsedRate : 0;
  const totalMonths = Math.round(years * 12);
  const displayYears = Math.floor(totalMonths / 12);
  const displayMonths = totalMonths % 12;

  let timeString = '0개월';
  if (displayYears > 0) timeString = `${displayYears}년 `;
  if (displayMonths > 0) timeString += `${displayMonths}개월`;
  if (displayYears === 0 && displayMonths === 0 && years > 0) timeString = '1개월 미만';

  return (
    // ✨ 배경 및 테두리 테마 적용
    <div className="bg-main-bg p-[24px] rounded-[16px] border border-border-color flex flex-col h-full hover:border-[#444] transition-colors duration-300 w-full">
      <div className="mb-[20px]">
        <h3 className="text-[#0dcaf0] font-bold text-[18px] m-0 mb-[8px]">⏱ 72의 법칙</h3>
        <p className="text-main-text/60 text-[13px] m-0 leading-relaxed">복리의 위력을 체감할 수 있는 공식으로, 투자한 원금이 2배가 되는 데 걸리는 시간을 계산합니다.</p>
      </div>

      <div className="mb-[15px]">
        <label className="block text-[12px] text-main-text/80 mb-[5px]">예상 연 수익률 (%)</label>
        <ClearableInput 
          value={rate} 
          onChange={(val) => setRate(val.replace(/[^0-9.]/g, ''))} 
          suffix="%" 
          focusColorClass="focus-within:border-[#0dcaf0]" 
          placeholder="0.0" 
        />
      </div>
      
      <div className="flex gap-[8px] flex-wrap mb-[20px]">
        <button onClick={() => addRate(1)} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#0dcaf0] hover:text-[#0dcaf0] text-[12px] transition-colors">+1%</button>
        <button onClick={() => addRate(5)} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#0dcaf0] hover:text-[#0dcaf0] text-[12px] transition-colors">+5%</button>
        <button onClick={() => addRate(10)} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#0dcaf0] hover:text-[#0dcaf0] text-[12px] transition-colors">+10%</button>
      </div>

      <div className="mt-auto pt-[20px] border-t border-border-color">
        <p className="text-main-text/60 text-[13px] m-0 mb-[5px]">내 자산이 2배가 되려면</p>
        <div className="flex justify-between items-end text-main-text">
          <span className="font-bold text-main-text/90">소요 기간</span>
          <span className="text-[#0dcaf0] font-bold text-[28px]">{years > 0 ? timeString : '-'}</span>
        </div>
      </div>
    </div>
  );
};

export default Rule72Calculator;