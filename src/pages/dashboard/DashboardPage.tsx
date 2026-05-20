/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  XSquare, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  TrendingUp, 
  Medal, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { MOCK_BOOKINGS, MOCK_SERVICES, MOCK_PROFESSIONALS } from '../../constants/mockData';
import { BookingStatus } from '../../types';

interface DashboardPageProps {
  onNavigateToScreen: (screen: string) => void;
}

export default function DashboardPage({ onNavigateToScreen }: DashboardPageProps) {
  const [chartScope, setChartScope] = useState<'semana' | 'mes' | 'trimestre'>('mes');

  // Sparkline data generators (normalized array from 0 to 1)
  const sparklineData = {
    agendamentos: [0.3, 0.5, 0.4, 0.7, 0.6, 0.9, 0.8, 1.0],
    faturamento: [0.2, 0.4, 0.3, 0.5, 0.4, 0.8, 0.7, 0.9],
    clientes: [0.5, 0.6, 0.5, 0.7, 0.7, 0.8, 0.8, 1.0],
    noshow: [1.0, 0.8, 0.6, 0.5, 0.3, 0.2, 0.2, 0.1]
  };

  const drawSparkline = (points: number[], strokeColor: string) => {
    const width = 100;
    const height = 30;
    const padding = 2;
    const step = width / (points.length - 1);
    
    const d = points.map((p, idx) => {
      const x = idx * step;
      const y = height - (p * (height - padding * 2) + padding);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');

    return (
      <svg className="w-24 h-8 select-none overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <path d={d} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  // Bar Chart Mock Data for current scope
  const chartData = {
    semana: [
      { label: 'Seg', valor: 12 }, { label: 'Ter', valor: 28 }, { label: 'Qua', valor: 32 }, 
      { label: 'Qui', valor: 35 }, { label: 'Sex', valor: 48 }, { label: 'Sáb', valor: 52 }, { label: 'Dom', valor: 18 }
    ],
    mes: [
      { label: 'S1', valor: 140 }, { label: 'S2', valor: 165 }, { label: 'S3', valor: 198 }, { label: 'S4', valor: 215 }
    ],
    trimestre: [
      { label: 'Mar', valor: 580 }, { label: 'Abr', valor: 690 }, { label: 'Mai', valor: 840 }
    ]
  };

  const currChart = chartData[chartScope];
  const maxChartVal = Math.max(...currChart.map(c => c.valor));

  // Cronological schedule lists filter
  const todayBookings = MOCK_BOOKINGS.filter(b => b.data === '2026-05-20');

  // Status colors helper
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

  return (
    <div className="space-y-6">
      
      {/* TITLE GREETINGS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black tracking-tight text-[#1A1F2E]">Painel de Controle</h2>
          <p className="text-xs text-[#64748B] font-medium mt-1">Sua empresa agendou <b>12 novos clientes</b> via WhatsApp nas últimas 24 horas.</p>
        </div>
        
        {/* QUICK ATIONS */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigateToScreen('agenda')}
            className="bg-[#0F4C81] text-white px-4 py-2.5 rounded-lg text-xs font-bold font-display tracking-wider uppercase shadow-md flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Agenda Completa
          </button>
          <div className="bg-white border border-[#E2E8F0] px-3.5 py-2 rounded-lg text-xs font-mono text-[#64748B]">
            Data Fictícia: <b>2026-05-20</b>
          </div>
        </div>
      </div>

      {/* KPI ROW GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1 */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between relative group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] bg-[#0F4C81]/5 text-[#0F4C81] font-bold uppercase tracking-wider block">Agendamentos Hoje</span>
              <h3 className="font-jetbrains font-bold text-2xl text-[#1A1F2E] mt-1.5 leading-none">34</h3>
            </div>
            <div className="p-2.5 bg-[#0F4C81]/10 rounded-lg text-[#0F4C81]">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 border-t border-[#E2E8F0]/50 pt-3">
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% vs set-passada
            </span>
            {drawSparkline(sparklineData.agendamentos, '#0F4C81')}
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between relative group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] bg-[#00C896]/10 text-[#009b74] font-bold uppercase tracking-wider block">Faturamento (Mês)</span>
              <h3 className="font-jetbrains font-bold text-2xl text-[#1A1F2E] mt-1.5 leading-none">R$ 18.420</h3>
            </div>
            <div className="p-2.5 bg-[#00C896]/10 rounded-lg text-[#00C896]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 border-t border-[#E2E8F0]/50 pt-3">
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +8.4% vs mês-passado
            </span>
            {drawSparkline(sparklineData.faturamento, '#00C896')}
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between relative group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] bg-[#FF6B35]/10 text-[#e4511d] font-bold uppercase tracking-wider block">Clientes Ativos</span>
              <h3 className="font-jetbrains font-bold text-2xl text-[#1A1F2E] mt-1.5 leading-none">248</h3>
            </div>
            <div className="p-2.5 bg-[#FF6B35]/10 rounded-lg text-[#FF6B35]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 border-t border-[#E2E8F0]/50 pt-3">
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +16 novos este mês
            </span>
            {drawSparkline(sparklineData.clientes, '#FF6B35')}
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between relative group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] bg-red-50 text-red-700 font-bold uppercase tracking-wider block">Taxa No-Show (Faltas)</span>
              <h3 className="font-jetbrains font-bold text-2xl text-[#1A1F2E] mt-1.5 leading-none">2.4%</h3>
            </div>
            <div className="p-2.5 bg-red-50 rounded-lg text-red-600">
              <XSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 border-t border-[#E2E8F0]/50 pt-3">
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <ArrowDownRight className="w-3.5 h-3.5" /> -3% vs mês-anterior
            </span>
            {drawSparkline(sparklineData.noshow, '#EF4444')}
          </div>
        </div>

      </div>

      {/* LINE 2: BAR CHART & HOURLY WORK TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CUSTOM SVG CHANNELS RATIO WORKLOAD BAR CHART */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-4 mb-6">
            <div>
              <h4 className="text-sm font-bold font-display text-[#1A1F2E]">Demanda de Agendamentos</h4>
              <span className="text-[11px] text-[#64748B] font-medium block mt-0.5">Volumetria de faturamento em atendimentos fechados</span>
            </div>
            <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-lg">
              {(['semana', 'mes', 'trimestre'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setChartScope(opt)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md tracking-wide transition-all ${
                    chartScope === opt 
                      ? 'bg-white text-[#0F4C81] shadow-xs' 
                      : 'text-[#64748B] hover:text-[#1A1F2E]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* BAR CHART GRAPH */}
          <div className="h-60 flex items-end justify-between gap-4 px-2 pt-4 relative select-none">
            {currChart.map((col, idx) => {
              const pct = maxChartVal > 0 ? (col.valor / maxChartVal) * 82 : 0; // leaves space for labels
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                  {/* HOVER TOOLTIP VALUE */}
                  <span className="text-[10px] font-mono font-bold text-[#0F4C81] bg-[#0F4C81]/5 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity absolute top-0">
                    {col.valor} Atend.
                  </span>
                  {/* BAR PILLAR */}
                  <div 
                    className="w-full bg-[#0F4C81]/15 group-hover:bg-[#0F4C81] transition-all rounded-t-lg relative overflow-hidden"
                    style={{ height: `${pct}%` }}
                  >
                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-[#00C896]/20"></div>
                  </div>
                  {/* LABEL */}
                  <span className="text-[11px] font-bold text-[#1A1F2E]">{col.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TODAY SCHEDULE TIMELINE (RIGHT COL) */}
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
              {todayBookings.map((b) => {
                const badge = getStatusBadge(b.status);
                return (
                  <div key={b.id} className="flex gap-3 items-start border-l-2 border-[#E2E8F0] pl-3.5 relative py-1 hover:bg-[#F8FAFC] rounded-r p-1 transition-colors">
                    {/* DYNAMIC TIMELINE BULLET */}
                    <span className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 bg-[#0F4C81] rounded-full border-2 border-white"></span>
                    
                    <span className="font-jetbrains text-xs font-bold text-[#0F4C81] shrink-0 mt-0.5 w-10">
                      {b.horario}
                    </span>
                    
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
              })}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-medium text-[#64748B]">
            <span>Capacidade Ocupada Hoje</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                <div className="bg-[#00C896] h-full w-[72%]"></div>
              </div>
              <span className="font-bold text-[#1A1F2E]">72%</span>
            </div>
          </div>
        </div>

      </div>

      {/* LINE 3: DETAILED SCORECARDS, RANKINGS & NOTIFICATIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: SERVICES RANKINGS */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <h4 className="text-sm font-bold font-display text-[#1A1F2E] border-b border-[#E2E8F0] pb-3.5 mb-4">Serviços Mais Vendidos</h4>
          <div className="space-y-4">
            {[
              { idx: 1, nome: 'Corte de Cabelo Premium', vendas: 148, pct: '100%' },
              { idx: 2, nome: 'Combo Cabelo e Barba', vendas: 112, pct: '75%' },
              { idx: 3, nome: 'Barba de Respeito', vendas: 85, pct: '57%' },
              { idx: 4, nome: 'Limpeza de Pele Profunda', vendas: 42, pct: '28%' },
            ].map((s) => (
              <div key={s.idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#1A1F2E]">{s.nome}</span>
                  <span className="font-jetbrains font-bold text-[#64748B]">{s.vendas} atend.</span>
                </div>
                {/* HORIZONTAL PROGRESS BAR */}
                <div className="h-2 w-full bg-[#F8FAFC] rounded-full overflow-hidden border border-[#E2E8F0]">
                  <div 
                    className="bg-[#0F4C81] h-full rounded-full" 
                    style={{ width: s.pct }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 2: PROFESSIONALS SCORECARD */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <h4 className="text-sm font-bold font-display text-[#1A1F2E] border-b border-[#E2E8F0] pb-3.5 mb-4">Profissionais em Destaque</h4>
          <div className="space-y-3.5">
            {MOCK_PROFESSIONALS.filter(p => p.atendimentosMes > 0).map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="relative">
                  <img src={p.avatar} alt={p.nome} className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]" />
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
                  <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">R$ {p.faturamento}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 3: CRITICAL ALERTS & INTELLIGENCE NOTIFICATIONS */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <h4 className="text-sm font-bold font-display text-[#1A1F2E] border-b border-[#E2E8F0] pb-3.5 mb-4">Alertas e Oportunidades</h4>
          <div className="space-y-3">
            
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2.5 items-start">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-amber-900 leading-normal">Cliente Inativo Sem Retorno</h5>
                <p className="text-[10px] text-amber-800 leading-normal mt-0.5">
                  Carlos Eduardo Nogueira completará 30 dias sem visita. Ative um reengajamento via WhatsApp.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#00C896]/5 rounded-xl border border-[#00C896]/20 flex gap-2.5 items-start">
              <Sparkles className="w-4.5 h-4.5 text-[#00C896] shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-[#0f5132] leading-normal font-display">Sinal Recebido Aguardando</h5>
                <p className="text-[10px] text-[#0f5132]/80 leading-normal mt-0.5">
                  Sinal securitário de R$ 30,00 recebido via PIX para o atendimento de Mariana hoje 15:30.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
