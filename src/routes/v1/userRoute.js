import express from 'express'
import { userController } from '~/controllers/userController'

const Router = express.Router()

// API login

Router.route('/login')
  .post(userController.login)

// API logout

Router.route('/logout')
  .delete(userController.logout)

// API Refresh Token

Router.route('/refresh_token')
  .put(userController.refreshToken)

export const userRoute = Router