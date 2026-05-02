import React, { useState } from 'react';

const parseNum = (val: string) => Number(val.replace(/,/g, '')) || 0;

// 1. 켈리 공식 (Cyan 테마)
const KellyWidget: React.FC = () => {
  const [winRate, setWinRate] = useState('');
  const [rewardRisk, setRewardRisk] = useState('');

  const w = parseNum(winRate) / 100; const r = parseNum(rewardRisk);
  const k = r > 0 ? w - ((1 - w) / r) : 0;
  const kellyFraction = Math.max(0, k * 100);

  return (
    <div className="bg-[#2a2a2a] p-[24px] rounded-[16px] border border-[#333] flex flex-col h-full hover:border-[#444] transition-colors duration-300 w-full">
      <div className="mb-[20px]">
        <h3 className="text-[#36cfc9] font-bold text-[18px] m-0 mb-[8px]">⚖️ 켈리 공식 (최적 투자 비중)</h3>
        <p className="text-[#888] text-[13px] m-0 leading-relaxed">파산을 방지하고 장기적으로 복리 수익을 극대화할 수 있는 자산 배분 비율을 결정합니다.</p>
      </div>

      <div className="grid grid-cols-2 gap-[15px] mb-[20px]">
        <div>
          <label className="block text-[12px] text-[#bdc3c7] mb-[5px]">승률 (%)</label>
          <div className="flex items-end border-b-2 border-[#555] focus-within:border-[#36cfc9] transition-colors pb-[5px]">
            <input type="text" value={winRate} onChange={(e) => setWinRate(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full bg-transparent text-white text-[20px] font-bold outline-none" placeholder="0.0" />
          </div>
        </div>
        <div>
          <label className="block text-[12px] text-[#bdc3c7] mb-[5px]">손익비 (예: 2)</label>
          <div className="flex items-end border-b-2 border-[#555] focus-within:border-[#36cfc9] transition-colors pb-[5px]">
            <input type="text" value={rewardRisk} onChange={(e) => setRewardRisk(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full bg-transparent text-white text-[20px] font-bold outline-none" placeholder="0.0" />
          </div>
        </div>
      </div>

      <div className="mt-auto pt-[20px] border-t border-[#3a3a3a]">
        <p className="text-[#888] text-[13px] m-0 mb-[5px]">최적의 투자 규모는 전체 자산의</p>
        <div className="flex justify-between items-end text-[#333]">
          <span className="font-bold text-[#bdc3c7]">추천 투자 비중</span>
          <span className={kellyFraction > 0 ? "text-[#36cfc9] font-bold text-[28px]" : "text-[#ff4d4f] font-bold text-[20px]"}>
            {kellyFraction > 0 ? `+${kellyFraction.toFixed(2)} %` : '투자 금지 (0%)'}
          </span>
        </div>
      </div>
    </div>
  );
};

// 2. 100 - 나이 법칙 (Green 테마)
const AssetAllocationAgeWidget: React.FC = () => {
  const [age, setAge] = useState('');
  const a = parseInt(age.replace(/[^0-9]/g, '')) || 0;

  return (
    <div className="bg-[#2a2a2a] p-[24px] rounded-[16px] border border-[#333] flex flex-col h-full hover:border-[#444] transition-colors duration-300 w-full">
      <div className="mb-[20px]">
        <h3 className="text-[#95de64] font-bold text-[18px] m-0 mb-[8px]">🎂 100 - 나이 법칙</h3>
        <p className="text-[#888] text-[13px] m-0 leading-relaxed">연령대에 맞게 주식(위험 자산)과 채권/예금(안전 자산)의 비중을 조절하는 클래식한 기준입니다.</p>
      </div>

      <div className="mb-[20px]">
        <label className="block text-[12px] text-[#bdc3c7] mb-[5px]">현재 나이 (세)</label>
        <div className="flex items-end border-b-2 border-[#555] focus-within:border-[#95de64] transition-colors pb-[5px]">
          <input type="text" value={age} onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-transparent text-white text-[24px] font-bold outline-none" placeholder="0" />
        </div>
      </div>

      <div className="mt-auto pt-[20px] border-t border-[#3a3a3a] flex flex-col gap-[8px]">
        <p className="text-[#888] text-[13px] m-0 mb-[5px]">나이에 맞는 추천 주식(위험자산) 비중</p>
        <div className="flex justify-between items-end text-[#333]">
          <span className="text-[#bdc3c7] text-[13px]">보수적 (100기준)</span>
          <span className="text-[#95de64] font-bold text-[16px]">{Math.max(0, 100 - a)} %</span>
        </div>
        <div className="flex justify-between items-end text-[#333]">
          <span className="text-[#bdc3c7] font-bold text-[14px]">표준 (110기준)</span>
          <span className="text-[#95de64] font-bold text-[20px]">{Math.max(0, 110 - a)} %</span>
        </div>
        <div className="flex justify-between items-end text-[#333]">
          <span className="text-[#bdc3c7] text-[13px]">공격적 (120기준)</span>
          <span className="text-[#95de64] font-bold text-[16px]">{Math.max(0, 120 - a)} %</span>
        </div>
      </div>
    </div>
  );
};

const AllocationTab: React.FC = () => (
  <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-[20px] items-stretch">
    <KellyWidget />
    <AssetAllocationAgeWidget />
  </div>
);

export default AllocationTab;