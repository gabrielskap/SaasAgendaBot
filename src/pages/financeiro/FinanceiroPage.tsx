/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ChevronRight, 
  Star, 
  Users, 
  Lock, 
  FileText, 
  Download, 
  Smartphone, 
  Check, 
  CheckSquare, 
  FileSpreadsheet, 
  ArrowUpRight, 
  Plus,
  ArrowDownRight
} from 'lucide-react';
import { MOCK_FINANCIAL_TRANSACTIONS } from '../../constants/mockData';

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState(MOCK_FINANCIAL_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState<'caixa' | 'comissoes'>('caixa');

  const stats = [
    { label: 'Faturamento do Mês', val: 'R$ 18.420', percent: '+14%', up: true },
    { label: 'Concluído Hoje (Caixa)', val: 'R$ 1.940', percent: '+9.4%', up: true },
    { label: 'Sinais PIX Bloqueados', val: 'R$ 740', percent: '99% liq.', up: true },
    { label: 'Custo de Operação', val: 'R$ 4.210', percent: '-2%', up: false }
  ];

  // Draw custom SVG curve chart of monthly financial faturamentos
  const drawLineChart = () => {
    const points = [40, 55, 45, 75, 60, 95]; // monthly metrics
    const width = 600;
    const height = 140;
    const paddingX = 30;
    const paddingY = 20;
    const step = (width - paddingX * 2) / (points.length - 1);

    const d = points.map((p, idx) => {
      const x = paddingX + idx * step;
      const y = height - paddingY - (p / 100) * (height - paddingY * 2);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');

    return (
      <svg className="w-full h-36 border border-slate-100 rounded-xl bg-slate-50/50 p-2" viewBox={`0 0 ${width} ${height}`}>
        {/* Draw subtle grid lines */}
        <line x1="30" y1="20" x2="570" y2="20" stroke="#f1f5f9" strokeWidth="1.5" />
        <line x1="30" y1="70" x2="570" y2="70" stroke="#f1f5f9" strokeWidth="1.5" />
        <line x1="30" y1="120" x2="570" y2="120" stroke="#f1f5f9" strokeWidth="1.5" />
        
        {/* Main Line path */}
        <path d={d} fill="none" stroke="#0F4C81" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Data point circle anchors */}
        {points.map((p, idx) => {
          const x = paddingX + idx * step;
          const y = height - paddingY - (p / 100) * (height - paddingY * 2);
          return (
            <circle key={idx} cx={x} cy={y} r="5" fill="#00C896" stroke="#fff" strokeWidth="2" />
          );
        })}
      </svg>
    );
  };

  const handleDownloadReport = (type: 'pdf' | 'excel') => {
    alert(`Preparando download do Relatório Financeiro Consolidado em formato ${type.toUpperCase()}.\nSua planilha contábil possui integridade AES-256.`);
  };

  return (
    <div className="space-y-6">
      
      {/* TITLE CONTAINER AND METRIC ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-display font-black text-[#1A1F2E]">Fluxo Financeiro & Comissões</h2>
          <p className="text-xs text-[#64748B] font-medium mt-1 font-sans">
            Módulo contábil integrado de repasses de equipe e fluxo de caixa de balcão.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleDownloadReport('pdf')}
            className="border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-800 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" /> Exportar PDF
          </button>
          
          <button 
            onClick={() => handleDownloadReport('excel')}
            className="bg-[#00C896]/10 hover:bg-[#00C896]/20 text-[#00C896] border border-[#00C896]/30 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer font-sans"
          >
            <FileSpreadsheet className="w-4 h-4" /> Exportar Excel
          </button>
        </div>
      </div>

      {/* KPI ROW FOR CARDS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[9.5px] uppercase tracking-wider font-bold text-[#64748B] block">{s.label}</span>
              <h4 className="font-jetbrains text-lg font-black text-[#1A1F2E] mt-1.5">{s.val}</h4>
            </div>
            
            <div className={`text-[10px] uppercase font-bold mt-3 block ${s.up ? 'text-emerald-600' : 'text-red-500'}`}>
              {s.percent} vs mês anterior
            </div>
          </div>
        ))}
      </div>

      {/* CHART & LEDGER LAYOUT ROWS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* MONTHLY CHART DISPLAY AREA */}
        <div className="lg:col-span-12 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-[#64748B] block">Faturamento Semanal Acumulado (R$)</h4>
              <span className="text-[11px] text-[#1A1F2E] font-medium block mt-0.5">Visão consolidada comparando os últimos 6 meses de captação</span>
            </div>
            <div className="flex gap-4 text-xs font-semibold text-[#64748B]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#0F4C81] rounded-full"></span> Receita Real</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#00C896] rounded-full"></span> Sinais Pix</span>
            </div>
          </div>
          {drawLineChart()}
        </div>

        {/* WORKSPACE CONTENT SECTIONS */}
        <div className="lg:col-span-12 space-y-4">
          
          {/* TAB HEADERS TOGGLER */}
          <div className="flex gap-2 border-b border-[#E2E8F0] pb-2">
            {[
              { id: 'caixa', label: 'Livro Caixa (Entradas e Saídas)' },
              { id: 'comissoes', label: 'Comissões de Profissionais' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2.5 px-4 text-xs font-bold transition-all relative ${
                  activeTab === tab.id 
                    ? 'text-[#0F4C81] font-black' 
                    : 'text-[#64748B] hover:text-[#1A1F2E]'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0F4C81] rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: CAIXA TRANSACTIONS LIST */}
          {activeTab === 'caixa' && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-display font-bold uppercase text-[10px] text-[#64748B]">
                    <tr>
                      <th className="px-5 py-3.5">Horário</th>
                      <th className="px-4 py-3.5">Cliente Relacionado</th>
                      <th className="px-4 py-3.5">Profissional</th>
                      <th className="px-4 py-3.5">Fluxo Tipo</th>
                      <th className="px-4 py-3.5">Forma</th>
                      <th className="px-5 py-3.5 text-right">Valor Operado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] font-medium text-[#1A1F2E]">
                    {transactions.map((tr) => (
                      <tr key={tr.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 font-mono text-[#64748B]">{tr.hora}</td>
                        <td className="px-4 py-4 font-bold">{tr.cliente}</td>
                        <td className="px-4 py-4 text-[#64748B] font-semibold">{tr.profissional}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-0.5 rounded text-[9.5px] uppercase font-bold ${
                            tr.tipo === 'Entrada' 
                              ? 'bg-emerald-50 text-emerald-800' 
                              : 'bg-red-50 text-red-800'
                          }`}>
                            {tr.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[#64748B] font-bold text-[10px]">{tr.formaPagamento}</td>
                        <td className={`px-5 py-4 text-right font-jetbrains font-bold text-xs ${
                          tr.tipo === 'Entrada' ? 'text-emerald-700' : 'text-red-600'
                        }`}>
                          {tr.tipo === 'Entrada' ? '+' : '-'} R$ {tr.valor.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: COMISSOES LIQUIDATIONS TABLE */}
          {activeTab === 'comissoes' && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4 animate-fade-in text-xs font-semibold">
              <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">Provisionamento de Comissões Acumuladas:</span>
              
              <div className="space-y-3">
                {[
                  { pro: 'Marcos Navalha', comissão: '40%', faturamento: 8520, repasse: 3408, status: 'A Pagar' },
                  { pro: 'Rodrigo Barber (Fuba)', comissão: '35%', faturamento: 7120, repasse: 2492, status: 'Pago' },
                  { pro: 'Dra. Beatriz Santos', comissão: '50%', faturamento: 10680, repasse: 5340, status: 'A Pagar' }
                ].map((c) => (
                  <div key={c.pro} className="flex justify-between items-center bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl">
                    <div className="space-y-0.5 text-left">
                      <h4 className="font-bold text-[#1A1F2E]">{c.pro}</h4>
                      <p className="text-[10px] text-[#64748B] font-mono">
                        Comissão: <b>{c.comissão}</b> • Faturamento Parceiro: R$ {c.faturamento}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-jetbrains font-bold text-emerald-700 text-sm block">R$ {c.repasse}</span>
                        <span className={`text-[9px] uppercase font-bold block mt-0.5 ${
                          c.status === 'Pago' ? 'text-[#00C896]' : 'text-orange-500'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      
                      {c.status === 'A Pagar' && (
                        <button
                          onClick={() => alert(`Repasse de comissão para ${c.pro} liquidada via PIX com sucesso!`)}
                          className="bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-bold p-1 rounded-sm cursor-pointer"
                          title="Lançar Pagamento"
                        >
                          <Check className="w-5.5 h-5.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
