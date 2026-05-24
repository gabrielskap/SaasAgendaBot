import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../shared/middlewares/auth.middleware'
import { AppointmentsController } from './appointments.controller'
import { AppointmentsService } from './appointments.service'

export async function appointmentsRoutes(fastify: FastifyInstance) {
  const service = new AppointmentsService()
  const ctrl = new AppointmentsController(service)

  // All appointment routes require authentication
  fastify.addHook('preHandler', authenticate)

  // Static routes before parameterized routes to avoid conflicts
  fastify.get('/appointments/today', (req, reply) => ctrl.today(req, reply))
  fastify.get('/appointments/availability', (req, reply) => ctrl.availability(req, reply))
  fastify.get('/appointments/metrics', (req, reply) => ctrl.metrics(req, reply))

  fastify.get('/appointments', (req, reply) => ctrl.list(req, reply))
  fastify.post('/appointments', (req, reply) => ctrl.create(req, reply))

  fastify.get('/appointments/:id', (req, reply) => ctrl.findById(req as any, reply))
  fastify.put('/appointments/:id', (req, reply) => ctrl.update(req as any, reply))
  fastify.patch('/appointments/:id/status', (req, reply) => ctrl.updateStatus(req as any, reply))
}
