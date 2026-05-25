import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { authenticate } from '../../shared/middlewares/auth.middleware'
import { ChatbotRepository } from './chatbot.repository'

export async function chatbotRoutes(fastify: FastifyInstance) {
  const repo = new ChatbotRepository()

  fastify.addHook('preHandler', authenticate)

  fastify.get('/chatbot/flow', async (req: FastifyRequest, reply: FastifyReply) => {
    const tenantId = (req as any).tenantId as string
    try {
      const flow = await repo.getFlow(tenantId)
      return reply.send(flow ?? { nodes: [], connections: [] })
    } catch (err: any) {
      req.log.error({ err }, 'chatbot/flow GET failed')
      return reply.status(500).send({ error: 'Falha ao carregar o fluxo.' })
    }
  })

  fastify.put('/chatbot/flow', async (req: FastifyRequest, reply: FastifyReply) => {
    const tenantId = (req as any).tenantId as string
    const body = req.body as { nodes: unknown[]; connections: unknown[] }

    if (!Array.isArray(body?.nodes) || !Array.isArray(body?.connections)) {
      return reply.status(400).send({ error: 'nodes e connections são obrigatórios.' })
    }

    try {
      await repo.upsertFlow(tenantId, { nodes: body.nodes, connections: body.connections })
      return reply.send({ ok: true })
    } catch (err: any) {
      req.log.error({ err }, 'chatbot/flow PUT failed')
      return reply.status(500).send({ error: 'Falha ao salvar o fluxo.' })
    }
  })
}
