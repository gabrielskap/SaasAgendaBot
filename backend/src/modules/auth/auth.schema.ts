import { z } from 'zod'

export const registerSchema = z.object({
  tenant_name: z.string().min(2).max(100),
  tenant_slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers and hyphens'),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  tenant_slug: z.string(),
})

export const refreshSchema = z.object({
  refresh_token: z.string(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
  tenant_slug: z.string(),
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshInput = z.infer<typeof refreshSchema>
