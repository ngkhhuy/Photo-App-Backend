import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { corsOptions } from './config/corsOptions'
import { APIs_V1 } from '~/routes/v1'
import 'dotenv/config'

const LOCAL_DEV_APP_PORT = process.env.LOCAL_DEV_APP_PORT
const LOCAL_DEV_APP_HOST = process.env.LOCAL_DEV_APP_HOST
const AUTHOR = process.env.AUTHOR

const START_SERVER = () => {
  const app = express()

  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.use(cookieParser())

  app.use(cors(corsOptions))

  app.use(express.json())

  app.use('/v1', APIs_V1)

  app.listen(LOCAL_DEV_APP_PORT, LOCAL_DEV_APP_HOST, () => {
    console.log(`Local DEV: Hello ${AUTHOR}, Server is running at : ${LOCAL_DEV_APP_HOST}:${LOCAL_DEV_APP_PORT}`)
  })
}

(async () => {
  try {
    console.log('Starting Server')
    START_SERVER()
  } catch ( error) {
    console.error(error)
    process.exit(0)
    
  }
}) ()