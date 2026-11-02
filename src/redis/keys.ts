const APP_PREFIX = 'taskpro'

const createKey = (...parts: (string | number)[]) =>
  [APP_PREFIX, ...parts].join(':')

export const redisKeys = {
  boards: {
    byUser: (userId: string) => createKey('boards', 'user', userId, 'all'),
    version: (boardId: string, userId: string) =>
      createKey('board', boardId, 'user', userId, 'ver'),
    byId: (boardId: string, userId: string, version: string | number) =>
      createKey('board', boardId, 'user', userId, 'v', version)
  },
  labels: {
    byUser: (userId: string) => createKey('labels', 'user', userId)
  },
  settings: {
    byUser: (userId: string) => createKey('settings', 'user', userId)
  }
}
