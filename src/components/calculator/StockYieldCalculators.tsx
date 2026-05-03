import React, { useState } from 'react';
import ClearableInput from '../common/ClearableInput';

const parseNum = (val: string) => Number(val.replace(/,/g, '')) || 0;

// ----------------------------------------------------
// 1. 🇺🇸 미국주식 22% 세금 계산기
// ----------------------------------------------------
export const USStockTaxCalculator: React.FC = () => {
  const [returnRate, setReturnRate] = useState('');
  
  const addRate = (amount: number) => setReturnRate(String(parseNum(returnRate) + amount));
  const domesticVal = parseNum(returnRate);
  const requiredUsReturn = domesticVal > 0 ? domesticVal / 0.78 : 0;

  return (
    // ✨ 배경 및 테두리 테마 적용
    <div className="bg-main-bg p-[24px] rounded-[16px] border border-border-color flex flex-col h-full transition-colors duration-300 w-full">
      <div className="mb-[20px]">
        <h3 className="text-[#20c997] font-bold text-[18px] m-0 mb-[8px]">🇺🇸 미국주식 22% 세금 계산기</h3>
        <p className="text-main-text/60 text-[13px] m-0 leading-relaxed">국내 주식 비과세 대비, 미국 주식에서 22% 양도소득세를 떼고도 동일한 수익을 얻기 위해 필요한 목표 수익률입니다.</p>
      </div>

      <div className="mb-[15px]">
        <label className="block text-[12px] text-main-text/80 mb-[5px]">국내 목표 수익률 (%)</label>
        <ClearableInput 
          value={returnRate} 
          onChange={(val) => setReturnRate(val.replace(/[^0-9.]/g, ''))} 
          suffix="%" 
          focusColorClass="focus-within:border-[#20c997]" 
          placeholder="0.0" 
        />
      </div>
      
      <div className="flex gap-[8px] flex-wrap mb-[20px]">
        {/* ✨ 버튼 테마 적용 */}
        <button onClick={() => addRate(10)} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#20c997] hover:text-[#20c997] text-[12px] transition-colors">+10%</button>
        <button onClick={() => addRate(50)} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#20c997] hover:text-[#20c997] text-[12px] transition-colors">+50%</button>
        <button onClick={() => addRate(100)} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#20c997] hover:text-[#20c997] text-[12px] transition-colors">+100%</button>
      </div>

      <div className="mt-auto pt-[20px] border-t border-border-color">
        <p className="text-main-text/60 text-[13px] m-0 mb-[5px]">미국 주식으로 똑같이 벌려면</p>
        <div className="flex justify-between items-end text-main-text">
          <span className="font-bold text-main-text/90">필요한 수익률</span>
          <span className="text-[#20c997] font-bold text-[28px]">+{requiredUsReturn.toFixed(2)}<span className="text-[18px]"> %</span></span>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 2. 📈 원금 회복 수익률 계산기
// ----------------------------------------------------
export const RecoveryCalculator: React.FC = () => {
  const [lossRate, setLossRate] = useState('');
  
  const addRate = (amount: number) => setLossRate(String(parseNum(lossRate) + amount));
  const loss = parseNum(lossRate);
  const requiredGain = (loss > 0 && loss < 100) ? (loss / (100 - loss)) * 100 : 0;

  return (
    <div className="bg-main-bg p-[24px] rounded-[16px] border border-border-color flex flex-col h-full transition-colors duration-300 w-full">
      <div className="mb-[20px]">
        <h3 className="text-[#ff4d4f] font-bold text-[18px] m-0 mb-[8px]">📈 원금 회복 수익률 계산기</h3>
        <p className="text-main-text/60 text-[13px] m-0 leading-relaxed">떨어진 비율만큼 올린다고 원금이 되지 않습니다. 복리의 마법 때문에 하락폭이 클수록 훨씬 높은 수익률이 필요합니다.</p>
      </div>

      <div className="mb-[15px]">
        <label className="block text-[12px] text-main-text/80 mb-[5px]">현재 손실률 (%)</label>
        <ClearableInput 
          value={lossRate} 
          onChange={(val) => setLossRate(val.replace(/[^0-9.]/g, ''))} 
          suffix="%" 
          focusColorClass="focus-within:border-[#ff4d4f]" 
          placeholder="0.0" 
        />
      </div>
      
      <div className="flex gap-[8px] flex-wrap mb-[20px]">
        <button onClick={() => addRate(1)} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#ff4d4f] hover:text-[#ff4d4f] text-[12px] transition-colors">+1%</button>
        <button onClick={() => addRate(5)} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#ff4d4f] hover:text-[#ff4d4f] text-[12px] transition-colors">+5%</button>
        <button onClick={() => addRate(10)} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#ff4d4f] hover:text-[#ff4d4f] text-[12px] transition-colors">+10%</button>
      </div>

      <div className="mt-auto pt-[20px] border-t border-border-color">
        <p className="text-main-text/60 text-[13px] m-0 mb-[5px]">원금으로 다시 돌아가려면</p>
        <div className="flex justify-between items-end text-main-text">
          <span className="font-bold text-main-text/90">필요한 수익률</span>
          {loss >= 100 ? (
            <span className="text-[#ff4d4f] font-bold text-[16px]">상장폐지 (회복 불가)</span>
          ) : (
            <span className="text-[#ff4d4f] font-bold text-[28px]">+{requiredGain.toFixed(2)}<span className="text-[18px]"> %</span></span>
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 3. 🪙 원금 배수 계산기
// ----------------------------------------------------
export const ReturnMultipleCalculator: React.FC = () => {
  const [rate, setRate] = useState('');
  const [isPositive, setIsPositive] = useState(true);
  
  const addRate = (amount: number) => setRate(String(parseNum(rate) + amount));
  const rawValue = parseNum(rate);
  const actualPercentage = isPositive ? rawValue : -rawValue;
  const multiplier = 1 + (actualPercentage / 100);

  return (
    <div className="bg-main-bg p-[24px] rounded-[16px] border border-border-color flex flex-col h-full transition-colors duration-300 w-full">
      <div className="mb-[20px]">
        <h3 className="text-[#b37feb] font-bold text-[18px] m-0 mb-[8px]">🪙 원금 배수 계산기</h3>
        <p className="text-main-text/60 text-[13px] m-0 leading-relaxed">수익률이 높아질수록 원금의 몇 배가 되는지 직관적으로 파악할 때 사용하는 계산기입니다.</p>
      </div>

      <div className="mb-[15px]">
        <label className="block text-[12px] text-main-text/80 mb-[5px]">수익률/손실률 입력</label>
        <div className="flex items-center gap-[10px]">
          <button 
            onClick={() => setIsPositive(!isPositive)} 
            className={`w-[40px] h-[40px] flex-shrink-0 rounded-[8px] font-bold text-[18px] transition-colors flex items-center justify-center ${isPositive ? 'bg-[#b37feb]/20 text-[#b37feb]' : 'bg-[#ff4d4f]/20 text-[#ff4d4f]'}`}
          >
            {isPositive ? '+' : '-'}
          </button>
          <div className="flex-1">
            <ClearableInput 
              value={rate} 
              onChange={(val) => setRate(val.replace(/[^0-9.]/g, ''))} 
              suffix="%" 
              focusColorClass="focus-within:border-[#b37feb]" 
              placeholder="0.0" 
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-[8px] flex-wrap mb-[20px] pl-[50px]">
        <button onClick={() => addRate(10)} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#b37feb] hover:text-[#b37feb] text-[12px] transition-colors">+10%</button>
        <button onClick={() => addRate(50)} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#b37feb] hover:text-[#b37feb] text-[12px] transition-colors">+50%</button>
        <button onClick={() => addRate(100)} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#b37feb] hover:text-[#b37feb] text-[12px] transition-colors">+100%</button>
      </div>

      <div className="mt-auto pt-[20px] border-t border-border-color">
        <p className="text-main-text/60 text-[13px] m-0 mb-[5px]">내 투자금은 현재</p>
        <div className="flex justify-between items-end text-main-text">
          <span className="font-bold text-main-text/90">원금 대비</span>
          <span className="text-[#b37feb] font-bold text-[28px]">{multiplier.toFixed(2)}<span className="text-[18px]"> 배</span></span>
        </div>
      </div>
    </div>
  );
};