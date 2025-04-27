import express from 'express'
import { userController } from '~/controllers/userController'
import path from 'path'

const Router = express.Router()

// API register
Router.route('/register')
 .post(userController.register)

// API login

Router.route('/login')
  .post(userController.login)

// API logout

Router.route('/logout')
  .delete(userController.logout)

// API Refresh Token

Router.route('/refresh_token')
  .put(userController.refreshToken)

// Thêm routes mới
Router.route('/forgot-password')
  .post(userController.requestPasswordReset);

Router.route('/reset-password')
  .post(userController.resetPassword);

export const userRoute = Router