import type { FastifyReply, FastifyRequest } from 'fastify'
import type { AppointmentsService } from './appointments.service'
import {
  availabilityQuerySchema,
  createAppointmentSchema,
  listQuerySchema,
  metricsQuerySchema,
  updateAppointmentSchema,
  updateStatusSchema,
} from './appointments.schema'

type WithId = FastifyRequest<{ Params: { id: string } }>

export class AppointmentsController {
  constructor(private service: AppointmentsService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listQuerySchema.parse(request.query)
    return reply.send(await this.service.list(request.tenantId, query))
  }

  async findById(request: WithId, reply: FastifyReply) {
    return reply.send(await this.service.findById(request.params.id, request.tenantId))
  }

  async today(request: FastifyRequest, reply: FastifyReply) {
    return reply.send(await this.service.today(request.tenantId))
  }

  async availability(request: FastifyRequest, reply: FastifyReply) {
    const query = availabilityQuerySchema.parse(request.query)
    return reply.send(await this.service.checkAvailability(request.tenantId, query))
  }

  async metrics(request: FastifyRequest, reply: FastifyReply) {
    const { date_from, date_to } = metricsQuerySchema.parse(request.query)
    return reply.send(await this.service.getMetrics(request.tenantId, date_from, date_to))
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createAppointmentSchema.parse(request.body)
    const result = await this.service.create(request.tenantId, request.userId, input)
    return reply.status(201).send(result)
  }

  async update(request: WithId, reply: FastifyReply) {
    const input = updateAppointmentSchema.parse(request.body)
    return reply.send(await this.service.update(request.params.id, request.tenantId, input))
  }

  async updateStatus(request: WithId, reply: FastifyReply) {
    const input = updateStatusSchema.parse(request.body)
    return reply.send(
      await this.service.updateStatus(request.params.id, request.tenantId, request.userId, input),
    )
  }
}
