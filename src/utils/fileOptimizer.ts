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

/**
 * Optimizes image files by downscaling extreme resolution (e.g. 48MP phone cameras)
 * to a maximum dimension of 2048px and re-encoding at high-clarity JPEG (0.88 quality).
 * This reduces payload size from ~15MB to ~350KB-600KB, preventing HTTP 413 / network
 * timeout errors while preserving crystal-clear handwriting and OCR legibility.
 */
export async function optimizeFileForUpload(file: File): Promise<{
  base64: string;
  mimeType: string;
  size: number;
  previewUrl?: string;
}> {
  const mimeType = normalizeMimeType(file.type, file.name);

  // If the file is an image, optimize it using an offscreen canvas
  if (mimeType.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.onload = (e) => {
        const rawBase64 = e.target?.result as string;
        const img = new Image();
        img.onerror = () => {
          // If decoding image fails, fallback to raw base64
          resolve({
            base64: rawBase64,
            mimeType: 'image/jpeg',
            size: file.size,
            previewUrl: rawBase64,
          });
        };
        img.onload = () => {
          try {
            const MAX_DIM = 2048;
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
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve({
                base64: rawBase64,
                mimeType,
                size: file.size,
                previewUrl: rawBase64,
              });
              return;
            }

            // Fill white background for transparent PNGs
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            // Export as crisp JPEG
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.88);
            // Calculate approximate byte size of base64
            const approximateBytes = Math.round((optimizedBase64.length * 3) / 4);

            resolve({
              base64: optimizedBase64,
              mimeType: 'image/jpeg',
              size: approximateBytes,
              previewUrl: optimizedBase64,
            });
          } catch {
            resolve({
              base64: rawBase64,
              mimeType,
              size: file.size,
              previewUrl: rawBase64,
            });
          }
        };
        img.src = rawBase64;
      };
      reader.readAsDataURL(file);
    });
  }

  // If the file is a PDF or other document
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read PDF document'));
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      resolve({
        base64,
        mimeType: 'application/pdf',
        size: file.size,
        previewUrl: undefined,
      });
    };
    reader.readAsDataURL(file);
  });
}
