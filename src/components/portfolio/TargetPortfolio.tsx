import React, { useState, useEffect, useRef } from 'react';
import DonutChart, { type PieChartData } from './DonutChart';
import ClearableInput from '../common/ClearableInput';

interface Asset {
  id: string;
  name: string;
  amount: number; // 비중 (%)
  color: string;
}

type PortfolioMap = Record<string, Asset[]>;

const PRESET_COLORS = ['#F7931A', '#0d6efd', '#20c997', '#ff4d4f', '#b37feb', '#faad14', '#36cfc9', '#eb2f96'];

const TargetPortfolio: React.FC = () => {
  // 상태 관리: 로컬 스토리지에서 초기값 불러오기
  const [portfolios, setPortfolios] = useState<PortfolioMap>(() => {
    const saved = localStorage.getItem('mongtool_target_portfolios');
    return saved ? JSON.parse(saved) : {};
  });
  const [activeTab, setActiveTab] = useState<string>('');
  
  // 모달 상태
  const [isAddPortModalOpen, setIsAddPortModalOpen] = useState(false);
  const [newPortName, setNewPortName] = useState('');
  
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetAmount, setNewAssetAmount] = useState('');
  const [newAssetColor, setNewAssetColor] = useState(PRESET_COLORS[0]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 로컬 스토리지 자동 저장
  useEffect(() => {
    localStorage.setItem('mongtool_target_portfolios', JSON.stringify(portfolios));
    const keys = Object.keys(portfolios);
    if (!activeTab && keys.length > 0) setActiveTab(keys[0]);
    if (activeTab && !keys.includes(activeTab) && keys.length > 0) setActiveTab(keys[0]);
  }, [portfolios, activeTab]);

  const activeAssets = portfolios[activeTab] || [];
  const totalAmount = activeAssets.reduce((sum, asset) => sum + asset.amount, 0);

  // --- 포트폴리오 관리 ---
  const handleAddPortfolio = () => {
    if (!newPortName.trim() || portfolios[newPortName]) return;
    setPortfolios(prev => ({ ...prev, [newPortName]: [] }));
    setActiveTab(newPortName);
    setIsAddPortModalOpen(false);
    setNewPortName('');
  };

  const handleDeletePortfolio = (name: string) => {
    if (!window.confirm(`'${name}' 포트폴리오를 정말 삭제하시겠습니까?`)) return;
    const updated = { ...portfolios };
    delete updated[name];
    setPortfolios(updated);
    if (activeTab === name) setActiveTab(Object.keys(updated)[0] || '');
  };

  // --- 자산 관리 ---
  const handleAddAsset = () => {
    const amountNum = parseFloat(newAssetAmount);
    if (!newAssetName.trim() || isNaN(amountNum) || amountNum <= 0) return;
    if (totalAmount + amountNum > 100) {
      alert(`총 비중은 100%를 초과할 수 없습니다. (입력 가능: ${100 - totalAmount}%)`);
      return;
    }
    
    const newAsset: Asset = { id: crypto.randomUUID(), name: newAssetName, amount: amountNum, color: newAssetColor };
    setPortfolios(prev => ({ ...prev, [activeTab]: [...prev[activeTab], newAsset] }));
    setIsAddAssetModalOpen(false);
    setNewAssetName(''); setNewAssetAmount(''); setNewAssetColor(PRESET_COLORS[0]);
  };

  const handleDeleteAsset = (id: string) => {
    setPortfolios(prev => ({ ...prev, [activeTab]: prev[activeTab].filter(a => a.id !== id) }));
  };

  // --- 백업 및 복원 ---
  const handleExportData = () => {
    const dataStr = JSON.stringify(portfolios, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `mongtool_portfolio_backup_${new Date().getTime()}.json`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        setPortfolios(importedData);
        alert('데이터가 성공적으로 복원되었습니다.');
      } catch (err) { alert('잘못된 백업 파일입니다.'); }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const chartData: PieChartData[] = activeAssets.map(a => ({ name: a.name, value: a.amount, color: a.color }));

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-[20px] items-stretch">
      
      {/* 🟢 좌측: 메인 컨텐츠 (차트 + 자산 리스트) */}
      <div className="flex-1 flex flex-col xl:flex-row gap-[20px] items-stretch min-w-0">
        {activeTab ? (
          <>
            {/* 차트 영역 */}
            <div className="bg-main-bg p-[24px] rounded-[16px] border border-border-color w-full xl:w-auto flex flex-col items-center justify-center min-w-[320px]">
              <DonutChart data={chartData} totalAmount={totalAmount} />
            </div>

            {/* 자산 리스트 영역 */}
            <div className="flex-1 bg-main-bg p-[24px] rounded-[16px] border border-border-color w-full flex flex-col min-h-[300px]">
              <div className="flex justify-between items-center mb-[20px]">
                <h3 className="text-main-text font-bold m-0 text-[18px]">{activeTab} 비중 상세</h3>
                <button onClick={() => setIsAddAssetModalOpen(true)} className="text-[#0d6efd] bg-[#0d6efd]/10 border-none px-[12px] py-[6px] rounded-[6px] text-[13px] font-bold cursor-pointer hover:bg-[#0d6efd]/20 transition-colors">+ 자산 추가</button>
              </div>

              <div className="flex-1 overflow-y-auto pr-[5px] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:bg-border-color hover:[&::-webkit-scrollbar-thumb]:bg-main-text/30 [&::-webkit-scrollbar-thumb]:rounded-[4px]">
                {activeAssets.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-main-text/50 text-[14px]">
                    자산을 추가하여 포트폴리오를 구성해보세요.
                  </div>
                ) : (
                  <div className="flex flex-col gap-[12px]">
                    {activeAssets.map(asset => (
                      <div key={asset.id} className="flex justify-between items-center p-[16px] bg-sub-bg rounded-[8px] border border-border-color transition-colors group">
                        <div className="flex items-center gap-[12px]">
                          <div className="w-[14px] h-[14px] rounded-full" style={{ backgroundColor: asset.color }}></div>
                          <span className="text-main-text font-bold text-[16px]">{asset.name}</span>
                        </div>
                        <div className="flex items-center gap-[15px]">
                          <span className="text-main-text font-bold text-[18px]">{asset.amount}%</span>
                          <button onClick={() => handleDeleteAsset(asset.id)} className="opacity-0 group-hover:opacity-100 bg-transparent border-none text-[#ff4d4f] cursor-pointer p-[4px] hover:bg-[#ff4d4f]/10 rounded transition-all">삭제</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-main-text/50 border border-dashed border-border-color rounded-[16px] min-h-[300px]">
            우측의 '+ 새 포트폴리오'를 눌러 포트폴리오를 만들어보세요.
          </div>
        )}
      </div>

      {/* 🔴 우측: 사이드바 (추가 버튼 -> 리스트 -> 백업/복원) */}
      <div className="w-full md:w-[240px] shrink-0 flex flex-col bg-main-bg border border-border-color rounded-[16px] p-[15px] max-md:order-last h-full max-md:min-h-[350px]">
        
        {/* 상단: 포트폴리오 추가 버튼 */}
        <button 
          onClick={() => setIsAddPortModalOpen(true)} 
          className="w-full py-[12px] bg-[#0d6efd]/10 text-[#0d6efd] border border-transparent font-bold rounded-[8px] hover:bg-[#0d6efd]/20 transition-colors mb-[15px] cursor-pointer"
        >
          + 새 포트폴리오
        </button>

        {/* 중간: 포트폴리오 리스트 (스크롤) */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-[10px] pr-[5px] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-border-color hover:[&::-webkit-scrollbar-thumb]:bg-main-text/30 [&::-webkit-scrollbar-thumb]:rounded-[4px]">
          {Object.keys(portfolios).map(portName => (
            <div 
              key={portName} 
              onClick={() => setActiveTab(portName)} 
              className={`flex justify-between items-center px-[16px] py-[12px] rounded-[10px] cursor-pointer transition-all ${
                activeTab === portName 
                  ? 'bg-main-text text-main-bg font-bold shadow-md' 
                  : 'bg-sub-bg text-main-text/80 border border-border-color hover:border-main-text/50'
              }`}
            >
              <span className="truncate flex-1">{portName}</span>
              {activeTab === portName && (
                <button onClick={(e) => { e.stopPropagation(); handleDeletePortfolio(portName); }} className="text-main-bg bg-transparent border-none p-0 cursor-pointer text-[14px] hover:text-[#ff4d4f] ml-[8px]">✕</button>
              )}
            </div>
          ))}
        </div>

        {/* 하단: 백업 및 복원 (항상 하단에 고정) */}
        <div className="mt-auto pt-[15px] border-t border-border-color flex flex-col gap-[8px]">
          <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportData} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="w-full bg-sub-bg border border-border-color text-main-text/80 py-[10px] rounded-[8px] text-[13px] hover:bg-border-color transition-colors font-bold cursor-pointer">
            데이터 복원
          </button>
          <button onClick={handleExportData} className="w-full bg-[#0d6efd] text-white py-[10px] rounded-[8px] text-[13px] border-none hover:bg-[#0b5ed7] transition-colors font-bold cursor-pointer">
            데이터 백업
          </button>
        </div>
      </div>

      {/* 포트폴리오 추가 모달 */}
      {isAddPortModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[3000] flex justify-center items-center backdrop-blur-sm px-[20px]">
          <div className="bg-main-bg w-full max-w-[400px] p-[24px] rounded-[16px] border border-border-color shadow-2xl flex flex-col gap-[20px]">
            <h3 className="text-main-text font-bold text-[18px] m-0">새 포트폴리오 추가</h3>
            <ClearableInput value={newPortName} onChange={setNewPortName} placeholder="포트폴리오 이름 (예: 미국 배당주)" fontSizeClass="text-[18px]" />
            <div className="flex gap-[10px] justify-end mt-[10px]">
              <button onClick={() => setIsAddPortModalOpen(false)} className="bg-sub-bg text-main-text/80 px-[16px] py-[8px] rounded-[8px] border-none cursor-pointer">취소</button>
              <button onClick={handleAddPortfolio} className="bg-[#0d6efd] text-white px-[16px] py-[8px] rounded-[8px] border-none font-bold cursor-pointer">만들기</button>
            </div>
          </div>
        </div>
      )}

      {/* 자산 추가 모달 */}
      {isAddAssetModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[3000] flex justify-center items-center backdrop-blur-sm px-[20px]">
          <div className="bg-main-bg w-full max-w-[400px] p-[24px] rounded-[16px] border border-border-color shadow-2xl flex flex-col gap-[20px]">
            <h3 className="text-main-text font-bold text-[18px] m-0">카테고리(자산) 추가</h3>
            <div>
              <label className="text-[12px] text-main-text/80 mb-[5px] block">자산 이름</label>
              <ClearableInput value={newAssetName} onChange={setNewAssetName} placeholder="예: S&P500" fontSizeClass="text-[18px]" />
            </div>
            <div>
              <label className="text-[12px] text-main-text/80 mb-[5px] block">비중 (%)</label>
              <ClearableInput value={newAssetAmount} onChange={(val) => setNewAssetAmount(val.replace(/[^0-9.]/g, ''))} placeholder="0" suffix="%" fontSizeClass="text-[18px]" />
            </div>
            <div>
              <label className="text-[12px] text-main-text/80 mb-[10px] block">색상 선택</label>
              <div className="flex gap-[10px] flex-wrap">
                {PRESET_COLORS.map(color => (
                  <button key={color} onClick={() => setNewAssetColor(color)} className={`w-[30px] h-[30px] rounded-full cursor-pointer transition-transform ${newAssetColor === color ? 'scale-125 ring-2 ring-offset-2 ring-offset-main-bg ring-[#0d6efd]' : 'hover:scale-110'}`} style={{ backgroundColor: color, border: 'none' }} />
                ))}
              </div>
            </div>
            <div className="flex gap-[10px] justify-end mt-[10px]">
              <button onClick={() => setIsAddAssetModalOpen(false)} className="bg-sub-bg text-main-text/80 px-[16px] py-[8px] rounded-[8px] border-none cursor-pointer">취소</button>
              <button onClick={handleAddAsset} className="bg-[#0d6efd] text-white px-[16px] py-[8px] rounded-[8px] border-none font-bold cursor-pointer">추가</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TargetPortfolio;