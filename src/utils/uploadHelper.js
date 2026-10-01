// High Quality Original Image Upload Utility & File Validation

const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.bmp', '.svg'];

export function validateImageFile(file) {
  if (!file) {
    throw new Error('No file selected.');
  }

  const filename = file.name || '';
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  
  const isImageMime = file.type && file.type.startsWith('image/');
  const isAllowedExt = ALLOWED_IMAGE_EXTENSIONS.includes(ext);

  if (!isImageMime && !isAllowedExt) {
    throw new Error(
      `Invalid file format "${ext || 'file'}". Only image files (JPG, PNG, WEBP, GIF, HEIC) are allowed!`
    );
  }

  return true;
}

export async function uploadImageFile(file, onProgress) {
  validateImageFile(file);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 50);
        onProgress(percent);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read local file.'));
    };

    reader.onload = async (event) => {
      const buffer = event.target.result;
      const originalName = file.name || `photo-${Date.now()}.jpg`;

      try {
        if (onProgress) onProgress(65);

        // Upload original raw buffer to /api/upload endpoint
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
            'X-Filename': encodeURIComponent(originalName)
          },
          body: buffer
        });

        if (onProgress) onProgress(90);

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.url) {
            if (onProgress) onProgress(100);
            return resolve({
              url: data.url,
              originalName: originalName,
              savedName: data.filename
            });
          }
        }
      } catch (err) {
        console.warn('Server upload fallback to Data URL:', err);
      }

      // Local Data URL Fallback if offline/server endpoint unavailable
      const dataUrlReader = new FileReader();
      dataUrlReader.onload = (dEvt) => {
        if (onProgress) onProgress(100);
        resolve({
          url: dEvt.target.result,
          originalName: originalName,
          savedName: originalName
        });
      };
      dataUrlReader.readAsDataURL(file);
    };

    reader.readAsArrayBuffer(file);
  });
}

// Webcam Snapshot Upload Handler
export async function uploadWebcamSnapshot(dataUrl) {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const filename = `webcam-snapshot-${Date.now()}.jpg`;

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
        'X-Filename': filename
      },
      body: blob
    });

    if (uploadRes.ok) {
      const data = await uploadRes.json();
      if (data.success && data.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn('Webcam upload fallback to Data URL:', err);
  }

  return dataUrl;
}
