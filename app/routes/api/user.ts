import { UserController } from '@/controllers/user'
import { upload } from '@/middlewares/multer'
import { Router } from 'express'
import { createValidator } from 'express-joi-validation'
import { authenticate } from 'middlewares/authenticate'
import { changeThemeSchema, editUserSchema, needHelpSchema } from 'schemas/user'

const validator = createValidator()

export const userRouter = Router()

userRouter.use(authenticate)

userRouter.put(
  '/',
  upload.single('avatar'),
  validator.body(editUserSchema),
  UserController.update
)

userRouter.post('/help', validator.body(needHelpSchema), UserController.help)

userRouter.put(
  '/theme',
  validator.body(changeThemeSchema),
  UserController.changeTheme
)

userRouter.get('/me', UserController.me)
