import { Prisma } from '@prisma/client'

const defaultUserAvatars = {
  light:
    'https://res.cloudinary.com/dmbnnewoy/image/upload/v1706958682/TaskPro/user_avatar_default/user_light.png',
  dark: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1706958682/TaskPro/user_avatar_default/user_dark.png',
  violet:
    'https://res.cloudinary.com/dmbnnewoy/image/upload/v1706958682/TaskPro/user_avatar_default/user_violet.png'
}

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
