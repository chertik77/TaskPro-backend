import type { SignupSchema } from '@/schemas'
import type { TypedRequestBody } from 'zod-express-middleware'

import { prisma } from '@/prisma'
import { hash } from 'argon2'
import passport from 'passport'
import { Strategy } from 'passport-local'

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

export const SignupPassportStrategy = new Strategy(
  { usernameField: 'email', passReqToCallback: true },
  async (req: TypedRequestBody<typeof SignupSchema>, email, password, done) => {
    try {
      const isUserExists = await prisma.user.findUnique({
        where: { email }
      })

      if (isUserExists) throw new Error('Email already exist')

      const user = await prisma.user.create({
        data: {
          ...req.body,
          password: await hash(password)
        },
        omit: { password: false }
      })

      done(null, user)
    } catch (err) {
      done(err, false)
    }
  }
)
