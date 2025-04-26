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

    // Lấy isPublic từ request body, mặc định là true
    const isPublic = req.body.isPublic !== 'false';

    // Tạo bản ghi photo mới
    const newPhoto = new Photo({
      imageUrl: req.file.path, // URL của ảnh từ Cloudinary
      publicId: req.file.filename, // Hoặc lấy public_id từ req.file tùy theo cấu hình
      description,
      keywords: keywordsArray,
      user: userId,
      isPublic: isPublic // Thêm trường isPublic
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

// Cập nhật getAllPhotos
const getAllPhotos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Lấy userId từ token nếu có
    const userId = req.user?.id;

    // Xây dựng query để chỉ lấy ảnh công khai hoặc ảnh của user hiện tại
    const query = userId 
      ? { $or: [{ isPublic: true }, { user: userId }] }
      : { isPublic: true };

    const photos = await Photo.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email');

    const total = await Photo.countDocuments(query);

    res.status(StatusCodes.OK).json({
      photos,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPhotos: total
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching photos',
      error: error.message
    });
  }
};

// Cập nhật getPhotoById
const getPhotoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id === 'undefined') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Valid photo ID is required'
      });
    }
    
    const photo = await Photo.findById(id)
      .populate('user', 'name email');

    if (!photo) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Photo not found'
      });
    }

    // Kiểm tra quyền xem ảnh
    const userId = req.user?.id;
    if (!photo.isPublic && (!userId || photo.user._id.toString() !== userId)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'You do not have permission to view this photo'
      });
    }

    res.status(StatusCodes.OK).json(photo);
  } catch (error) {
    console.error('Error fetching photo:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching photo',
      error: error.message
    });
  }
};

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

    // Check if user already liked
    const userId = req.user.id
    const hasLiked = photo.likedBy.some(id => id.toString() === userId)
    if (hasLiked) {
      // Unlike
      photo.likedBy = photo.likedBy.filter(id => id.toString() !== userId)
      photo.likes -= 1
      await photo.save()
      return res.status(StatusCodes.OK).json({
        message: 'Photo unliked successfully',
        likes: photo.likes
      })
    }
    // Like
    photo.likedBy.push(userId)
    photo.likes += 1
    await photo.save()
    return res.status(StatusCodes.OK).json({
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

// Cập nhật searchPhotos
const searchPhotos = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Search query is required'
      });
    }

    // Lấy userId từ token nếu có
    const userId = req.user?.id;

    // Xây dựng query tìm kiếm
    const searchQuery = {
      $and: [
        {
          $or: [
            { description: { $regex: query, $options: 'i' } },
            { keywords: { $regex: query, $options: 'i' } }
          ]
        },
        userId 
          ? { $or: [{ isPublic: true }, { user: userId }] }
          : { isPublic: true }
      ]
    };

    const photos = await Photo.find(searchQuery)
      .populate('user', 'name email');

    res.status(StatusCodes.OK).json({
      count: photos.length,
      photos
    });
  } catch (error) {
    console.error('Error searching photos:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error searching photos',
      error: error.message
    });
  }
};

const updatePhotoVisibility = async (req, res) => {
  try {
    const photoId = req.params.id;
    const { isPublic } = req.body;
    
    // Kiểm tra isPublic có phải là boolean không
    if (typeof isPublic !== 'boolean' && isPublic !== 'true' && isPublic !== 'false') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'isPublic must be a boolean value'
      });
    }
    
    const photo = await Photo.findById(photoId);
    
    if (!photo) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Photo not found'
      });
    }
    
    // Chỉ cho phép chủ sở hữu ảnh thay đổi trạng thái
    if (photo.user.toString() !== req.user.id) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'You do not have permission to update this photo'
      });
    }
    
    // Chuyển đổi isPublic thành boolean nếu là string
    const visibility = typeof isPublic === 'boolean' ? isPublic : isPublic === 'true';
    
    // Cập nhật trạng thái
    photo.isPublic = visibility;
    await photo.save();
    
    res.status(StatusCodes.OK).json({
      message: 'Photo visibility updated successfully',
      photo: {
        id: photo._id,
        isPublic: photo.isPublic
      }
    });
  } catch (error) {
    console.error('Error updating photo visibility:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error updating photo visibility',
      error: error.message
    });
  }
};

// Thêm hàm mới
const getMyPhotos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const userId = req.user.id;
    
    const photos = await Photo.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email');

    const total = await Photo.countDocuments({ user: userId });

    res.status(StatusCodes.OK).json({
      photos,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPhotos: total
    });
  } catch (error) {
    console.error('Error fetching user photos:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching user photos',
      error: error.message
    });
  }
};

// Thêm vào export object
export const photoController = {
  uploadPhoto,
  getAllPhotos,
  getPhotoById,
  toggleLike,
  deletePhoto,
  searchPhotos,
  updatePhotoVisibility, // Thêm controller mới
  getMyPhotos
}