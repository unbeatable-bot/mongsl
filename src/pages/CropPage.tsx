import React, { useState, useEffect, useRef } from 'react';
import { type Crop } from 'react-image-crop';
import { saveAs } from 'file-saver';

import Header from '../components/layout/Header';
import ProcessingOverlay from '../components/common/ProcessingOverlay';
import CropToolbar from '../components/crop/CropToolbar';
import ThumbnailList, { type ImageFile } from '../components/crop/ThumbnailList';
import ImageCropper from '../components/crop/ImageCropper';
import ActionSidebar from '../components/crop/ActionSidebar';
import PreviewModal from '../components/crop/PreviewModal';

const calculateMaxCrop = (imgWidth: number, imgHeight: number, containerWidth: number, containerHeight: number, currentAspect?: number): Crop => {
  let cropWidth = imgWidth; let cropHeight = imgHeight;
  if (currentAspect) {
    if (imgWidth / currentAspect > imgHeight) { cropHeight = imgHeight; cropWidth = imgHeight * currentAspect; } 
    else { cropWidth = imgWidth; cropHeight = imgWidth / currentAspect; }
  }
  const x = (containerWidth - imgWidth) / 2 + (imgWidth - cropWidth) / 2;
  const y = (containerHeight - imgHeight) / 2;
  return { unit: 'px', width: cropWidth, height: cropHeight, x, y };
};

const CropPage: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState<'pdf' | 'zip' | 'preview' | 'upload' | null>(null);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [quality, setQuality] = useState<number>(0.95);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [grayscale, setGrayscale] = useState<number>(0);

  const imgRef = useRef<HTMLImageElement>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (e) => {
      const { status, data, message, format } = e.data;
      if (status === 'success') {
        const mimeType = format === 'pdf' ? 'application/pdf' : 'application/zip';
        saveAs(new Blob([data as BlobPart], { type: mimeType }), `mongtool${format}-${Date.now()}.${format}`);
      } else alert(`파일 생성 실패: ${message}`);
      setIsProcessing(false); setProcessingType(null);
    };
    return () => workerRef.current?.terminate();
  }, []);

  const handleCropChange = (c: Crop) => {
    if (!imgRef.current) { setCrop(c); return; }
    const { width: imgWidth, height: imgHeight } = imgRef.current;
    const container = imgRef.current.parentElement?.parentElement;
    const offsetX = ((container?.clientWidth || imgWidth) - imgWidth) / 2;
    const offsetY = ((container?.clientHeight || imgHeight) - imgHeight) / 2;

    let { x, y, width, height } = c;
    if (crop && Math.abs(crop.width - width) < 0.1 && Math.abs(crop.height - height) < 0.1) {
      if (x < offsetX) x = offsetX; if (y < offsetY) y = offsetY;
      if (x + width > offsetX + imgWidth) x = offsetX + imgWidth - width;
      if (y + height > offsetY + imgHeight) y = offsetY + imgHeight - height;
    } else {
      if (x < offsetX) { width -= (offsetX - x); x = offsetX; }
      if (y < offsetY) { height -= (offsetY - y); y = offsetY; }
      if (x + width > offsetX + imgWidth) { width = offsetX + imgWidth - x; }
      if (y + height > offsetY + imgHeight) { height = offsetY + imgHeight - y; }
      if (aspect) { width / aspect > height ? width = height * aspect : height = width / aspect; }
    }
    setCrop({ ...c, x, y, width, height });
  };

  const handleResetCrop = (newAspect: number | undefined = aspect) => {
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;
    const container = imgRef.current.parentElement?.parentElement;
    const newCrop = calculateMaxCrop(width, height, container?.clientWidth || width, container?.clientHeight || height, newAspect);
    setCrop(newCrop); setCompletedCrop(newCrop);
  };

  const onImageLoad = (_e: React.SyntheticEvent<HTMLImageElement>) => handleResetCrop(aspect);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsProcessing(true); setProcessingType('upload');
    const files = Array.from(e.target.files);
    Promise.all(files.map(file => new Promise<ImageFile>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => resolve({ id: self.crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file), originalWidth: img.width, originalHeight: img.height });
        img.onerror = reject; img.src = reader.result as string;
      };
      reader.onerror = reject; reader.readAsDataURL(file);
    }))).then(newImages => {
      setImages(newImages); if (newImages.length > 0) setSelectedImage(newImages[0]);
    }).finally(() => { setIsProcessing(false); setProcessingType(null); });
  };

  const handleProcessImages = async (format: 'pdf' | 'zip') => {
    if (!completedCrop || !imgRef.current || !selectedImage?.originalWidth) return;
    setIsProcessing(true); setProcessingType(format);
    const container = imgRef.current.parentElement?.parentElement;
    const imagePayloads = await Promise.all(images.map(async (img) => ({ buffer: await img.file.arrayBuffer(), originalWidth: img.originalWidth, originalHeight: img.originalHeight, name: img.file.name })));
    
    workerRef.current?.postMessage({
      format, images: imagePayloads, completedCrop, quality, filters: { brightness, contrast, grayscale },
      selectedImage: { originalWidth: selectedImage.originalWidth, originalHeight: selectedImage.originalHeight },
      viewPort: { width: imgRef.current.width, height: imgRef.current.height, containerWidth: container?.clientWidth, containerHeight: container?.clientHeight },
    });
  };

  const generatePreview = async () => {
    if (!completedCrop || !imgRef.current || images.length === 0) return;
    setIsProcessing(true); setProcessingType('preview');
    try {
      const generatedPreviews: string[] = [];
      const { width: viewWidth, height: viewHeight } = imgRef.current;
      const container = imgRef.current.parentElement?.parentElement;
      const translatedX = completedCrop.x - (((container?.clientWidth || viewWidth) - viewWidth) / 2);
      const translatedY = completedCrop.y - (((container?.clientHeight || viewHeight) - viewHeight) / 2);

      for (const img of images) {
        const imageElement = new Image(); imageElement.src = img.previewUrl;
        await new Promise((resolve) => { imageElement.onload = resolve; });
        const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        const cw = imageElement.width * (completedCrop.width / viewWidth);
        const ch = imageElement.height * (completedCrop.height / viewHeight);
        canvas.width = cw; canvas.height = ch;
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%)`;
        ctx.drawImage(imageElement, imageElement.width * (translatedX / viewWidth), imageElement.height * (translatedY / viewHeight), cw, ch, 0, 0, cw, ch);
        generatedPreviews.push(canvas.toDataURL('image/jpeg', 0.8));
      }
      setPreviewImages(generatedPreviews); setIsPreviewOpen(true);
    } finally { setIsProcessing(false); setProcessingType(null); }
  };

  return (
    // ✨ 배경과 테두리를 테마 변수로 교체
    <div className="w-full h-full mx-auto bg-main-bg border border-border-color p-[20px] rounded-[8px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex flex-col box-border max-md:h-auto max-md:min-h-[100dvh] max-md:overflow-y-auto transition-colors duration-300">
      <Header />
      {selectedImage && (
        <CropToolbar aspect={aspect} onAspectChange={(v) => { setAspect(v); handleResetCrop(v); }} brightness={brightness} setBrightness={setBrightness} contrast={contrast} setContrast={setContrast} grayscale={grayscale} setGrayscale={setGrayscale} />
      )}
      <div className="flex-1 flex flex-row gap-[15px] overflow-visible min-h-0 relative max-md:flex-col max-md:gap-[10px] max-md:h-auto">
        <ThumbnailList images={images} setImages={setImages} selectedId={selectedImage?.id} onSelect={setSelectedImage} />
        <ImageCropper 
          imageUrl={selectedImage?.previewUrl} 
          crop={crop} 
          aspect={aspect} 
          onChange={handleCropChange} 
          onComplete={setCompletedCrop} 
          onImageLoad={onImageLoad} 
          imgRef={imgRef} 
          brightness={brightness} 
          contrast={contrast} 
          grayscale={grayscale} 
        />
        <ActionSidebar imageCount={images.length} isProcessing={isProcessing} processingType={processingType} quality={quality} hasSelection={!!selectedImage} onFileChange={onFileChange} onResetCrop={() => handleResetCrop(aspect)} onPreview={generatePreview} onProcess={handleProcessImages} setQuality={setQuality} />
      </div>
      <ProcessingOverlay isVisible={isProcessing} type={processingType} />
      <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} previewImages={previewImages} />
    </div>
  );
};

export default CropPage;