import { supabaseAdmin } from '../../config/database'

export interface FlowData {
  nodes: unknown[]
  connections: unknown[]
}

export interface FlowRecord {
  id: string
  tenant_id: string
  name: string
  nodes: unknown[]
  connections: unknown[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export class ChatbotRepository {
  // ── Legacy single-flow (backward compat) ────────────────────────────────────

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

  // ── Multi-flow CRUD ──────────────────────────────────────────────────────────

  async listFlows(tenantId: string): Promise<FlowRecord[]> {
    const { data, error } = await supabaseAdmin
      .from('AgendaBot_ChatbotFlows')
      .select('id, tenant_id, name, nodes, connections, is_active, created_at, updated_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data ?? []) as FlowRecord[]
  }

  async createFlow(tenantId: string, name: string): Promise<FlowRecord> {
    const { data, error } = await supabaseAdmin
      .from('AgendaBot_ChatbotFlows')
      .insert({ tenant_id: tenantId, name, nodes: [], connections: [] })
      .select()
      .single()

    if (error) throw error
    return data as FlowRecord
  }

  async getFlowById(tenantId: string, flowId: string): Promise<FlowRecord | null> {
    const { data, error } = await supabaseAdmin
      .from('AgendaBot_ChatbotFlows')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', flowId)
      .maybeSingle()

    if (error) throw error
    return data as FlowRecord | null
  }

  async updateFlow(
    tenantId: string,
    flowId: string,
    updates: Partial<{ name: string; nodes: unknown[]; connections: unknown[]; is_active: boolean }>,
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from('AgendaBot_ChatbotFlows')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', flowId)

    if (error) throw error
  }

  async deleteFlow(tenantId: string, flowId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('AgendaBot_ChatbotFlows')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('id', flowId)

    if (error) throw error
  }

  async getActiveFlow(tenantId: string): Promise<FlowRecord | null> {
    const { data, error } = await supabaseAdmin
      .from('AgendaBot_ChatbotFlows')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw error
    if (data) return data as FlowRecord

    // Fallback to legacy single-flow table
    const { data: legacy, error: legacyErr } = await supabaseAdmin
      .from('AgendaBot_ChatbotFlow')
      .select('nodes, connections')
      .eq('tenant_id', tenantId)
      .maybeSingle()

    if (legacyErr) throw legacyErr
    if (!legacy) return null

    return {
      id: `legacy_${tenantId}`,
      tenant_id: tenantId,
      name: 'Fluxo Principal',
      nodes: legacy.nodes ?? [],
      connections: legacy.connections ?? [],
      is_active: true,
      created_at: '',
      updated_at: '',
    } as FlowRecord
  }
}
