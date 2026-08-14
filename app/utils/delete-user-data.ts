import { prisma } from '@/prisma'
import { invalidate } from '@/redis'

import cloudinary from '@/config'

export const deleteUserData = async (userId: string) => {
  const [user, boards] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { imagePublicId: true }
    }),
    prisma.board.findMany({ where: { userId }, select: { id: true } })
  ])

  if (user?.imagePublicId) {
    try {
      await cloudinary.uploader.destroy(user.imagePublicId, {
        type: 'upload',
        resource_type: 'image'
      })
    } catch (error) {
      console.error('Failed to delete avatar for user', userId, error)
    }
  }

  await Promise.all([
    invalidate.boards(userId),
    invalidate.labels(userId),
    invalidate.settings(userId),
    invalidate.boardMany(
      userId,
      boards.map(({ id }) => id)
    )
  ])
}
