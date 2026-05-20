/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BarChart3, Download, FileSpreadsheet, Sparkles, TrendingUp, Users } from 'lucide-react';

export default function RelatoriosPage() {
  const reportsList = [
    { title: 'Quadro Geral de Faturamento do Mês', desc: 'DRE Consolidada, custos de transação e faturamento líquido.', format: 'PDF', size: '1.2 MB' },
    { title: 'Tabela Completa de Clientes CRM', desc: 'Exportação unificada de ficha técnica, emails e telefones.', format: 'Excel', size: '440 KB' },
    { title: 'Histórico de Atendimentos das Instâncias', desc: 'Sinais, cancelamentos e taxas individuais de No-show.', format: 'PDF', size: '2.4 MB' },
    { title: 'Repasses e Comissionamentos de Equipe', desc: 'Extrato contábil mensal mapeado detalhadamente para recolhimento.', format: 'Excel', size: '180 KB' },
  ];

  return (
    <div className="space-y-6 text-xs text-left">
      <div className="pb-5 border-b border-[#E2E8F0]">
        <h2 className="text-xl font-display font-black text-[#1A1F2E]">Relatórios Hub & DRE</h2>
        <p className="text-xs text-[#64748B] font-medium mt-1">
          Gere arquivos digitais em PDF ou Excel contendo faturamentos do estabelecimento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reportsList.map((rep) => (
          <div key={rep.title} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between font-semibold">
            <div>
              <span className="text-[9.5px] uppercase tracking-wider font-bold text-[#64748B] block">{rep.format} • {rep.size}</span>
              <h4 className="font-display font-black text-sm text-[#1A1F2E] mt-1.5">{rep.title}</h4>
              <p className="text-[#64748B] mt-1 text-[11px] font-medium leading-relaxed">{rep.desc}</p>
            </div>

            <button
              onClick={() => alert(`Preparando arquivo para exportação securitária. O download de "${rep.title}" iniciará em instantes.`)}
              className="mt-6 flex items-center justify-center gap-1.5 w-full bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-slate-50 text-[#1A1F2E] font-bold py-2 rounded-lg cursor-pointer transition-colors"
            >
              {rep.format === 'Excel' ? (
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              ) : (
                <Download className="w-4 h-4 text-[#0F4C81]" />
              )}
              Download do Arquivo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
