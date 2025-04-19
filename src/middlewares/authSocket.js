import jwt from 'jsonwebtoken'
import User from '~/models/userModel'   
import 'dotenv/config'

const authSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token

        if(!token) {
            return next(new Error('Authentication failed: No token provided'))
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_SIGNATURE)
        const user = (await User.findById(decoded.id)).isSelected('-password')
        
        if(!user) {
            return next(new Error('Authentication failed: User not found'))
        }
        socket.user = user
        next()
    } catch (error) {
        next(new Error('Authentication failed: ' + error.message))
    }
}

export default authSocket