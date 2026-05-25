import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabaseUrl = process.env.SUPABASE_URL || 'https://supabase-01.quantumtecnologia.com.br'
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceRole!)

async function checkDatabase() {
  console.log('--- Testing AgendaBot_ChatbotFlows ---')
  try {
    const { data, error } = await supabase
      .from('AgendaBot_ChatbotFlows')
      .select('*')
    
    if (error) {
      console.error('AgendaBot_ChatbotFlows Error:', error)
    } else {
      console.log('AgendaBot_ChatbotFlows Success:', data)
    }
  } catch (e: any) {
    console.error('AgendaBot_ChatbotFlows Exception:', e.message || e)
  }

  console.log('--- Testing AgendaBot_Tenant ---')
  try {
    const { data, error } = await supabase
      .from('AgendaBot_Tenant')
      .select('*')
    
    if (error) {
      console.error('AgendaBot_Tenant Error:', error)
    } else {
      console.log('AgendaBot_Tenant Success:', data)
    }
  } catch (e: any) {
    console.error('AgendaBot_Tenant Exception:', e.message || e)
  }

  console.log('--- Testing AgendaBot_User ---')
  try {
    const { data, error } = await supabase
      .from('AgendaBot_User')
      .select('*')
    
    if (error) {
      console.error('AgendaBot_User Error:', error)
    } else {
      console.log('AgendaBot_User Success:', data)
    }
  } catch (e: any) {
    console.error('AgendaBot_User Exception:', e.message || e)
  }
}

checkDatabase()
