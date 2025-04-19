import express from 'express'
import { chatController } from '~/controllers/chatController'
import { verifyToken } from '~/middlewares/authMiddleware'

const Router = express.Router()

// Tao cuoc tro chuyen moi
Router.route('/')
  .post(verifyToken, chatController.createChat)
  .get(verifyToken, chatController.getAllChats)

// Lay tin nhan cua mot cuoc tro chuyen
Router.route('/:chatId/messages')
  .get(verifyToken, chatController.getChatMessages)

export const chatRoute = Router

