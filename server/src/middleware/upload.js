import multer from 'multer';
import { BadRequestError } from '../errors/index.js';

// Store files in memory, then stream to Cloudinary
const storage = multer.memoryStorage();

function fileFilter(allowedTypes) {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError(`That file type isn't allowed. Accepted: ${allowedTypes.join(', ')}`), false);
    }
  };
}

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp']),
}).single('file');

export const uploadDocument = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
}).single('file');

export const uploadAny = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('file');

// Upload buffer to Cloudinary
export async function uploadToCloudinary(buffer, folder, resourceType = 'auto') {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (!cloudinaryUrl || cloudinaryUrl.includes('placeholder')) {
    // Return a placeholder URL in dev without Cloudinary configured
    console.log('[CLOUDINARY SKIP] No Cloudinary URL configured — using placeholder');
    return `https://via.placeholder.com/400?text=Avatar`;
  }

  const { v2: cloudinary } = await import('cloudinary');
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) reject(new BadRequestError("That file's over 5MB — try a smaller one."));
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
}
