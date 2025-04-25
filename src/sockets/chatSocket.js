import Message from "~/models/messageModel";
import Chat from "~/models/chatModel";

const chatSocket = (io) => {
    // Xu li su kien chat bang socket
    io.on('connection', (socket) => {
        console.log(`A user connected: ${socket.user.name} (${socket.id})`)

    // Tham gia 1 cuoc tro chuyen
    socket.on('joinChat', (chatId) => {
        console.log('User joining chat:', {
            socketId: socket.id,
            userId: socket.user,  // Có thể đây là undefined
            chatId: chatId
        });
        
        socket.join(chatId);
        console.log(`User ${socket.user} joined chat ${chatId}`);
    })
    // Roi khoi cuoc tro chuyen
    socket.on('leaveChat', (chatId) => {
        socket.leave(chatId);
        console.log(`User ${socket.user.name} left chat ${chatId}`);
    })

    // Gui tin nhan
    socket.on('sendMessage', async (data) => {
        console.log('Received message data:', data);
        console.log('User info:', socket.user);
        
        // Kiểm tra xem có user không
        if (!socket.user) {
            console.error('No user found on socket');
            socket.emit('error', { message: 'User not authenticated' });
            return;
        }
        
        try {
            const { chatId, text } = data;
            
            // Nếu không có userId, không thể lưu tin nhắn
            if (!socket.user) {
              socket.emit('error', { message: 'User authentication failed' });
              return;
            }
            
            // Tạo tin nhắn mới
            const newMessage = new Message({
              sender: socket.user.id,      // Chỉ dùng ID
              chat: chatId,
              text: text,
              readBy: [socket.user.id]     // Chỉ dùng ID
            });
            
            await newMessage.save();
            
            // Cập nhật lastMessage cho chat
            await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id });
            
            // Populate thông tin người gửi trước khi broadcast
            const populatedMessage = await Message.findById(newMessage._id)
              .populate('sender', 'name email');
            
            // Gửi tin nhắn cho tất cả trong phòng chat
            io.to(chatId).emit('message', populatedMessage);
          } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Error sending message' });
          }
    })

    // Thong bao nguoi dung dang nhap 
    socket.on('typing', ({ chatId}) => {
        socket.to(chatId).emit('typing', { user: socket.user.id, name: socket.user.name })
      })
    // Thong bao nguoi dung ngung nhap
    socket.on('stopTyping', ({ chatId}) => {
        socket.to(chatId).emit('stopTyping', { user: socket.user.id, name: socket.user.name })
    })

    // Ngung ket noi
    socket.on('disconnect', () => {
        console.log(`User ${socket.user.name} disconnected`)
    })
})
}

export default chatSocket
