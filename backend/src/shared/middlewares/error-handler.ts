import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { AppError } from '../errors/app-error'

export function errorHandler(
  error: FastifyError | AppError | ZodError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.code ?? 'APP_ERROR',
      message: error.message,
    })
  }

  if (error instanceof ZodError) {
    return reply.status(422).send({
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: error.flatten().fieldErrors,
    })
  }

  const fastifyError = error as FastifyError
  if (fastifyError.statusCode) {
    return reply.status(fastifyError.statusCode).send({
      error: fastifyError.code ?? 'FASTIFY_ERROR',
      message: fastifyError.message,
    })
  }

  request.log.error(error)
  return reply.status(500).send({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  })
}
