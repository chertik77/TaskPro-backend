import { redisClient } from '@/config'

import { redisKeys } from './keys'
import { REDIS_TTL } from './ttl'

const bumpBoardVersion = async (userId: string, boardId: string) => {
  const key = redisKeys.boards.version(boardId, userId)

  await redisClient.incr(key)
  await redisClient.expire(key, REDIS_TTL.VERSION)
}

export const invalidate = {
  board(userId: string, boardId: string) {
    return bumpBoardVersion(userId, boardId)
  },

  async boardRelated(userId: string, boardId: string) {
    await bumpBoardVersion(userId, boardId)
    await redisClient.del(redisKeys.boards.byUser(userId))
  },

  async boardMany(userId: string, boardIds: string[]) {
    if (!boardIds.length) return

    await Promise.all(
      boardIds.map(boardId => bumpBoardVersion(userId, boardId))
    )
  },

  boards(userId: string) {
    return redisClient.del(redisKeys.boards.byUser(userId))
  },

  labels(userId: string) {
    return redisClient.del(redisKeys.labels.byUser(userId))
  },

  settings(userId: string) {
    return redisClient.del(redisKeys.settings.byUser(userId))
  }
}
