import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { corsOptions } from './config/corsOptions'
import { APIs_V1 } from '~/routes/v1'
import connectDB from '~/config/mongodb'
import { Server } from 'socket.io'
import authSocket from '~/middlewares/authSocket'
import chatSocket from '~/sockets/chatSocket'
import http from 'http'
import 'dotenv/config'


const START_SERVER = () => {
  const app = express()
  const server = http.createServer(app)
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.use(cookieParser())
  app.use(cors({
    origin: '*', // Cho phép tất cả origins trong quá trình phát triển mobile
    credentials: true
  }))
  app.use(express.json())
  app.use('/v1', APIs_V1)

  // Middleware socket cho xac thuc
  io.use(authSocket)
  // Khoi tao socket
  chatSocket(io)

  server.listen(process.env.LOCAL_DEV_APP_PORT, process.env.LOCAL_DEV_APP_HOST, () => {
    console.log(`Local DEV: Hello Admin, Server is running at : ${process.env.LOCAL_DEV_APP_HOST}:${process.env.LOCAL_DEV_APP_PORT}`)
  })
}

(async () => {
  try {
    console.log('Connecting to MongoDB...')
    await connectDB()
    
    console.log('Starting Server')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

//demo thoi