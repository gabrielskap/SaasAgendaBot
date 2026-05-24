import 'fastify'
import '@fastify/jwt'

declare module 'fastify' {
  interface FastifyRequest {
    userId: string
    tenantId: string
    userRole: string
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string
      tenant_id: string
      role: string
    }
    user: {
      sub: string
      tenant_id: string
      role: string
    }
  }
}
