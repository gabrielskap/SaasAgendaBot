import dayjs from 'dayjs'
import { prisma } from '../../config/database'
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

const INCLUDE_SUMMARY = {
  client: { select: { id: true, name: true, phone: true, avatar_url: true } },
  professional: { select: { id: true, name: true, avatar_url: true, color: true } },
  service: { select: { id: true, name: true, duration_minutes: true, price: true } },
} as const

export class AppointmentsRepository {
  async findMany(tenantId: string, query: ListQuery) {
    const { page, limit, professional_id, client_id, status, date_from, date_to } = query
    const skip = (page - 1) * limit

    const where = {
      tenant_id: tenantId,
      ...(professional_id && { professional_id }),
      ...(client_id && { client_id }),
      ...(status && { status: status as AppointmentStatus }),
      ...((date_from || date_to) && {
        scheduled_at: {
          ...(date_from && { gte: new Date(date_from) }),
          ...(date_to && { lte: new Date(date_to) }),
        },
      }),
    }

    const [data, total] = await Promise.all([
      prisma.agendaBot_Appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduled_at: 'asc' },
        include: INCLUDE_SUMMARY,
      }),
      prisma.agendaBot_Appointment.count({ where }),
    ])

    return { data, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async findById(id: string, tenantId: string) {
    return prisma.agendaBot_Appointment.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        ...INCLUDE_SUMMARY,
        client: true,
        logs: {
          orderBy: { created_at: 'desc' },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    })
  }

  async findToday(tenantId: string) {
    return prisma.agendaBot_Appointment.findMany({
      where: {
        tenant_id: tenantId,
        scheduled_at: {
          gte: dayjs().startOf('day').toDate(),
          lte: dayjs().endOf('day').toDate(),
        },
      },
      orderBy: { scheduled_at: 'asc' },
      include: INCLUDE_SUMMARY,
    })
  }

  async create(
    tenantId: string,
    userId: string | undefined,
    data: CreateAppointmentInput & { end_at: Date; duration_minutes: number; price: number },
  ) {
    return prisma.agendaBot_Appointment.create({
      data: {
        tenant_id: tenantId,
        client_id: data.client_id,
        professional_id: data.professional_id,
        service_id: data.service_id,
        scheduled_at: new Date(data.scheduled_at),
        end_at: data.end_at,
        duration_minutes: data.duration_minutes,
        price: data.price,
        notes: data.notes,
        booked_via: data.booked_via,
        deposit_amount: data.deposit_amount,
        created_by: userId,
      },
      include: INCLUDE_SUMMARY,
    })
  }

  async update(
    id: string,
    data: UpdateAppointmentInput & { end_at?: Date },
  ) {
    return prisma.agendaBot_Appointment.update({
      where: { id },
      data: {
        ...(data.scheduled_at && { scheduled_at: new Date(data.scheduled_at) }),
        ...(data.end_at && { end_at: data.end_at }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.deposit_paid !== undefined && { deposit_paid: data.deposit_paid }),
      },
      include: INCLUDE_SUMMARY,
    })
  }

  async updateStatus(
    id: string,
    userId: string,
    input: UpdateStatusInput,
    oldStatus: AppointmentStatus,
  ) {
    const [appointment] = await prisma.$transaction([
      prisma.agendaBot_Appointment.update({
        where: { id },
        data: {
          status: input.status as AppointmentStatus,
          ...(input.status === 'CANCELLED' && {
            cancelled_reason: input.cancelled_reason,
            cancelled_at: new Date(),
          }),
        },
        include: INCLUDE_SUMMARY,
      }),
      prisma.agendaBot_AppointmentLog.create({
        data: {
          appointment_id: id,
          changed_by: userId,
          old_status: oldStatus,
          new_status: input.status as AppointmentStatus,
          note: input.cancelled_reason,
        },
      }),
    ])

    return appointment
  }

  async findConflicts(
    professionalId: string,
    scheduledAt: Date,
    endAt: Date,
    excludeId?: string,
  ) {
    return prisma.agendaBot_Appointment.findMany({
      where: {
        professional_id: professionalId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        ...(excludeId && { id: { not: excludeId } }),
        scheduled_at: { lt: endAt },
        end_at: { gt: scheduledAt },
      },
    })
  }

  async findByProfessionalOnDate(professionalId: string, date: string) {
    return prisma.agendaBot_Appointment.findMany({
      where: {
        professional_id: professionalId,
        scheduled_at: {
          gte: dayjs(date).startOf('day').toDate(),
          lte: dayjs(date).endOf('day').toDate(),
        },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      orderBy: { scheduled_at: 'asc' },
      select: { scheduled_at: true, end_at: true },
    })
  }

  async getMetrics(tenantId: string, from: Date, to: Date) {
    const base = { tenant_id: tenantId, scheduled_at: { gte: from, lte: to } }

    const [total, completed, cancelled, noShow] = await Promise.all([
      prisma.agendaBot_Appointment.count({ where: base }),
      prisma.agendaBot_Appointment.count({ where: { ...base, status: 'COMPLETED' } }),
      prisma.agendaBot_Appointment.count({ where: { ...base, status: 'CANCELLED' } }),
      prisma.agendaBot_Appointment.count({ where: { ...base, status: 'NO_SHOW' } }),
    ])

    const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0)

    return {
      total,
      completed,
      cancelled,
      no_show: noShow,
      completion_rate: pct(completed),
      cancellation_rate: pct(cancelled),
      no_show_rate: pct(noShow),
    }
  }
}
