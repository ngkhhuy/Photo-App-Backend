import mongoose from 'mongoose'

const PhotoSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  likedBy: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: []
  },
  likes: {
    type: Number,
    default: 0
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true })

// Index để tìm kiếm hiệu quả
PhotoSchema.index({ description: 'text', keywords: 'text' })

const Photo = mongoose.model('Photo', PhotoSchema)

export default Photo