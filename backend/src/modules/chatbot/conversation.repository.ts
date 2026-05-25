import { supabaseAdmin } from '../../config/database'

export interface Conversation {
  id: string
  tenant_id: string
  client_name: string
  client_phone: string
  status: 'bot' | 'human'
  last_message: string
  last_message_at: string
  current_node_id: string | null
  flow_id: string | null
  session_data: Record<string, unknown>
}

export interface WhatsappInstance {
  tenant_id: string
  instance_name: string
}

export class ConversationRepository {
  async findTenantByToken(token: string): Promise<WhatsappInstance | null> {
    const { data, error } = await supabaseAdmin
      .from('AgendaBot_WhatsappInstance')
      .select('tenant_id, instance_name')
      .eq('instance_token', token)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw error
    return data as WhatsappInstance | null
  }

  async findOrCreate(
    tenantId: string,
    clientPhone: string,
    clientName: string,
  ): Promise<Conversation> {
    const { data: existing } = await supabaseAdmin
      .from('AgendaBot_Conversation')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('client_phone', clientPhone)
      .neq('status', 'closed')
      .order('last_message_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing) return existing as Conversation

    const { data, error } = await supabaseAdmin
      .from('AgendaBot_Conversation')
      .insert({
        tenant_id: tenantId,
        client_name: clientName,
        client_phone: clientPhone,
        status: 'bot',
        last_message: '',
        last_message_at: new Date().toISOString(),
        current_node_id: null,
        flow_id: null,
        session_data: {},
      })
      .select()
      .single()

    if (error) throw error
    return data as Conversation
  }

  async updateSession(
    conversationId: string,
    updates: {
      current_node_id?: string | null
      flow_id?: string | null
      session_data?: Record<string, unknown>
      last_message?: string
    },
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from('AgendaBot_Conversation')
      .update({ ...updates, last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    if (error) throw error
  }

  async resetSession(conversationId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('AgendaBot_Conversation')
      .update({
        current_node_id: null,
        flow_id: null,
        session_data: {},
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId)

    if (error) throw error
  }

  async addMessage(conversationId: string, sender: 'client' | 'bot' | 'human', text: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('AgendaBot_Message')
      .insert({ conversation_id: conversationId, sender, text })

    if (error) throw error
  }
}
