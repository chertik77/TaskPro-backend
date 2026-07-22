import type {
  UpdateaccessibilitySettingsSchema,
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

    const [general, task, label, accessibility] = await Promise.all([
      prisma.userSettings.findUnique({ where: { userId } }),
      prisma.taskSettings.findUnique({ where: { userId } }),
      prisma.labelSettings.findUnique({ where: { userId } }),
      prisma.accessibilitySettings.findUnique({ where: { userId } })
    ])

    await redisClient.set(
      cacheKey,
      JSON.stringify({ general, task, label, accessibility }),
      'EX',
      REDIS_TTL.DEFAULT
    )

    return { general, task, label, accessibility }
  }

  updateGeneral = async (
    data: z.infer<typeof UpdateGeneralSettingsSchema>,
    userId: string
  ) => {
    const settings = await prisma.userSettings.update({
      where: { userId },
      data
    })

    await invalidate.settings(userId)

    return settings
  }

  updateTasks = async (
    data: z.infer<typeof UpdateTaskSettingsSchema>,
    userId: string
  ) => {
    const settings = await prisma.taskSettings.update({
      where: { userId },
      data
    })

    await invalidate.settings(userId)

    return settings
  }

  updateLabels = async (
    data: z.infer<typeof UpdateLabelSettingsSchema>,
    userId: string
  ) => {
    const settings = await prisma.labelSettings.update({
      where: { userId },
      data
    })

    await invalidate.settings(userId)

    return settings
  }

  updateAccessibility = async (
    data: z.infer<typeof UpdateaccessibilitySettingsSchema>,
    userId: string
  ) => {
    const settings = await prisma.accessibilitySettings.update({
      where: { userId },
      data
    })

    await invalidate.settings(userId)

    return settings
  }
}

export const settingsService = new SettingsService()
