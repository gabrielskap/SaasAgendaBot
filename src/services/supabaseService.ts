import { supabase } from '../lib/supabase';
import {
  Agendamento,
  BookingStatus,
  CampanhaReengajamento,
  Cliente,
  ConversaChat,
  Profissional,
  Servico,
} from '../types';

// ── Status mapping ────────────────────────────────────────────────────────────

const STATUS_DB_TO_APP: Record<string, BookingStatus> = {
  PENDING: BookingStatus.PENDENTE,
  CONFIRMED: BookingStatus.CONFIRMADO,
  IN_PROGRESS: BookingStatus.EM_ANDAMENTO,
  COMPLETED: BookingStatus.CONCLUIDO,
  CANCELLED: BookingStatus.CANCELADO,
  NO_SHOW: BookingStatus.CANCELADO,
};

export const STATUS_APP_TO_DB: Record<BookingStatus, string> = {
  [BookingStatus.PENDENTE]: 'PENDING',
  [BookingStatus.CONFIRMADO]: 'CONFIRMED',
  [BookingStatus.EM_ANDAMENTO]: 'IN_PROGRESS',
  [BookingStatus.CONCLUIDO]: 'COMPLETED',
  [BookingStatus.CANCELADO]: 'CANCELLED',
};

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapAppointment(row: any): Agendamento {
  const dt = new Date(row.scheduled_at);
  return {
    id: row.id,
    clienteId: row.client_id ?? '',
    clienteNome: row.client?.name ?? '',
    clienteTelefone: row.client?.phone ?? '',
    clienteEmail: row.client?.email ?? '',
    servicoId: row.service_id ?? '',
    servicoNome: row.service?.name ?? '',
    profissionalId: row.professional_id ?? '',
    profissionalNome: row.professional?.name ?? '',
    data: dt.toISOString().split('T')[0],
    horario: dt.toTimeString().slice(0, 5),
    status: STATUS_DB_TO_APP[row.status] ?? BookingStatus.PENDENTE,
    valor: Number(row.price ?? 0),
    observacoes: row.notes ?? undefined,
    notificarWhats: row.notify_whatsapp ?? true,
    cobrarSinal: Number(row.deposit_amount ?? 0) > 0,
    sinalValor: Number(row.deposit_amount ?? 0) > 0 ? Number(row.deposit_amount) : undefined,
    historico: (row.logs ?? []).map((l: any) => ({
      dataHora: new Date(l.created_at).toLocaleString('pt-BR'),
      acao: l.new_status
        ? `Status → ${l.new_status}${l.note ? ': ' + l.note : ''}`
        : (l.note ?? ''),
      usuario: l.user?.name ?? 'Sistema',
    })),
  };
}

function mapClient(row: any): Cliente {
  return {
    id: row.id,
    nome: row.name,
    telefone: row.phone ?? '',
    email: row.email ?? '',
    totalVisitas: row.total_visits ?? 0,
    ultimoAgendamento: row.last_appointment_at
      ? new Date(row.last_appointment_at).toISOString().split('T')[0]
      : 'Sem agendamentos',
    valorTotalGasto: Number(row.total_spent ?? 0),
    status: (row.is_active ?? true) ? 'Ativo' : 'Inativo',
    vip: row.is_vip ?? false,
    observacoes: row.notes ?? '',
    dataCadastro: row.created_at
      ? new Date(row.created_at).toISOString().split('T')[0]
      : '',
    servicosFavoritos: row.favorite_services ?? [],
    profissionalPreferido: row.preferred_professional ?? 'Não definido',
  };
}

function mapProfessional(row: any): Profissional {
  const s = row.status ?? 'ACTIVE';
  return {
    id: row.id,
    nome: row.name,
    avatar: row.avatar_url ?? '',
    especialidades: row.specialties ?? [],
    status: s === 'ACTIVE' ? 'Ativo' : s === 'VACATION' ? 'Férias' : 'Inativo',
    atendimentosMes: row.appointments_this_month ?? 0,
    faturamento: Number(row.revenue_this_month ?? 0),
    avaliacao: Number(row.rating ?? 5.0),
    comissaoPercentual: row.commission_percent ?? 40,
  };
}

function mapService(row: any): Servico {
  return {
    id: row.id,
    nome: row.name,
    categoria: row.category ?? '',
    duracao: `${row.duration_minutes ?? 30}min`,
    preco: Number(row.price ?? 0),
    profissionaisIds: row.professional_ids ?? [],
    status: (row.is_active ?? true) ? 'Ativo' : 'Inativo',
    descricao: row.description ?? '',
    imagem: row.image_url ?? undefined,
  };
}

function mapCampaign(row: any): CampanhaReengajamento {
  const statusMap: Record<string, CampanhaReengajamento['status']> = {
    COMPLETED: 'Concluída',
    SCHEDULED: 'Agendada',
    ACTIVE: 'Ativa',
  };
  return {
    id: row.id,
    nome: row.name,
    publicoAlvo: row.target_audience ?? '',
    mensagem: row.message ?? '',
    dataAgendada: row.scheduled_at ?? '',
    tipo: row.type === 'ONE_TIME' ? 'Única' : 'Recorrente',
    status: statusMap[row.status] ?? 'Ativa',
    metricas: {
      enviadas: row.metrics_sent ?? 0,
      responderam: row.metrics_responded ?? 0,
      converteram: row.metrics_converted ?? 0,
    },
  };
}

function mapConversation(row: any): ConversaChat {
  return {
    id: row.id,
    clienteNome: row.client_name ?? '',
    clienteTelefone: row.client_phone ?? '',
    mensagens: (row.messages ?? []).map((m: any) => ({
      remetente:
        m.sender === 'client' ? 'cliente' : m.sender === 'human' ? 'humano' : 'bot',
      texto: m.text ?? '',
      timestamp: new Date(m.created_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    })),
    status: row.status === 'human' ? 'humano' : 'bot',
    ultimaMensagem: row.last_message ?? '',
    ultimoTimestamp: row.last_message_at
      ? new Date(row.last_message_at).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '',
  };
}

function formatTimeAgo(date: Date): string {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 60) return `Há ${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Há ${diffH}h`;
  return `Há ${Math.floor(diffH / 24)}d`;
}

// ── Appointments ──────────────────────────────────────────────────────────────

const APPT_SELECT = `
  *,
  client:AgendaBot_Client(id, name, phone, email),
  professional:AgendaBot_Professional(id, name, avatar_url),
  service:AgendaBot_Service(id, name, duration_minutes, price),
  logs:AgendaBot_AppointmentLog(id, created_at, old_status, new_status, note, user:AgendaBot_User(id, name))
`;

export async function fetchAppointments(
  tenantId: string,
  from?: string,
  to?: string,
): Promise<Agendamento[]> {
  let q = supabase
    .from('AgendaBot_Appointment')
    .select(APPT_SELECT)
    .eq('tenant_id', tenantId)
    .order('scheduled_at', { ascending: true });
  if (from) q = q.gte('scheduled_at', `${from}T00:00:00`);
  if (to) q = q.lte('scheduled_at', `${to}T23:59:59`);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(mapAppointment);
}

export async function createAppointment(
  tenantId: string,
  booking: Omit<Agendamento, 'id' | 'historico'>,
  userId?: string,
): Promise<Agendamento> {
  const scheduledAt = `${booking.data}T${booking.horario}:00`;
  const { data, error } = await supabase
    .from('AgendaBot_Appointment')
    .insert({
      tenant_id: tenantId,
      client_id: booking.clienteId || null,
      professional_id: booking.profissionalId,
      service_id: booking.servicoId,
      scheduled_at: scheduledAt,
      price: booking.valor,
      notes: booking.observacoes ?? null,
      status: STATUS_APP_TO_DB[booking.status],
      deposit_amount: booking.cobrarSinal ? (booking.sinalValor ?? null) : null,
      created_by: userId ?? null,
    })
    .select(APPT_SELECT)
    .single();
  if (error) throw error;
  return mapAppointment(data);
}

export async function updateAppointmentStatus(
  id: string,
  tenantId: string,
  newStatus: BookingStatus,
): Promise<void> {
  const { error } = await supabase
    .from('AgendaBot_Appointment')
    .update({ status: STATUS_APP_TO_DB[newStatus] })
    .eq('id', id)
    .eq('tenant_id', tenantId);
  if (error) throw error;
}

// ── Clients ───────────────────────────────────────────────────────────────────

export async function fetchClients(tenantId: string): Promise<Cliente[]> {
  const { data, error } = await supabase
    .from('AgendaBot_Client')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapClient);
}

export async function createClient(
  tenantId: string,
  client: { nome: string; telefone: string; email: string; observacoes?: string },
): Promise<Cliente> {
  const { data, error } = await supabase
    .from('AgendaBot_Client')
    .insert({
      tenant_id: tenantId,
      name: client.nome,
      phone: client.telefone,
      email: client.email || null,
      notes: client.observacoes ?? null,
      is_active: true,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapClient(data);
}

// ── Professionals ─────────────────────────────────────────────────────────────

export async function fetchProfessionals(tenantId: string): Promise<Profissional[]> {
  const { data, error } = await supabase
    .from('AgendaBot_Professional')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapProfessional);
}

export async function createProfessional(
  tenantId: string,
  pro: { nome: string; especialidades: string[]; comissaoPercentual: number },
): Promise<Profissional> {
  const { data, error } = await supabase
    .from('AgendaBot_Professional')
    .insert({
      tenant_id: tenantId,
      name: pro.nome,
      specialties: pro.especialidades,
      commission_percent: pro.comissaoPercentual,
      status: 'ACTIVE',
      rating: 5.0,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapProfessional(data);
}

// ── Services ──────────────────────────────────────────────────────────────────

export async function fetchServices(tenantId: string): Promise<Servico[]> {
  const { data, error } = await supabase
    .from('AgendaBot_Service')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapService);
}

export async function createService(
  tenantId: string,
  service: { nome: string; categoria: string; duracao: string; preco: number; descricao?: string },
): Promise<Servico> {
  const { data, error } = await supabase
    .from('AgendaBot_Service')
    .insert({
      tenant_id: tenantId,
      name: service.nome,
      category: service.categoria,
      duration_minutes: parseInt(service.duracao) || 30,
      price: service.preco,
      description: service.descricao ?? null,
      is_active: true,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapService(data);
}

// ── Financial Transactions ────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  hora: string;
  cliente: string;
  tipo: 'Entrada' | 'Saída';
  servico: string;
  profissional: string;
  formaPagamento: string;
  valor: number;
}

export async function fetchTransactions(tenantId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('AgendaBot_Transaction')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any): Transaction => ({
    id: row.id,
    hora: new Date(row.created_at).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    cliente: row.client_name ?? '',
    tipo: row.type === 'INCOME' ? 'Entrada' : 'Saída',
    servico: row.service_name ?? '',
    profissional: row.professional_name ?? '-',
    formaPagamento: row.payment_method ?? '',
    valor: Number(row.amount ?? 0),
  }));
}

// ── Campaigns ─────────────────────────────────────────────────────────────────

export async function fetchCampaigns(tenantId: string): Promise<CampanhaReengajamento[]> {
  const { data, error } = await supabase
    .from('AgendaBot_Campaign')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapCampaign);
}

export async function updateCampaignStatus(
  id: string,
  tenantId: string,
  metrics: { enviadas: number; responderam: number; converteram: number },
): Promise<void> {
  const { error } = await supabase
    .from('AgendaBot_Campaign')
    .update({
      status: 'COMPLETED',
      metrics_sent: metrics.enviadas,
      metrics_responded: metrics.responderam,
      metrics_converted: metrics.converteram,
    })
    .eq('id', id)
    .eq('tenant_id', tenantId);
  if (error) throw error;
}

// ── Fidelity ──────────────────────────────────────────────────────────────────

export interface FidelityRankingItem {
  id: string;
  nome: string;
  pontos: number;
  visitas: number;
  avatar: string;
  posicao: number;
}

export async function fetchFidelityRanking(tenantId: string): Promise<FidelityRankingItem[]> {
  const { data, error } = await supabase
    .from('AgendaBot_Client')
    .select('id, name, avatar_url, fidelity_points, total_visits')
    .eq('tenant_id', tenantId)
    .order('fidelity_points', { ascending: false })
    .limit(5);
  if (error) throw error;
  return (data ?? []).map((row: any, idx: number) => ({
    id: row.id,
    nome: row.name,
    pontos: row.fidelity_points ?? 0,
    visitas: row.total_visits ?? 0,
    avatar: row.avatar_url ?? '',
    posicao: idx + 1,
  }));
}

export interface FidelityReward {
  id: number | string;
  nome: string;
  pontos: number;
  tipo: string;
}

export async function fetchFidelityRewards(tenantId: string): Promise<FidelityReward[]> {
  const { data, error } = await supabase
    .from('AgendaBot_FidelityReward')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('points_required', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    nome: row.name,
    pontos: row.points_required,
    tipo: row.type,
  }));
}

export async function createFidelityReward(
  tenantId: string,
  reward: { nome: string; pontos: number; tipo: string },
): Promise<FidelityReward> {
  const { data, error } = await supabase
    .from('AgendaBot_FidelityReward')
    .insert({ tenant_id: tenantId, name: reward.nome, points_required: reward.pontos, type: reward.tipo })
    .select('*')
    .single();
  if (error) throw error;
  return { id: data.id, nome: data.name, pontos: data.points_required, tipo: data.type };
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface Notification {
  id: number | string;
  text: string;
  time: string;
  read: boolean;
}

export async function fetchNotifications(_tenantId: string): Promise<Notification[]> {
  // AgendaBot_Notification table not yet provisioned — return empty until created
  return [];
}

export async function markNotificationsRead(_tenantId: string): Promise<void> {
  // no-op until AgendaBot_Notification table is provisioned
}

// ── Conversations (Chatbot) ───────────────────────────────────────────────────

export async function fetchConversations(tenantId: string): Promise<ConversaChat[]> {
  const { data, error } = await supabase
    .from('AgendaBot_Conversation')
    .select('*, messages:AgendaBot_Message(*)')
    .eq('tenant_id', tenantId)
    .order('last_message_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return (data ?? []).map(mapConversation);
}

export async function updateConversationStatus(
  id: string,
  tenantId: string,
  status: 'bot' | 'humano',
): Promise<void> {
  const { error } = await supabase
    .from('AgendaBot_Conversation')
    .update({ status: status === 'humano' ? 'human' : 'bot' })
    .eq('id', id)
    .eq('tenant_id', tenantId);
  if (error) throw error;
}

// ── Financial Stats ───────────────────────────────────────────────────────────

export interface FinancialStats {
  faturamentoMes: number;
  concluidoHoje: number;
  sinaisBloqueados: number;
  custoOperacao: number;
}

export async function fetchFinancialStats(tenantId: string): Promise<FinancialStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const sum = (rows: any[] | null, key: string) =>
    (rows ?? []).reduce((s: number, r: any) => s + Number(r[key] ?? 0), 0);

  const [monthRes, todayRes, depositRes, expenseRes] = await Promise.all([
    supabase.from('AgendaBot_Transaction').select('amount').eq('tenant_id', tenantId).eq('type', 'INCOME').gte('created_at', monthStart).lte('created_at', monthEnd),
    supabase.from('AgendaBot_Transaction').select('amount').eq('tenant_id', tenantId).eq('type', 'INCOME').gte('created_at', todayStart).lt('created_at', todayEnd),
    supabase.from('AgendaBot_Appointment').select('deposit_amount').eq('tenant_id', tenantId).eq('deposit_paid', false).gt('deposit_amount', 0).not('status', 'in', '(CANCELLED,NO_SHOW)'),
    supabase.from('AgendaBot_Transaction').select('amount').eq('tenant_id', tenantId).eq('type', 'EXPENSE').gte('created_at', monthStart).lte('created_at', monthEnd),
  ]);

  return {
    faturamentoMes: sum(monthRes.data, 'amount'),
    concluidoHoje: sum(todayRes.data, 'amount'),
    sinaisBloqueados: sum(depositRes.data, 'deposit_amount'),
    custoOperacao: sum(expenseRes.data, 'amount'),
  };
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  agendamentosHoje: number;
  faturamentoMes: number;
  clientesAtivos: number;
  taxaNoShow: number;
}

export async function fetchDashboardMetrics(tenantId: string): Promise<DashboardMetrics> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const [todayResult, monthResult, clientResult] = await Promise.all([
    supabase
      .from('AgendaBot_Appointment')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('scheduled_at', todayStart)
      .lt('scheduled_at', todayEnd),
    supabase
      .from('AgendaBot_Appointment')
      .select('status, price')
      .eq('tenant_id', tenantId)
      .gte('scheduled_at', monthStart)
      .lte('scheduled_at', monthEnd),
    supabase
      .from('AgendaBot_Client')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_active', true),
  ]);

  const monthData = monthResult.data ?? [];
  const completedRevenue = monthData
    .filter((a: any) => a.status === 'COMPLETED')
    .reduce((sum: number, a: any) => sum + Number(a.price ?? 0), 0);
  const noShowCount = monthData.filter((a: any) => a.status === 'NO_SHOW').length;
  const noShowRate = monthData.length > 0 ? (noShowCount / monthData.length) * 100 : 0;

  return {
    agendamentosHoje: todayResult.count ?? 0,
    faturamentoMes: completedRevenue,
    clientesAtivos: clientResult.count ?? 0,
    taxaNoShow: noShowRate,
  };
}

export interface DashboardAlert {
  type: 'inativo' | 'sinal';
  clienteNome: string;
  detalhe: string;
}

export async function fetchDashboardAlerts(tenantId: string): Promise<DashboardAlert[]> {
  const alerts: DashboardAlert[] = [];

  const [depositResult] = await Promise.all([
    supabase
      .from('AgendaBot_Appointment')
      .select('deposit_amount, scheduled_at, client:AgendaBot_Client(name)')
      .eq('tenant_id', tenantId)
      .gt('deposit_amount', 0)
      .eq('deposit_paid', false)
      .not('status', 'in', '(CANCELLED,NO_SHOW)')
      .order('scheduled_at', { ascending: true })
      .limit(1),
  ]);

  const pendingDeposit = (depositResult.data ?? [])[0];
  if (pendingDeposit) {
    const apptTime = pendingDeposit.scheduled_at
      ? new Date(pendingDeposit.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : '';
    const clientName = (pendingDeposit as any).client?.name ?? '';
    alerts.push({
      type: 'sinal',
      clienteNome: clientName,
      detalhe: `Sinal securitário de R$ ${Number(pendingDeposit.deposit_amount).toFixed(2)} recebido via PIX para o atendimento${apptTime ? ` de ${clientName} às ${apptTime}` : ''}.`,
    });
  }

  return alerts;
}
