import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

const localEnv = path.resolve(process.cwd(), '.env')
const parentEnv = path.resolve(process.cwd(), '../.env')

if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv })
} else if (fs.existsSync(parentEnv)) {
  dotenv.config({ path: parentEnv })
} else {
  dotenv.config()
}
import { buildApp } from './app'
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
    await redis?.quit()
    process.exit(0)
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main()
