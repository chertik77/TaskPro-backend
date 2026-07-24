import { createProtectedRouter } from '@/lib'
import { userService } from '@/services'

import { helpRoute } from './openapi'

export const userRouter = createProtectedRouter()

userRouter.openapi(helpRoute, async c => {
  const json = c.req.valid('json')

  await userService.help(json)

  return c.json({ message: 'Email sent' }, 200)
})
