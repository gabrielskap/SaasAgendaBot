import { FastifyReply, FastifyRequest } from 'fastify'
import { UnauthorizedError } from '../errors/app-error'

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
    request.userId = request.user.sub
    request.tenantId = request.user.tenant_id
    request.userRole = request.user.role
  } catch {
    throw new UnauthorizedError()
  }
}
