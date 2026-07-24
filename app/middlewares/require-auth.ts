import type { AuthVariables } from '@/types'

import { auth } from '@/lib'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

export const requireAuth = createMiddleware<{
  Variables: AuthVariables
}>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers
  })

  if (!session) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }

  c.set('user', session.user)
  c.set('session', session.session)

  await next()
})
