import { Redis } from 'ioredis'
import { env } from './env'

// Redis is optional in development — BullMQ jobs are disabled when not configured
const hasRedis = !!(env.REDIS_URL || env.REDIS_HOST !== 'localhost' || env.REDIS_PASSWORD)

function createRedis(): Redis | null {
  if (!hasRedis && env.NODE_ENV === 'development') return null

  const opts = env.REDIS_URL
    ? { lazyConnect: true, maxRetriesPerRequest: null }
    : {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
        lazyConnect: true,
      }

  const client = env.REDIS_URL ? new Redis(env.REDIS_URL, opts) : new Redis(opts as any)

  client.on('error', (err: Error) => {
    console.warn('Redis unavailable:', err.message)
  })

  return client
}

export const redis = createRedis()
export const isRedisEnabled = redis !== null
