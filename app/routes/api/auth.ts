import { Router } from 'express'
import { upload } from 'middlewares/multer'
import { authenticate } from 'middlewares/authenticate'
import { validateBody } from 'decorators/validateBody'
import { signinSchema, signupSchema, editUserSchema } from 'schemas/user'
import * as authController from 'controllers/auth'

export const authRouter = Router()

authRouter.post('/signup', validateBody(signupSchema), authController.signup)

authRouter.post('/signin', validateBody(signinSchema), authController.signin)

authRouter.get('/current', authenticate, authController.getCurrent)

authRouter.patch('/user', authenticate, upload.single('avatar'), validateBody(editUserSchema), authController.update) // Edit user

authRouter.post('/signout', authenticate, authController.signout)
