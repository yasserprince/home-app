import sharp from "sharp";

export async function compressImage(buffer: Buffer, options: {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}): Promise<Buffer> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 80,
    format = 'jpeg'
  } = options;

  try {
    let sharpInstance = sharp(buffer);
    
    // Get image metadata
    const metadata = await sharpInstance.metadata();
    
    // Resize if needed
    if (metadata.width && metadata.height) {
      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
    }
    
    // Apply compression based on format
    switch (format) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ quality, progressive: true });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality });
        break;
    }
    
    return await sharpInstance.toBuffer();
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image');
  }
}

export function getOptimalImageFormat(originalFormat?: string): 'jpeg' | 'png' | 'webp' {
  if (!originalFormat) return 'jpeg';
  
  const format = originalFormat.toLowerCase();
  
  if (format.includes('png')) return 'png';
  if (format.includes('webp')) return 'webp';
  return 'jpeg';
}

export function calculateImageSize(buffer: Buffer): number {
  return buffer.length;
}

export async function validateImageFile(buffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(buffer).metadata();
    return !!(metadata.format && metadata.width && metadata.height);
  } catch {
    return false;
  }
}