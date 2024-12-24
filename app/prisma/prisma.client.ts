import { PrismaClient } from '@prisma/client'

import {
  deleteIgnoreNotFoundExtension,
  updateIgnoreNotFoundExtension
} from './extensions'

export const prisma = new PrismaClient()
  .$extends(updateIgnoreNotFoundExtension)
  .$extends(deleteIgnoreNotFoundExtension)
