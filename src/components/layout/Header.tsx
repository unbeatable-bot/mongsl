import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SideMenu from './SideMenu'; // ✨ 새로 만든 사이드 메뉴 임포트

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // ✨ 사이드 메뉴 열림 상태 관리

  return (
    <>
      <div className="relative flex justify-between items-center py-[15px] px-[20px] text-[#ecf0f1] shadow-[0_2px_4px_rgba(0,0,0,0.1)] border-b border-[#34495e] mb-[15px] shrink-0">
        <h1 
          className="m-0 text-[2.2em] max-md:text-[1.5em] font-bold flex items-baseline text-white text-center shrink-0 cursor-pointer transition-opacity duration-200 hover:opacity-80"
          onClick={() => navigate('/')}
          title="홈으로 이동"
        >
          MongTool <span className="text-[0.5em] font-normal ml-[10px] text-[#bdc3c7]">Crop & Compile</span>
        </h1>
        
        <button 
          className="bg-transparent border-none p-[8px] cursor-pointer outline-none flex items-center justify-center transition-opacity duration-200 hover:opacity-70"
          onClick={() => setIsMenuOpen(true)} // ✨ 클릭 시 사이드 메뉴 열기
          aria-label="메뉴 열기"
        >
          <Menu color="white" size={28} strokeWidth={2} />
        </button>
      </div>

      {/* ✨ 메뉴 상태가 true일 때 사이드 메뉴 렌더링 */}
      {isMenuOpen && <SideMenu onClose={() => setIsMenuOpen(false)} />}
    </>
  );
};

export default Header;