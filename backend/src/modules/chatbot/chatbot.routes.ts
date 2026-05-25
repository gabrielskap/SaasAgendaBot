import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { authenticate } from '../../shared/middlewares/auth.middleware'
import { ChatbotRepository } from './chatbot.repository'

export async function chatbotRoutes(fastify: FastifyInstance) {
  const repo = new ChatbotRepository()

  fastify.addHook('preHandler', authenticate)

  // ── Legacy single-flow routes (backward compat) ──────────────────────────────

  fastify.get('/chatbot/flow', async (req: FastifyRequest, reply: FastifyReply) => {
    const tenantId = (req as any).tenantId as string
    try {
      const flow = await repo.getFlow(tenantId)
      return reply.send(flow ?? { nodes: [], connections: [] })
    } catch (err: any) {
      req.log.error({ err }, 'chatbot/flow GET failed')
      return reply.status(500).send({ error: 'Falha ao carregar o fluxo.', message: err.message, details: err })
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
      return reply.status(500).send({ error: 'Falha ao salvar o fluxo.', message: err.message, details: err })
    }
  })

  // ── Multi-flow routes ────────────────────────────────────────────────────────

  fastify.get('/chatbot/flows', async (req: FastifyRequest, reply: FastifyReply) => {
    const tenantId = (req as any).tenantId as string
    try {
      const flows = await repo.listFlows(tenantId)
      return reply.send(flows)
    } catch (err: any) {
      req.log.error({ err }, 'chatbot/flows GET failed')
      return reply.status(500).send({ error: 'Falha ao listar fluxos.', message: err.message, details: err })
    }
  })

  fastify.post('/chatbot/flows', async (req: FastifyRequest, reply: FastifyReply) => {
    const tenantId = (req as any).tenantId as string
    const body = req.body as { name?: string }
    const name = body?.name?.trim() || 'Novo Fluxo'

    try {
      const flow = await repo.createFlow(tenantId, name)
      return reply.status(201).send(flow)
    } catch (err: any) {
      req.log.error({ err }, 'chatbot/flows POST failed')
      return reply.status(500).send({ error: 'Falha ao criar fluxo.', message: err.message, details: err })
    }
  })

  fastify.get('/chatbot/flows/:flowId', async (req: FastifyRequest, reply: FastifyReply) => {
    const tenantId = (req as any).tenantId as string
    const { flowId } = req.params as { flowId: string }

    try {
      const flow = await repo.getFlowById(tenantId, flowId)
      if (!flow) return reply.status(404).send({ error: 'Fluxo não encontrado.' })
      return reply.send(flow)
    } catch (err: any) {
      req.log.error({ err }, 'chatbot/flows/:flowId GET failed')
      return reply.status(500).send({ error: 'Falha ao carregar fluxo.', message: err.message, details: err })
    }
  })

  fastify.put('/chatbot/flows/:flowId', async (req: FastifyRequest, reply: FastifyReply) => {
    const tenantId = (req as any).tenantId as string
    const { flowId } = req.params as { flowId: string }
    const body = req.body as { name?: string; nodes?: unknown[]; connections?: unknown[]; is_active?: boolean }

    const updates: Record<string, unknown> = {}
    if (body?.name !== undefined) updates.name = body.name
    if (body?.nodes !== undefined) updates.nodes = body.nodes
    if (body?.connections !== undefined) updates.connections = body.connections
    if (body?.is_active !== undefined) updates.is_active = body.is_active

    if (Object.keys(updates).length === 0) {
      return reply.status(400).send({ error: 'Nenhum campo para atualizar.' })
    }

    try {
      await repo.updateFlow(tenantId, flowId, updates)
      return reply.send({ ok: true })
    } catch (err: any) {
      req.log.error({ err }, 'chatbot/flows/:flowId PUT failed')
      return reply.status(500).send({ error: 'Falha ao atualizar fluxo.', message: err.message, details: err })
    }
  })

  fastify.delete('/chatbot/flows/:flowId', async (req: FastifyRequest, reply: FastifyReply) => {
    const tenantId = (req as any).tenantId as string
    const { flowId } = req.params as { flowId: string }

    try {
      await repo.deleteFlow(tenantId, flowId)
      return reply.send({ ok: true })
    } catch (err: any) {
      req.log.error({ err }, 'chatbot/flows/:flowId DELETE failed')
      return reply.status(500).send({ error: 'Falha ao excluir fluxo.', message: err.message, details: err })
    }
  })
}
