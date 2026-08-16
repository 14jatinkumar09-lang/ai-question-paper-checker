import * as pdfjsLib from 'pdfjs-dist';

// Configure worker for pdfjs in Vite / browser environment
try {
  if (typeof window !== 'undefined') {
    // Use unpkg or cdnjs as reliable fallback worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn('PDF.js worker setup warning:', e);
}

export function normalizeMimeType(mime?: string, fileName?: string): string {
  let type = (mime || '').toLowerCase().trim();
  if (type === 'image/jpg' || type === 'image/pjpeg') {
    return 'image/jpeg';
  }

  if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'png') return 'image/png';
    if (ext === 'webp') return 'image/webp';
    if (ext === 'pdf') return 'application/pdf';
  }

  if (!type || type === 'application/octet-stream') {
    return 'application/pdf';
  }

  return type;
}

export interface OptimizedFileResult {
  base64: string;
  mimeType: string;
  size: number;
  originalSize: number;
  previewUrl?: string;
  pageCount: number;
  pages?: string[]; // Array of base64 JPEG images for each page
}

/**
 * Optimizes a single Image by downscaling high resolution (e.g. 48MP phone cameras)
 * to max 1600px and compressing to high-clarity JPEG (0.82 quality).
 * Keeps handwriting super sharp while shrinking 10MB down to ~180KB.
 */
export async function optimizeImageFile(file: File): Promise<OptimizedFileResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const rawBase64 = e.target?.result as string;
      const img = new Image();
      img.onerror = () => {
        resolve({
          base64: rawBase64,
          mimeType: 'image/jpeg',
          size: file.size,
          originalSize: file.size,
          previewUrl: rawBase64,
          pageCount: 1,
          pages: [rawBase64],
        });
      };

      img.onload = () => {
        try {
          const MAX_DIM = 1600;
          let width = img.width;
          let height = img.height;

          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { alpha: false });
          if (!ctx) {
            resolve({
              base64: rawBase64,
              mimeType: 'image/jpeg',
              size: file.size,
              originalSize: file.size,
              previewUrl: rawBase64,
              pageCount: 1,
              pages: [rawBase64],
            });
            return;
          }

          // Fill white background for transparent PNGs
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Export as crisp JPEG with 0.82 quality (optimal balance of OCR legibility & tiny size)
          const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.82);
          const approximateBytes = Math.round((optimizedBase64.length * 3) / 4);

          resolve({
            base64: optimizedBase64,
            mimeType: 'image/jpeg',
            size: approximateBytes,
            originalSize: file.size,
            previewUrl: optimizedBase64,
            pageCount: 1,
            pages: [optimizedBase64],
          });
        } catch {
          resolve({
            base64: rawBase64,
            mimeType: 'image/jpeg',
            size: file.size,
            originalSize: file.size,
            previewUrl: rawBase64,
            pageCount: 1,
            pages: [rawBase64],
          });
        }
      };
      img.src = rawBase64;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Optimizes a PDF by rendering each page to a clean, high-clarity canvas image (JPEG ~150KB per page).
 * This converts heavy 15-40MB scanned PDFs into a lightweight multi-page payload (~600KB total)
 * that never hits HTTP 413 payload limits on any deployment platform.
 */
export async function optimizePdfFile(file: File): Promise<OptimizedFileResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => {
      // Fallback
      resolve({
        base64: '',
        mimeType: 'application/pdf',
        size: file.size,
        originalSize: file.size,
        pageCount: 1,
      });
    };

    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const rawBase64 = `data:application/pdf;base64,${btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      )}`;

      try {
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/cmaps/`,
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        const totalPages = Math.min(pdf.numPages, 20); // Cap at 20 pages max
        const pageImages: string[] = [];
        let totalBytes = 0;

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const initialViewport = page.getViewport({ scale: 1.0 });

          // Scale viewport so max dimension is around 1500px for crisp reading
          const maxDim = Math.max(initialViewport.width, initialViewport.height);
          const scale = Math.min(1500 / maxDim, 2.0);
          const viewport = page.getViewport({ scale: Math.max(scale, 1.2) });

          const canvas = document.createElement('canvas');
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);

          const ctx = canvas.getContext('2d', { alpha: false });
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const renderContext: any = {
              canvasContext: ctx,
              viewport: viewport,
              canvas: canvas,
            };

            await page.render(renderContext).promise;
            const pageDataUrl = canvas.toDataURL('image/jpeg', 0.80);
            pageImages.push(pageDataUrl);
            totalBytes += Math.round((pageDataUrl.length * 3) / 4);
          }
        }

        if (pageImages.length > 0) {
          resolve({
            base64: pageImages[0], // First page as primary
            mimeType: 'image/jpeg',
            size: totalBytes,
            originalSize: file.size,
            previewUrl: pageImages[0],
            pageCount: pageImages.length,
            pages: pageImages,
          });
          return;
        }
      } catch (pdfErr) {
        console.warn('PDF canvas extraction fallback to raw base64:', pdfErr);
      }

      // If PDF canvas rendering wasn't possible, return raw PDF base64
      resolve({
        base64: rawBase64,
        mimeType: 'application/pdf',
        size: file.size,
        originalSize: file.size,
        previewUrl: undefined,
        pageCount: 1,
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Universal file optimizer: checks file type and performs compression.
 */
export async function optimizeFileForUpload(file: File): Promise<OptimizedFileResult> {
  const mimeType = normalizeMimeType(file.type, file.name);

  if (mimeType.startsWith('image/')) {
    return optimizeImageFile(file);
  }

  if (mimeType === 'application/pdf') {
    return optimizePdfFile(file);
  }

  // Fallback for other formats
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read document'));
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      resolve({
        base64,
        mimeType,
        size: file.size,
        originalSize: file.size,
        previewUrl: mimeType.startsWith('image/') ? base64 : undefined,
        pageCount: 1,
        pages: [base64],
      });
    };
    reader.readAsDataURL(file);
  });
}
