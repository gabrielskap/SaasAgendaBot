import crypto from 'crypto'
import { prisma } from '../../config/database'
import type { RegisterInput } from './auth.schema'

export class AuthRepository {
  async createTenantWithAdmin(data: RegisterInput & { password_hash: string }) {
    return prisma.agendaBot_Tenant.create({
      data: {
        name: data.tenant_name,
        slug: data.tenant_slug,
        users: {
          create: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            password_hash: data.password_hash,
            role: 'ADMIN',
          },
        },
      },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, tenant_id: true },
        },
      },
    })
  }

  async findUserByEmailAndSlug(email: string, tenantSlug: string) {
    return prisma.agendaBot_User.findFirst({
      where: {
        email,
        is_active: true,
        deleted_at: null,
        tenant: { slug: tenantSlug, is_active: true, deleted_at: null },
      },
      include: {
        tenant: { select: { id: true, name: true, slug: true, is_active: true } },
      },
    })
  }

  async findUserById(id: string) {
    return prisma.agendaBot_User.findFirst({
      where: { id, is_active: true, deleted_at: null },
      include: {
        tenant: { select: { id: true, name: true, slug: true, plan: true } },
      },
    })
  }

  async createRefreshToken(userId: string, expiresAt: Date): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    await prisma.agendaBot_RefreshToken.create({
      data: { user_id: userId, token_hash: tokenHash, expires_at: expiresAt },
    })

    return token
  }

  async findRefreshToken(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    return prisma.agendaBot_RefreshToken.findUnique({
      where: { token_hash: tokenHash },
      include: {
        user: {
          include: {
            tenant: { select: { id: true, slug: true, is_active: true } },
          },
        },
      },
    })
  }

  async revokeRefreshToken(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    await prisma.agendaBot_RefreshToken.updateMany({
      where: { token_hash: tokenHash },
      data: { revoked_at: new Date() },
    })
  }

  async updateLastLogin(userId: string) {
    await prisma.agendaBot_User.update({
      where: { id: userId },
      data: { last_login_at: new Date() },
    })
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await prisma.agendaBot_Tenant.count({ where: { slug } })
    return count > 0
  }
}
