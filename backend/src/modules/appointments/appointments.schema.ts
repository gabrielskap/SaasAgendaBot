import { z } from 'zod'

export const createAppointmentSchema = z.object({
  client_id: z.string().cuid(),
  professional_id: z.string().cuid(),
  service_id: z.string().cuid(),
  scheduled_at: z.string().datetime(),
  notes: z.string().optional(),
  booked_via: z.enum(['WHATSAPP', 'MANUAL', 'ONLINE']).default('MANUAL'),
  deposit_amount: z.number().positive().optional(),
})

export const updateAppointmentSchema = z.object({
  scheduled_at: z.string().datetime().optional(),
  notes: z.string().optional(),
  deposit_paid: z.boolean().optional(),
})

export const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  cancelled_reason: z.string().optional(),
})

export const availabilityQuerySchema = z.object({
  professional_id: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  service_id: z.string().cuid(),
})

export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  professional_id: z.string().cuid().optional(),
  client_id: z.string().cuid().optional(),
  status: z
    .enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
    .optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
})

export const metricsQuerySchema = z.object({
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>
export type ListQuery = z.infer<typeof listQuerySchema>
