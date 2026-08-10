import type {
  UpdateGeneralSettingsSchema,
  UpdateLabelSettingsSchema,
  UpdateTaskSettingsSchema
} from '@/schemas'
import type { z } from 'zod'

import { prisma } from '@/prisma'
import { invalidate, REDIS_TTL, redisKeys } from '@/redis'

import { redisClient } from '@/config'

class SettingsService {
  getAll = async (userId: string) => {
    const cacheKey = redisKeys.settings.byUser(userId)

    const cachedSettings = await redisClient.get(cacheKey)

    if (cachedSettings) return JSON.parse(cachedSettings)

    const [general, task, label] = await Promise.all([
      prisma.userSettings.upsert({
        where: { userId },
        create: { userId },
        update: {}
      }),
      prisma.taskSettings.upsert({
        where: { userId },
        create: { userId },
        update: {}
      }),
      prisma.labelSettings.upsert({
        where: { userId },
        create: { userId },
        update: {}
      })
    ])

    await redisClient.set(
      cacheKey,
      JSON.stringify({ general, task, label }),
      'EX',
      REDIS_TTL.DEFAULT
    )

    return { general, task, label }
  }

  updateGeneral = async (
    data: z.infer<typeof UpdateGeneralSettingsSchema>,
    userId: string
  ) => {
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data
    })

    await invalidate.settings(userId)

    return settings
  }

  updateTasks = async (
    data: z.infer<typeof UpdateTaskSettingsSchema>,
    userId: string
  ) => {
    const settings = await prisma.taskSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data
    })

    await invalidate.settings(userId)

    return settings
  }

  updateLabels = async (
    data: z.infer<typeof UpdateLabelSettingsSchema>,
    userId: string
  ) => {
    const settings = await prisma.labelSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data
    })

    await invalidate.settings(userId)

    return settings
  }
}

export const settingsService = new SettingsService()
