import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import Fastify from 'fastify'
import { env } from './config/env'
import { appointmentsRoutes } from './modules/appointments/appointments.routes'
import { authRoutes } from './modules/auth/auth.routes'
import { chatbotRoutes } from './modules/chatbot/chatbot.routes'
import { whatsappRoutes } from './modules/whatsapp/whatsapp.routes'
import { errorHandler } from './shared/middlewares/error-handler'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
          : undefined,
    },
  })

  await app.register(helmet)

  await app.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
  })

  await app.register(rateLimit, {
    max: 120,
    timeWindow: '1 minute',
  })

  await app.register(jwt, {
    secret: env.JWT_SECRET,
  })

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'AgendaBot API',
        description: 'SaaS de agendamento para barbearias, salões e clínicas',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { deepLinking: false },
  })

  app.setErrorHandler(errorHandler)

  await app.register(authRoutes)
  await app.register(appointmentsRoutes)
  await app.register(chatbotRoutes)
  await app.register(whatsappRoutes)

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  return app
}
