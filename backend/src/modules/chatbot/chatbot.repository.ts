import { supabaseAdmin } from '../../config/database'

export interface FlowData {
  nodes: unknown[]
  connections: unknown[]
}

export class ChatbotRepository {
  async getFlow(tenantId: string): Promise<FlowData | null> {
    const { data, error } = await supabaseAdmin
      .from('AgendaBot_ChatbotFlow')
      .select('nodes, connections')
      .eq('tenant_id', tenantId)
      .maybeSingle()

    if (error) throw error
    return data as FlowData | null
  }

  async upsertFlow(tenantId: string, flow: FlowData): Promise<void> {
    const { error } = await supabaseAdmin
      .from('AgendaBot_ChatbotFlow')
      .upsert(
        {
          tenant_id: tenantId,
          nodes: flow.nodes,
          connections: flow.connections,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'tenant_id' },
      )

    if (error) throw error
  }
}
