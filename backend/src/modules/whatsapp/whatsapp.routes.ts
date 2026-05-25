import type { FastifyInstance } from 'fastify'
import { env } from '../../config/env'
import { ChatbotRepository } from '../chatbot/chatbot.repository'
import { ConversationRepository } from '../chatbot/conversation.repository'
import { FlowEngineService } from '../chatbot/flow-engine.service'
import type { UazapiWebhookPayload } from './webhook.types'
import { WhatsappService } from './whatsapp.service'

export async function whatsappRoutes(fastify: FastifyInstance) {
  // ── GET /whatsapp/status ───────────────────────────────────────────────────
  fastify.get('/whatsapp/status', async (_req, reply) => {
    try {
      const response = await fetch(`${env.UAZAPI_BASE_URL}/instance/status`, {
        headers: {
          token: env.UAZAPI_TOKEN_INSTANCE,
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        return reply.status(502).send({
          connected: false,
          error: `UAZAPI retornou status ${response.status}`,
        })
      }

      const data = await response.json() as any
      const inst = data?.instance ?? {}
      const st = data?.status ?? {}

      return reply.send({
        connected: st.connected === true,
        loggedIn: st.loggedIn === true,
        resetting: st.resetting === false,
        jid: st.jid ?? null,
        instanceId: inst.id ?? null,
        instanceName: inst.name ?? null,
        status: inst.status ?? null,
        profileName: inst.profileName ?? null,
        profilePicUrl: inst.profilePicUrl ?? null,
        owner: inst.owner ?? null,
        isBusiness: inst.isBusiness ?? false,
        platform: inst.plataform ?? null,
      })
    } catch {
      return reply.status(503).send({
        connected: false,
        error: 'Não foi possível alcançar a API de WhatsApp',
      })
    }
  })

  // ── POST /whatsapp/webhook ─────────────────────────────────────────────────
  // Public endpoint — authenticated by the UAZAPI token inside the payload body.
  fastify.post('/whatsapp/webhook', {
    config: {
      rateLimit: { max: 1000, timeWindow: '1 minute' },
    },
  }, async (req, reply) => {
    // Always return 200 immediately so UAZAPI does not retry
    reply.status(200).send({ ok: true })

    const payload = req.body as UazapiWebhookPayload

    // Only process inbound message events
    if (payload?.EventType !== 'messages') return
    if (!payload?.message) return
    if (payload.message.fromMe) return
    if (payload.message.wasSentByApi) return
    if (payload.message.isGroup) return

    const messageText = (payload.message.text || payload.message.content || '').trim()
    if (!messageText) return

    const convRepo = new ConversationRepository()
    const chatbotRepo = new ChatbotRepository()
    const whatsapp = new WhatsappService()
    const engine = new FlowEngineService(whatsapp, convRepo, chatbotRepo)

    try {
      // Resolve tenant from the UAZAPI instance token
      const instance = await convRepo.findTenantByToken(payload.token)
      if (!instance) {
        req.log.warn({ token: payload.token, instanceName: payload.instanceName }, 'webhook: unknown instance token')
        return
      }

      const tenantId = instance.tenant_id
      const chatId = payload.message.chatid
      const clientName = payload.chat?.name || payload.message.senderName || 'Cliente'
      const clientPhone = payload.chat?.phone || chatId

      // Skip if chatbot is temporarily disabled for this chat
      if (payload.chat?.chatbot_disableUntil && Date.now() < payload.chat.chatbot_disableUntil) {
        req.log.debug({ chatId }, 'webhook: chatbot disabled for this chat')
        return
      }

      const conversation = await convRepo.findOrCreate(tenantId, clientPhone, clientName)

      // Skip chats taken over by a human attendant
      if (conversation.status === 'human') return

      // Persist the incoming message before processing
      await Promise.all([
        convRepo.addMessage(conversation.id, 'client', messageText),
        convRepo.updateSession(conversation.id, { last_message: messageText }),
      ])

      await engine.processMessage(tenantId, chatId, messageText, clientName, conversation)
    } catch (err) {
      req.log.error({ err }, 'webhook: flow engine error')
    }
  })
}
