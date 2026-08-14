import type {
  UpdateGeneralSettingsSchema,
  UpdateLabelSettingsSchema,
  UpdateTaskSettingsSchema
} from '@/schemas'
import type { z } from 'zod'

import { prisma } from '@/prisma'
import { invalidate, REDIS_TTL, redisKeys } from '@/redis'

import { redisClient } from '@/config'

const EMPTY_SECTIONS = { general: {}, task: {}, label: {} }

class SettingsService {
  getAll = async (userId: string) => {
    const cacheKey = redisKeys.settings.byUser(userId)

    const cachedSettings = await redisClient.get(cacheKey)

    if (cachedSettings) return JSON.parse(cachedSettings)

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...EMPTY_SECTIONS },
      update: {}
    })

    await redisClient.set(
      cacheKey,
      JSON.stringify(settings),
      'EX',
      REDIS_TTL.DEFAULT
    )

    return settings
  }

  updateGeneral = async (
    data: z.infer<typeof UpdateGeneralSettingsSchema>,
    userId: string
  ) => {
    const { general } = await prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...EMPTY_SECTIONS, general: data },
      update: { general: { update: data } }
    })

    await invalidate.settings(userId)

    return general
  }

  updateTasks = async (
    data: z.infer<typeof UpdateTaskSettingsSchema>,
    userId: string
  ) => {
    const { task } = await prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...EMPTY_SECTIONS, task: data },
      update: { task: { update: data } }
    })

    await invalidate.settings(userId)

    return task
  }

  updateLabels = async (
    data: z.infer<typeof UpdateLabelSettingsSchema>,
    userId: string
  ) => {
    const { label } = await prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...EMPTY_SECTIONS, label: data },
      update: { label: { update: data } }
    })

    await invalidate.settings(userId)

    return label
  }
}

export const settingsService = new SettingsService()
