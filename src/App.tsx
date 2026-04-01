import { useState, useEffect, useRef } from 'react';
import { ReactCrop, type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { saveAs } from 'file-saver';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import InfoPage from './pages/InfoPage';
import PrivacyPolicyModal from './pages/PrivacyPolicyModal';

interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  originalWidth?: number;
  originalHeight?: number;
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

        canvas.width = cropWidth;
        canvas.height = cropHeight;

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
      
      {selectedImage && (
        <div className="aspect-ratio-bar">
          <span className="aspect-label">크롭 비율:</span>
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
      )}

      <div className="main-content">
        <div className="thumbnail-wrapper">
          <div className="thumbnail-list">
            {images.map(image => (
              <img 
                key={image.id} 
                src={image.previewUrl} 
                alt="thumbnail" 
                className={selectedImage?.id === image.id ? 'active' : ''} 
                onClick={() => setSelectedImage(image)} 
              />
            ))}
          </div>
        </div>

        <div className="cropper-container">
          {selectedImage && (
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              onComplete={c => setCompletedCrop(c)}
              aspect={aspect}
              ruleOfThirds
            >
              <img ref={imgRef} src={selectedImage.previewUrl} alt="Selected for cropping" onLoad={onImageLoad} />
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