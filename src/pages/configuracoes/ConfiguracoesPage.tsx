/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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

export default function ConfiguracoesPage() {
  const [empresaNome, setEmpresaNome] = useState('Barbearia Navalha de Ouro Ltda');
  const [empresaCnpj, setEmpresaCnpj] = useState('42.128.540/0001-92');
  const [empresaEnd, setEmpresaEnd] = useState('Av. Paulista, 1000 - Bela Vista, São Paulo - SP');
  
  // Notification States
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [lockInactivity, setLockInactivity] = useState(true);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    alert('As configurações gerais do seu estabelecimento AgendaBot foram salvas com sucesso!');
  };

  return (
    <div className="space-y-6">
      
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
              className="bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider cursor-pointer"
            >
              Salvar Parâmetros Gerais
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
                    className="flex-grow px-2 px-3.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]"
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

              {/* LIST OF CURRENT OUTGOING ACCESS LOGS */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider block">Lista de Convites Ativos:</span>
                
                {[
                  { email: 'auxiliar.joao@email.com', cargo: 'Recepção', status: 'Pendente' },
                  { email: 'barber.caio@gmail.com', cargo: 'Profissional', status: 'Aceito' }
                ].map((inv) => (
                  <div key={inv.email} className="flex justify-between items-center p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                    <div className="text-left">
                      <p className="font-bold text-[#1A1F2E] truncate max-w-[140px]">{inv.email}</p>
                      <span className="text-[9px] text-[#64748B] block mt-0.5">{inv.cargo}</span>
                    </div>

                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-sm ${
                      inv.status === 'Aceito' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {inv.status}
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
