import { useState, useEffect, useRef } from 'react';
import { ReactCrop, type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { saveAs } from 'file-saver';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import InfoPage from './pages/InfoPage';
import PrivacyPolicyModal from './pages/PrivacyPolicyModal';
// 기존 import 들 아래에 추가
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings } from 'lucide-react';

interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  originalWidth?: number;
  originalHeight?: number;
}

// MainAppContent 함수 바깥에 선언해 주세요.
interface SortableThumbnailProps {
  image: ImageFile;
  isActive: boolean;
  onClick: () => void;
}

function SortableThumbnail({ image, isActive, onClick }: SortableThumbnailProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <img
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      src={image.previewUrl}
      alt="thumbnail"
      // 기존 className="thumbnail-img ..." 를 아래처럼 변경
      className={`w-full h-auto max-md:w-auto max-md:h-full shrink-0 cursor-pointer border-2 rounded-[4px] object-cover transition-colors duration-300 ${
        isActive ? 'border-[#0d6efd]' : 'border-transparent'
      } ${
        isDragging ? 'opacity-40 scale-90 transition-all duration-200 ease-in-out' : ''
      }`}
      onClick={onClick}
    />
  );
}

const ASPECT_RATIOS = [
  { label: '자유형', value: undefined },
  { label: '1:1 (정방형)', value: 1 / 1 },
  { label: '16:9 (가로형)', value: 16 / 9 },
  { label: '3:4 (증명사진)', value: 3 / 4 },
  { label: 'A4 비율', value: 1 / 1.414 },
];

// ✨ 핵심 개선: 전체 컨테이너 여백(Offset)을 계산하여 '실제 이미지가 렌더링된 좌표'의 맨 위 중앙에 배치합니다.
const calculateMaxCrop = (
  imgWidth: number, 
  imgHeight: number, 
  containerWidth: number, 
  containerHeight: number, 
  currentAspect?: number
): Crop => {
  let cropWidth = imgWidth;
  let cropHeight = imgHeight;

  if (currentAspect) {
    if (imgWidth / currentAspect > imgHeight) {
      cropHeight = imgHeight;
      cropWidth = imgHeight * currentAspect;
    } else {
      cropWidth = imgWidth;
      cropHeight = imgWidth / currentAspect;
    }
  }

  // 1. 실제 이미지가 컨테이너 내부에서 시작되는 좌/상단 여백(Offset) 계산
  const imageStartX = (containerWidth - imgWidth) / 2;
  const imageStartY = (containerHeight - imgHeight) / 2;

  // 2. 가로(x): 이미지 시작점 + (이미지 남는 가로 폭 / 2) -> 가로 중앙
  const xOffsetWithinImage = (imgWidth - cropWidth) / 2;
  const x = imageStartX + xOffsetWithinImage;

  // 3. 세로(y): 실제 이미지가 시작되는 상단 Y좌표에 딱 붙임
  const y = imageStartY;

  return {
    unit: 'px',
    width: cropWidth,
    height: cropHeight,
    x: x,
    y: y
  };
};

function MainAppContent() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState<'pdf' | 'zip' | 'preview' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // ✨ 추가: 설정 메뉴 팝업 상태 및 Ref
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [quality, setQuality] = useState<number>(0.95);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // ✨ 추가: 이미지 보정 필터 상태 (기본값: 밝기 100%, 대비 100%, 흑백 0%)
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [grayscale, setGrayscale] = useState<number>(0);

  const workerRef = useRef<Worker | null>(null);
  
  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current.onmessage = (e) => {
      const { status, data, message, format } = e.data;
      if (status === 'success') {
        const mimeType = format === 'pdf' ? 'application/pdf' : 'application/zip';
        const timestamp = Date.now();
        const defaultFileName = `mongsl-${format}-${timestamp}.${format}`;
        const blob = new Blob([data as BlobPart], { type: mimeType });
        saveAs(blob, defaultFileName);
      } else {
        alert(`파일 생성 실패: ${message}`);
      }
      setIsProcessing(false);
      setProcessingType(null);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // ref가 가리키는 요소(settings-wrapper) 밖을 클릭했을 때만 닫음
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    // 메뉴가 열려있을 때만 이벤트 리스너 등록
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // 컴포넌트가 언마운트되거나 메뉴가 닫힐 때 리스너 제거 (메모리 누수 방지)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  // ✨ 통합된 센서 설정 (PC와 모바일을 완벽하게 구분하면서 통합 제어)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // PC: 마우스로 5px 이상 움직여야 드래그로 인식 (클릭과 구분)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 모바일: 250ms 동안 길게 눌러야 드래그 모드 진입 (스크롤과 구분!)
        tolerance: 5, // 누르는 동안 손가락이 5px 이상 미끄러지면 취소
      },
    })
  );

  // ✨ 단 하나의 드롭 이벤트 핸들러만 필요합니다
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // 다른 위치에 드롭되었을 때만 배열 순서 변경
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        // arrayMove가 기존 배열의 위치를 안전하게 스왑해 줍니다.
        return arrayMove(items, oldIndex, newIndex); 
      });
    }
  };

// ✨ 핵심 개선: 이동(Drag)과 크기 조절(Resize)을 구분하여 완벽하게 화면 이탈 방지
  const handleCropChange = (c: Crop) => {
    if (!imgRef.current) {
      setCrop(c);
      return;
    }
    
    const { width: imgWidth, height: imgHeight } = imgRef.current;
    const container = imgRef.current.parentElement?.parentElement;
    const containerWidth = container?.clientWidth || imgWidth;
    const containerHeight = container?.clientHeight || imgHeight;

    // 이미지가 떠있는 여백 위치
    const offsetX = (containerWidth - imgWidth) / 2;
    const offsetY = (containerHeight - imgHeight) / 2;

    let { x, y, width, height } = c;

    // 이전 상태의 크기와 비교하여 '단순 이동'인지 '크기 조절'인지 판단 (소수점 오차 방지)
    const isMoving = crop && Math.abs(crop.width - width) < 0.1 && Math.abs(crop.height - height) < 0.1;

    if (isMoving) {
      // 1. 단순 이동(Drag) 중일 때: 상자 크기는 유지하고 좌/우/상/하 좌표가 벽을 못 넘게 막음
      if (x < offsetX) x = offsetX; // 좌측 벽
      if (y < offsetY) y = offsetY; // 상단 벽
      if (x + width > offsetX + imgWidth) x = offsetX + imgWidth - width; // 우측 벽
      if (y + height > offsetY + imgHeight) y = offsetY + imgHeight - height; // 하단 벽
    } else {
      // 2. 크기 조절(Resize) 중일 때: 박스가 밖으로 나가는 만큼 너비와 높이를 깎아냄
      if (x < offsetX) {
        width -= (offsetX - x);
        x = offsetX;
      }
      if (y < offsetY) {
        height -= (offsetY - y);
        y = offsetY;
      }
      if (x + width > offsetX + imgWidth) {
        width = offsetX + imgWidth - x;
      }
      if (y + height > offsetY + imgHeight) {
        height = offsetY + imgHeight - y;
      }
      
      // 비율(Aspect Ratio) 프리셋이 적용된 상태라면, 찌그러지지 않게 다시 비율 강제 맞춤
      if (aspect) {
        if (width / aspect > height) {
          width = height * aspect;
        } else {
          height = width / aspect;
        }
      }
    }

    setCrop({ ...c, x, y, width, height });
  };

  // ✨ 크롭 영역 초기화 시
  const handleResetCrop = () => {
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;
    const container = imgRef.current.parentElement?.parentElement;
    const containerWidth = container?.clientWidth || width;
    const containerHeight = container?.clientHeight || height;
    
    const initialCrop = calculateMaxCrop(width, height, containerWidth, containerHeight, aspect);
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  };

  // ✨ 비율 변경 시
  const handleAspectChange = (newAspect: number | undefined) => {
    setAspect(newAspect);
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;
    const container = imgRef.current.parentElement?.parentElement;
    const containerWidth = container?.clientWidth || width;
    const containerHeight = container?.clientHeight || height;
    
    const newCrop = calculateMaxCrop(width, height, containerWidth, containerHeight, newAspect);
    setCrop(newCrop);
    setCompletedCrop(newCrop);
  };

  // ✨ 이미지 최초 로드 시
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const container = e.currentTarget.parentElement?.parentElement;
    const containerWidth = container?.clientWidth || width;
    const containerHeight = container?.clientHeight || height;
    
    const initialCrop = calculateMaxCrop(width, height, containerWidth, containerHeight, aspect);
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true); 
    const files = Array.from(e.target.files);

    Promise.all(files.map(file => {
      return new Promise<ImageFile>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
            resolve({
              id: self.crypto.randomUUID(),
              file,
              previewUrl: URL.createObjectURL(file),
              originalWidth: img.width,
              originalHeight: img.height,
            });
          };
          img.onerror = reject;
          img.src = reader.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    })).then(newImages => {
      setImages(newImages);
      if (newImages.length > 0) setSelectedImage(newImages[0]);
      setIsUploading(false); 
    }).catch(error => {
      console.error("파일 처리 중 오류 발생:", error);
      alert("이미지를 불러오는 데 실패했습니다.");
      setIsUploading(false);
    });
  };

  const handleProcessImages = async (format: 'pdf' | 'zip') => {
    if (!completedCrop || !imgRef.current || !selectedImage?.originalWidth) {
      alert("이미지를 업로드하고 크롭 영역을 선택해 주세요.");
      return;
    }
    setIsProcessing(true);
    setProcessingType(format);

    const imagePayloads = await Promise.all(
      images.map(async (img) => ({
        buffer: await img.file.arrayBuffer(),
        originalWidth: img.originalWidth,
        originalHeight: img.originalHeight,
        name: img.file.name, 
      }))
    );

    const imgElement = imgRef.current;
    const container = imgElement.parentElement?.parentElement;
    if (!container) {
      setIsProcessing(false);
      return;
    }

    const workerData = {
      format,
      images: imagePayloads,
      completedCrop,
      quality,
      filters: { brightness, contrast, grayscale }, // ✨ 추가: 필터 값 워커로 전달
      selectedImage: {
        originalWidth: selectedImage.originalWidth,
        originalHeight: selectedImage.originalHeight,
      },
      viewPort: {
        width: imgElement.width,
        height: imgElement.height,
        containerWidth: container.clientWidth,
        containerHeight: container.clientHeight,
      },
    };
    workerRef.current?.postMessage(workerData);
  };

  const generatePreview = async () => {
    if (!completedCrop || !imgRef.current || images.length === 0) {
      alert("이미지와 크롭 영역을 먼저 확인해주세요.");
      return;
    }
    setIsProcessing(true);
    setProcessingType('preview');
    
    try {
      const generatedPreviews: string[] = [];
      const { width: viewWidth, height: viewHeight } = imgRef.current;
      const container = imgRef.current.parentElement?.parentElement;
      const containerWidth = container?.clientWidth || viewWidth;
      const containerHeight = container?.clientHeight || viewHeight;
      
      const offsetX = (containerWidth - viewWidth) / 2;
      const offsetY = (containerHeight - viewHeight) / 2;

      const translatedX = completedCrop.x - offsetX;
      const translatedY = completedCrop.y - offsetY;

      const scaleX = completedCrop.width / viewWidth;
      const scaleY = completedCrop.height / viewHeight;
      const xPercent = translatedX / viewWidth;
      const yPercent = translatedY / viewHeight;

      for (const img of images) {
        const imageElement = new Image();
        imageElement.src = img.previewUrl;
        await new Promise((resolve) => { imageElement.onload = resolve; });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        const cropX = imageElement.width * xPercent;
        const cropY = imageElement.height * yPercent;
        const cropWidth = imageElement.width * scaleX;
        const cropHeight = imageElement.height * scaleY;

        // 1. 반드시 캔버스 크기를 먼저 설정합니다. (이때 ctx가 초기화됨)
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // ✨ 2. 크기 설정 "이후"이자 그리기 "직전"에 필터를 적용해야 정상 동작합니다!
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%)`;

        ctx.drawImage(
          imageElement,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );
        generatedPreviews.push(canvas.toDataURL('image/jpeg', 0.8));
      }
      setPreviewImages(generatedPreviews);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("미리보기 생성 실패", error);
      alert("미리보기를 생성하는 중 문제가 발생했습니다.");
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

  return (
    <div className="w-full h-full mx-auto bg-[#1e1e1e] border border-[#333] p-[20px] rounded-[8px] shadow-[0_4px_15px_rgba(0,0,0,0.4)] flex flex-col box-border max-md:h-auto max-md:min-h-[100dvh] max-md:overflow-y-auto">
{/* .header 역할 */}
      <div className="relative flex justify-between items-center py-[15px] px-[20px] text-[#ecf0f1] shadow-[0_2px_4px_rgba(0,0,0,0.1)] border-b border-[#34495e] mb-[15px]">
        {/* h1 및 .subtitle */}
        <h1 className="m-0 text-[2.2em] max-md:text-[1.5em] font-bold flex items-baseline text-white text-center shrink-0">
          MongTool <span className="text-[0.5em] font-normal ml-[10px] text-[#bdc3c7]">Crop & Compile</span>
        </h1>
        
        {/* .settings-wrapper 역할 */}
        <div className="relative" ref={settingsMenuRef}>
          {/* .settings-trigger 역할 */}
          <button 
            className="bg-transparent border-none p-[8px] cursor-pointer outline-none flex items-center justify-center transition-opacity duration-200 hover:opacity-70"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            aria-label="설정"
          >
            <Settings color="white" size={24} strokeWidth={2} />
          </button>

          {/* .settings-dropdown 역할 */}
          {isSettingsOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-max min-w-[180px] bg-[#1e1e1e] border border-[#333] rounded-[12px] shadow-[0_10px_25px_rgba(0,0,0,0.5)] z-[1000] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-[8px]">
                <nav className="flex flex-col gap-[4px]">
                  {/* .menu-item 역할 */}
                  <button className="flex items-center gap-[12px] py-[10px] px-[16px] text-[#ececec] text-[14px] border-none bg-transparent rounded-[8px] cursor-pointer text-left whitespace-nowrap transition-colors duration-200 hover:bg-[#333] w-full" onClick={() => { setIsSettingsOpen(false); setIsInfoOpen(true); }}>
                    <span className="text-[16px]">❓</span> 사용 안내
                  </button>
                  <a href="mailto:your-email@example.com" className="flex items-center gap-[12px] py-[10px] px-[16px] text-[#ececec] text-[14px] no-underline border-none bg-transparent rounded-[8px] cursor-pointer text-left whitespace-nowrap transition-colors duration-200 hover:bg-[#333]" onClick={() => setIsSettingsOpen(false)}>
                    <span className="text-[16px]">📧</span> Contact Us
                  </a>
                  <a href="https://github.com/unbeatable-bot/mongsl" target="_blank" rel="noreferrer" className="flex items-center gap-[12px] py-[10px] px-[16px] text-[#ececec] text-[14px] no-underline border-none bg-transparent rounded-[8px] cursor-pointer text-left whitespace-nowrap transition-colors duration-200 hover:bg-[#333]" onClick={() => setIsSettingsOpen(false)}>
                    <span className="text-[16px]">🐙</span> GitHub
                  </a>
                  <button className="flex items-center gap-[12px] py-[10px] px-[16px] text-[#ececec] text-[14px] border-none bg-transparent rounded-[8px] cursor-pointer text-left whitespace-nowrap transition-colors duration-200 hover:bg-[#333] w-full" onClick={() => { setIsSettingsOpen(false); setIsPrivacyOpen(true); }}>
                    <span className="text-[16px]">🛡️</span> 개인정보처리방침
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* ✨ 핵심 개선: 크롭 비율과 필터 컨트롤을 한 줄(가로 스크롤)로 통합 */}
{/* ✨ 핵심 개선: 크롭 비율과 필터 컨트롤을 한 줄(가로 스크롤)로 통합 */}
      {selectedImage && (
        // .toolbar-container 역할
        <div className="flex items-center bg-[#2a2a2a] py-[10px] px-[15px] rounded-[8px] mb-[15px] border border-[#444] overflow-x-auto whitespace-nowrap gap-[15px] shrink-0 [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#555] [&::-webkit-scrollbar-thumb]:rounded-[4px] hover:[&::-webkit-scrollbar-thumb]:bg-[#777]">
          
          {/* 1. 크롭 비율 영역 */}
          {/* .toolbar-section 역할 */}
          <div className="flex items-center gap-[10px]">
            {/* .toolbar-label 역할 */}
            <span className="text-[13px] font-bold text-[#bdc3c7]">비율:</span>
            {/* .aspect-buttons 역할 */}
            <div className="flex gap-[8px]">
              {ASPECT_RATIOS.map((ratio, idx) => (
                <button
                  key={idx}
                  // .aspect-btn 및 .aspect-btn.active 역할
                  className={`bg-[#333] text-white border border-[#555] py-[6px] px-[12px] rounded-[20px] text-[13px] cursor-pointer transition-all duration-200 ease hover:bg-[#444] ${
                    aspect === ratio.value ? '!bg-[#0d6efd] !border-[#0b5ed7] font-bold' : ''
                  }`}
                  onClick={() => handleAspectChange(ratio.value)}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* 시각적 구분선 ( | ) */}
          {/* .toolbar-divider 역할 */}
          <div className="w-[2px] h-[20px] bg-[#555] shrink-0 rounded-[2px]"></div>

          {/* 2. 필터 보정 영역 */}
          {/* .toolbar-section 역할 */}
          <div className="flex items-center gap-[10px]">
            {/* .filter-group 역할 */}
            <div className="flex items-center gap-[8px]">
              <span className="text-[13px] font-bold text-[#bdc3c7]">밝기</span>
              <input 
                type="range" min="50" max="150" value={brightness} 
                onChange={(e) => setBrightness(Number(e.target.value))} 
                className="w-[80px] cursor-pointer accent-[#0d6efd] m-0"
              />
              <span className="text-[12px] text-[#999] min-w-[35px] text-right">{brightness}%</span>
            </div>
            <div className="flex items-center gap-[8px]">
              <span className="text-[13px] font-bold text-[#bdc3c7]">대비</span>
              <input 
                type="range" min="50" max="150" value={contrast} 
                onChange={(e) => setContrast(Number(e.target.value))} 
                className="w-[80px] cursor-pointer accent-[#0d6efd] m-0"
              />
              <span className="text-[12px] text-[#999] min-w-[35px] text-right">{contrast}%</span>
            </div>
            <div className="flex items-center gap-[8px]">
              <label className="flex items-center gap-[5px] cursor-pointer text-[13px] text-[#bdc3c7] font-bold">
                <input 
                  type="checkbox" 
                  checked={grayscale === 100} 
                  onChange={(e) => setGrayscale(e.target.checked ? 100 : 0)} 
                  className="cursor-pointer w-[14px] h-[14px] m-0"
                />
                흑백
              </label>
            </div>
            {/* .reset-filter-btn 역할 */}
            <button 
              className="bg-[#444] text-white border border-[#666] py-[5px] px-[12px] rounded-[4px] text-[12px] cursor-pointer transition-colors duration-200 hover:bg-[#555]" 
              onClick={() => { setBrightness(100); setContrast(100); setGrayscale(0); }}
            >
              초기화
            </button>
          </div>
        </div>
      )}

      {/* .main-content 역할: 전체를 좌/우로 나누는 뼈대 */}
      <div className="flex-1 flex flex-row gap-[15px] overflow-visible min-h-0 relative max-md:flex-col max-md:gap-[10px] max-md:h-auto">
        {/* .thumbnail-wrapper 역할 */}
        <div className="w-[150px] h-full shrink-0 flex flex-col max-md:order-2 max-md:w-full max-md:h-auto max-md:static max-md:m-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {/* .thumbnail-list 역할 */}
            <div className="w-full h-full bg-[#2a2a2a] border border-[#444] rounded-[8px] p-[10px] overflow-y-auto flex flex-col gap-[10px] box-border max-md:flex-row max-md:h-[100px] max-md:overflow-x-auto max-md:overflow-y-hidden [&::-webkit-scrollbar]:w-[6px] max-md:[&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#555] [&::-webkit-scrollbar-thumb]:rounded-[4px] hover:[&::-webkit-scrollbar-thumb]:bg-[#777]">
              <SortableContext
                items={images.map(img => img.id)}
                strategy={horizontalListSortingStrategy}
              >
                {images.map(image => (
                  <SortableThumbnail
                    key={image.id}
                    image={image}
                    isActive={selectedImage?.id === image.id}
                    onClick={() => setSelectedImage(image)}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        </div>

        {/* .cropper-container 역할 */}
        <div className="flex-1 flex justify-center items-center border border-[#444] rounded-[8px] overflow-hidden min-w-0 bg-[#1a1a1a] max-md:order-1 max-md:w-full max-md:min-h-[350px] max-md:ml-0 [&_.ReactCrop]:!max-w-full [&_.ReactCrop]:!max-h-full [&_.ReactCrop]:w-full [&_.ReactCrop]:h-full [&_.ReactCrop]:flex [&_.ReactCrop]:justify-center [&_.ReactCrop]:items-center [&_.ReactCrop>div]:!max-w-full [&_.ReactCrop>div]:!max-h-full [&_.ReactCrop>div]:w-full [&_.ReactCrop>div]:h-full [&_.ReactCrop>div]:flex [&_.ReactCrop>div]:justify-center [&_.ReactCrop>div]:items-center [&_img]:!max-w-full [&_img]:!max-h-full [&_img]:object-contain [&_.ReactCrop__crop-selection]:shadow-[0_0_0_9999em_rgba(0,0,0,0.5)]">
          {selectedImage && (
            <ReactCrop
              crop={crop}
              onChange={handleCropChange}
              onComplete={c => setCompletedCrop(c)}
              aspect={aspect}
              ruleOfThirds
            >
              <img 
                ref={imgRef} 
                src={selectedImage.previewUrl} 
                alt="Selected for cropping" 
                onLoad={onImageLoad}
                style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%)` }}
              />
            </ReactCrop>
          )}
        </div>
        
        {/* .actions-bar.side 역할 */}
        <div className="flex flex-col items-stretch justify-start gap-[10px] ml-[15px] shrink-0 max-md:flex-row max-md:flex-wrap max-md:justify-between max-md:ml-0 max-md:w-full">
          
          {/* 버튼들은 공통 스타일을 가지며 bg/hover-bg 색상만 다릅니다 */}
          <label htmlFor="file-upload" className="bg-[#0d6efd] hover:bg-[#0b5ed7] hover:-translate-y-[1px] disabled:bg-[#444] disabled:text-[#888] disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 py-[8px] px-[15px] text-[14px] cursor-pointer text-white border-none rounded-[5px] transition-all duration-300 whitespace-nowrap shadow-[0_2px_5px_rgba(0,0,0,0.3)] text-center max-md:px-[10px] max-md:text-[12px] max-md:flex-1">
            이미지 업로드 ({images.length}장)
          </label>
          <input id="file-upload" type="file" multiple accept="image/*" onChange={onFileChange} className="hidden" />
          
          <button onClick={handleResetCrop} disabled={!selectedImage || isProcessing} className="bg-[#6c757d] hover:bg-[#5c636a] hover:-translate-y-[1px] disabled:bg-[#444] disabled:text-[#888] disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 py-[8px] px-[15px] text-[14px] cursor-pointer text-white border-none rounded-[5px] transition-all duration-300 whitespace-nowrap shadow-[0_2px_5px_rgba(0,0,0,0.3)] text-center max-md:px-[10px] max-md:text-[12px] max-md:flex-1">
            크롭 영역 초기화
          </button>
          
          <button onClick={generatePreview} disabled={images.length === 0 || !completedCrop || isProcessing} className="bg-[#f39c12] hover:bg-[#e67e22] hover:-translate-y-[1px] disabled:bg-[#444] disabled:text-[#888] disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 py-[8px] px-[15px] text-[14px] cursor-pointer text-white border-none rounded-[5px] transition-all duration-300 whitespace-nowrap shadow-[0_2px_5px_rgba(0,0,0,0.3)] text-center max-md:px-[10px] max-md:text-[12px] max-md:flex-1">
            결과 미리보기 👀
          </button>
          
          {/* 품질 선택기 영역 */}
          <div className="flex flex-col gap-[5px] bg-[#2a2a2a] p-[10px] rounded-[5px] border border-[#444] mt-[5px] max-md:w-full max-md:flex-[1_1_100%]">
            <label htmlFor="quality-select" className="text-[12px] text-[#bdc3c7]">압축 품질 (용량)</label>
            <select 
              id="quality-select" 
              value={quality} 
              onChange={(e) => setQuality(Number(e.target.value))}
              disabled={isProcessing}
              className="bg-[#1e1e1e] text-white border border-[#555] p-[6px] rounded-[4px] text-[13px] cursor-pointer"
            >
              <option value={0.95}>고화질 (권장)</option>
              <option value={0.7}>보통 (용량 절약)</option>
              <option value={0.4}>저화질 (최대 압축)</option>
            </select>
          </div>
          
          <button onClick={() => handleProcessImages('pdf')} disabled={images.length === 0 || !completedCrop || isProcessing} className="bg-[#198754] hover:bg-[#157347] hover:-translate-y-[1px] disabled:bg-[#444] disabled:text-[#888] disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 py-[8px] px-[15px] text-[14px] cursor-pointer text-white border-none rounded-[5px] transition-all duration-300 whitespace-nowrap shadow-[0_2px_5px_rgba(0,0,0,0.3)] text-center max-md:px-[10px] max-md:text-[12px] max-md:flex-1">
            {isProcessing && processingType === 'pdf' ? '생성 중...' : 'PDF 다운로드'}
          </button>

          <button onClick={() => handleProcessImages('zip')} disabled={images.length === 0 || !completedCrop || isProcessing} className="bg-[#dc3545] hover:bg-[#bb2d3b] hover:-translate-y-[1px] disabled:bg-[#444] disabled:text-[#888] disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 py-[8px] px-[15px] text-[14px] cursor-pointer text-white border-none rounded-[5px] transition-all duration-300 whitespace-nowrap shadow-[0_2px_5px_rgba(0,0,0,0.3)] text-center max-md:px-[10px] max-md:text-[12px] max-md:flex-1">
            {isProcessing && processingType === 'zip' ? '생성 중...' : '이미지(ZIP) 다운로드'}
          </button>

          <button onClick={() => setIsInfoOpen(true) } disabled={!selectedImage || isProcessing} className="bg-[#6c757d] hover:bg-[#5c636a] hover:-translate-y-[1px] disabled:bg-[#444] disabled:text-[#888] disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 py-[8px] px-[15px] text-[14px] cursor-pointer text-white border-none rounded-[5px] transition-all duration-300 whitespace-nowrap shadow-[0_2px_5px_rgba(0,0,0,0.3)] text-center max-md:px-[10px] max-md:text-[12px] max-md:flex-1 flex justify-center items-center gap-[4px]">
            <span className="text-[16px]">❓</span>사용 안내
          </button>
        </div>
      </div>

      {/* 처리 중 오버레이 (.processing-overlay) */}
      {isProcessing && (
        <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.7)] flex flex-col justify-center items-center text-white text-[1.2em] z-[1000] cursor-not-allowed">
          {/* .spinner */}
          <div className="border-[8px] border-[rgba(255,255,255,0.3)] border-t-white rounded-full w-[60px] h-[60px] animate-spin mb-[15px]"></div>
          <p>
            {processingType === 'pdf' ? 'PDF를' : 
             processingType === 'zip' ? 'ZIP 파일을' : '미리보기를'} 생성 중입니다... 잠시만 기다려 주세요.
          </p>
        </div> 
      )}
      
      {/* 업로드 중 오버레이 */}
      {isUploading && (
        <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.7)] flex flex-col justify-center items-center text-white text-[1.2em] z-[1000] cursor-not-allowed">
          <div className="border-[8px] border-[rgba(255,255,255,0.3)] border-t-white rounded-full w-[60px] h-[60px] animate-spin mb-[15px]"></div>
          <p>이미지 미리보기를 준비 중입니다...</p>
        </div>
      )}

      {/* 결과 미리보기 모달 (.preview-modal-overlay) */}
      {isPreviewOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.85)] flex justify-center items-center z-[2000] backdrop-blur-[5px]">
          <div className="bg-[#1e1e1e] w-[90%] max-w-[800px] h-[85vh] rounded-[12px] flex flex-col border border-[#444] shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="flex justify-between items-center py-[15px] px-[20px] bg-[#2a2a2a] border-b border-[#444]">
              <h2 className="m-0 text-[1.2rem] text-white">PDF 페이지 미리보기 ({previewImages.length}장)</h2>
              <button onClick={() => setIsPreviewOpen(false)} className="bg-transparent border-none text-[#bbb] text-[1.2rem] cursor-pointer transition-colors duration-200 hover:text-white">닫기 ✕</button>
            </div>
            <div className="flex-1 p-[20px] overflow-y-auto grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[20px] content-start max-md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
              {previewImages.map((src, idx) => (
                <div key={idx} className="relative bg-white rounded-[4px] p-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex justify-center items-center">
                  <span className="absolute top-[5px] left-[5px] bg-[rgba(0,0,0,0.6)] text-white text-[12px] py-[2px] px-[6px] rounded-[10px]">{idx + 1}</span>
                  <img src={src} alt={`preview-${idx}`} className="max-w-full max-h-[250px] object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isInfoOpen && <InfoPage onClose={() => setIsInfoOpen(false)} />}
      {isPrivacyOpen && <PrivacyPolicyModal onClose={() => setIsPrivacyOpen(false)} />}
    </div>
  );
}

function App() {
  const location = useLocation(); 
  useEffect(() => {
    if (location.pathname === '/') {
      document.body.style.overflow = 'auto'; 
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [location.pathname]);

  return (
      <Routes>
        <Route path="/" element={<MainAppContent />} /> 
      </Routes>
  );
}

function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default Root;