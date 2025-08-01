import { Prisma } from '@prisma/client'

import { defaultUserAvatars } from '@/config'

export const userWithDefaultAvatar = Prisma.defineExtension(client =>
  client.$extends({
    name: 'userWithDefaultAvatar',
    result: {
      user: {
        avatar: {
          needs: { avatar: true, theme: true },
          compute: ({ avatar, theme }) =>
            avatar || defaultUserAvatars[theme] || defaultUserAvatars.light
        }
      }
    }
  })
)
