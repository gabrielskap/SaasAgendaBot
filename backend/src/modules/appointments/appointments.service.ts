import dayjs from 'dayjs'
import { prisma } from '../../config/database'
import { AppError, NotFoundError } from '../../shared/errors/app-error'
import { AppointmentsRepository } from './appointments.repository'
import type {
  AvailabilityQuery,
  CreateAppointmentInput,
  ListQuery,
  UpdateAppointmentInput,
  UpdateStatusInput,
} from './appointments.schema'

const SLOT_INTERVAL_MIN = 30

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
}

export class AppointmentsService {
  private repo = new AppointmentsRepository()

  async list(tenantId: string, query: ListQuery) {
    return this.repo.findMany(tenantId, query)
  }

  async findById(id: string, tenantId: string) {
    const item = await this.repo.findById(id, tenantId)
    if (!item) throw new NotFoundError('Appointment')
    return item
  }

  async today(tenantId: string) {
    return this.repo.findToday(tenantId)
  }

  async create(tenantId: string, userId: string | undefined, input: CreateAppointmentInput) {
    const [service, professional, client] = await Promise.all([
      prisma.agendaBot_Service.findFirst({
        where: { id: input.service_id, tenant_id: tenantId, is_active: true, deleted_at: null },
      }),
      prisma.agendaBot_Professional.findFirst({
        where: { id: input.professional_id, tenant_id: tenantId, is_active: true, deleted_at: null },
      }),
      prisma.agendaBot_Client.findFirst({
        where: { id: input.client_id, tenant_id: tenantId, deleted_at: null },
      }),
    ])

    if (!service) throw new NotFoundError('Service')
    if (!professional) throw new NotFoundError('Professional')
    if (!client) throw new NotFoundError('Client')

    const scheduledAt = new Date(input.scheduled_at)
    const endAt = dayjs(scheduledAt).add(service.duration_minutes, 'minute').toDate()

    const conflicts = await this.repo.findConflicts(input.professional_id, scheduledAt, endAt)
    if (conflicts.length > 0) {
      throw new AppError(
        'Professional is unavailable at the requested time',
        409,
        'SCHEDULE_CONFLICT',
      )
    }

    return this.repo.create(tenantId, userId, {
      ...input,
      end_at: endAt,
      duration_minutes: service.duration_minutes,
      price: Number(service.price),
    })
  }

  async update(id: string, tenantId: string, input: UpdateAppointmentInput) {
    const appointment = await this.findById(id, tenantId)

    if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) {
      throw new AppError('Cannot modify a completed or cancelled appointment', 400, 'INVALID_STATUS')
    }

    let endAt: Date | undefined
    if (input.scheduled_at) {
      endAt = dayjs(input.scheduled_at).add(appointment.duration_minutes, 'minute').toDate()

      const conflicts = await this.repo.findConflicts(
        appointment.professional_id,
        new Date(input.scheduled_at),
        endAt,
        id,
      )
      if (conflicts.length > 0) {
        throw new AppError(
          'Professional is unavailable at the requested time',
          409,
          'SCHEDULE_CONFLICT',
        )
      }
    }

    return this.repo.update(id, { ...input, end_at: endAt })
  }

  async updateStatus(
    id: string,
    tenantId: string,
    userId: string,
    input: UpdateStatusInput,
  ) {
    const appointment = await this.findById(id, tenantId)

    if (!VALID_TRANSITIONS[appointment.status]?.includes(input.status)) {
      throw new AppError(
        `Cannot transition from ${appointment.status} to ${input.status}`,
        400,
        'INVALID_STATUS_TRANSITION',
      )
    }

    return this.repo.updateStatus(id, userId, input, appointment.status as any)
  }

  async checkAvailability(tenantId: string, query: AvailabilityQuery) {
    const [service, professional] = await Promise.all([
      prisma.agendaBot_Service.findFirst({
        where: { id: query.service_id, tenant_id: tenantId, is_active: true },
      }),
      prisma.agendaBot_Professional.findFirst({
        where: { id: query.professional_id, tenant_id: tenantId, is_active: true },
        include: {
          hours: true,
          time_off: { where: { start_date: { lte: new Date(query.date) }, end_date: { gte: new Date(query.date) } } },
        },
      }),
    ])

    if (!service) throw new NotFoundError('Service')
    if (!professional) throw new NotFoundError('Professional')

    if (professional.time_off.length > 0) return { available_slots: [] }

    const dayOfWeek = dayjs(query.date).day()
    const workHours = professional.hours.find((h) => h.day_of_week === dayOfWeek)
    if (!workHours || workHours.is_day_off) return { available_slots: [] }

    const busySlots = await this.repo.findByProfessionalOnDate(query.professional_id, query.date)

    return {
      available_slots: this.generateSlots(
        query.date,
        workHours.start_time,
        workHours.end_time,
        service.duration_minutes,
        busySlots,
      ),
    }
  }

  private generateSlots(
    date: string,
    startTime: string,
    endTime: string,
    durationMin: number,
    busy: { scheduled_at: Date; end_at: Date }[],
  ): string[] {
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)

    let current = dayjs(date).hour(sh).minute(sm).second(0).millisecond(0)
    const workEnd = dayjs(date).hour(eh).minute(em).second(0).millisecond(0)
    const slots: string[] = []

    while (current.isBefore(workEnd)) {
      const slotEnd = current.add(durationMin, 'minute')
      if (slotEnd.isAfter(workEnd)) break

      const hasConflict = busy.some(
        (b) => current.isBefore(dayjs(b.end_at)) && slotEnd.isAfter(dayjs(b.scheduled_at)),
      )

      if (!hasConflict) slots.push(current.format('HH:mm'))
      current = current.add(SLOT_INTERVAL_MIN, 'minute')
    }

    return slots
  }

  async getMetrics(tenantId: string, dateFrom?: string, dateTo?: string) {
    const from = dateFrom ? new Date(dateFrom) : dayjs().startOf('month').toDate()
    const to = dateTo ? new Date(dateTo) : dayjs().endOf('month').toDate()
    return this.repo.getMetrics(tenantId, from, to)
  }
}
