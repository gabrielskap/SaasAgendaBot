import type { ChatbotRepository, FlowRecord } from './chatbot.repository'
import type { ConversationRepository, Conversation } from './conversation.repository'
import type { WhatsappService } from '../whatsapp/whatsapp.service'

interface FlowNode {
  id: string
  type: string
  title?: string
  text?: string
  options?: string[]
  delaySeconds?: number
  conditions?: Array<{ value: string; port: string }>
  variableName?: string
  [key: string]: unknown
}

interface FlowConnection {
  id: string
  fromNodeId: string
  fromPort: string
  toNodeId: string
  label?: string
}

// Nodes that pause execution and wait for user input
const WAITING_NODES = new Set(['pergunta', 'input_texto', 'numero', 'email', 'telefone', 'data_input', 'time_input'])

export class FlowEngineService {
  constructor(
    private readonly whatsapp: WhatsappService,
    private readonly convRepo: ConversationRepository,
    private readonly chatbotRepo: ChatbotRepository,
  ) {}

  async processMessage(
    tenantId: string,
    chatId: string,
    messageText: string,
    clientName: string,
    conversation: Conversation,
  ): Promise<void> {
    const flow = await this.chatbotRepo.getActiveFlow(tenantId)
    if (!flow) return

    const nodes = (flow.nodes as FlowNode[]) ?? []
    const connections = (flow.connections as FlowConnection[]) ?? []

    if (nodes.length === 0) return

    const sessionData: Record<string, unknown> = {
      nome_cliente: clientName,
      ...((conversation.session_data as Record<string, unknown>) ?? {}),
    }

    let currentNodeId = conversation.current_node_id
    let currentNode = currentNodeId ? nodes.find(n => n.id === currentNodeId) : null

    // ── New or reset conversation: start from inicio ──────────────────────────
    if (!currentNode) {
      const startNode = nodes.find(n => n.type === 'inicio')
      if (!startNode) return

      await this.convRepo.updateSession(conversation.id, {
        current_node_id: startNode.id,
        flow_id: flow.id,
        session_data: sessionData,
      })

      const firstConn = connections.find(c => c.fromNodeId === startNode.id && c.fromPort === 'output')
      if (!firstConn) return

      const nextNode = nodes.find(n => n.id === firstConn.toNodeId)
      if (!nextNode) return

      await this.runChain(nodes, connections, nextNode, chatId, conversation.id, sessionData, flow)
      return
    }

    // ── Continuing from a waiting node ────────────────────────────────────────
    if (WAITING_NODES.has(currentNode.type)) {
      const nextNodeId = await this.resolveWaitingNode(
        currentNode,
        messageText,
        connections,
        nodes,
        sessionData,
      )

      if (nextNodeId === null) {
        // Invalid response — re-send the current node prompt
        await this.sendNode(currentNode, chatId, sessionData)
        return
      }

      if (nextNodeId === undefined) {
        // End of flow from this node
        await this.convRepo.resetSession(conversation.id)
        return
      }

      const nextNode = nodes.find(n => n.id === nextNodeId)
      if (!nextNode) {
        await this.convRepo.resetSession(conversation.id)
        return
      }

      await this.runChain(nodes, connections, nextNode, chatId, conversation.id, sessionData, flow)
      return
    }

    // ── If somehow stuck on a non-waiting node, advance ──────────────────────
    const nextConn = connections.find(c => c.fromNodeId === currentNode!.id && c.fromPort === 'output')
    if (!nextConn) {
      await this.convRepo.resetSession(conversation.id)
      return
    }

    const nextNode = nodes.find(n => n.id === nextConn.toNodeId)
    if (!nextNode) {
      await this.convRepo.resetSession(conversation.id)
      return
    }

    await this.runChain(nodes, connections, nextNode, chatId, conversation.id, sessionData, flow)
  }

  // ── Run a chain of nodes until we hit a waiter or the flow ends ─────────────
  private async runChain(
    nodes: FlowNode[],
    connections: FlowConnection[],
    startNode: FlowNode,
    chatId: string,
    conversationId: string,
    sessionData: Record<string, unknown>,
    _flow: FlowRecord,
  ): Promise<void> {
    let node: FlowNode | undefined = startNode

    while (node) {
      if (node.type === 'delay') {
        const ms = Math.min((node.delaySeconds ?? 1) * 1000, 30_000)
        await new Promise(r => setTimeout(r, ms))
        const nextConn = connections.find(c => c.fromNodeId === node!.id && c.fromPort === 'output')
        node = nextConn ? nodes.find(n => n.id === nextConn.toNodeId) : undefined
        continue
      }

      if (node.type === 'variavel') {
        const varName = node.variableName as string | undefined
        const varValue = this.interpolate(node.text ?? '', sessionData)
        if (varName) sessionData[varName] = varValue
        const nextConn = connections.find(c => c.fromNodeId === node!.id && c.fromPort === 'output')
        node = nextConn ? nodes.find(n => n.id === nextConn.toNodeId) : undefined
        continue
      }

      if (node.type === 'condicao') {
        node = this.resolveCondition(node, connections, nodes, sessionData)
        continue
      }

      await this.sendNode(node, chatId, sessionData)

      if (WAITING_NODES.has(node.type)) {
        // Pause and persist state
        await this.convRepo.updateSession(conversationId, {
          current_node_id: node.id,
          session_data: sessionData,
          last_message: node.text ?? '',
        })
        return
      }

      const nextConn = connections.find(c => c.fromNodeId === node!.id && c.fromPort === 'output')
      node = nextConn ? nodes.find(n => n.id === nextConn.toNodeId) : undefined
    }

    // Flow ended
    await this.convRepo.resetSession(conversationId)
  }

  // ── Resolve a waiting node response, returns next node id or null/undefined ──
  private async resolveWaitingNode(
    node: FlowNode,
    messageText: string,
    connections: FlowConnection[],
    nodes: FlowNode[],
    sessionData: Record<string, unknown>,
  ): Promise<string | null | undefined> {
    const trimmed = messageText.trim()

    if (node.type === 'pergunta') {
      const options = node.options ?? []

      // Match by label (case-insensitive) or number (1-based)
      let matchedIndex = options.findIndex(o => o.toLowerCase() === trimmed.toLowerCase())
      if (matchedIndex === -1) {
        const num = parseInt(trimmed, 10)
        if (!Number.isNaN(num) && num >= 1 && num <= options.length) {
          matchedIndex = num - 1
        }
      }

      if (matchedIndex === -1) return null // invalid — re-prompt

      const portConn = connections.find(c => c.fromNodeId === node.id && c.fromPort === `option_${matchedIndex}`)
      return portConn?.toNodeId ?? undefined
    }

    // Generic input nodes — collect value into a variable derived from title
    const varKey = (node.variableName as string | undefined) ?? this.nodeTitle2Key(node.title)
    if (varKey) sessionData[varKey] = trimmed

    const outConn = connections.find(c => c.fromNodeId === node.id && c.fromPort === 'output')
    return outConn?.toNodeId ?? undefined
  }

  // ── Resolve a conditional node ───────────────────────────────────────────────
  private resolveCondition(
    node: FlowNode,
    connections: FlowConnection[],
    nodes: FlowNode[],
    sessionData: Record<string, unknown>,
  ): FlowNode | undefined {
    const conditions = (node.conditions ?? []) as Array<{ variable: string; operator: string; value: string; port: string }>

    for (const cond of conditions) {
      const actual = String(sessionData[cond.variable] ?? '').toLowerCase()
      const expected = String(cond.value ?? '').toLowerCase()

      let matched = false
      switch (cond.operator) {
        case 'equals':    matched = actual === expected; break
        case 'contains':  matched = actual.includes(expected); break
        case 'starts':    matched = actual.startsWith(expected); break
        case 'not_empty': matched = actual.trim() !== ''; break
        default:          matched = actual === expected
      }

      if (matched) {
        const conn = connections.find(c => c.fromNodeId === node.id && c.fromPort === cond.port)
        return conn ? nodes.find(n => n.id === conn.toNodeId) : undefined
      }
    }

    // Fallback to 'else' port
    const elseConn = connections.find(c => c.fromNodeId === node.id && c.fromPort === 'else')
    return elseConn ? nodes.find(n => n.id === elseConn.toNodeId) : undefined
  }

  // ── Send a single node's output to WhatsApp ─────────────────────────────────
  private async sendNode(node: FlowNode, chatId: string, sessionData: Record<string, unknown>): Promise<void> {
    const text = this.interpolate(node.text ?? '', sessionData)

    switch (node.type) {
      case 'inicio':
        if (text) await this.whatsapp.sendText(chatId, text)
        break

      case 'texto':
        if (text) await this.whatsapp.sendText(chatId, text)
        break

      case 'pergunta': {
        const opts = node.options ?? []
        if (opts.length === 0) break
        if (text) await this.whatsapp.sendButtons(chatId, text, opts)
        break
      }

      case 'input_texto':
      case 'numero':
      case 'email':
      case 'telefone':
      case 'data_input':
      case 'time_input':
        if (text) await this.whatsapp.sendText(chatId, text)
        break

      // Node types not yet fully supported — send text if available
      default:
        if (text) await this.whatsapp.sendText(chatId, text)
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private interpolate(template: string, data: Record<string, unknown>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => String(data[key] ?? `{${key}}`))
  }

  private nodeTitle2Key(title?: string): string {
    if (!title) return ''
    return title
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
  }
}
