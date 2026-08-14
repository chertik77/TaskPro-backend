import { createProtectedRouter } from '@/lib'
import { userService } from '@/services'

import { deleteAvatarRoute, helpRoute, uploadAvatarRoute } from './openapi'

export const userRouter = createProtectedRouter()

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
