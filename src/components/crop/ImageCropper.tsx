import React from 'react';
import { ReactCrop, type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface Props {
  imageUrl?: string; 
  crop?: Crop; 
  aspect?: number;
  onChange: (c: Crop) => void; 
  onComplete: (c: Crop) => void; 
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  imgRef: React.RefObject<HTMLImageElement | null>; 
  brightness: number; 
  contrast: number; 
  grayscale: number;
}

const ImageCropper: React.FC<Props> = ({ imageUrl, crop, aspect, onChange, onComplete, onImageLoad, imgRef, brightness, contrast, grayscale }) => {
  return (
    // ✨ 작업 영역 배경을 bg-main-bg로 교체
    <div className="flex-1 flex justify-center items-center border border-border-color rounded-[8px] overflow-hidden min-w-0 bg-main-bg transition-colors duration-300 max-md:order-1 max-md:w-full max-md:min-h-[350px] max-md:ml-0 [&_.ReactCrop]:!max-w-full [&_.ReactCrop]:!max-h-full [&_.ReactCrop]:w-full [&_.ReactCrop]:h-full [&_.ReactCrop]:flex [&_.ReactCrop]:justify-center [&_.ReactCrop]:items-center [&_.ReactCrop>div]:!max-w-full [&_.ReactCrop>div]:!max-h-full [&_.ReactCrop>div]:w-full [&_.ReactCrop>div]:h-full [&_.ReactCrop>div]:flex [&_.ReactCrop>div]:justify-center [&_.ReactCrop>div]:items-center [&_img]:!max-w-full [&_img]:!max-h-full [&_img]:object-contain [&_.ReactCrop__crop-selection]:shadow-[0_0_0_9999em_rgba(0,0,0,0.5)]">
      
      {imageUrl ? (
        <ReactCrop crop={crop} onChange={onChange} onComplete={onComplete} aspect={aspect} ruleOfThirds>
          <img ref={imgRef} src={imageUrl} alt="Selected for cropping" onLoad={onImageLoad} style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%)` }} />
        </ReactCrop>
      ) : (
        <div className="flex flex-col items-center justify-center text-main-text/60 p-[20px] text-center w-full h-full">
          <p className="m-0 text-[15px] text-main-text/80">우측의 <strong className="text-[#0d6efd]">이미지 업로드</strong> 버튼을 눌러</p>
          <p className="m-[5px_0_0_0] text-[14px]">작업할 이미지를 추가해 주세요.</p>
        </div>
      )}
    </div>
  );
};

export default ImageCropper;