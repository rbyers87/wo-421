import { v2 as cloudinary } from 'cloudinary';

    cloudinary.config({
      cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
      api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
      secure: true,
    });

    export default cloudinary;
