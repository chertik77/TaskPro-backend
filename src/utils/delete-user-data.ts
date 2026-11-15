import { prisma } from '@/prisma'
import { invalidate } from '@/redis'

import { deleteFromCloudinary } from './cloudinary'

export const deleteUserData = async (userId: string) => {
  const [user, boards] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { imagePublicId: true }
    }),
    prisma.board.findMany({ where: { userId }, select: { id: true } })
  ])

  await deleteFromCloudinary(user?.imagePublicId)

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
