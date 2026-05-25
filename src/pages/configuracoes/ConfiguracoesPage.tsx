/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  CreditCard, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  Sliders, 
  UserPlus, 
  BellRing, 
  Layers, 
  Lock, 
  Sparkles,
  Check,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

interface TeamMember { id: string; nome: string; email: string; role: string }

export default function ConfiguracoesPage() {
  const { tenant } = useAuthStore();
  const [empresaNome, setEmpresaNome] = useState('');
  const [empresaCnpj, setEmpresaCnpj] = useState('');
  const [empresaEnd, setEmpresaEnd] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [notifySms, setNotifySms] = useState(true);
  const [lockInactivity, setLockInactivity] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');

  // Initialize form from tenant data
  useEffect(() => {
    if (!tenant) return;
    setEmpresaNome(tenant.nome ?? '');
    setEmpresaCnpj(tenant.cnpj ?? '');
    setEmpresaEnd(tenant.endereco ?? '');
  }, [tenant?.id]);

  // Load team members
  useEffect(() => {
    if (!tenant?.id) return;
    supabase
      .from('AgendaBot_User')
      .select('id, name, email, role')
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)
      .then(({ data }) => {
        setTeamMembers((data ?? []).map((u: any) => ({
          id: u.id,
          nome: u.name,
          email: u.email,
          role: u.role,
        })));
      });
  }, [tenant?.id]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) return;
    setSaving(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('AgendaBot_Tenant')
        .update({ name: empresaNome, cnpj: empresaCnpj, address: empresaEnd })
        .eq('id', tenant.id);
      if (err) throw err;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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
          Erro: {error}
        </div>
      )}
      {saved && (
        <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" /> Configurações salvas com sucesso!
        </div>
      )}

      {/* TITLE GREETINGS */}
      <div className="pb-5 border-b border-[#E2E8F0]">
        <h2 className="text-xl font-display font-black text-[#1A1F2E]">Configurações da Conta SaaS</h2>
        <p className="text-xs text-[#64748B] font-medium mt-1">
          Ajuste variáveis jurídicas, controle chaves Stripe, visualize acessos e adicione pessoal auxiliar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COMPARTMENT FORM (7 COLS) */}
        <form onSubmit={handleSaveConfig} className="lg:col-span-8 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-6 text-xs font-semibold text-left">
          
          {/* SECTION 1: ESTABLISHMENT DETAILS */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-bold font-display text-[#1A1F2E] flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <MapPin className="w-4.5 h-4.5 text-[#0F4C81]" /> Dados do Estabelecimento
            </h4>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] font-bold text-[#1a1f2e] uppercase block mb-1">Razão Social / Nome Fantasia</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]"
                  value={empresaNome}
                  onChange={(e) => setEmpresaNome(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#1a1f2e] uppercase block mb-1">CNPJ do Negócio</label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0001-00"
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] font-mono"
                  value={empresaCnpj}
                  onChange={(e) => setEmpresaCnpj(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#1a1f2e] uppercase block mb-1">Endereço Geográfico Local</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]"
                value={empresaEnd}
                onChange={(e) => setEmpresaEnd(e.target.value)}
              />
            </div>
          </div>

          {/* SECTION 2: NOTIFICATIONS TRIGGERS */}
          <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
            <h4 className="text-sm font-bold font-display text-[#1A1F2E] flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <BellRing className="w-4.5 h-4.5 text-[#0F4C81]" /> Notificações do Sistema SaaS
            </h4>

            <div className="space-y-2.5">
              
              <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <div>
                  <span className="font-bold text-[#1A1F2E] block">Alertas de Cancelamentos por E-mail</span>
                  <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium leading-normal">Enviar notificação ao dono do negócio se o bot cancelar.</span>
                </div>
                <input 
                  type="checkbox"
                  className="w-4 h-4 rounded text-[#0F4C81] border-[#E2E8F0]"
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <div>
                  <span className="font-bold text-[#1A1F2E] block">Segurança: Bloquear Sessões Ociosas</span>
                  <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium leading-normal">Exige nova senha após 15 minutos sem interação de tela.</span>
                </div>
                <input 
                  type="checkbox"
                  className="w-4 h-4 rounded text-[#0F4C81] border-[#E2E8F0]"
                  checked={lockInactivity}
                  onChange={(e) => setLockInactivity(e.target.checked)}
                />
              </div>

            </div>
          </div>

          {/* SAVE BUTTONS */}
          <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#0F4C81] hover:bg-[#0F4C81]/90 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider cursor-pointer"
            >
              {saving ? 'Salvando...' : 'Salvar Parâmetros Gerais'}
            </button>
          </div>

        </form>

        {/* RIGHT STRIPE & PLAN CARDS BILLING SUBSCRIPTION (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* SUBSCRIPTION PLAN OVERVIEW CARD */}
          <div className="bg-gradient-to-br from-[#0F4C81] to-[#0A3459] text-white rounded-xl p-5 shadow-lg relative overflow-hidden">
            {/* FLOATING LIGHT RAYS */}
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#00C896]/10 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-white/10 text-white text-[9.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">Plano AgendaBot Plus</span>
                <h3 className="font-display font-black text-lg mt-3">R$ 149,90<span className="text-xs font-normal">/mês</span></h3>
              </div>
              <Sparkles className="w-6 h-6 text-[#00C896] animate-pulse" />
            </div>

            <div className="space-y-2 mt-5 text-[11px] font-medium border-t border-white/10 pt-3">
              <div className="flex justify-between">
                <span className="opacity-80">Agendamentos Mensais</span>
                <span>Ilimitados</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80">Funcionários Inclusos</span>
                <span>Até 10</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80">WhatsApp Instâncias</span>
                <span>Ativa (1/1)</span>
              </div>
            </div>

            <button
              onClick={() => alert('Sua assinatura anual AgendaBot Plus de faturamento recorrente via cartão de crédito está adimplente.')}
              className="w-full bg-[#00C896] hover:bg-[#00C896]/90 text-[#1A1F2E] font-black py-2.5 rounded-lg text-[10.5px] uppercase tracking-wider text-center mt-5 block cursor-pointer transition-colors"
            >
              Gerenciar Assinatura Stripe
            </button>
          </div>

          {/* STAFF INVITATIONS AND ROLES BOX */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4 text-xs font-semibold text-left">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">Convidar Colaborador (Painel)</span>
            
            <div className="space-y-3">
              <div>
                <label className="text-[9.5px] font-bold text-[#1A1F2E] uppercase block mb-1">E-mail do Colaborador</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="recepcao@email.com"
                    className="flex-grow px-3.5 py-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => alert('Convite de acesso para recepção enviado por e-mail com token temporário!')}
                    className="bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white p-2 rounded-lg cursor-pointer"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* CURRENT TEAM MEMBERS */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider block">Equipe com Acesso:</span>
                {teamMembers.length === 0 && (
                  <p className="text-[10px] text-[#64748B] italic">Nenhum colaborador cadastrado.</p>
                )}
                {teamMembers.map((m) => (
                  <div key={m.id} className="flex justify-between items-center p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                    <div className="text-left">
                      <p className="font-bold text-[#1A1F2E] truncate max-w-[140px]">{m.nome}</p>
                      <span className="text-[9px] text-[#64748B] block mt-0.5">{m.email}</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold px-1.5 rounded-sm bg-emerald-50 text-emerald-800">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
