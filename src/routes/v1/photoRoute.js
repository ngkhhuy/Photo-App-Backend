import express from 'express'
import { photoController } from '~/controllers/photoController'
import { verifyToken } from '~/middlewares/authMiddleware'
import { upload } from '~/config/cloudinary'

const Router = express.Router()

// Upload photo - yêu cầu đăng nhập và upload single file
Router.route('/upload')
  .post(verifyToken, upload.single('image'), photoController.uploadPhoto)

// Get all photos
Router.route('/')
  .get(photoController.getAllPhotos)

// Get, like, and delete single photo
Router.route('/:id')
  .get(photoController.getPhotoById)
  .put(verifyToken, photoController.toggleLike)
  .delete(verifyToken, photoController.deletePhoto)

// Search photos
Router.route('/search')
  .get(photoController.searchPhotos)

export const photoRoute = Router