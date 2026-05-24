import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../shared/middlewares/auth.middleware'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

export async function authRoutes(fastify: FastifyInstance) {
  const service = new AuthService(fastify)
  const ctrl = new AuthController(service)

  fastify.post('/auth/register', (req, reply) => ctrl.register(req, reply))
  fastify.post('/auth/login', (req, reply) => ctrl.login(req, reply))
  fastify.post('/auth/refresh', (req, reply) => ctrl.refresh(req, reply))
  fastify.post('/auth/logout', (req, reply) => ctrl.logout(req, reply))
  fastify.post('/auth/forgot-password', (req, reply) => ctrl.forgotPassword(req, reply))
  fastify.post('/auth/reset-password', (req, reply) => ctrl.resetPassword(req, reply))
  fastify.get('/auth/me', { preHandler: [authenticate] }, (req, reply) => ctrl.me(req, reply))
}
