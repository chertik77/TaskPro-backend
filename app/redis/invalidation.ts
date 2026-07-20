import { redisClient } from '@/config'

import { redisKeys } from './keys'

export const invalidate = {
  board(userId: string, boardId: string) {
    return redisClient.del(redisKeys.boards.byId(boardId, userId))
  },

  boardRelated(userId: string, boardId: string) {
    return redisClient.del([
      redisKeys.boards.byId(boardId, userId),
      redisKeys.boards.byUser(userId)
    ])
  },

  boardMany(userId: string, boardIds: string[]) {
    if (!boardIds.length) return Promise.resolve()

    return redisClient.del(
      boardIds.map(boardId => redisKeys.boards.byId(boardId, userId))
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
