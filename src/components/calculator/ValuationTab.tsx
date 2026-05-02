import React, { useState } from 'react';

const formatComma = (val: string | number) => {
  const str = String(val).replace(/,/g, '');
  if (isNaN(Number(str))) return '';
  return Number(str).toLocaleString('ko-KR');
};
const parseNum = (val: string) => Number(val.replace(/,/g, '')) || 0;

// 1. 그레이엄 내재가치 계산기 (Amber 테마)
const GrahamWidget: React.FC = () => {
  const [eps, setEps] = useState('');
  const [growth, setGrowth] = useState('');
  const [bondYield, setBondYield] = useState('4.4');

  const e = parseNum(eps); const g = parseNum(growth); const y = parseNum(bondYield);
  
  const original = e * (8.5 + 2 * g);
  const revised = y > 0 ? original * 4.4 / y : 0;
  const safetyMargin = (y > 0 ? revised : original) * 0.7;

  return (
    <div className="bg-[#2a2a2a] p-[24px] rounded-[16px] border border-[#333] flex flex-col h-full hover:border-[#444] transition-colors duration-300 w-full">
      <div className="mb-[20px]">
        <h3 className="text-[#faad14] font-bold text-[18px] m-0 mb-[8px]">🏛 그레이엄 내재가치</h3>
        <p className="text-[#888] text-[13px] m-0 leading-relaxed">벤저민 그레이엄이 제안한 적정 주가 산출 및 안전 마진 적용가입니다.</p>
      </div>

      <div className="grid grid-cols-2 gap-[15px] mb-[15px]">
        <div>
          <label className="block text-[12px] text-[#bdc3c7] mb-[5px]">주당순이익 (EPS)</label>
          <div className="flex items-end border-b-2 border-[#555] focus-within:border-[#faad14] transition-colors pb-[5px]">
            <input type="text" value={eps} onChange={(e) => setEps(formatComma(e.target.value.replace(/[^0-9]/g, '')))} className="w-full bg-transparent text-white text-[20px] font-bold outline-none" placeholder="0" />
          </div>
        </div>
        <div>
          <label className="block text-[12px] text-[#bdc3c7] mb-[5px]">예상 성장률 (%)</label>
          <div className="flex items-end border-b-2 border-[#555] focus-within:border-[#faad14] transition-colors pb-[5px]">
            <input type="text" value={growth} onChange={(e) => setGrowth(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full bg-transparent text-white text-[20px] font-bold outline-none" placeholder="0.0" />
          </div>
        </div>
      </div>
      <div className="mb-[20px]">
        <label className="block text-[12px] text-[#bdc3c7] mb-[5px]">현재 AAA급 회사채 금리 (%)</label>
        <div className="flex items-end border-b-2 border-[#555] focus-within:border-[#faad14] transition-colors pb-[5px]">
          <input type="text" value={bondYield} onChange={(e) => setBondYield(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full bg-transparent text-white text-[20px] font-bold outline-none" placeholder="4.4" />
        </div>
      </div>

      <div className="mt-auto pt-[20px] border-t border-[#3a3a3a] flex flex-col gap-[8px]">
        <div className="flex justify-between items-end text-[#333]">
          <span className="text-[#888] text-[13px]">금리 반영 수정 적정가</span>
          <span className="text-[#bdc3c7] font-bold text-[16px]">{formatComma(revised.toFixed(0))} 원</span>
        </div>
        <div className="flex justify-between items-end text-[#333]">
          <span className="font-bold text-[#bdc3c7] text-[14px]">안전 마진 적용 (30% 할인)</span>
          <span className="text-[#faad14] font-bold text-[24px]">{formatComma(safetyMargin.toFixed(0))} <span className="text-[16px]">원</span></span>
        </div>
      </div>
    </div>
  );
};

// 2. 마법의 공식 (Purple 테마)
const MagicFormulaWidget: React.FC = () => {
  const [roc, setRoc] = useState('');
  const [yieldRate, setYieldRate] = useState('');

  const r = parseNum(roc); const y = parseNum(yieldRate);
  const score = r + y;

  return (
    <div className="bg-[#2a2a2a] p-[24px] rounded-[16px] border border-[#333] flex flex-col h-full hover:border-[#444] transition-colors duration-300 w-full">
      <div className="mb-[20px]">
        <h3 className="text-[#d3adf7] font-bold text-[18px] m-0 mb-[8px]">🪄 마법의 공식</h3>
        <p className="text-[#888] text-[13px] m-0 leading-relaxed">자본수익률(우량함)과 이익수익률(저렴함)을 더해 합산 매력도 점수를 냅니다.</p>
      </div>

      <div className="grid grid-cols-2 gap-[15px] mb-[20px]">
        <div>
          <label className="block text-[12px] text-[#bdc3c7] mb-[5px]">자본수익률 (ROC, %)</label>
          <div className="flex items-end border-b-2 border-[#555] focus-within:border-[#d3adf7] transition-colors pb-[5px]">
            <input type="text" value={roc} onChange={(e) => setRoc(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full bg-transparent text-white text-[20px] font-bold outline-none" placeholder="0.0" />
          </div>
        </div>
        <div>
          <label className="block text-[12px] text-[#bdc3c7] mb-[5px]">이익수익률 (%)</label>
          <div className="flex items-end border-b-2 border-[#555] focus-within:border-[#d3adf7] transition-colors pb-[5px]">
            <input type="text" value={yieldRate} onChange={(e) => setYieldRate(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full bg-transparent text-white text-[20px] font-bold outline-none" placeholder="0.0" />
          </div>
        </div>
      </div>

      <div className="mt-auto pt-[20px] border-t border-[#3a3a3a]">
        <p className="text-[#888] text-[13px] m-0 mb-[5px]">이 종목의 합산 매력도 점수</p>
        <div className="flex justify-between items-end text-[#333]">
          <span className="font-bold text-[#bdc3c7]">마법 공식 점수</span>
          <span className="text-[#d3adf7] font-bold text-[28px]">{score.toFixed(2)}<span className="text-[18px]"> 점</span></span>
        </div>
      </div>
    </div>
  );
};

const ValuationTab: React.FC = () => (
  <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-[20px] items-stretch">
    <GrahamWidget />
    <MagicFormulaWidget />
  </div>
);

export default ValuationTab;