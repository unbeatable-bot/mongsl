import React, { useState } from 'react';

const formatComma = (val: string | number) => {
  const str = String(val).replace(/,/g, '');
  if (isNaN(Number(str))) return '';
  return Number(str).toLocaleString('ko-KR');
};
const parseNum = (val: string) => Number(val.replace(/,/g, '')) || 0;

const ExchangeCalculator: React.FC = () => {
  const [prefRate, setPrefRate] = useState('90');
  const [exRate, setExRate] = useState('');
  const [amount, setAmount] = useState('');
  const [compareRate, setCompareRate] = useState('');

  const pRate = parseNum(prefRate);
  const rate = parseNum(exRate);
  const amt = parseNum(amount);
  const cRate = parseNum(compareRate);

  // 기본 마진율 1.75% 적용
  const baseSpreadRate = 0.0175;
  const appliedSpreadRatePercent = 1.75 * (1 - pRate / 100);
  const spread = rate * baseSpreadRate;
  const appliedSpread = spread * (1 - pRate / 100);
  const finalRate = rate + appliedSpread;
  const totalKrw = amt * finalRate;

  let compareTotalKrw = 0;
  let compareDiffKrw = 0;
  let compareDiffPercent = 0;

  if (cRate > 0) {
    const compareSpread = cRate * baseSpreadRate;
    const compareAppliedSpread = compareSpread * (1 - pRate / 100);
    const compareFinalRate = cRate + compareAppliedSpread;
    compareTotalKrw = amt * compareFinalRate;
    compareDiffKrw = totalKrw - compareTotalKrw;
    compareDiffPercent = ((rate - cRate) / cRate) * 100;
  }

  return (
    <div className="bg-[#2a2a2a] p-[24px] rounded-[16px] border border-[#333] flex flex-col h-full hover:border-[#444] transition-colors duration-300 w-full xl:max-w-[50%]">
      <div className="mb-[20px]">
        <h3 className="text-[#1890ff] font-bold text-[18px] m-0 mb-[8px]">💱 환전 수수료 (우대율) 계산기</h3>
        <p className="text-[#888] text-[13px] m-0 leading-relaxed">은행의 기본 마진율(1.75%)을 기준으로 우대율을 적용했을 때 실제 필요한 원화와 아낀 수수료를 계산합니다.</p>
      </div>

      <div className="grid grid-cols-2 gap-[15px] mb-[15px]">
        <div>
          <label className="block text-[12px] text-[#bdc3c7] mb-[5px]">우대율 (%)</label>
          <div className="flex items-end border-b-2 border-[#555] focus-within:border-[#1890ff] transition-colors pb-[5px]">
            <input type="text" value={prefRate} onChange={(e) => setPrefRate(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full bg-transparent text-white text-[20px] font-bold outline-none" placeholder="0" />
          </div>
          <div className="flex gap-[5px] mt-[10px]">
            {[80, 90, 100].map(val => (
              <button key={val} onClick={() => setPrefRate(String(val))} className="px-[10px] py-[4px] rounded-full bg-[#1a1a1a] border border-[#444] text-[#bdc3c7] hover:border-[#1890ff] hover:text-[#1890ff] text-[11px] transition-colors">{val}%</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[12px] text-[#bdc3c7] mb-[5px]">현재 환율</label>
          <div className="flex items-end border-b-2 border-[#555] focus-within:border-[#1890ff] transition-colors pb-[5px]">
            <input type="text" value={exRate} onChange={(e) => setExRate(formatComma(e.target.value.replace(/[^0-9.]/g, '')))} className="w-full bg-transparent text-white text-[20px] font-bold outline-none" placeholder="0" />
          </div>
          <div className="flex gap-[5px] mt-[10px]">
            <button onClick={() => setExRate('1350')} className="px-[10px] py-[4px] rounded-full bg-[#1a1a1a] border border-[#444] text-[#bdc3c7] hover:border-[#1890ff] hover:text-[#1890ff] text-[11px] transition-colors">USD</button>
            <button onClick={() => setExRate('9')} className="px-[10px] py-[4px] rounded-full bg-[#1a1a1a] border border-[#444] text-[#bdc3c7] hover:border-[#1890ff] hover:text-[#1890ff] text-[11px] transition-colors">JPY</button>
            <button onClick={() => setExRate('1450')} className="px-[10px] py-[4px] rounded-full bg-[#1a1a1a] border border-[#444] text-[#bdc3c7] hover:border-[#1890ff] hover:text-[#1890ff] text-[11px] transition-colors">EUR</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[15px] mb-[20px]">
        <div>
          <label className="block text-[12px] text-[#bdc3c7] mb-[5px]">환전할 외화</label>
          <div className="flex items-end border-b-2 border-[#555] focus-within:border-[#1890ff] transition-colors pb-[5px]">
            <input type="text" value={amount} onChange={(e) => setAmount(formatComma(e.target.value.replace(/[^0-9]/g, '')))} className="w-full bg-transparent text-white text-[20px] font-bold outline-none" placeholder="0" />
          </div>
        </div>
        <div>
          <label className="block text-[12px] text-[#bdc3c7] mb-[5px]">비교할 환율 (선택)</label>
          <div className="flex items-end border-b-2 border-[#555] focus-within:border-[#eb2f96] transition-colors pb-[5px]">
            <input type="text" value={compareRate} onChange={(e) => setCompareRate(formatComma(e.target.value.replace(/[^0-9.]/g, '')))} className="w-full bg-transparent text-white text-[20px] font-bold outline-none" placeholder="0" />
          </div>
        </div>
      </div>

      <div className="mt-auto pt-[20px] border-t border-[#3a3a3a] flex flex-col gap-[8px]">
        <div className="flex justify-between items-end text-[#333]">
          <span className="text-[#bdc3c7] text-[13px]">적용 환율 / 은행 수수료({appliedSpreadRatePercent.toFixed(2)}%)</span>
          <span className="text-[#bdc3c7] font-bold text-[16px]">{formatComma(finalRate.toFixed(2))} 원 / {formatComma((amt * appliedSpread).toFixed(0))} 원</span>
        </div>
        <div className="flex justify-between items-end text-[#333]">
          <span className="font-bold text-[#bdc3c7] text-[14px]">총 필요 원화</span>
          <span className="text-[#1890ff] font-bold text-[24px]">{formatComma(totalKrw.toFixed(0))} <span className="text-[16px]">원</span></span>
        </div>
        
        {cRate > 0 && (
          <div className="mt-[10px] pt-[10px] border-t border-[#444] border-dashed">
            <div className="flex justify-between items-end text-[#333]">
              <span className="text-[#888] text-[13px]">비교 환율 적용 시 필요 원화</span>
              <span className="text-[#bdc3c7] font-bold text-[14px]">{formatComma(compareTotalKrw.toFixed(0))} 원</span>
            </div>
            <div className="flex justify-between items-end text-[#333] mt-[5px]">
              <span className="font-bold text-[#bdc3c7] text-[13px]">현재 환율이...</span>
              <span className={`font-bold text-[16px] ${compareDiffKrw > 0 ? 'text-[#ff4d4f]' : 'text-[#1890ff]'}`}>
                {compareDiffKrw > 0 ? '더 비쌈' : '더 저렴함'} ({compareDiffPercent > 0 ? '+' : ''}{compareDiffPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExchangeCalculator;