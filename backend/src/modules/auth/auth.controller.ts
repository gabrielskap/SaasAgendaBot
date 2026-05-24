import type { FastifyReply, FastifyRequest } from 'fastify'
import type { AuthService } from './auth.service'
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.schema'

export class AuthController {
  constructor(private service: AuthService) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    const input = registerSchema.parse(request.body)
    const result = await this.service.register(input)
    return reply.status(201).send(result)
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const input = loginSchema.parse(request.body)
    const result = await this.service.login(input)
    return reply.send(result)
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const input = refreshSchema.parse(request.body)
    const result = await this.service.refresh(input)
    return reply.send(result)
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const { refresh_token } = refreshSchema.parse(request.body)
    await this.service.logout(refresh_token)
    return reply.status(204).send()
  }

  async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
    forgotPasswordSchema.parse(request.body)
    // TODO: enviar email com token de reset (integrar com serviço de email)
    return reply.send({ message: 'If the email exists, a reset link was sent' })
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    resetPasswordSchema.parse(request.body)
    // TODO: validar token e atualizar senha
    return reply.send({ message: 'Password updated successfully' })
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.service.me(request.userId)
    return reply.send(result)
  }
}
