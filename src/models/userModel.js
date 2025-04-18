import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    region: {
        type: String,
        default: ''
    }
}, { timestamps: true})

// Ma hoa mat khau truoc khi luu vao database
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
        try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
    } catch (error) {
    next(error)
    }
})

// Phuong thuc so sanh mat khau
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', UserSchema)

export default User