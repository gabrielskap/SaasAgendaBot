/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sliders, 
  Trash2, 
  Star, 
  Clock, 
  DollarSign, 
  Heart, 
  X, 
  Award, 
  Calendar, 
  TrendingUp,
  UserPlus,
  Users
} from 'lucide-react';
import { MOCK_PROFESSIONALS } from '../../constants/mockData';
import { Profissional } from '../../types';

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState<Profissional[]>(MOCK_PROFESSIONALS);
  const [selectedPro, setSelectedPro] = useState<Profissional | null>(MOCK_PROFESSIONALS[0]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Pro States
  const [newName, setNewName] = useState('');
  const [newSpeciality, setNewSpeciality] = useState('');
  const [newComission, setNewComission] = useState('40');

  const handleCreatePro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const freshPro: Profissional = {
      id: `p-added-${Date.now()}`,
      nome: newName,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      especialidades: [newSpeciality || 'Corte Geral'],
      status: 'Ativo',
      atendimentosMes: 0,
      faturamento: 0,
      avaliacao: 5.0,
      comissaoPercentual: parseInt(newComission) || 40
    };

    setProfessionals([...professionals, freshPro]);
    setIsAddOpen(false);

    // Reset Form
    setNewName('');
    setNewSpeciality('');
    setNewComission('40');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-display font-black text-[#1A1F2E]">Gestão de Profissionais</h2>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            Configure regras de comissionamento individualizado e horários de trabalho.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-[#0F4C81] text-white px-4 py-2.5 rounded-lg text-xs font-bold font-display tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-md shadow-[#0F4C81]/15"
        >
          <UserPlus className="w-4.5 h-4.5" />
          Adicionar Profissional
        </button>
      </div>

      {/* DUAL WORKSPACE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* PROFESSIONALS GRID CARD ROSTER (LEFT 8 COLS) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {professionals.map((pro) => {
            const isSelected = selectedPro?.id === pro.id;
            return (
              <div 
                key={pro.id}
                onClick={() => setSelectedPro(pro)}
                className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-[#0F4C81] ring-2 ring-[#0F4C81]/10 shadow-md' 
                    : 'border-[#E2E8F0] hover:border-[#64748B]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img src={pro.avatar} alt={pro.nome} className="w-11 h-11 rounded-full object-cover border border-[#E2E8F0]" />
                    <div>
                      <h4 className="font-display font-black text-sm text-[#1A1F2E]">{pro.nome}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-2 h-2 rounded-full ${pro.status === 'Ativo' ? 'bg-[#00C896]' : 'bg-red-400'}`}></span>
                        <span className="text-[10px] uppercase font-bold text-[#64748B]">{pro.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{pro.avaliacao.toFixed(1)}</span>
                  </div>
                </div>

                {/* SPECIALITY CHIPS */}
                <div className="flex flex-wrap gap-1.5 my-4">
                  {pro.especialidades.map((spec) => (
                    <span key={spec} className="bg-slate-50 border border-[#E2E8F0] text-[10px] text-[#64748B] font-bold px-2 py-0.6 rounded-md">
                      {spec}
                    </span>
                  ))}
                </div>

                {/* KPI SNIPPETS */}
                <div className="grid grid-cols-2 gap-3 border-t border-[#E2E8F0]/50 pt-3 text-xs">
                  <div>
                    <span className="text-[9px] text-[#64748B] uppercase font-bold block">Atendimentos no Mês</span>
                    <span className="font-jetbrains font-bold text-[#1A1F2E] text-sm">{pro.atendimentosMes}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#64748B] uppercase font-bold block">Comissão Geral</span>
                    <span className="font-jetbrains font-bold text-emerald-700 text-sm">{pro.comissaoPercentual}%</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* WORK HOURS CALENDAR EDITOR DRAWER (RIGHT 4 COLS) */}
        <div className="lg:col-span-4">
          {selectedPro ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-5 animate-fade-in text-xs font-semibold">
              <div className="border-b border-[#E2E8F0] pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-[#64748B] uppercase tracking-wider block font-bold">Configuração Pessoal</span>
                  <h4 className="font-display font-black text-sm text-[#1A1F2E]">{selectedPro.nome}</h4>
                </div>
                <Users className="w-5 h-5 text-[#0F4C81]" />
              </div>

              {/* TIMETABLE CHECKLISTS */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">Horário de Expediente:</span>
                
                {[
                  { dia: 'Segunda-feira', ativo: false, horas: '09:00 - 18:00' },
                  { dia: 'Terça-feira', ativo: true, horas: '08:00 - 20:00' },
                  { dia: 'Quarta-feira', ativo: true, horas: '08:00 - 20:00' },
                  { dia: 'Quinta-feira', ativo: true, horas: '08:00 - 20:00' },
                  { dia: 'Sexta-feira', ativo: true, horas: '08:00 - 21:00' },
                  { dia: 'Sábado', ativo: true, horas: '08:00 - 21:00' },
                ].map((item) => (
                  <div key={item.dia} className="flex justify-between items-center bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-lg">
                    <div>
                      <span className="font-bold text-[#1A1F2E] block">{item.dia}</span>
                      <span className="text-[10px] text-[#64748B] font-mono mt-0.5 block">{item.ativo ? item.horas : 'Folga de Expediente'}</span>
                    </div>
                    
                    {/* CHECKBOX FLAGGING */}
                    <input 
                      type="checkbox"
                      className="w-4 h-4 rounded text-[#0F4C81] border-[#E2E8F0]"
                      checked={item.ativo}
                      onChange={() => {}} // simulated toggler
                    />
                  </div>
                ))}
              </div>

              {/* SAVING TRIGGER BUTTONS */}
              <button 
                onClick={() => alert(`Escala semanal do parceiro ${selectedPro.nome} atualizada com sucesso.`)}
                className="w-full bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider"
              >
                Salvar Expediente do Profissional
              </button>

            </div>
          ) : (
            <div className="bg-[#0F4C81]/5 rounded-xl border border-[#0F4C81]/15 p-5 text-center text-xs text-[#64748B] font-medium space-y-3">
              <Sliders className="w-9 h-9 text-[#0F4C81] mx-auto opacity-70" />
              <p>Parceiro não focalizado.</p>
              <p className="text-[11px] leading-relaxed">Clique em qualquer profissional da nossa lista para configurar comissões individuais, editar folgas e visualizar comissões do mês.</p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: ADD NEW PROFESSIONAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-sm w-full overflow-hidden animate-fade-in-up">
            
            <div className="bg-[#0F4C81] text-white p-4.5 flex justify-between items-center">
              <h4 className="font-display font-extrabold text-xs uppercase tracking-wider">Novo Profissional</h4>
              <button onClick={() => setIsAddOpen(false)} className="hover:bg-white/10 rounded-full p-1"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreatePro} className="p-5 space-y-4 text-xs font-semibold">
              
              <div>
                <label className="text-[10px] font-bold text-[#1A1F2E] uppercase block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Rodrigo de Jesus"
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#1A1F2E] uppercase block mb-1">Especialidade Principal</label>
                <input
                  type="text"
                  placeholder="Química Capilar, Esteticista..."
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]"
                  value={newSpeciality}
                  onChange={(e) => setNewSpeciality(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#1A1F2E] uppercase block mb-1">Taxa de Comissão (%)</label>
                <input
                  type="number"
                  placeholder="40"
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] font-jetbrains"
                  value={newComission}
                  onChange={(e) => setNewComission(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-lg font-bold uppercase tracking-wider text-[11.5px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-bold px-5 py-2 rounded-lg font-bold uppercase tracking-wider text-[11.5px]"
                >
                  Adicionar Profissional
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
