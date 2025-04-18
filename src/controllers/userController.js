import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { JwtProvider } from '~/providers/JwtProvider'
import 'dotenv/config'
import User from '~/models/userModel'

 
const ACCESS_TOKEN_SECRET_SIGNATURE = process.env.ACCESS_TOKEN_SECRET_SIGNATURE
const REFRESH_TOKEN_SECRET_SIGNATURE = process.env.REFRESH_TOKEN_SECRET_SIGNATURE


// Phuong thuc dang ky tai khoan
const register = async (req, res) => {
  try {
    const { email, password, name} = req.body

    // Kiem tra xem cac muc yeu cau da duoc cung cap chua
    if (!email || !password || !name) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        messages: 'Please provide email, password, and name'
      })
    }
    // Kiem tra xem email da duoc su dung chua
    const existingUser = await User.findOne({ email})
    if (existingUser) {
      return res.status(StatusCodes.CONFLICT).json({
        message: 'User with this email already exists'
      })
    }

    // Tao user moi
    const newUser = new User({
      email,
      password,
      name
    })
    await newUser.save()

    // Tao token cua moi nguoi dung
    const userInfo = {
      id: newUser._id,
      email: newUser.email  
    }

    // Tao token cho moi nguoi dung
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      '1h',
    )

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      REFRESH_TOKEN_SECRET_SIGNATURE,
      '14d',
    )

    // Cai dat HTTP-only cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    // Tra ve thong tin nguoi dung va tokens
    res.status(StatusCodes.CREATED).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name
      },
      accessToken,
      refreshToken

    })     
  } catch (error) {
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Something went wrong',
      error: error.message
    })
  }
}

// Phuong thuc dang nhap
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Kiem tra input
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        message: 'Please provide email and password' 
      })
    }

    // Tim user theo email
    const user = await User.findOne({ email })
    
    // Kiem tra user co ton tai khong hoac mat khau khong khop
    if (!user || !(await user.comparePassword(password))) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        message: 'Invalid email or password' 
      })
    }

    // Tạo thông tin user cho token
    const userInfo = {
      id: user._id,
      email: user.email
    }

    // Tạo token
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      '1h',
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      REFRESH_TOKEN_SECRET_SIGNATURE,
      '14 days',
    )

    //  Set HTTP-only cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    // Tra ve thong tin user va tokens
    res.status(StatusCodes.OK).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      accessToken,
      refreshToken
    })
  } catch (error) {
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Server error during login',
      error: error.message
    })
  }
}
// Phuong thuc Logout
const logout = async (req, res) => {
  try {
    // Xóa cookies
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.status(StatusCodes.OK).json({message: 'Logout successful'})
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Server error during logout',
      error: error.message
    })
  }
}

// Refresh token
const refreshToken = async (req, res) => {
  try {
    res.status(StatusCodes.OK).json({messages: 'Refresh token API success!' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

export const userController = {
  register,
  login,
  logout,
  refreshToken
}


