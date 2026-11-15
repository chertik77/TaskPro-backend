import { redisClient } from '@/config'

export const cached = async <T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> => {
  const hit = await redisClient.get(key)

  if (hit) return JSON.parse(hit)

  const value = await fetcher()

  await redisClient.set(key, JSON.stringify(value), 'EX', ttl)

  return value
}
