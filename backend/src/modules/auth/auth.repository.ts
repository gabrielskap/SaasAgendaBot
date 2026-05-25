import crypto from 'crypto'
import { supabaseAdmin } from '../../config/database'
import type { RegisterInput } from './auth.schema'

export class AuthRepository {
  async createTenantWithAdmin(data: RegisterInput & { password_hash: string }) {
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('AgendaBot_Tenant')
      .insert({ name: data.tenant_name, slug: data.tenant_slug })
      .select('id, name, slug')
      .single()

    if (tenantError) throw tenantError

    const { data: user, error: userError } = await supabaseAdmin
      .from('AgendaBot_User')
      .insert({
        tenant_id: tenant.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        password_hash: data.password_hash,
        role: 'ADMIN',
      })
      .select('id, name, email, role, tenant_id')
      .single()

    if (userError) throw userError

    return { ...tenant, users: [user] }
  }

  async findUserByEmailAndSlug(email: string, tenantSlug: string) {
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('AgendaBot_Tenant')
      .select('id, name, slug, is_active')
      .eq('slug', tenantSlug)
      .eq('is_active', true)
      .is('deleted_at', null)
      .maybeSingle()

    if (tenantError) throw tenantError
    if (!tenant) return null

    const { data: user, error: userError } = await supabaseAdmin
      .from('AgendaBot_User')
      .select('*')
      .eq('email', email)
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)
      .is('deleted_at', null)
      .maybeSingle()

    if (userError) throw userError
    if (!user) return null

    return { ...user, tenant }
  }

  async findUserById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('AgendaBot_User')
      .select('*, tenant:AgendaBot_Tenant(id, name, slug, plan)')
      .eq('id', id)
      .eq('is_active', true)
      .is('deleted_at', null)
      .maybeSingle()

    if (error) throw error
    return data
  }

  async createRefreshToken(userId: string, expiresAt: Date): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const { error } = await supabaseAdmin
      .from('AgendaBot_RefreshToken')
      .insert({ user_id: userId, token_hash: tokenHash, expires_at: expiresAt.toISOString() })

    if (error) throw error
    return token
  }

  async findRefreshToken(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const { data, error } = await supabaseAdmin
      .from('AgendaBot_RefreshToken')
      .select('*, user:AgendaBot_User(*, tenant:AgendaBot_Tenant(id, slug, is_active))')
      .eq('token_hash', tokenHash)
      .maybeSingle()

    if (error) throw error
    return data
  }

  async revokeRefreshToken(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const { error } = await supabaseAdmin
      .from('AgendaBot_RefreshToken')
      .update({ revoked_at: new Date().toISOString() })
      .eq('token_hash', tokenHash)

    if (error) throw error
  }

  async updateLastLogin(userId: string) {
    const { error } = await supabaseAdmin
      .from('AgendaBot_User')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) throw error
  }

  async slugExists(slug: string): Promise<boolean> {
    const { count, error } = await supabaseAdmin
      .from('AgendaBot_Tenant')
      .select('*', { count: 'exact', head: true })
      .eq('slug', slug)

    if (error) throw error
    return (count ?? 0) > 0
  }
}
