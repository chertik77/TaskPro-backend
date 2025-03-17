import { PrismaClient } from '@prisma/client'

import {
  deleteIgnoreNotFoundExtension,
  updateIgnoreNotFoundExtension
} from './extensions'

export const prisma = new PrismaClient({ omit: { user: { password: true } } })
  .$extends(updateIgnoreNotFoundExtension)
  .$extends(deleteIgnoreNotFoundExtension)
