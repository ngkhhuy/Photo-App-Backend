import mongoose, { MongooseError } from 'mongoose'

const ChatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    }
}, { timestamps: true })

const Chat = mongoose.model('Chat', ChatSchema)

export default Chat
