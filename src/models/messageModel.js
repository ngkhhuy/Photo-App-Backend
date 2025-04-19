import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        require: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    text: {
        type: String,
        required: true
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true })

const Message = mongoose.model('Message', MessageSchema)

export default Message