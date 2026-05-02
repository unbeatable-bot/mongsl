import React, { useState } from 'react';
import ClearableInput from '../common/ClearableInput';

const formatComma = (val: string | number) => {
  const str = String(val).replace(/,/g, '');
  return isNaN(Number(str)) ? '' : Number(str).toLocaleString('ko-KR');
};
const parseNum = (val: string) => Number(val.replace(/,/g, '')) || 0;

interface Props { isReverseMode: boolean; }

const PensionCalculator: React.FC<Props> = ({ isReverseMode }) => {
  const [assetOrMonthly, setAssetOrMonthly] = useState('');
  const [durationYears, setDurationYears] = useState('30');
  const [returnRate, setReturnRate] = useState('3.0');

  const addAmount = (amount: number) => setAssetOrMonthly(formatComma(parseNum(assetOrMonthly) + amount));

  const y = parseNum(durationYears);
  const r = parseNum(returnRate) / 100 / 12;
  const n = y * 12;
  const inputVal = parseNum(assetOrMonthly);

  let resultMonthly = 0, requiredAsset = 0, totalReceived = 0, totalInterest = 0;

  if (n > 0 && inputVal > 0) {
    if (!isReverseMode) {
      resultMonthly = r > 0 ? inputVal * r / (1 - Math.pow(1 + r, -n)) : inputVal / n;
      totalReceived = resultMonthly * n;
      totalInterest = totalReceived - inputVal;
    } else {
      requiredAsset = r > 0 ? inputVal * (1 - Math.pow(1 + r, -n)) / r : inputVal * n;
      totalReceived = inputVal * n;
      totalInterest = totalReceived - requiredAsset;
    }
  }

  return (
    // ✨ xl:max-w-[50%] 제거하여 100% 너비 차지
    <div className="bg-[#2a2a2a] p-[24px] rounded-[16px] border border-[#333] flex flex-col h-full hover:border-[#444] transition-colors duration-300 w-full">
      <div className="mb-[20px]">
        <h3 className="text-[#52c41a] font-bold text-[18px] m-0 mb-[8px]">🌴 {!isReverseMode ? '연금 수령액 계산기' : '연금 목표자산 계산기'}</h3>
        <p className="text-[#888] text-[13px] m-0 leading-relaxed">{!isReverseMode ? '모아둔 은퇴 자산으로 매월 얼마씩 수령할 수 있는지 계산합니다.' : '희망하는 월 수령액을 받기 위해 지금 당장 필요한 은퇴 자산을 역계산합니다.'}</p>
      </div>

      <div className="mb-[15px]">
        <label className="block text-[12px] text-[#bdc3c7] mb-[5px]">{!isReverseMode ? '보유한 총 자산 (연금 총액)' : '은퇴 후 희망 월 수령액'}</label>
        <ClearableInput value={assetOrMonthly} onChange={(val) => setAssetOrMonthly(formatComma(val.replace(/[^0-9]/g, '')))} focusColorClass="focus-within:border-[#52c41a]" />
      </div>
      
      <div className="flex gap-[8px] flex-wrap mb-[30px]">
        <button onClick={() => addAmount(!isReverseMode ? 10000000 : 100000)} className="px-[14px] py-[6px] rounded-full bg-[#1a1a1a] border border-[#444] text-[#bdc3c7] hover:border-[#52c41a] hover:text-[#52c41a] text-[12px] transition-colors">{!isReverseMode ? '+1천만' : '+10만'}</button>
        <button onClick={() => addAmount(!isReverseMode ? 100000000 : 1000000)} className="px-[14px] py-[6px] rounded-full bg-[#1a1a1a] border border-[#444] text-[#bdc3c7] hover:border-[#52c41a] hover:text-[#52c41a] text-[12px] transition-colors">{!isReverseMode ? '+1억' : '+100만'}</button>
        <button onClick={() => addAmount(!isReverseMode ? 1000000000 : 10000000)} className="px-[14px] py-[6px] rounded-full bg-[#1a1a1a] border border-[#444] text-[#bdc3c7] hover:border-[#52c41a] hover:text-[#52c41a] text-[12px] transition-colors">{!isReverseMode ? '+10억' : '+1000만'}</button>
      </div>

      <div className="grid grid-cols-2 gap-[20px] mb-[30px]">
        <div>
          <label className="block text-[12px] text-[#bdc3c7] mb-[5px]">수령 기간 (년)</label>
          <ClearableInput value={durationYears} onChange={(val) => setDurationYears(val.replace(/[^0-9]/g, ''))} focusColorClass="focus-within:border-[#52c41a]" fontSizeClass="text-[20px]" />
        </div>
        <div>
          <label className="block text-[12px] text-[#bdc3c7] mb-[5px]">은퇴 후 기대수익률 (%)</label>
          <ClearableInput value={returnRate} onChange={(val) => setReturnRate(val.replace(/[^0-9.]/g, ''))} focusColorClass="focus-within:border-[#52c41a]" fontSizeClass="text-[20px]" />
        </div>
      </div>

      <div className="mt-auto pt-[20px] border-t border-[#3a3a3a] flex flex-col gap-[10px]">
        <div className="flex justify-between items-end text-[#333]">
          <span className="text-[#888] text-[14px]">총 수령액 / 수령 중 굴러간 이자</span>
          <span className="text-[#bdc3c7] font-bold text-[16px]">{formatComma(totalReceived.toFixed(0))} 원 / <span className="text-[#52c41a]">+{formatComma(totalInterest.toFixed(0))} 원</span></span>
        </div>
        <div className="flex justify-between items-end text-[#333] mt-[10px] pt-[10px] border-t border-[#444] border-dashed">
          <span className="font-bold text-[#bdc3c7] text-[18px]">{!isReverseMode ? '매월 예상 수령액' : '지금 필요한 총 자산'}</span>
          <span className="text-[#52c41a] font-bold text-[32px]">{formatComma((!isReverseMode ? resultMonthly : requiredAsset).toFixed(0))} <span className="text-[20px]">원{!isReverseMode && '/월'}</span></span>
        </div>
      </div>
    </div>
  );
};

export default PensionCalculator;