import type { FastifyInstance } from 'fastify'
import { env } from '../../config/env'

export async function whatsappRoutes(fastify: FastifyInstance) {
  fastify.get('/whatsapp/status', async (_req, reply) => {
    try {
      const response = await fetch(`${env.UAZAPI_BASE_URL}/status`, {
        headers: {
          'token': env.UAZAPI_GLOBAL_TOKEN,
        },
      })

      if (!response.ok) {
        return reply.status(502).send({
          connected: false,
          error: `UAZAPI retornou status ${response.status}`,
        })
      }

      const data = await response.json() as any
      const checked = data?.status?.checked_instance
      const connectionStatus = checked?.connection_status ?? null
      const connected = connectionStatus === 'connected' && checked?.is_healthy === true

      return reply.send({
        connected,
        state: connectionStatus,
        instanceName: checked?.name ?? null,
        phone: null,
      })
    } catch {
      return reply.status(503).send({
        connected: false,
        error: 'Não foi possível alcançar a API de WhatsApp',
      })
    }
  })
}
