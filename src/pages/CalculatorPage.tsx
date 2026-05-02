import React from 'react';
import Header from '../components/layout/Header';

const CalculatorPage: React.FC = () => {
  return (
    <div className="w-full h-full mx-auto bg-[#1e1e1e] border border-[#333] p-[20px] rounded-[8px] flex flex-col max-md:h-auto max-md:min-h-[100dvh]">
      <Header />
      <div className="flex-1 flex justify-center items-center text-white text-2xl">
        계산기 기능 준비 중입니다... 🧮
      </div>
    </div>
  );
};

export default CalculatorPage;