import { verify } from 'argon2'
import passport from 'passport'
import { Strategy } from 'passport-local'

import { prisma } from '@/prisma'

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const findUser = await prisma.user.findFirst({
      where: { id: id as string },
      omit: { password: false }
    })

    if (!findUser) throw new Error('User not found')

    done(null, findUser)
  } catch (err) {
    done(err, null)
  }
})

export const SigninPassportStrategy = new Strategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await prisma.user.findFirst({
        where: { email },
        omit: { password: false }
      })

      if (!user) throw new Error('Email or password invalid')

      const isPasswordMatch = await verify(user.password, password)

      if (!isPasswordMatch) throw new Error('Email or password invalid')

      done(null, user)
    } catch (err) {
      done(err, false)
    }
  }
)
