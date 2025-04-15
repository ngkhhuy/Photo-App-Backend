import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { JwtProvider } from '~/providers/JwtProvider'
import 'dotenv/config'

const MOCK_DATABASE = {
  USER: {
    ID: 'ngkhhuy',
    EMAIL: 'toilatoi123@gmail.com',
    PASSWORD: '123456'
  }
}

const ACCESS_TOKEN_SECRET_SIGNATURE = process.env.ACCESS_TOKEN_SECRET_SIGNATURE
const REFRESH_TOKEN_SECRET_SIGNATURE = process.env.REFRESH_TOKEN_SECRET_SIGNATURE

const login = async (req, res) => {
  try {
    if (req.body.email !== MOCK_DATABASE.USER.EMAIL || req.body.password !== MOCK_DATABASE.USER.PASSWORD) {
      res.status(StatusCodes.FORBIDDEN).json({ messenger: 'Your email or password is incorrect!' })
      return
    }

    // Trong truong hop nhap dung thong tin tai khoan, tao token va tra ve phia client

    const userInfo = {
      id: MOCK_DATABASE.USER.ID,
      email:MOCK_DATABASE.USER.EMAIL
    }

    // Tao ra 2 loai token la access va refresh
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

    // Xử lý trường hợp trả về http Only cookie cho phía trình duyệt
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

    // Tra ve thong tin cua user va tra ve token cho truong hop phia FE can luu token vao localstorage

    res.status(StatusCodes.OK).json({
      ...userInfo,
      accessToken,
      refreshToken
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
  
}


const logout = async (req, res) => {
  try {
    // do something
    res.status(StatusCodes.OK).json({messages: 'Logout API success!' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const refreshToken = async (req, res) => {
  try {
    res.status(StatusCodes.OK).json({messages: 'Refresh Token API success.' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
    
  }
}

export const userController = {
  login,
  logout,
  refreshToken
}


