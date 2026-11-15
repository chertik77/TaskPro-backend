import { Prisma } from '@prisma/client'

export const isUniqueConstraintError = (err: unknown) =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
