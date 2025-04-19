import Message from "~/models/messageModel";
import Chat from "~/models/chatModel";

const chatSocket = (io) => {
    // Xu li su kien chat bang socket
    io.on('connection', (socket) => {
        console.log(`A user connected: ${socket.user.name} (${socket.id})`)

    // Tham gia 1 cuoc tro chuyen
    socket.on('joinChat', (chatId) => {
        socket.join(chatId)
        console.log(`User ${socket.user.name} joined chat ${chatId}`)
    })
    // Roi khoi cuoc tro chuyen
    socket.on('leaveChat', (chatId) => {
        socket.leave(chatId)
        console.log(`User ${socket.user.name} left chat ${chatId}`)
    })

    // Gui tin nhan
    socket.on('sendMessage', async ({chatId, text}) => {
        try {
            // Kiem tra nguoi dung co trong cuoc tro chuyen khong
            const chat = await Chat.findById(chatId)
            if (!chat || !chat.participants.includes(socket.user.id)) {
                socket.emit('error', { message: 'No permission to chat' })
                return
            }

            // Tạo tin nhắn
            const message = new Message({
                chat: chatId,
                sender: socket.user.id,
                text,
                readBy: [socket.user.id] 
              })
            await message.save()

            // Cap nhat tin nhan cuoi cung cuoc tro chuyen
            await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id})

            // Lay tin nhan kem thong tin nguoi gui
            const populateMessage = await Message.findById(message._id)
                .populate('sender', 'name email')

            // Phat tin nhan cho tat ca nguoi dung
            io.to(chatId).emit('message', populateMessage) 
        } catch (error) {
            console.error('Error sending message:', error)
            socket.emit('error', { message: 'Error sending message' })
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
