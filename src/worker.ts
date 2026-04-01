import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

self.onmessage = async (e) => {
  try {
    const { format, images, completedCrop, selectedImage, viewPort } = e.data;

    // 크롭 스케일 및 오프셋 계산 (기존과 동일)
    const scaleX = selectedImage.originalWidth / viewPort.width;
    const scaleY = selectedImage.originalHeight / viewPort.height;
    const offsetX = (viewPort.containerWidth - viewPort.width) / 2;
    const offsetY = (viewPort.containerHeight - viewPort.height) / 2;

    // 공통: 크롭 좌표 계산 함수 (기존 Rust에서 처리하던 경계값 체크 포함)
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

    // ✨ 핵심: OffscreenCanvas를 활용한 네이티브 이미지 크롭 함수
    const cropImageWithCanvas = async (imageBuffer: ArrayBuffer, coords: any) => {
      // 1. ArrayBuffer를 브라우저 네이티브 ImageBitmap으로 디코딩 (GPU 가속 활용 가능)
      const blob = new Blob([imageBuffer]);
      const imageBitmap = await createImageBitmap(blob);
      
      // 2. 백그라운드 스레드용 캔버스 생성 (크롭할 크기만큼)
      const canvas = new OffscreenCanvas(coords.w, coords.h);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context is not supported');

      // 3. 캔버스에 잘라낼 영역만 그리기
      ctx.drawImage(
          imageBitmap,
          coords.x, coords.y, coords.w, coords.h, // Source (원본 이미지에서 자를 영역)
          0, 0, coords.w, coords.h                // Destination (캔버스에 그려질 위치와 크기)
      );

      // 4. 그려진 캔버스를 고품질 JPEG Blob으로 변환
      const croppedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
      
      // 5. Blob을 다시 Uint8Array로 변환하여 반환
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

        // Wasm 대신 새 함수 호출
        const croppedBytes = await cropImageWithCanvas(imageFile.buffer, coords);
        
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

        // Wasm 대신 새 함수 호출
        const croppedBytes = await cropImageWithCanvas(imageFile.buffer, coords);
        
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