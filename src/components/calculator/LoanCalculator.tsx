import React, { useState } from 'react';
import ClearableInput from '../common/ClearableInput';

const formatComma = (val: string | number) => {
  const str = String(val).replace(/,/g, '');
  return isNaN(Number(str)) ? '' : Number(str).toLocaleString('ko-KR');
};
const parseNum = (val: string) => Number(val.replace(/,/g, '')) || 0;

const LoanCalculator: React.FC = () => {
  const [loanPrincipal, setLoanPrincipal] = useState('');
  const [loanRate, setLoanRate] = useState('');
  const [loanYears, setLoanYears] = useState('');
  
  const [passedMonths, setPassedMonths] = useState('');
  const [prepayAmount, setPrepayAmount] = useState('');

  const addRate = (amt: number) => setLoanRate(String(parseNum(loanRate) + amt));
  const addYears = (amt: number) => setLoanYears(String(parseNum(loanYears) + amt));

  const p = parseNum(loanPrincipal); const rate = parseNum(loanRate); const y = parseNum(loanYears);
  const m = parseNum(passedMonths); const e = parseNum(prepayAmount);

  const n = y * 12;
  const r = (rate / 100) / 12;
  const pmt = r > 0 ? p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : (n > 0 ? p / n : 0);
  const totalPay = pmt * n;
  const totalInt = totalPay - p;

  let prepayResult = null;
  if (p > 0 && n > 0 && m > 0 && m < n && e > 0) {
    const balM = r > 0 ? pmt * (1 - Math.pow(1 + r, -(n - m))) / r : p - (pmt * m);
    const actualE = e > balM ? balM : e;
    const newBal = balM - actualE;
    const nRem = n - m;

    const newPmt = newBal <= 0 ? 0 : (r > 0 ? newBal * (r * Math.pow(1 + r, nRem)) / (Math.pow(1 + r, nRem) - 1) : newBal / nRem);
    const savedInt = ((pmt * nRem) - balM) - ((newPmt * nRem) - newBal);
    
    prepayResult = { balM, newBal, newPmt, diffPmt: pmt - newPmt, savedInt, totalReduced: actualE + savedInt };
  }

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-[20px] items-stretch">
      {/* 위젯 1: 대출 이자 계산 */}
      {/* ✨ 배경 및 테두리 테마 적용 */}
      <div className="bg-main-bg p-[24px] rounded-[16px] border border-border-color flex flex-col h-full hover:border-[#444] transition-colors duration-300 w-full">
        <div className="mb-[20px]">
          <h3 className="text-[#ff4d4f] font-bold text-[18px] m-0 mb-[8px]">🏦 대출 이자 계산기 (원리금 균등)</h3>
          <p className="text-main-text/60 text-[13px] m-0 leading-relaxed">초기 대출 시 발생하는 월 상환액과 총 납입 이자를 계산합니다.</p>
        </div>

        <div className="mb-[15px]">
          <label className="block text-[12px] text-main-text/80 mb-[5px]">대출 원금 (원)</label>
          <ClearableInput value={loanPrincipal} onChange={(val) => setLoanPrincipal(formatComma(val.replace(/[^0-9]/g, '')))} focusColorClass="focus-within:border-[#ff4d4f]" />
        </div>
        <div className="flex gap-[8px] flex-wrap mb-[20px]">
          <button onClick={() => setLoanPrincipal(formatComma(parseNum(loanPrincipal) + 10000000))} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#ff4d4f] hover:text-[#ff4d4f] text-[12px] transition-colors">+1000만</button>
          <button onClick={() => setLoanPrincipal(formatComma(parseNum(loanPrincipal) + 50000000))} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#ff4d4f] hover:text-[#ff4d4f] text-[12px] transition-colors">+5000만</button>
          <button onClick={() => setLoanPrincipal(formatComma(parseNum(loanPrincipal) + 100000000))} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#ff4d4f] hover:text-[#ff4d4f] text-[12px] transition-colors">+1억</button>
        </div>

        <div className="grid grid-cols-2 gap-[15px] mb-[20px]">
          <div>
            <label className="block text-[12px] text-main-text/80 mb-[5px]">연 이자율 (%)</label>
            <ClearableInput value={loanRate} onChange={(val) => setLoanRate(val.replace(/[^0-9.]/g, ''))} focusColorClass="focus-within:border-[#ff4d4f]" fontSizeClass="text-[20px]" />
            <div className="flex gap-[5px] mt-[10px]">
              <button onClick={() => addRate(0.5)} className="px-[10px] py-[4px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#ff4d4f] hover:text-[#ff4d4f] text-[11px] transition-colors">+0.5%</button>
              <button onClick={() => addRate(1)} className="px-[10px] py-[4px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#ff4d4f] hover:text-[#ff4d4f] text-[11px] transition-colors">+1%</button>
            </div>
          </div>
          <div>
            <label className="block text-[12px] text-main-text/80 mb-[5px]">대출 기간 (년)</label>
            <ClearableInput value={loanYears} onChange={(val) => setLoanYears(val.replace(/[^0-9]/g, ''))} focusColorClass="focus-within:border-[#ff4d4f]" fontSizeClass="text-[20px]" />
            <div className="flex gap-[5px] mt-[10px] flex-wrap">
              <button onClick={() => addYears(10)} className="px-[10px] py-[4px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#ff4d4f] hover:text-[#ff4d4f] text-[11px] transition-colors">+10년</button>
              <button onClick={() => addYears(20)} className="px-[10px] py-[4px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#ff4d4f] hover:text-[#ff4d4f] text-[11px] transition-colors">+20년</button>
              <button onClick={() => addYears(30)} className="px-[10px] py-[4px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#ff4d4f] hover:text-[#ff4d4f] text-[11px] transition-colors">+30년</button>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-[20px] border-t border-border-color flex flex-col gap-[8px]">
          <div className="flex justify-between items-end text-main-text">
            <span className="text-main-text/60 text-[13px]">총 납입 이자 / 총 상환액</span>
            <span className="text-main-text/90 font-bold text-[14px]">+{formatComma(totalInt.toFixed(0))} 원 / {formatComma(totalPay.toFixed(0))} 원</span>
          </div>
          <div className="flex justify-between items-end text-main-text mt-[5px]">
            <span className="font-bold text-main-text text-[16px]">월 상환액 (원금+이자)</span>
            <span className="text-[#ff4d4f] font-bold text-[28px]">{formatComma(pmt.toFixed(0))} <span className="text-[18px]">원</span></span>
          </div>
        </div>
      </div>

      {/* 위젯 2: 중도상환 시뮬레이션 */}
      {/* ✨ 배경 및 테두리 테마 적용 */}
      <div className="bg-main-bg p-[24px] rounded-[16px] border border-border-color flex flex-col h-full hover:border-[#444] transition-colors duration-300 w-full">
        <div className="mb-[20px]">
          <h3 className="text-[#faad14] font-bold text-[18px] m-0 mb-[8px]">💡 중도상환 시뮬레이션</h3>
          <p className="text-main-text/60 text-[13px] m-0 leading-relaxed">목돈이 생겨 대출 원금을 중간에 갚았을 때, 이자가 얼마나 줄어드는지 확인하세요.</p>
        </div>

        <div className="grid grid-cols-2 gap-[15px] mb-[15px] mt-[10px]">
          <div>
            <label className="block text-[12px] text-main-text/80 mb-[5px]">납입 경과 (개월)</label>
            <ClearableInput value={passedMonths} onChange={(val) => setPassedMonths(val.replace(/[^0-9]/g, ''))} focusColorClass="focus-within:border-[#faad14]" fontSizeClass="text-[20px]" />
          </div>
          <div>
            <label className="block text-[12px] text-main-text/80 mb-[5px]">중도상환금 (원)</label>
            <ClearableInput value={prepayAmount} onChange={(val) => setPrepayAmount(formatComma(val.replace(/[^0-9]/g, '')))} focusColorClass="focus-within:border-[#faad14]" fontSizeClass="text-[20px]" />
          </div>
        </div>
        <div className="flex gap-[8px] flex-wrap mb-[20px]">
          <button onClick={() => setPrepayAmount(formatComma(parseNum(prepayAmount) + 1000000))} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#faad14] hover:text-[#faad14] text-[12px] transition-colors">+100만</button>
          <button onClick={() => setPrepayAmount(formatComma(parseNum(prepayAmount) + 10000000))} className="px-[14px] py-[6px] rounded-full bg-sub-bg border border-border-color text-main-text/80 hover:border-[#faad14] hover:text-[#faad14] text-[12px] transition-colors">+1000만</button>
        </div>

        <div className="mt-auto pt-[20px] border-t border-border-color flex flex-col gap-[8px]">
          {prepayResult ? (
            <>
              <div className="flex justify-between items-end text-main-text">
                <span className="text-main-text/60 text-[13px]">새로운 월 상환액 (기존대비 차이)</span>
                <span className="text-main-text/90 font-bold text-[14px]">{formatComma(prepayResult.newPmt.toFixed(0))} 원 <span className="text-[#faad14]">(-{formatComma(prepayResult.diffPmt.toFixed(0))}원)</span></span>
              </div>
              <div className="flex justify-between items-end text-main-text mt-[5px]">
                <span className="font-bold text-main-text text-[16px]">순수하게 절약된 이자</span>
                <span className="text-[#faad14] font-bold text-[28px]">{formatComma(prepayResult.savedInt.toFixed(0))} <span className="text-[18px]">원</span></span>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-full">
              <span className="text-main-text/50 text-[14px]">좌측의 초기 대출 정보와 상환 정보를 모두 입력해주세요.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;