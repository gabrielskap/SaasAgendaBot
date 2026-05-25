import dayjs from 'dayjs'
import { supabaseAdmin } from '../../config/database'
import type {
  CreateAppointmentInput,
  ListQuery,
  UpdateAppointmentInput,
  UpdateStatusInput,
} from './appointments.schema'

type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

const SUMMARY_SELECT = `
  *,
  client:AgendaBot_Client(id, name, phone, avatar_url),
  professional:AgendaBot_Professional(id, name, avatar_url, color),
  service:AgendaBot_Service(id, name, duration_minutes, price)
`

export class AppointmentsRepository {
  async findMany(tenantId: string, query: ListQuery) {
    const { page, limit, professional_id, client_id, status, date_from, date_to } = query
    const skip = (page - 1) * limit

    let q = supabaseAdmin
      .from('AgendaBot_Appointment')
      .select(SUMMARY_SELECT, { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('scheduled_at', { ascending: true })
      .range(skip, skip + limit - 1)

    if (professional_id) q = q.eq('professional_id', professional_id)
    if (client_id) q = q.eq('client_id', client_id)
    if (status) q = q.eq('status', status)
    if (date_from) q = q.gte('scheduled_at', date_from)
    if (date_to) q = q.lte('scheduled_at', date_to)

    const { data, count, error } = await q
    if (error) throw error

    const total = count ?? 0
    return { data: data ?? [], total, page, limit, pages: Math.ceil(total / limit) }
  }

  async findById(id: string, tenantId: string) {
    const { data, error } = await supabaseAdmin
      .from('AgendaBot_Appointment')
      .select(`
        *,
        client:AgendaBot_Client(*),
        professional:AgendaBot_Professional(id, name, avatar_url, color),
        service:AgendaBot_Service(id, name, duration_minutes, price),
        logs:AgendaBot_AppointmentLog(*, user:AgendaBot_User(id, name))
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    return {
      ...data,
      logs: ((data as any).logs ?? []).sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    }
  }

  async findToday(tenantId: string) {
    const start = dayjs().startOf('day').toISOString()
    const end = dayjs().endOf('day').toISOString()

    const { data, error } = await supabaseAdmin
      .from('AgendaBot_Appointment')
      .select(SUMMARY_SELECT)
      .eq('tenant_id', tenantId)
      .gte('scheduled_at', start)
      .lte('scheduled_at', end)
      .order('scheduled_at', { ascending: true })

    if (error) throw error
    return data ?? []
  }

  async create(
    tenantId: string,
    userId: string | undefined,
    data: CreateAppointmentInput & { end_at: Date; duration_minutes: number; price: number },
  ) {
    const { data: result, error } = await supabaseAdmin
      .from('AgendaBot_Appointment')
      .insert({
        tenant_id: tenantId,
        client_id: data.client_id,
        professional_id: data.professional_id,
        service_id: data.service_id,
        scheduled_at: new Date(data.scheduled_at).toISOString(),
        end_at: data.end_at.toISOString(),
        duration_minutes: data.duration_minutes,
        price: data.price,
        notes: data.notes,
        booked_via: data.booked_via,
        deposit_amount: data.deposit_amount,
        created_by: userId,
      })
      .select(SUMMARY_SELECT)
      .single()

    if (error) throw error
    return result
  }

  async update(
    id: string,
    data: UpdateAppointmentInput & { end_at?: Date },
  ) {
    const updateData: Record<string, unknown> = {}
    if (data.scheduled_at) updateData.scheduled_at = new Date(data.scheduled_at).toISOString()
    if (data.end_at) updateData.end_at = data.end_at.toISOString()
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.deposit_paid !== undefined) updateData.deposit_paid = data.deposit_paid

    const { data: result, error } = await supabaseAdmin
      .from('AgendaBot_Appointment')
      .update(updateData)
      .eq('id', id)
      .select(SUMMARY_SELECT)
      .single()

    if (error) throw error
    return result
  }

  async updateStatus(
    id: string,
    userId: string,
    input: UpdateStatusInput,
    oldStatus: AppointmentStatus,
  ) {
    const updateData: Record<string, unknown> = { status: input.status }
    if (input.status === 'CANCELLED') {
      updateData.cancelled_reason = input.cancelled_reason
      updateData.cancelled_at = new Date().toISOString()
    }

    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from('AgendaBot_Appointment')
      .update(updateData)
      .eq('id', id)
      .select(SUMMARY_SELECT)
      .single()

    if (appointmentError) throw appointmentError

    await supabaseAdmin
      .from('AgendaBot_AppointmentLog')
      .insert({
        appointment_id: id,
        changed_by: userId,
        old_status: oldStatus,
        new_status: input.status,
        note: input.cancelled_reason,
      })

    return appointment
  }

  async findConflicts(
    professionalId: string,
    scheduledAt: Date,
    endAt: Date,
    excludeId?: string,
  ) {
    let q = supabaseAdmin
      .from('AgendaBot_Appointment')
      .select('id')
      .eq('professional_id', professionalId)
      .not('status', 'in', '(CANCELLED,NO_SHOW)')
      .lt('scheduled_at', endAt.toISOString())
      .gt('end_at', scheduledAt.toISOString())

    if (excludeId) q = q.neq('id', excludeId)

    const { data, error } = await q
    if (error) throw error
    return data ?? []
  }

  async findByProfessionalOnDate(professionalId: string, date: string) {
    const start = dayjs(date).startOf('day').toISOString()
    const end = dayjs(date).endOf('day').toISOString()

    const { data, error } = await supabaseAdmin
      .from('AgendaBot_Appointment')
      .select('scheduled_at, end_at')
      .eq('professional_id', professionalId)
      .gte('scheduled_at', start)
      .lte('scheduled_at', end)
      .not('status', 'in', '(CANCELLED,NO_SHOW)')
      .order('scheduled_at', { ascending: true })

    if (error) throw error
    return (data ?? []).map((row) => ({
      scheduled_at: new Date(row.scheduled_at),
      end_at: new Date(row.end_at),
    }))
  }

  async getMetrics(tenantId: string, from: Date, to: Date) {
    const makeCountQuery = (status?: string) => {
      let q = supabaseAdmin
        .from('AgendaBot_Appointment')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('scheduled_at', from.toISOString())
        .lte('scheduled_at', to.toISOString())
      if (status) q = q.eq('status', status)
      return q
    }

    const [
      { count: total, error: e1 },
      { count: completed, error: e2 },
      { count: cancelled, error: e3 },
      { count: noShow, error: e4 },
    ] = await Promise.all([
      makeCountQuery(),
      makeCountQuery('COMPLETED'),
      makeCountQuery('CANCELLED'),
      makeCountQuery('NO_SHOW'),
    ])

    if (e1 ?? e2 ?? e3 ?? e4) throw e1 ?? e2 ?? e3 ?? e4

    const t = total ?? 0
    const pct = (n: number) => (t > 0 ? Math.round((n / t) * 100) : 0)

    return {
      total: t,
      completed: completed ?? 0,
      cancelled: cancelled ?? 0,
      no_show: noShow ?? 0,
      completion_rate: pct(completed ?? 0),
      cancellation_rate: pct(cancelled ?? 0),
      no_show_rate: pct(noShow ?? 0),
    }
  }
}
