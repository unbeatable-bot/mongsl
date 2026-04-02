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
    zIndex: isDragging ? 10 : 1, // 드래그 중인 요소를 위로 띄움
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
      className={`thumbnail-img ${isActive ? 'active' : ''} ${isDragging ? 'is-dragging' : ''}`}
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
    <div className="container">
      <div className="header">
        <h1>MONGSL <span className="subtitle">Crop & Compile</span></h1>
      </div>
      
{/* ✨ 핵심 개선: 크롭 비율과 필터 컨트롤을 한 줄(가로 스크롤)로 통합 */}
      {selectedImage && (
        <div className="toolbar-container">
          {/* 1. 크롭 비율 영역 */}
          <div className="toolbar-section">
            <span className="toolbar-label">비율:</span>
            <div className="aspect-buttons">
              {ASPECT_RATIOS.map((ratio, idx) => (
                <button
                  key={idx}
                  className={`aspect-btn ${aspect === ratio.value ? 'active' : ''}`}
                  onClick={() => handleAspectChange(ratio.value)}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* 시각적 구분선 ( | ) */}
          <div className="toolbar-divider"></div>

          {/* 2. 필터 보정 영역 */}
          <div className="toolbar-section">
            <div className="filter-group">
              <span className="toolbar-label">밝기</span>
              <input type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} />
              <span className="filter-value">{brightness}%</span>
            </div>
            <div className="filter-group">
              <span className="toolbar-label">대비</span>
              <input type="range" min="50" max="150" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} />
              <span className="filter-value">{contrast}%</span>
            </div>
            <div className="filter-group checkbox">
              <label>
                <input type="checkbox" checked={grayscale === 100} onChange={(e) => setGrayscale(e.target.checked ? 100 : 0)} />
                흑백
              </label>
            </div>
            <button className="reset-filter-btn" onClick={() => { setBrightness(100); setContrast(100); setGrayscale(0); }}>
              초기화
            </button>
          </div>
        </div>
      )}

      <div className="main-content">
<div className="thumbnail-wrapper">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="thumbnail-list">
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

        <div className="cropper-container">
          {selectedImage && (
            <ReactCrop
              crop={crop}
              onChange={handleCropChange} // ✨ onChange에 JS 강제 제한 로직 추가
              onComplete={c => setCompletedCrop(c)}
              aspect={aspect}
              ruleOfThirds
            >
              <img 
                ref={imgRef} 
                src={selectedImage.previewUrl} 
                alt="Selected for cropping" 
                onLoad={onImageLoad}
                /* ✨ 추가: UI 실시간 미리보기를 위한 CSS 필터 적용 */
                style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%)` }}
              />
            </ReactCrop>
          )}
        </div>
        
        <div className="actions-bar side">
          <label htmlFor="file-upload" className="custom-file-upload">이미지 업로드 ({images.length}장)</label>
          <input id="file-upload" type="file" multiple accept="image/*" onChange={onFileChange} />
          
          <button onClick={handleResetCrop} className="reset-crop-button" disabled={!selectedImage || isProcessing}>
            크롭 영역 초기화
          </button>
          
          <button onClick={generatePreview} className="preview-button" disabled={images.length === 0 || !completedCrop || isProcessing}>
            결과 미리보기 👀
          </button>
          
          <div className="quality-selector-wrapper">
            <label htmlFor="quality-select">압축 품질 (용량)</label>
            <select 
              id="quality-select" 
              value={quality} 
              onChange={(e) => setQuality(Number(e.target.value))}
              disabled={isProcessing}
            >
              <option value={0.95}>고화질 (권장)</option>
              <option value={0.7}>보통 (용량 절약)</option>
              <option value={0.4}>저화질 (최대 압축)</option>
            </select>
          </div>
          
          <button onClick={() => handleProcessImages('pdf')} className="pdf-download-button" disabled={images.length === 0 || !completedCrop || isProcessing}>
            {isProcessing && processingType === 'pdf' ? '생성 중...' : 'PDF 다운로드'}
          </button>

          <button onClick={() => handleProcessImages('zip')} className="zip-download-button" disabled={images.length === 0 || !completedCrop || isProcessing}>
            {isProcessing && processingType === 'zip' ? '생성 중...' : '이미지(ZIP) 다운로드'}
          </button>
        </div>
      </div>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <strong>MONGSL</strong>
            <span>Image Crop & Compile Web Service</span>
          </div>
          <div className="footer-links">
            <a href="#" onClick={(e) => { e.preventDefault(); setIsInfoOpen(true); }}>사용 안내</a>
            <a href="mailto:contact@example.com">Contact Us</a>
            <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setIsPrivacyOpen(true); }}>개인정보처리방침</a>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} MONGSL. All rights reserved.
        </div>
      </footer>

      {isProcessing && (
        <div className="processing-overlay">
          <div className="spinner"></div>
          <p>
            {processingType === 'pdf' ? 'PDF를' : 
             processingType === 'zip' ? 'ZIP 파일을' : '미리보기를'} 생성 중입니다... 잠시만 기다려 주세요.
          </p>
        </div> 
      )}
      
      {isUploading && (
        <div className="processing-overlay">
          <div className="spinner"></div>
          <p>이미지 미리보기를 준비 중입니다...</p>
        </div>
      )}

      {isPreviewOpen && (
        <div className="preview-modal-overlay">
          <div className="preview-modal">
            <div className="preview-modal-header">
              <h2>PDF 페이지 미리보기 ({previewImages.length}장)</h2>
              <button onClick={() => setIsPreviewOpen(false)}>닫기 ✕</button>
            </div>
            <div className="preview-modal-content">
              {previewImages.map((src, idx) => (
                <div key={idx} className="preview-page">
                  <span className="page-number">{idx + 1}</span>
                  <img src={src} alt={`preview-${idx}`} />
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