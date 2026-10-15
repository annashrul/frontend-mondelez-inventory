// Base64 is larger than the original file. Keep the entire image string below
// 750 KiB so the JSON payload fits the API/proxy's 1 MiB request limit.
export const searchImageMaxLength = 750 * 1024;
export const searchImageMaxDimension = 1280;

export async function prepareProductImage(source) {
  const objectUrl = source instanceof Blob ? URL.createObjectURL(source) : null;
  const image = new Image();
  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('Gagal membaca gambar. Gunakan JPEG, PNG, atau WebP.'));
      image.src = objectUrl || source;
    });
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('Gagal membaca gambar. Gunakan JPEG, PNG, atau WebP.');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Gagal memproses gambar');
    let maxDimension = searchImageMaxDimension;
    while (maxDimension >= 320) {
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.9, 0.8, 0.7]) {
        const result = canvas.toDataURL('image/jpeg', quality);
        if (result.startsWith('data:image/jpeg;base64,') && result.length <= searchImageMaxLength) return result;
      }
      maxDimension = Math.floor(maxDimension * 0.75);
    }
    throw new Error('Gambar masih terlalu besar. Gunakan foto dengan resolusi lebih rendah.');
  } finally {
    image.onload = null;
    image.onerror = null;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}
