import { createProtectedRouter } from '@/lib'
import { userService } from '@/services'
import { bodyLimit } from 'hono/body-limit'

import { AVATAR_MAX_SIZE } from '@/schemas'

import { deleteAvatarRoute, helpRoute, uploadAvatarRoute } from './openapi'

export const userRouter = createProtectedRouter()

userRouter.post(
  '/avatar',
  bodyLimit({
    maxSize: AVATAR_MAX_SIZE,
    onError: c =>
      c.json({ status: 413, message: 'Avatar must be 5MB or less' }, 413)
  })
)

userRouter.openapi(helpRoute, async c => {
  const json = c.req.valid('json')

  await userService.help(json)

  return c.json({ message: 'Email sent' }, 200)
})

userRouter.openapi(uploadAvatarRoute, async c => {
  const { avatar } = c.req.valid('form')
  const user = c.get('user')

  const image = await userService.uploadAvatar(avatar, user, c.req.raw.headers)

  return c.json(image, 200)
})

userRouter.openapi(deleteAvatarRoute, async c => {
  const user = c.get('user')

  const image = await userService.deleteAvatar(user, c.req.raw.headers)

  return c.json(image, 200)
})
