import { StatusCodes } from 'http-status-codes'
import Photo from '~/models/photoModel'
import { cloudinary } from '~/config/cloudinary'

// Upload ảnh lên Cloudinary và lưu metadata vào MongoDB
const uploadPhoto = async (req, res) => {
  try {
    // Multer đã upload ảnh lên Cloudinary và thêm file info vào req.file
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'No image file provided'
      })
    }

    const { description, keywords } = req.body
    
    if (!description) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Description is required'
      })
    }

    // Parse keywords từ string hoặc array
    let keywordsArray = []
    if (keywords) {
      keywordsArray = typeof keywords === 'string' 
        ? keywords.split(',').map(keyword => keyword.trim()) 
        : keywords
    }

    // Lấy user ID từ authentication
    const userId = req.user.id // Giả sử middleware authentication đã thêm req.user

    // Tạo bản ghi photo mới
    const newPhoto = new Photo({
      imageUrl: req.file.path, // URL của ảnh từ Cloudinary
      publicId: req.file.filename, // Hoặc lấy public_id từ req.file tùy theo cấu hình
      description,
      keywords: keywordsArray,
      user: userId
    })

    // Lưu vào database
    await newPhoto.save()

    res.status(StatusCodes.CREATED).json({
      message: 'Photo uploaded successfully',
      photo: newPhoto
    })
  } catch (error) {
    console.error('Error uploading photo:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error uploading photo',
      error: error.message
    })
  }
}

// Get all photos (with pagination)
const getAllPhotos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const photos = await Photo.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email') // Populate user info

    const total = await Photo.countDocuments()

    res.status(StatusCodes.OK).json({
      photos,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPhotos: total
    })
  } catch (error) {
    console.error('Error fetching photos:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching photos',
      error: error.message
    })
  }
}

// Get photo by ID
const getPhotoById = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id)
      .populate('user', 'name email')

    if (!photo) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Photo not found'
      })
    }

    res.status(StatusCodes.OK).json(photo)
  } catch (error) {
    console.error('Error fetching photo:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching photo',
      error: error.message
    })
  }
}

// Like/Unlike a photo
const toggleLike = async (req, res) => {
  try {
    const photoId = req.params.id
    const photo = await Photo.findById(photoId)

    if (!photo) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Photo not found'
      })
    }

    // Tăng số lượng like
    photo.likes += 1
    await photo.save()

    res.status(StatusCodes.OK).json({
      message: 'Photo liked successfully',
      likes: photo.likes
    })
  } catch (error) {
    console.error('Error liking photo:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error liking photo',
      error: error.message
    })
  }
}

// Delete a photo
const deletePhoto = async (req, res) => {
  try {
    const photoId = req.params.id
    const photo = await Photo.findById(photoId)

    if (!photo) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Photo not found'
      })
    }

    // Kiểm tra quyền xóa (chỉ user đã upload mới có quyền xóa)
    if (photo.user.toString() !== req.user.id) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'You do not have permission to delete this photo'
      })
    }

    // Xóa ảnh từ Cloudinary
    await cloudinary.uploader.destroy(photo.publicId)

    // Xóa metadata từ MongoDB
    await Photo.findByIdAndDelete(photoId)

    res.status(StatusCodes.OK).json({
      message: 'Photo deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting photo:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error deleting photo',
      error: error.message
    })
  }
}

// Search photos
const searchPhotos = async (req, res) => {
  try {
    const { query } = req.query
    
    if (!query) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Search query is required'
      })
    }

    const photos = await Photo.find({
      $or: [
        { description: { $regex: query, $options: 'i' } },
        { keywords: { $regex: query, $options: 'i' } }
      ]
    }).populate('user', 'name email')

    res.status(StatusCodes.OK).json({
      count: photos.length,
      photos
    })
  } catch (error) {
    console.error('Error searching photos:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error searching photos',
      error: error.message
    })
  }
}

export const photoController = {
  uploadPhoto,
  getAllPhotos,
  getPhotoById,
  toggleLike,
  deletePhoto,
  searchPhotos
}