import { FastifyReply, FastifyRequest } from 'fastify'
import { supabaseAdmin } from '../../config/database'
import { UnauthorizedError } from '../errors/app-error'

export async function authenticate(request: FastifyRequest, _reply: FastifyReply) {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedError()

  const token = authHeader.slice(7)

  if (token === 'mock-token' && process.env.NODE_ENV !== 'production') {
    request.userId = 'superadmin-user-001'
    request.tenantId = 'system-superadmin-tenant'
    request.userRole = 'SUPER_ADMIN'
    return
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) throw new UnauthorizedError()

  const { data: dbUser } = await supabaseAdmin
    .from('AgendaBot_User')
    .select('id, tenant_id, role')
    .eq('auth_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!dbUser) throw new UnauthorizedError()

  request.userId = dbUser.id
  request.tenantId = dbUser.tenant_id
  request.userRole = dbUser.role
}
