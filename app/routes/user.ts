import { createProtectedRouter } from '@/lib'
import { userService } from '@/services'

import { zValidator } from '@/middlewares'

import { NeedHelpSchema } from '@/schemas'

export const userRouter = createProtectedRouter()

userRouter.post('/help', zValidator('json', NeedHelpSchema), async c => {
  const json = c.req.valid('json')

  await userService.help(json)

  return c.json({ message: 'Email sent' })
})
