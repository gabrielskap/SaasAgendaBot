import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabaseUrl = process.env.SUPABASE_URL || 'https://supabase-01.quantumtecnologia.com.br'
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceRole!)

async function checkUndefined() {
  console.log('--- Testing eq with undefined ---')
  try {
    const { data, error } = await supabase
      .from('AgendaBot_ChatbotFlows')
      .select('id, tenant_id, name, nodes, connections, is_active, created_at, updated_at')
      .eq('tenant_id', undefined as any)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Query returned error:', error)
    } else {
      console.log('Query succeeded with:', data)
    }
  } catch (e: any) {
    console.error('Query threw exception:', e.message || e)
  }
}

checkUndefined()
