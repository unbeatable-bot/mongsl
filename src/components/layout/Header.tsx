import React, { useState } from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SideMenu from './SideMenu';
import { useTheme } from '../../contexts/ThemeContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      {/* ✨ 헤더 테두리 색상 및 텍스트 색상을 테마에 맞게 교체 */}
      <div className="relative flex justify-between items-center py-[15px] px-[20px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] border-b border-border-color mb-[15px] shrink-0 transition-colors duration-300">
        <h1 
          className="m-0 text-[2.2em] max-md:text-[1.5em] font-bold flex items-baseline text-main-text text-center shrink-0 cursor-pointer transition-opacity duration-200 hover:opacity-80"
          onClick={() => navigate('/')}
          title="홈으로 이동"
        >
          MongTool <span className="text-[0.5em] font-normal ml-[10px] text-main-text/60">Hub</span>
        </h1>
        
        {/* 상단 버튼 영역 */}
        <div className="flex justify-end items-center gap-[8px]">
          {/* 테마 토글 버튼 */}
          <button 
            onClick={toggleTheme}
            className="text-main-text/80 bg-transparent border-none p-[8px] cursor-pointer hover:text-main-text transition-colors"
            title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          
          <button 
            className="bg-transparent border-none p-[8px] cursor-pointer outline-none flex items-center justify-center transition-opacity duration-200 hover:opacity-70 text-main-text"
            onClick={() => setIsMenuOpen(true)}
            aria-label="메뉴 열기"
          >
            <Menu size={28} strokeWidth={2} /> {/* ✨ currentColor를 따라가도록 color prop 제거 */}
          </button>
        </div>
      </div>
        
      {isMenuOpen && <SideMenu onClose={() => setIsMenuOpen(false)} />}
    </>
  );
};

export default Header;