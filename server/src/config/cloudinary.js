import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'movies',
    allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'webm'], // include video formats
    resource_type: 'auto', // lets Cloudinary detect image/video automatically
    quality: 'auto:best',
    fetch_format: 'auto',
    transformation: [{ quality: 'auto:best' }]
  }
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'video/mp4',
      'video/quicktime', // mov
      'video/webm'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});
