import bcrypt from 'bcryptjs'
import dayjs from 'dayjs'
import type { FastifyInstance } from 'fastify'
import { env } from '../../config/env'
import { ConflictError, NotFoundError, UnauthorizedError } from '../../shared/errors/app-error'
import { AuthRepository } from './auth.repository'
import type { LoginInput, RefreshInput, RegisterInput } from './auth.schema'

export class AuthService {
  private repo = new AuthRepository()

  constructor(private fastify: FastifyInstance) {}

  async register(input: RegisterInput) {
    if (await this.repo.slugExists(input.tenant_slug)) {
      throw new ConflictError(`Slug "${input.tenant_slug}" is already taken`)
    }

    const password_hash = await bcrypt.hash(input.password, 10)
    const result = await this.repo.createTenantWithAdmin({ ...input, password_hash })
    const user = result.users[0]

    const accessToken = this.signAccess(user.id, result.id, user.role)
    const refreshToken = await this.repo.createRefreshToken(
      user.id,
      dayjs().add(env.JWT_REFRESH_EXPIRES_DAYS, 'day').toDate(),
    )

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant: { id: result.id, name: result.name, slug: result.slug },
      },
    }
  }

  async login(input: LoginInput) {
    const user = await this.repo.findUserByEmailAndSlug(input.email, input.tenant_slug)

    if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
      throw new UnauthorizedError('Invalid credentials')
    }

    await this.repo.updateLastLogin(user.id)

    const accessToken = this.signAccess(user.id, user.tenant_id, user.role)
    const refreshToken = await this.repo.createRefreshToken(
      user.id,
      dayjs().add(env.JWT_REFRESH_EXPIRES_DAYS, 'day').toDate(),
    )

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant: { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug },
      },
    }
  }

  async refresh(input: RefreshInput) {
    const record = await this.repo.findRefreshToken(input.refresh_token)

    if (!record || record.revoked_at || dayjs().isAfter(record.expires_at)) {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    if (!record.user.is_active || !record.user.tenant.is_active) {
      throw new UnauthorizedError('Account is inactive')
    }

    // Rotate: revoke old, issue new
    await this.repo.revokeRefreshToken(input.refresh_token)
    const newRefreshToken = await this.repo.createRefreshToken(
      record.user.id,
      dayjs().add(env.JWT_REFRESH_EXPIRES_DAYS, 'day').toDate(),
    )

    return {
      access_token: this.signAccess(record.user.id, record.user.tenant_id, record.user.role),
      refresh_token: newRefreshToken,
    }
  }

  async logout(refreshToken: string) {
    await this.repo.revokeRefreshToken(refreshToken)
  }

  async me(userId: string) {
    const user = await this.repo.findUserById(userId)
    if (!user) throw new NotFoundError('User')

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar_url: user.avatar_url,
      role: user.role,
      last_login_at: user.last_login_at,
      tenant: user.tenant,
    }
  }

  private signAccess(userId: string, tenantId: string, role: string): string {
    return this.fastify.jwt.sign(
      { sub: userId, tenant_id: tenantId, role },
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN },
    )
  }
}
