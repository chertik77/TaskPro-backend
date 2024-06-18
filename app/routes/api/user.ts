import { UserController } from '@/controllers/user'
import { upload } from '@/middlewares/multer'
import { Router } from 'express'
import { createValidator } from 'express-joi-validation'
import { authenticate } from 'middlewares/authenticate'
import { EditUserSchema, ThemeSchema } from 'schemas/user'
import { validateRequestBody } from 'zod-express-middleware'

const validator = createValidator()

export const userRouter = Router()

userRouter.use(authenticate)

userRouter.put(
  '/',
  upload.single('avatar'),
  validateRequestBody(EditUserSchema),
  UserController.update
)

userRouter.post(
  '/help',
  validateRequestBody(EditUserSchema),
  UserController.help
)

userRouter.put(
  '/theme',
  validateRequestBody(ThemeSchema),
  UserController.changeTheme
)

userRouter.get('/me', UserController.me)
