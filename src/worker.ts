import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

self.onmessage = async (e) => {
  try {
    // ✨ 변경점: quality 파라미터 추가 (기본값 0.95)
    const { format, images, completedCrop, selectedImage, viewPort, quality = 0.95 } = e.data;

    // 크롭 스케일 및 오프셋 계산 (기존과 동일)
    const scaleX = selectedImage.originalWidth / viewPort.width;
    const scaleY = selectedImage.originalHeight / viewPort.height;
    const offsetX = (viewPort.containerWidth - viewPort.width) / 2;
    const offsetY = (viewPort.containerHeight - viewPort.height) / 2;

    const getActualCropCoordinates = (imageFile: any) => {
      const translatedX = completedCrop.x - offsetX;
      const translatedY = completedCrop.y - offsetY;
      let actualCropX = Math.round(translatedX * scaleX);
      let actualCropY = Math.round(translatedY * scaleY);
      let actualCropWidth = Math.round(completedCrop.width * scaleX);
      let actualCropHeight = Math.round(completedCrop.height * scaleY);

      if (actualCropWidth <= 0 || actualCropHeight <= 0) return null;
      if (actualCropX < 0) actualCropX = 0;
      if (actualCropY < 0) actualCropY = 0;
      if (actualCropX + actualCropWidth > imageFile.originalWidth) { actualCropWidth = imageFile.originalWidth - actualCropX; }
      if (actualCropY + actualCropHeight > imageFile.originalHeight) { actualCropHeight = imageFile.originalHeight - actualCropY; }

      return { x: actualCropX, y: actualCropY, w: actualCropWidth, h: actualCropHeight };
    };

    // ✨ 변경점: imgQuality 파라미터를 받아 압축률에 적용
    const cropImageWithCanvas = async (imageBuffer: ArrayBuffer, coords: any, imgQuality: number) => {
      const blob = new Blob([imageBuffer]);
      const imageBitmap = await createImageBitmap(blob);
      
      const canvas = new OffscreenCanvas(coords.w, coords.h);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context is not supported');

      ctx.drawImage(
          imageBitmap,
          coords.x, coords.y, coords.w, coords.h, 
          0, 0, coords.w, coords.h                
      );

      // ✨ 변경점: 하드코딩된 0.95 대신 전달받은 imgQuality 사용
      const croppedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: imgQuality });
      
      const arrayBuffer = await croppedBlob.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    };

    // --- 1. ZIP 생성 로직 ---
    if (format === 'zip') {
      const zip = new JSZip();
      let hasValidImages = false;

      for (let i = 0; i < images.length; i++) {
        const imageFile = images[i];
        const coords = getActualCropCoordinates(imageFile);
        
        if (!coords) continue;

        // ✨ 변경점: quality 파라미터 전달
        const croppedBytes = await cropImageWithCanvas(imageFile.buffer, coords, quality);
        
        if (croppedBytes && croppedBytes.length > 0) {
          const fileName = imageFile.name || `cropped_image_${i + 1}.jpg`;
          zip.file(fileName, croppedBytes);
          hasValidImages = true;
        }
      }

      if (hasValidImages) {
        const zipBytes = await zip.generateAsync({ type: 'uint8array' });
        self.postMessage({ status: 'success', data: zipBytes, format: 'zip' });
      } else {
        self.postMessage({ status: 'error', message: '크롭할 유효한 이미지가 없습니다.' });
      }
      return;
    }

    // --- 2. 기존 PDF 생성 로직 ---
    if (format === 'pdf') {
      const pdfDoc = await PDFDocument.create();

      for (const imageFile of images) {
        const coords = getActualCropCoordinates(imageFile);
        
        if (!coords) continue;

        // ✨ 변경점: quality 파라미터 전달
        const croppedBytes = await cropImageWithCanvas(imageFile.buffer, coords, quality);
        
        if (croppedBytes && croppedBytes.length > 0) {
          const jpgImage = await pdfDoc.embedJpg(croppedBytes);
          const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
          page.drawImage(jpgImage, { x: 0, y: 0, width: jpgImage.width, height: jpgImage.height });
        }
      }

      if (pdfDoc.getPageCount() > 0) {
        const pdfBytes = await pdfDoc.save();
        self.postMessage({ status: 'success', data: pdfBytes, format: 'pdf' });
      } else {
        self.postMessage({ status: 'error', message: 'PDF로 변환할 유효한 이미지가 없습니다.' });
      }
    }

  } catch (error) {
    let errorMessage = '알 수 없는 오류가 발생했습니다.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    self.postMessage({ status: 'error', message: errorMessage });
  }
};