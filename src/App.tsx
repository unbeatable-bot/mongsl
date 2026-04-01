import { useState, useEffect, useRef } from 'react';
import { ReactCrop, type Crop, centerCrop } from 'react-image-crop';
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

function MainAppContent() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState<'pdf' | 'zip' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [showThumbnails, setShowThumbnails] = useState(true);
  // 팝업 띄우기 상태 추가
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false); // 개인정보 팝업 상태 추가

  const workerRef = useRef<Worker | null>(null);
  
  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current.onmessage = (e) => {
      const { status, data, message, format } = e.data;
      if (status === 'success') {
        const mimeType = format === 'pdf' ? 'application/pdf' : 'application/zip';
        
        // 현재 시간(밀리초) 가져오기
        const timestamp = Date.now();
        // format 변수가 'pdf' 또는 'zip'을 가지고 있으므로 이를 활용하여 동적 파일명 생성
        const defaultFileName = `mongsl-${format}-${timestamp}.${format}`;

        // TypeScript 타입 에러 해결: data를 BlobPart로 명시적 형변환
        const blob = new Blob([data as BlobPart], { type: mimeType });
        
        // 브라우저에서 직접 다운로드 실행
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

  // [추가] 크롭 영역 초기화 함수
  const handleResetCrop = () => {
    if (!imgRef.current) return;
    
    const { width: imgWidth, height: imgHeight } = imgRef.current;
    const container = imgRef.current.parentElement?.parentElement;
    if (!container) return;
    
    const { clientWidth: containerWidth, clientHeight: containerHeight } = container;

    // 초기 로드 시와 동일한 로직으로 중앙 크롭 영역 계산
    const initialCrop = centerCrop(
      { unit: 'px', width: imgWidth, height: imgHeight },
      containerWidth,
      containerHeight
    );
    
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

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width: imgWidth, height: imgHeight } = e.currentTarget;
    const container = imgRef.current?.parentElement?.parentElement;
    if (!container) return;
    const { clientWidth: containerWidth, clientHeight: containerHeight } = container;

    const initialCrop = centerCrop(
      { unit: 'px', width: imgWidth, height: imgHeight },
      containerWidth,
      containerHeight
    );
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
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

  return (
    <div className="container">
      <div className="header">
        <h1>
          MONGSL <span className="subtitle">Crop & Compile</span>
        </h1>
      </div>
      
      <div className="main-content">
        <div className={`thumbnail-wrapper ${showThumbnails ? '' : 'hidden'}`}>
          <div className="thumbnail-list">
            {images.map(image => (<img key={image.id} src={image.previewUrl} alt="thumbnail" className={selectedImage?.id === image.id ? 'active' : ''} onClick={() => setSelectedImage(image)} />))}
          </div>
        </div>
        
        <button className={`toggle-thumbnails-btn ${showThumbnails ? 'shown' : 'hidden'}`} onClick={() => setShowThumbnails(!showThumbnails)} title={showThumbnails ? "미리보기 숨기기" : "미리보기 보이기"}>{showThumbnails ? '◀' : '▶'}</button>

<div className="cropper-container">
          {selectedImage && (
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              onComplete={c => setCompletedCrop(c)}
              ruleOfThirds
            >
              <img ref={imgRef} src={selectedImage.previewUrl} alt="Selected for cropping" onLoad={onImageLoad} />
            </ReactCrop>
          )}
        </div>
        
        <div className="actions-bar side">
          <label htmlFor="file-upload" className="custom-file-upload">이미지 업로드 ({images.length}장)</label>
          <input id="file-upload" type="file" multiple accept="image/*" onChange={onFileChange} />
          
          {/* [추가] 크롭 초기화 버튼 - 업로드된 이미지가 있을 때만 노출 */}
          <button 
            onClick={handleResetCrop} 
            className="reset-crop-button"
            disabled={!selectedImage || isProcessing}
          >
            크롭 영역 초기화
          </button>
          
          <button 
            onClick={() => handleProcessImages('pdf')} 
            className="pdf-download-button" 
            disabled={images.length === 0 || !completedCrop || isProcessing}
          >
            {isProcessing && processingType === 'pdf' ? '생성 중...' : 'PDF 다운로드'}
          </button>

          <button 
            onClick={() => handleProcessImages('zip')} 
            className="zip-download-button"
            disabled={images.length === 0 || !completedCrop || isProcessing}
          >
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
      {/* ========================================================= */}

      {isProcessing && (
        <div className="processing-overlay">
          <div className="spinner"></div><p>{processingType === 'pdf' ? 'PDF를' : 'ZIP 파일을'} 생성 중입니다... 잠시만 기다려 주세요.</p>
        </div> )}
      
      {isUploading && (
        <div className="processing-overlay">
          <div className="spinner"></div>
          <p>이미지 미리보기를 준비 중입니다...</p>
        </div>
      )}
      {/* 추가: isInfoOpen 상태가 true일 때만 InfoPage 팝업 렌더링 */}
      {isInfoOpen && (
        <InfoPage onClose={() => setIsInfoOpen(false)} />
      )}
      {/* 새로 추가된 개인정보처리방침 팝업 */}
      {isPrivacyOpen && (
        <PrivacyPolicyModal onClose={() => setIsPrivacyOpen(false)} />
      )}
    </div>
  );
}

function App() {
  const location = useLocation(); 

  useEffect(() => {
    if (location.pathname === '/') {
      document.body.style.overflow = 'hidden';
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