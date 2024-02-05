import * as authController from 'controllers/auth'
import { validateBody } from 'decorators/validateBody'
import { Router } from 'express'
import { authenticate } from 'middlewares/authenticate'
import { upload } from 'middlewares/multer'
import { editUserSchema, signinSchema, signupSchema } from 'schemas/user'

export const authRouter = Router()

authRouter.post('/signup', validateBody(signupSchema), authController.signup)

authRouter.post('/signin', validateBody(signinSchema), authController.signin)

authRouter.get('/current', authenticate, authController.getCurrent)

authRouter.patch('/user', authenticate, upload.single('avatar'), validateBody(editUserSchema), authController.update) // Edit user

authRouter.post('/logout', authenticate, authController.logout)
