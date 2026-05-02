import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#121212] flex flex-col animate-[fadeIn_0.2s_ease-out]">
      <div className="p-[20px] flex justify-center items-center border-b border-[#333]">
        <h1 className="m-0 text-[2.2em] font-bold flex items-baseline text-white text-center">
          MongTool <span className="text-[0.5em] font-normal ml-[10px] text-[#bdc3c7]">Hub</span>
        </h1>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-[30px]">
        <button onClick={() => navigate('/crop')} className="text-[2em] font-bold text-white bg-transparent border-none cursor-pointer hover:text-[#0d6efd] transition-colors">CROP & COMPILE</button>
        <button onClick={() => navigate('/calculator')} className="text-[2em] font-bold text-white bg-transparent border-none cursor-pointer hover:text-[#0d6efd] transition-colors">계산기</button>
        <button onClick={() => navigate('/portfolio')} className="text-[2em] font-bold text-white bg-transparent border-none cursor-pointer hover:text-[#0d6efd] transition-colors">포트폴리오</button>
      </div>
    </div>
  );
};

export default HomePage;