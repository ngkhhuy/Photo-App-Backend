import { StatusCodes } from 'http-status-codes'
import Chat from '~/models/chatModel'
import Message from '~/models/messageModel'

//Tao cuoc tro chuyen moi
const createChat = async (req, res) => {
    try {
        const { participants} = req.body

        if (!participants || participants.length <1) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Participants are required'
            })
        }

    // Kiem tra trang thai nguoi dung hien tai
    const allParticipants = [...new Set([...participants, req.user.id])]

    // Kiem tra doan chat co bi trung khong
    const existingChat = await Chat.findOne({
        participants: { $all: allParticipants, $size: allParticipants.length } 
    })
    
    if (existingChat) {
        return res.status(StatusCodes.OK).json(existingChat)
    }


    const newChat = new Chat({
        participants: allParticipants
    })

    await newChat.save()

    const populateChat = await Chat.findById(newChat._id)
        .populate('participants', 'name email')
        
    res.status(StatusCodes.CREATED).json(populateChat)
    } catch (error) {
        console.error('Error creating chat:', error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error creating chat',
            error: error.message
        })
    }
}

// Lay tat ca cac doan chat cua nguoi dung
const getAllChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user.id
        })
        .populate('participants', 'name email')
        .populate('lastMessage')
        .sort({ updatedAt: -1 })

    res.status(StatusCodes.OK).json(chats)
    } catch (error) {
        console.error('Error getting chats:', error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error getting chats',
            error: error.message
        })
    }
}

// Lay tin nhan cua mot cuoc tro chuyen
const getChatMessages = async (req, res) => {
    try {
      const { chatId } = req.params
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const skip = (page - 1) * limit
  
      const chat = await Chat.findById(chatId)
  
      if (!chat) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: 'Không tìm thấy cuộc trò chuyện'
        })
      }
  
      // Kiểm tra xem người dùng có thuộc về cuộc trò chuyện này không
      if (!chat.participants.includes(req.user.id)) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: 'Bạn không có quyền truy cập cuộc trò chuyện này'
        })
      }
  
      const messages = await Message.find({ chat: chatId })
        .populate('sender', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
  
      const total = await Message.countDocuments({ chat: chatId })
  
      // Đánh dấu tin nhắn là đã đọc
      await Message.updateMany(
        { 
          chat: chatId, 
          sender: { $ne: req.user.id },
          readBy: { $ne: req.user.id }
        },
        { $addToSet: { readBy: req.user.id } }
      )
  
      res.status(StatusCodes.OK).json({
        messages,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMessages: total
      })
    } catch (error) {
      console.error('Error getting chat messages:', error)
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error getting chat messages',
        error: error.message
      })
    }
  }
  
  export const chatController = {
    createChat,
    getAllChats,
    getChatMessages
  }