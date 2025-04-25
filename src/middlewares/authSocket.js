import jwt from 'jsonwebtoken'
import User from '~/models/userModel'   
import 'dotenv/config'

// Middleware authSocket.js có thể đang gặp vấn đề
const authSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    
    if (!token) {
      return next(new Error("Authentication error: Token not provided"));
    }
    
    // Xác thực token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_SIGNATURE);
    
    // Thiết lập thông tin user - có thể đang bị lỗi ở đây
    const user = await User.findById(decoded.id);
    if (!user) return next(new Error("User not found"));

    // Lưu thông tin đầy đủ
    socket.user = {
      id: user._id,
      name: user.name,
      email: user.email
    };
    
    next();
  } catch (error) {
    console.error("Socket auth error:", error);
    return next(new Error("Authentication error"));
  }
};

export default authSocket