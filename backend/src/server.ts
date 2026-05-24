import 'dotenv/config'
import { buildApp } from './app'
import { prisma } from './config/database'
import { env } from './config/env'
import { redis } from './config/redis'

async function main() {
  const app = await buildApp()

  try {
    await app.listen({ port: env.PORT, host: env.HOST })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }

  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down…`)
    await app.close()
    await prisma.$disconnect()
    await redis?.quit()
    process.exit(0)
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main()
