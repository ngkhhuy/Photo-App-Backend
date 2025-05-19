import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import 'dotenv/config'

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Cấu hình storage cho multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'photo-app', // Thư mục lưu trữ trên Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { width: 1000, crop: 'limit' }, // Resize ảnh
      // Thêm watermark
      {
        overlay: {
          font_family: "Arial",
          font_size: 35,
          font_weight: "bold",
          text: "by flickshare"
        },
        color: "#FFFFFF", // Màu chữ trắng
        opacity: 80,      // Độ trong suốt 80%
        gravity: "south_east", // Góc phải dưới
        y: 10,  // Cách lề dưới 10px
        x: 10   // Cách lề phải 10px
      }
    ]
  }
})

// Khởi tạo multer middleware
const upload = multer({ storage: storage })

export { cloudinary, upload }