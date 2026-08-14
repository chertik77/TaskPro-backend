const APP_PREFIX = 'taskpro'

const createKey = (...parts: (string | number)[]) =>
  [APP_PREFIX, ...parts].join(':')

export const redisKeys = {
  boards: {
    byUser: (userId: string) => createKey('boards', 'user', userId, 'all'),
    byId: (boardId: string, userId: string) =>
      createKey('board', boardId, 'user', userId)
  },
  labels: {
    byUser: (userId: string) => createKey('labels', 'user', userId)
  },
  settings: {
    byUser: (userId: string) => createKey('settings', 'user', userId)
  }
}
