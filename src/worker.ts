export {};
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip'; // JSZip 추가
import init, { crop_image } from './pkg/wasm_image_cropper';

const wasmPromise = init(new URL('./pkg/wasm_image_cropper_bg.wasm', import.meta.url).href);

self.onmessage = async (e) => {
  try {
    const { format, images, completedCrop, selectedImage, viewPort } = e.data;
    await wasmPromise;

    const scaleX = selectedImage.originalWidth / viewPort.width;
    const scaleY = selectedImage.originalHeight / viewPort.height;
    const offsetX = (viewPort.containerWidth - viewPort.width) / 2;
    const offsetY = (viewPort.containerHeight - viewPort.height) / 2;

    // 공통: 크롭 좌표 계산 함수
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

    // --- 1. ZIP 생성 로직 ---
    if (format === 'zip') {
      const zip = new JSZip();
      let hasValidImages = false;

      for (let i = 0; i < images.length; i++) {
        const imageFile = images[i];
        const uint8Array = new Uint8Array(imageFile.buffer);
        const coords = getActualCropCoordinates(imageFile);
        
        if (!coords) continue;
        const croppedBytes = crop_image(uint8Array, coords.x, coords.y, coords.w, coords.h);
        
        if (croppedBytes && croppedBytes.length > 0) {
          // 원본 파일명을 유지하거나, 없을 경우 번호를 매깁니다.
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
        const uint8Array = new Uint8Array(imageFile.buffer);
        const coords = getActualCropCoordinates(imageFile);
        
        if (!coords) continue;
        const croppedBytes = crop_image(uint8Array, coords.x, coords.y, coords.w, coords.h);
        
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