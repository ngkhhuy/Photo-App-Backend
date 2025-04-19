import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { userRoute } from '~/routes/v1/userRoute'
import { photoRoute } from '~/routes/v1/photoRoute'
import { chatRoute } from '~/routes/v1/chatRoute'

const Router = express.Router()

/** Check APIs v1/status */
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.' })
})

/** User APIs */
Router.use('/users', userRoute)
Router.use('/photos', photoRoute)

/** Chat APIs */
Router.use('/chats', chatRoute)





export const APIs_V1 = Router