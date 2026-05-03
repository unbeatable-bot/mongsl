import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Header from '../components/layout/Header';

// 💡 분리해둔 데이터 목록을 불러옵니다.
import { INFO_LIST } from '../data/info';

const InfoPage: React.FC = () => {
  // INFO_LIST가 비어있을 경우를 대비한 안전 처리
  const initialId = INFO_LIST.length > 0 ? INFO_LIST[0].id : '';
  const [activeId, setActiveId] = useState<string>(initialId);

  const activeInfo = INFO_LIST.find((item) => item.id === activeId);

  return (
    <div className="w-full h-full mx-auto bg-main-bg border border-border-color p-[20px] rounded-[8px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex flex-col box-border max-md:h-auto max-md:min-h-[100dvh] max-md:overflow-y-auto transition-colors duration-300">
      
      <Header />

      <div className="flex-1 flex flex-col md:flex-row gap-[20px] items-stretch mt-[15px] overflow-hidden min-h-0 relative max-md:h-auto">
        
        {/* 🟢 좌측 메인 영역: 마크다운 컨텐츠 렌더링 */}
        <div className="flex-1 bg-main-bg p-[30px] max-md:p-[20px] rounded-[16px] border border-border-color overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:bg-border-color [&::-webkit-scrollbar-thumb]:rounded-[4px]">
        {activeInfo ? (
            /* 
            prose-slate: 기본 회색톤 테마
            dark:prose-invert: 다크모드일 때만 색상 반전
            prose-headings:text-current: 제목 색상을 부모 색상(main-text)에 맞춤
            */
            <div className="prose prose-slate dark:prose-invert max-w-none text-main-text
            prose-headings:text-main-text prose-headings:border-b prose-headings:border-border-color prose-headings:pb-2
            prose-table:border prose-table:border-border-color
            prose-th:bg-sub-bg prose-th:text-main-text
            prose-td:text-main-text/80">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {activeInfo.content}
            </ReactMarkdown>
            </div>
        ) : (
            <div className="h-full flex items-center justify-center text-main-text/50">
            등록된 정보가 없습니다.
            </div>
        )}
        </div>

        {/* 🔴 우측 사이드 탭 영역: 제목 리스트 */}
        <div className="w-full md:w-[260px] shrink-0 flex flex-col bg-main-bg border border-border-color rounded-[16px] p-[15px] max-md:order-first transition-colors duration-300">
          <h3 className="text-main-text font-bold text-[16px] m-0 mb-[15px] px-[5px]">📚 정보 목록</h3>
          
          <div className="flex-1 overflow-y-auto flex flex-col gap-[8px] pr-[5px] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-border-color hover:[&::-webkit-scrollbar-thumb]:bg-main-text/30 [&::-webkit-scrollbar-thumb]:rounded-[4px]">
            {INFO_LIST.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`text-left w-full px-[16px] py-[14px] rounded-[10px] cursor-pointer transition-all border ${
                  activeId === item.id
                    ? 'bg-main-text text-main-bg font-bold shadow-md border-transparent'
                    : 'bg-sub-bg text-main-text/80 border-border-color hover:border-main-text/50'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default InfoPage;