/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  DollarSign,
  Users,
  XSquare,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Medal,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import {
  fetchAppointments,
  fetchProfessionals,
  fetchDashboardMetrics,
  fetchDashboardAlerts,
  DashboardMetrics,
  DashboardAlert,
} from '../../services/supabaseService';
import { Agendamento, BookingStatus, Profissional } from '../../types';

interface DashboardPageProps {
  onNavigateToScreen: (screen: string) => void;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function DashboardPage({ onNavigateToScreen }: DashboardPageProps) {
  const { tenant } = useAuthStore();
  const [chartScope, setChartScope] = useState<'semana' | 'mes' | 'trimestre'>('mes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [todayBookings, setTodayBookings] = useState<Agendamento[]>([]);
  const [quarterAppointments, setQuarterAppointments] = useState<Agendamento[]>([]);
  const [professionals, setProfessionals] = useState<Profissional[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    agendamentosHoje: 0,
    faturamentoMes: 0,
    clientesAtivos: 0,
    taxaNoShow: 0,
  });
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);

  useEffect(() => {
    if (!tenant?.id) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const now = new Date();
        const todayStr = toDateStr(now);
        const quarterStart = toDateStr(new Date(now.getFullYear(), now.getMonth() - 2, 1));
        const monthEnd = toDateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0));

        const [todayAppts, quarterAppts, pros, m, a] = await Promise.all([
          fetchAppointments(tenant.id, todayStr, todayStr),
          fetchAppointments(tenant.id, quarterStart, monthEnd),
          fetchProfessionals(tenant.id),
          fetchDashboardMetrics(tenant.id),
          fetchDashboardAlerts(tenant.id),
        ]);

        setTodayBookings(todayAppts);
        setQuarterAppointments(quarterAppts);
        setProfessionals(pros);
        setMetrics(m);
        setAlerts(a);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tenant?.id]);

  // ── Sparkline computation ─────────────────────────────────────────────────

  const sparklineData = React.useMemo(() => {
    const now = new Date();
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const end = new Date(now);
      end.setDate(now.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      const fromStr = toDateStr(start);
      const toStr = toDateStr(end);
      const week = quarterAppointments.filter(a => a.data >= fromStr && a.data <= toStr);
      return {
        count: week.length,
        revenue: week
          .filter(a => a.status === BookingStatus.CONCLUIDO)
          .reduce((s, a) => s + a.valor, 0),
        noshow: week.filter(a => a.status === BookingStatus.CANCELADO).length,
      };
    }).reverse();

    const normalize = (arr: number[]) => {
      const max = Math.max(...arr) || 1;
      return arr.map(v => v / max);
    };

    return {
      agendamentos: normalize(weeks.map(w => w.count)),
      faturamento: normalize(weeks.map(w => w.revenue)),
      clientes: weeks.map(() => 0.5),
      noshow: normalize(weeks.map(w => w.noshow)).map(v => 1 - v),
    };
  }, [quarterAppointments]);

  // ── Bar chart computation ─────────────────────────────────────────────────

  const chartData = React.useMemo(() => {
    const now = new Date();

    const semana = (() => {
      const ws = getWeekStart(now);
      return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((label, i) => {
        const d = new Date(ws);
        d.setDate(ws.getDate() + i);
        const dateStr = toDateStr(d);
        return { label, valor: quarterAppointments.filter(a => a.data === dateStr).length };
      });
    })();

    const mes = (() => {
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      return [1, 2, 3, 4].map(week => {
        const from = (week - 1) * 7 + 1;
        const to = Math.min(week * 7, daysInMonth);
        const fromStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(from).padStart(2, '0')}`;
        const toStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(to).padStart(2, '0')}`;
        return {
          label: `S${week}`,
          valor: quarterAppointments.filter(a => a.data >= fromStr && a.data <= toStr).length,
        };
      });
    })();

    const trimestre = [2, 1, 0].map(monthsAgo => {
      const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const fromStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const toStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`;
      return {
        label: d.toLocaleString('pt-BR', { month: 'short' }),
        valor: quarterAppointments.filter(a => a.data >= fromStr && a.data <= toStr).length,
      };
    });

    return { semana, mes, trimestre };
  }, [quarterAppointments]);

  // ── Service rankings computation ──────────────────────────────────────────

  const serviceRankings = React.useMemo(() => {
    const countBySvc: Record<string, { nome: string; count: number }> = {};
    quarterAppointments.forEach(a => {
      if (!countBySvc[a.servicoId]) countBySvc[a.servicoId] = { nome: a.servicoNome, count: 0 };
      countBySvc[a.servicoId].count++;
    });
    const sorted = Object.values(countBySvc).sort((a, b) => b.count - a.count).slice(0, 4);
    const max = sorted[0]?.count || 1;
    return sorted.map((s, i) => ({
      idx: i + 1,
      nome: s.nome,
      vendas: s.count,
      pct: `${Math.round((s.count / max) * 100)}%`,
    }));
  }, [quarterAppointments]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const drawSparkline = (points: number[], strokeColor: string) => {
    const width = 100;
    const height = 30;
    const padding = 2;
    const step = width / Math.max(points.length - 1, 1);
    const d = points
      .map((p, idx) => {
        const x = idx * step;
        const y = height - (p * (height - padding * 2) + padding);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
    return (
      <svg className="w-24 h-8 select-none overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <path d={d} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONCLUIDO:
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Concluído' };
      case BookingStatus.EM_ANDAMENTO:
        return { bg: 'bg-[#00C896]/10 text-[#00a97f] border-[#00C896]/20', label: 'Em Atendimento' };
      case BookingStatus.CONFIRMADO:
        return { bg: 'bg-[#0F4C81]/10 text-[#0F4C81] border-[#0F4C81]/20', label: 'Confirmado por IA' };
      case BookingStatus.PENDENTE:
        return { bg: 'bg-amber-50 text-amber-700 border-amber-100', label: 'Aguardando' };
      case BookingStatus.CANCELADO:
        return { bg: 'bg-red-50 text-red-700 border-red-100', label: 'Cancelado' };
    }
  };

  const currChart = chartData[chartScope];
  const maxChartVal = Math.max(...currChart.map(c => c.valor), 1);

  const today = new Date();
  const todayLabel = today.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">

      {/* TITLE GREETINGS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black tracking-tight text-[#1A1F2E]">Painel de Controle</h2>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            {loading ? 'Carregando dados...' : `Hoje: ${todayLabel}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToScreen('agenda')}
            className="bg-[#0F4C81] text-white px-4 py-2.5 rounded-lg text-xs font-bold font-display tracking-wider uppercase shadow-md flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Agenda Completa
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-semibold">
          Erro ao carregar dados: {error}
        </div>
      )}

      {/* KPI ROW GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between relative group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] bg-[#0F4C81]/5 text-[#0F4C81] font-bold uppercase tracking-wider block">Agendamentos Hoje</span>
              <h3 className="font-jetbrains font-bold text-2xl text-[#1A1F2E] mt-1.5 leading-none">
                {loading ? '...' : metrics.agendamentosHoje}
              </h3>
            </div>
            <div className="p-2.5 bg-[#0F4C81]/10 rounded-lg text-[#0F4C81]">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 border-t border-[#E2E8F0]/50 pt-3">
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> Hoje
            </span>
            {drawSparkline(sparklineData.agendamentos, '#0F4C81')}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between relative group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] bg-[#00C896]/10 text-[#009b74] font-bold uppercase tracking-wider block">Faturamento (Mês)</span>
              <h3 className="font-jetbrains font-bold text-2xl text-[#1A1F2E] mt-1.5 leading-none">
                {loading ? '...' : `R$ ${metrics.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
              </h3>
            </div>
            <div className="p-2.5 bg-[#00C896]/10 rounded-lg text-[#00C896]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 border-t border-[#E2E8F0]/50 pt-3">
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> Mês atual
            </span>
            {drawSparkline(sparklineData.faturamento, '#00C896')}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between relative group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] bg-[#FF6B35]/10 text-[#e4511d] font-bold uppercase tracking-wider block">Clientes Ativos</span>
              <h3 className="font-jetbrains font-bold text-2xl text-[#1A1F2E] mt-1.5 leading-none">
                {loading ? '...' : metrics.clientesAtivos}
              </h3>
            </div>
            <div className="p-2.5 bg-[#FF6B35]/10 rounded-lg text-[#FF6B35]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 border-t border-[#E2E8F0]/50 pt-3">
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> Cadastros ativos
            </span>
            {drawSparkline(sparklineData.clientes, '#FF6B35')}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between relative group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] bg-red-50 text-red-700 font-bold uppercase tracking-wider block">Taxa No-Show (Faltas)</span>
              <h3 className="font-jetbrains font-bold text-2xl text-[#1A1F2E] mt-1.5 leading-none">
                {loading ? '...' : `${metrics.taxaNoShow.toFixed(1)}%`}
              </h3>
            </div>
            <div className="p-2.5 bg-red-50 rounded-lg text-red-600">
              <XSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 border-t border-[#E2E8F0]/50 pt-3">
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <ArrowDownRight className="w-3.5 h-3.5" /> Mês atual
            </span>
            {drawSparkline(sparklineData.noshow, '#EF4444')}
          </div>
        </div>

      </div>

      {/* LINE 2: BAR CHART & TODAY TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* BAR CHART */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-4 mb-6">
            <div>
              <h4 className="text-sm font-bold font-display text-[#1A1F2E]">Demanda de Agendamentos</h4>
              <span className="text-[11px] text-[#64748B] font-medium block mt-0.5">Volumetria de faturamento em atendimentos fechados</span>
            </div>
            <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-lg">
              {(['semana', 'mes', 'trimestre'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => setChartScope(opt)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md tracking-wide transition-all ${
                    chartScope === opt ? 'bg-white text-[#0F4C81] shadow-xs' : 'text-[#64748B] hover:text-[#1A1F2E]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="h-60 flex items-end justify-between gap-4 px-2 pt-4 relative select-none">
            {currChart.map((col, idx) => {
              const pct = (col.valor / maxChartVal) * 82;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                  <span className="text-[10px] font-mono font-bold text-[#0F4C81] bg-[#0F4C81]/5 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity absolute top-0">
                    {col.valor} Atend.
                  </span>
                  <div
                    className="w-full bg-[#0F4C81]/15 group-hover:bg-[#0F4C81] transition-all rounded-t-lg relative overflow-hidden"
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  >
                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-[#00C896]/20"></div>
                  </div>
                  <span className="text-[11px] font-bold text-[#1A1F2E]">{col.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TODAY SCHEDULE */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-4 mb-4">
              <div>
                <h4 className="text-sm font-bold font-display text-[#1A1F2E]">Controle de Filas Hoje</h4>
                <span className="text-[11px] text-[#64748B] font-medium block mt-0.5">Progresso cronológico do expediente</span>
              </div>
              <button
                onClick={() => onNavigateToScreen('agenda')}
                className="text-xs text-[#0F4C81] hover:underline font-bold flex items-center"
              >
                Ver tudo <ChevronRight className="w-4 h-4 ml-0.5" />
              </button>
            </div>

            <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
              {loading ? (
                <p className="text-xs text-[#64748B] text-center py-6">Carregando...</p>
              ) : todayBookings.length === 0 ? (
                <p className="text-xs text-[#64748B] text-center py-6">Nenhum agendamento para hoje.</p>
              ) : (
                todayBookings.map(b => {
                  const badge = getStatusBadge(b.status);
                  return (
                    <div key={b.id} className="flex gap-3 items-start border-l-2 border-[#E2E8F0] pl-3.5 relative py-1 hover:bg-[#F8FAFC] rounded-r p-1 transition-colors">
                      <span className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 bg-[#0F4C81] rounded-full border-2 border-white"></span>
                      <span className="font-jetbrains text-xs font-bold text-[#0F4C81] shrink-0 mt-0.5 w-10">{b.horario}</span>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-xs font-bold text-[#1A1F2E] truncate">{b.clienteNome}</h4>
                        <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                          {b.servicoNome} • <span className="font-medium text-[#1A1F2E]">{b.profissionalNome}</span>
                        </p>
                      </div>
                      <span className={`text-[9px] font-display font-bold px-2 py-0.5 rounded-full border shrink-0 ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-medium text-[#64748B]">
            <span>Agendamentos hoje</span>
            <span className="font-bold text-[#1A1F2E]">{metrics.agendamentosHoje}</span>
          </div>
        </div>

      </div>

      {/* LINE 3: RANKINGS & ALERTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* SERVICES RANKINGS */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <h4 className="text-sm font-bold font-display text-[#1A1F2E] border-b border-[#E2E8F0] pb-3.5 mb-4">Serviços Mais Vendidos</h4>
          {loading ? (
            <p className="text-xs text-[#64748B] text-center py-4">Carregando...</p>
          ) : serviceRankings.length === 0 ? (
            <p className="text-xs text-[#64748B] text-center py-4">Sem dados no trimestre.</p>
          ) : (
            <div className="space-y-4">
              {serviceRankings.map(s => (
                <div key={s.idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#1A1F2E]">{s.nome}</span>
                    <span className="font-jetbrains font-bold text-[#64748B]">{s.vendas} atend.</span>
                  </div>
                  <div className="h-2 w-full bg-[#F8FAFC] rounded-full overflow-hidden border border-[#E2E8F0]">
                    <div className="bg-[#0F4C81] h-full rounded-full" style={{ width: s.pct }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PROFESSIONALS SCORECARD */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <h4 className="text-sm font-bold font-display text-[#1A1F2E] border-b border-[#E2E8F0] pb-3.5 mb-4">Profissionais em Destaque</h4>
          {loading ? (
            <p className="text-xs text-[#64748B] text-center py-4">Carregando...</p>
          ) : (
            <div className="space-y-3.5">
              {professionals.filter(p => p.atendimentosMes > 0).map((p, idx) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="relative">
                    {p.avatar ? (
                      <img src={p.avatar} alt={p.nome} className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#0F4C81]/10 flex items-center justify-center font-bold text-[#0F4C81] text-sm">
                        {p.nome.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {idx === 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-400 text-white p-0.5 rounded-full">
                        <Medal className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h5 className="text-xs font-bold text-[#1A1F2E] truncate">{p.nome}</h5>
                    <span className="text-[10px] text-[#64748B] block mt-0.5 truncate">{p.especialidades.slice(0, 1).join(', ')}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-jetbrains text-xs font-bold text-[#1A1F2E]">{p.atendimentosMes} atend.</span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">R$ {p.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                  </div>
                </div>
              ))}
              {professionals.filter(p => p.atendimentosMes > 0).length === 0 && (
                <p className="text-xs text-[#64748B] text-center py-4">Nenhum atendimento registrado este mês.</p>
              )}
            </div>
          )}
        </div>

        {/* ALERTS */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <h4 className="text-sm font-bold font-display text-[#1A1F2E] border-b border-[#E2E8F0] pb-3.5 mb-4">Alertas e Oportunidades</h4>
          {loading ? (
            <p className="text-xs text-[#64748B] text-center py-4">Carregando...</p>
          ) : alerts.length === 0 ? (
            <p className="text-xs text-[#64748B] text-center py-4">Nenhum alerta no momento.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                alert.type === 'inativo' ? (
                  <div key={i} className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2.5 items-start">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-amber-900 leading-normal">Cliente Inativo Sem Retorno</h5>
                      <p className="text-[10px] text-amber-800 leading-normal mt-0.5">
                        {alert.clienteNome} — {alert.detalhe}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div key={i} className="p-3 bg-[#00C896]/5 rounded-xl border border-[#00C896]/20 flex gap-2.5 items-start">
                    <Sparkles className="w-4.5 h-4.5 text-[#00C896] shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-[#0f5132] leading-normal font-display">Sinal Recebido Aguardando</h5>
                      <p className="text-[10px] text-[#0f5132]/80 leading-normal mt-0.5">{alert.detalhe}</p>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
