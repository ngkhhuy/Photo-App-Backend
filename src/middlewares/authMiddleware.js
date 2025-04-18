// src/middleware/authMiddleware.js
import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'
import 'dotenv/config'

const ACCESS_TOKEN_SECRET_SIGNATURE = process.env.ACCESS_TOKEN_SECRET_SIGNATURE

export const verifyToken = async (req, res, next) => {
  try {
    // Lấy token từ cookies hoặc Authorization header
    const token = req.cookies.accessToken || 
                 (req.headers.authorization && req.headers.authorization.split(' ')[1])
    
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Access denied. No token provided.'
      })
    }

    // Xác thực token
    const decoded = await JwtProvider.verifyToken(token, ACCESS_TOKEN_SECRET_SIGNATURE)
    
    // Thêm thông tin user vào request
    req.user = decoded
    
    next()
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Invalid or expired token',
      error: error.message
    })
  }
}