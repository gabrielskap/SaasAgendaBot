import { FastifyReply, FastifyRequest } from 'fastify'
import { ForbiddenError } from '../errors/app-error'

type Role = 'ADMIN' | 'MANAGER' | 'PROFESSIONAL' | 'RECEPTIONIST'

const ROLE_LEVEL: Record<Role, number> = {
  ADMIN: 4,
  MANAGER: 3,
  PROFESSIONAL: 2,
  RECEPTIONIST: 1,
}

export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const userLevel = ROLE_LEVEL[request.userRole as Role] ?? 0
    const requiredLevel = Math.min(...roles.map((r) => ROLE_LEVEL[r]))
    if (userLevel < requiredLevel) {
      throw new ForbiddenError('Insufficient permissions')
    }
  }
}
