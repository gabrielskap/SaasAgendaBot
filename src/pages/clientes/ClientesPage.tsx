/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Award, 
  Trash2, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  TrendingUp, 
  UserPlus, 
  Star,
  ChevronRight,
  Sparkles,
  DollarSign,
  AlertTriangle,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { fetchClients, createClient } from '../../services/supabaseService';
import { Cliente } from '../../types';

export default function ClientesPage() {
  const { tenant } = useAuthStore();
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'todos' | 'vips' | 'inativos'>('todos');
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [profileTab, setProfileTab] = useState<'geral' | 'historico' | 'comunicacoes'>('geral');
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);

  useEffect(() => {
    if (!tenant?.id) return;
    setLoading(true);
    fetchClients(tenant.id)
      .then(data => setClients(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [tenant?.id]);

  // Form States for New Client
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');

  // Searching and categorization filter operations
  const filteredClients = clients.filter((c) => {
    // Search filter Match
    const matchesSearch = c.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.telefone.includes(searchQuery) || 
                          c.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Segment filter Match
    if (activeFilter === 'vips') return matchesSearch && c.vip;
    if (activeFilter === 'inativos') return matchesSearch && c.status === 'Inativo';
    return matchesSearch;
  });

  const handleAddNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientPhone || !tenant?.id) return;
    setSaving(true);
    try {
      const created = await createClient(tenant.id, {
        nome: newClientName,
        telefone: newClientPhone,
        email: newClientEmail,
        observacoes: newClientNotes,
      });
      setClients(prev => [created, ...prev]);
      setIsNewClientOpen(false);
      setNewClientName('');
      setNewClientPhone('');
      setNewClientEmail('');
      setNewClientNotes('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold">
          Erro ao carregar clientes: {error}
        </div>
      )}

      {/* HEADER BAR ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-display font-black text-[#1A1F2E]">Clientes & CRM Inteligente</h2>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            Controle de histórico técnico, observações médicas e reengajamento WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setIsNewClientOpen(true)}
          className="bg-[#0F4C81] text-white px-4 py-2.5 rounded-lg text-xs font-bold font-display tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-md shadow-[#0F4C81]/15"
        >
          <UserPlus className="w-4.5 h-4.5" />
          Cadastrar Cliente
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* INPUT */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone, email..."
            className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-xs bg-white focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* REGULAR FILTERS SELECTOR CHIPS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'todos', label: 'Todos os Clientes' },
            { id: 'vips', label: 'Segmento VIP ⭐' },
            { id: 'inativos', label: 'Inativos (60 dias+ ⚠️)' }
          ].map((filt) => (
            <button
              key={filt.id}
              onClick={() => setActiveFilter(filt.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                activeFilter === filt.id
                  ? 'bg-[#0F4C81] text-white border-[#0F4C81]'
                  : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#64748B]'
              }`}
            >
              {filt.label}
            </button>
          ))}
        </div>

      </div>

      {/* DUAL WORKSPACE LAYOUT ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CUSTOM TABLE CONTAINER (LEFT 8 COLS) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-display font-bold uppercase text-[10px] text-[#64748B]">
                <tr>
                  <th className="px-5 py-4">Nome Cliente</th>
                  <th className="px-4 py-4">Telefone</th>
                  <th className="px-4 py-4 text-center">Visitas</th>
                  <th className="px-4 py-4 text-center">Último Retorno</th>
                  <th className="px-4 py-4 text-right">Faturamento Total</th>
                  <th className="px-5 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] font-medium text-[#1A1F2E]">
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-[#64748B] font-medium font-sans">
                      Carregando clientes...
                    </td>
                  </tr>
                )}
                {!loading && filteredClients.map((c) => (
                  <tr 
                    key={c.id}
                    onClick={() => {
                      setSelectedClient(c);
                      setProfileTab('geral');
                    }}
                    className={`hover:bg-[#0F4C81]/2.5 transition-colors cursor-pointer ${
                      selectedClient?.id === c.id ? 'bg-[#0F4C81]/5 font-semibold' : ''
                    }`}
                  >
                    <td className="px-5 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0F4C81]/10 text-[#0F4C81] flex items-center justify-center font-bold font-display text-sm">
                          {c.nome.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold leading-tight">{c.nome}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {c.vip && (
                              <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 py-0.2 rounded-sm font-sans block tracking-wider uppercase">
                                VIP
                              </span>
                            )}
                            {c.status === 'Inativo' && (
                              <span className="bg-red-100 text-red-800 text-[8px] font-bold px-1.5 py-0.2 rounded-sm block font-sans tracking-wider uppercase">
                                Inativo
                              </span>
                            )}
                            <span className="text-[10px] text-[#64748B] font-mono block">cad. {c.dataCadastro}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4.5 font-mono text-[#64748B]">{c.telefone}</td>
                    <td className="px-4 py-4.5 text-center font-jetbrains text-xs">{c.totalVisitas}</td>
                    <td className="px-4 py-4.5 text-center">{c.ultimoAgendamento}</td>
                    <td className="px-4 py-4.5 text-right font-jetbrains text-xs text-emerald-700">R$ {c.valorTotalGasto.toFixed(2)}</td>
                    <td className="px-5 py-4.5 text-right">
                      <button className="p-1 hover:bg-[#E2E8F0] rounded text-[#0F4C81] text-[11px] font-bold">
                        Selecionar
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-[#64748B] font-medium font-sans">
                      Nenhum cliente atende aos critérios descritos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DRILL DOWN PROFILE DETAILS (RIGHT 4 COLS) */}
        <div className="lg:col-span-4">
          {selectedClient ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-5 animate-fade-in text-xs">
              
              {/* MINI PROFILE HEADER */}
              <div className="flex justify-between items-start border-b border-[#E2E8F0] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#0F4C81] text-white flex items-center justify-center font-display font-extrabold text-md border-2 border-white ring-4 ring-[#0F4C81]/10">
                    {selectedClient.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm text-[#1A1F2E] leading-tight">{selectedClient.nome}</h4>
                    <span className="text-[11px] text-[#64748B]">{selectedClient.email}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* CRM MODULE TAB TOGGLES */}
              <div className="flex gap-1 border-b border-[#E2E8F0] pb-1">
                {[
                  { id: 'geral', label: 'Geral' },
                  { id: 'historico', label: 'Preferências' },
                  { id: 'comunicacoes', label: 'WhatsLogs' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setProfileTab(tab.id as any)}
                    className={`flex-1 text-center pb-2 text-[10px] font-bold uppercase transition-all tracking-wider ${
                      profileTab === tab.id
                        ? 'border-b-2 border-b-[#0F4C81] text-[#0F4C81]'
                        : 'text-[#64748B] hover:text-[#1A1F2E]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT: GERAL */}
              {profileTab === 'geral' && (
                <div className="space-y-4">
                  {/* KPI BULLETS */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                      <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider block">Ticket Médio</span>
                      <h5 className="font-jetbrains text-sm font-bold text-[#1A1F2E] mt-0.5">
                        R$ {selectedClient.totalVisitas > 0 ? (selectedClient.valorTotalGasto / selectedClient.totalVisitas).toFixed(2) : '0.00'}
                      </h5>
                    </div>
                    <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                      <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider block">Profissional Preferido</span>
                      <h5 className="text-xs font-bold text-[#0F4C81] truncate mt-0.5">{selectedClient.profissionalPreferido}</h5>
                    </div>
                  </div>

                  {/* FAVORITE PLATES */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-2">Serviços Favoritos:</span>
                    <div className="space-y-2">
                      {selectedClient.servicosFavoritos.length > 0 ? (
                        selectedClient.servicosFavoritos.map((sf, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-[#F8FAFC] p-2 border border-[#E2E8F0] rounded">
                            <span className="font-semibold text-[#1A1F2E]">{sf.nome}</span>
                            <span className="font-jetbrains font-bold text-[#64748B] text-[10px]">{sf.quantidade}x</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-[#64748B] italic">Sem serviços catalogados.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: PREFERENCES AND HISTORIC */}
              {profileTab === 'historico' && (
                <div className="space-y-4">
                  {/* OBSERVATIONS AND MEDICAL/ALLERGY WARNINGS */}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2 items-start text-amber-900 leading-normal">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold uppercase tracking-wide text-[9px] text-amber-950">Observações de Ficha Técnica</h5>
                      <p className="text-[10px] font-medium mt-0.5">{selectedClient.observacoes || 'Nenhuma nota restritiva anexada.'}</p>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] p-3 border border-[#E2E8F0] rounded-xl space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">Informações de cadastro:</span>
                    <p className="text-[#1A1F2E]">WhatsApp Oficial: <b>{selectedClient.telefone}</b></p>
                    <p className="text-[#1A1F2E]">E-mail principal: <b>{selectedClient.email}</b></p>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: MOCKED CHAT ROBOT SENT BOX WHATS LOG */}
              {profileTab === 'comunicacoes' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">Últimas Mensagens WhatsApp Ativas:</span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                      <div className="flex justify-between font-bold text-[10px] text-emerald-900">
                        <span>Lembrete Pré-Atendimento (2h)</span>
                        <span className="font-mono">Enviada</span>
                      </div>
                      <p className="text-[10px] text-emerald-950 mt-1 leading-normal">
                        "Olá {selectedClient.nome.split(' ')[0]}! Lembramos de seu atendimento hoje às 15:30. Para reagendar ou cancelar digite a opção ou acesse o link."
                      </p>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-[#E2E8F0]">
                      <div className="flex justify-between font-bold text-[10px] text-[#1A1F2E]">
                        <span>Confirmação de Agendamento</span>
                        <span>Lida</span>
                      </div>
                      <p className="text-[10px] text-[#64748B] mt-1 leading-normal">
                        "Prezado {selectedClient.nome.split(' ')[0]}, seu agendamento do serviço foi confirmado com sucesso. Obrigado!"
                      </p>
                    </div>

                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-[#0F4C81]/5 rounded-xl border border-[#0F4C81]/15 p-5 text-center text-xs text-[#64748B] font-medium space-y-3">
              <Users className="w-9 h-9 text-[#0F4C81] mx-auto opacity-70" />
              <p>Ficha de Cliente não carregada.</p>
              <p className="text-[11px] leading-relaxed">Clique em qualquer cliente na tabela à esquerda para visualizar seu ticket médio, faturamento acumulado, restrições e logs de WhatsApp.</p>
            </div>
          )}
        </div>

      </div>

      {/* FORM: NEW CLIENT CREATE POPUP */}
      {isNewClientOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-md w-full overflow-hidden animate-fade-in-up">
            
            <div className="bg-[#0F4C81] text-white p-4.5 flex justify-between items-center">
              <h4 className="font-display font-extrabold text-xs uppercase tracking-wider">Novo Cliente CRM</h4>
              <button onClick={() => setIsNewClientOpen(false)} className="hover:bg-white/10 rounded-full p-1"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddNewClient} className="p-5 space-y-4 text-xs font-semibold">
              
              <div>
                <label className="text-[10px] font-bold text-[#1A1F2E] uppercase block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Carlos Alberto Lima"
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#1A1F2E] uppercase block mb-1">WhatsApp de Contato</label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 98888-7777"
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#1A1F2E] uppercase block mb-1">Endereço de E-mail</label>
                <input
                  type="email"
                  placeholder="exemplo@email.com"
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#1A1F2E] uppercase block mb-1">Observações Privadas Ficha</label>
                <textarea
                  placeholder="Sabor de pomada preferencial, alergia a produtos, indicações do médico, restrições químicas..."
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg h-20 resize-none bg-[#F8FAFC] font-medium"
                  value={newClientNotes}
                  onChange={(e) => setNewClientNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsNewClientOpen(false)}
                  className="px-4 py-2 border border-[#E2E8F0] hover:bg-slate-50 rounded-lg font-bold uppercase tracking-wider text-[11px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#0F4C81] hover:bg-[#0F4C81]/90 disabled:opacity-60 text-white font-bold px-5 py-2 rounded-lg uppercase tracking-wider text-[11px]"
                >
                  {saving ? 'Salvando...' : 'Cadastrar Cliente'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
