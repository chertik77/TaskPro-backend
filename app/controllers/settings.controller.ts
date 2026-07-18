import type {
  UpdateaccessibilitySettingsSchema,
  UpdateGeneralSettingsSchema,
  UpdateLabelSettingsSchema,
  UpdateTaskSettingsSchema
} from '@/schemas'
import type { TypedRequest } from '@/types'
import type { Request, Response } from 'express'
import type { ZodType } from 'zod'

import { prisma } from '@/prisma'

import { redisClient } from '@/config'

class SettingsController {
  getAll = async (req: Request, res: Response) => {
    const userId = req.user.id

    const cacheKey = `settings:user:${userId}`

    const cachedSettings = await redisClient.get(cacheKey)

    if (cachedSettings) {
      res.json(JSON.parse(cachedSettings))
    } else {
      const [general, task, label, accessibility] = await Promise.all([
        prisma.userSettings.findUnique({ where: { userId } }),
        prisma.taskSettings.findUnique({ where: { userId } }),
        prisma.labelSettings.findUnique({ where: { userId } }),
        prisma.accessibilitySettings.findUnique({ where: { userId } })
      ])

      res.json({ general, task, label, accessibility })
    }
  }

  updateGeneral = async (
    {
      body,
      user
    }: TypedRequest<ZodType, ZodType, typeof UpdateGeneralSettingsSchema>,
    res: Response
  ) => {
    const settings = await prisma.userSettings.update({
      where: { userId: user.id },
      data: body
    })

    await redisClient.del(`settings:user:${user.id}`)

    res.json(settings)
  }

  updateTasks = async (
    {
      body,
      user
    }: TypedRequest<ZodType, ZodType, typeof UpdateTaskSettingsSchema>,
    res: Response
  ) => {
    const settings = await prisma.taskSettings.update({
      where: { userId: user.id },
      data: body
    })

    // if (body.sortTasksBy) {
    //   const keys = await redisClient.keys(`board:*:user:${user.id}`)

    //   if (keys.length) await redisClient.del(keys)
    // }

    await redisClient.del(`settings:user:${user.id}`)

    res.json(settings)
  }

  updateLabels = async (
    {
      body,
      user
    }: TypedRequest<ZodType, ZodType, typeof UpdateLabelSettingsSchema>,
    res: Response
  ) => {
    const settings = await prisma.labelSettings.update({
      where: { userId: user.id },
      data: body
    })

    await redisClient.del(`settings:user:${user.id}`)

    res.json(settings)
  }

  updateAccessibility = async (
    {
      body,
      user
    }: TypedRequest<ZodType, ZodType, typeof UpdateaccessibilitySettingsSchema>,
    res: Response
  ) => {
    const settings = await prisma.accessibilitySettings.update({
      where: { userId: user.id },
      data: body
    })

    await redisClient.del(`settings:user:${user.id}`)

    res.json(settings)
  }
}

export const settingsController = new SettingsController()
