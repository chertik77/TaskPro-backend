import { userController } from '@/controllers/user'
import { upload } from '@/middlewares/multer'
import { Router } from 'express'
import { authenticate } from 'middlewares/authenticate'
import { EditUserSchema, NeedHelpSchema, ThemeSchema } from 'schemas/user'
import { validateRequestBody } from 'zod-express-middleware'

export const userRouter = Router()

userRouter.use(authenticate)

userRouter.put(
  '/',
  upload.single('avatar'),
  validateRequestBody(EditUserSchema),
  userController.update
)

userRouter.post(
  '/help',
  validateRequestBody(NeedHelpSchema),
  userController.help
)

userRouter.put(
  '/theme',
  validateRequestBody(ThemeSchema),
  userController.changeTheme
)

userRouter.get('/me', userController.me)
