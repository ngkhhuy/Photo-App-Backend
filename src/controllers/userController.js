import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { JwtProvider } from '~/providers/JwtProvider'
import 'dotenv/config'
import User from '~/models/userModel'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

 
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

// Người dùng yêu cầu reset mật khẩu
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Email is required'
      });
    }
    
    // Tìm user với email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'No account with that email address exists'
      });
    }
    
    // Tạo mã xác thực ngẫu nhiên 6 chữ số
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Lưu mã xác thực đã hash và thời hạn vào DB
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetCode)
      .digest('hex');
      
    // Mã có hiệu lực trong 15 phút
    user.resetPasswordExpires = Date.now() + 900000;
    
    await user.save();
    
    // Cấu hình nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Nội dung email
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'FlickShare - Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/depcmmmyc/image/upload/v1713978654/logo_tyjsyu.png" alt="FlickShare Logo" height="60">
          </div>
          <h2 style="color: #333;">Reset Your Password</h2>
          <p style="color: #666; line-height: 1.5;">You have requested to reset your password for your FlickShare account.</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <h1 style="color: #4285f4; font-size: 32px; margin: 0;">${resetCode}</h1>
            <p style="margin: 5px 0 0 0; color: #666;">Enter this code in the app to reset your password</p>
          </div>
          <p style="color: #666; line-height: 1.5;">This code will expire in 15 minutes.</p>
          <p style="color: #666; line-height: 1.5;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #e4e4e4; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} FlickShare. All rights reserved.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(StatusCodes.OK).json({
      message: 'Reset code sent to your email'
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error requesting password reset',
      error: error.message
    });
  }
};

// Xác thực token và đặt lại mật khẩu mới
const resetPassword = async (req, res) => {
  try {
    const { code, password } = req.body;
    
    if (!code || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Reset code and new password are required'
      });
    }
    
    // Hash mã xác thực để tìm trong database
    const hashedCode = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');
    
    // Tìm user với mã xác thực hợp lệ và chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken: hashedCode,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Reset code is invalid or has expired'
      });
    }
    
    // SỬA Ở ĐÂY: Không hash thủ công, để middleware xử lý
    user.password = password; // Chỉ gán mật khẩu mới
    
    // Xóa thông tin reset password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    res.status(StatusCodes.OK).json({
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error resetting password',
      error: error.message
    });
  }
};

export const userController = {
  register,
  login,
  logout,
  refreshToken,
  requestPasswordReset,
  resetPassword
}


