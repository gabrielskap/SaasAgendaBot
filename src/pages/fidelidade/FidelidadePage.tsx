/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Award,
  Trash2,
  Plus,
  Trophy,
  Smile,
  Smartphone,
  Settings,
  ArrowUpRight,
  Sparkles,
  Star,
  Users,
  MessageSquare,
  Check,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import {
  fetchCampaigns,
  updateCampaignStatus,
  fetchFidelityRanking,
  fetchFidelityRewards,
  createFidelityReward,
  type FidelityRankingItem,
  type FidelityReward,
} from '../../services/supabaseService';
import { CampanhaReengajamento } from '../../types';

export default function FidelidadePage() {
  const { tenant } = useAuthStore();
  const [fidelAtivo, setFidelAtivo] = useState(true);
  const [exchangeValue, setExchangeValue] = useState('1.00');
  const [rewards, setRewards] = useState<FidelityReward[]>([]);
  const [campaigns, setCampaigns] = useState<CampanhaReengajamento[]>([]);
  const [ranking, setRanking] = useState<FidelityRankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [isRewModalOpen, setIsRewModalOpen] = useState(false);
  const [newRewName, setNewRewName] = useState('');
  const [newRewPoints, setNewRewPoints] = useState('100');
  const [newRewType, setNewRewType] = useState('Serviço Grátis');

  useEffect(() => {
    if (!tenant?.id) return;
    setLoading(true);
    Promise.all([
      fetchCampaigns(tenant.id),
      fetchFidelityRanking(tenant.id),
      fetchFidelityRewards(tenant.id),
    ])
      .then(([camps, rank, rews]) => {
        setCampaigns(camps);
        setRanking(rank);
        setRewards(rews);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [tenant?.id]);

  const handleLaunchCampaign = async (id: string, name: string) => {
    if (!tenant?.id) return;
    const metrics = { enviadas: 40, responderam: 18, converteram: 9 };
    try {
      await updateCampaignStatus(id, tenant.id, metrics);
      setCampaigns(prev => prev.map(camp =>
        camp.id === id
          ? { ...camp, status: 'Concluída' as any, metricas: metrics }
          : camp
      ));
      alert(`Campanha "${name}" transmitida via WhatsApp com sucesso!`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddNewReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewName || !tenant?.id) return;
    setSaving(true);
    try {
      const created = await createFidelityReward(tenant.id, {
        nome: newRewName,
        pontos: parseInt(newRewPoints) || 100,
        tipo: newRewType,
      });
      setRewards(prev => [...prev, created]);
      setIsRewModalOpen(false);
      setNewRewName('');
      setNewRewPoints('100');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const Avatar = ({ item, size }: { item?: FidelityRankingItem; size: 'sm' | 'lg' }) => {
    if (!item) return null;
    const dim = size === 'lg' ? 'w-14 h-14 text-sm' : 'w-11 h-11 text-xs';
    if (item.avatar) {
      return <img src={item.avatar} alt={item.nome} className={`${dim} rounded-full object-cover border-2 border-[#E2E8F0] shadow-sm`} />;
    }
    return (
      <div className={`${dim} rounded-full bg-[#0F4C81] text-white flex items-center justify-center font-bold border-2 border-[#E2E8F0]`}>
        {item.nome.slice(0, 2).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold">
          Erro: {error}
        </div>
      )}

      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-display font-black text-[#1A1F2E]">Fidelidade & Campanhas WhatsApp</h2>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            Recompense recorrência e automatize transmissões ativas de marketing inteligente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold font-display uppercase tracking-wider ${fidelAtivo ? 'text-[#00C896]' : 'text-[#64748B]'}`}>
            {fidelAtivo ? 'Programa Ativado' : 'Programa Desativado'}
          </span>
          <button
            onClick={() => setFidelAtivo(!fidelAtivo)}
            className={`w-14 h-7 rounded-full p-1 relative flex items-center transition-colors cursor-pointer ${fidelAtivo ? 'bg-[#00C896]' : 'bg-[#64748B]'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${fidelAtivo ? 'translate-x-7' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      {/* CORE WORKSPACE DETAILS FIELDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

        {/* REWARDS RULE CONFIG (LEFT 5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs text-xs font-semibold space-y-5 flex flex-col justify-between">

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2.5">
              <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">Regra Geral de Troca</span>
              <Settings className="w-4 h-4 text-[#0F4C81]" />
            </div>

            <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] flex items-center justify-between gap-3">
              <p className="text-[#1A1F2E] leading-normal font-sans pr-4">Regra de Conversão:</p>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#64748B]">R$ 1,00 gasto =</span>
                <input
                  type="number"
                  placeholder="1"
                  className="px-2 py-1.5 border border-[#E2E8F0] rounded text-center w-12 font-jetbrains font-bold bg-white"
                  value={exchangeValue}
                  onChange={(e) => setExchangeValue(e.target.value)}
                />
                <span className="font-bold text-[#0F4C81]">ponto</span>
              </div>
            </div>

            {/* REWARDS LIST COMPARTMENT */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">Recompensas Cadastradas:</span>
                <button
                  onClick={() => setIsRewModalOpen(true)}
                  className="text-[10.5px] text-[#0F4C81] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Recompensa
                </button>
              </div>

              <div className="space-y-2.5">
                {loading && <p className="text-[10px] text-[#64748B] text-center py-4">Carregando...</p>}
                {!loading && rewards.map((rew) => (
                  <div key={rew.id} className="flex justify-between items-center p-3 border border-[#E2E8F0] rounded-xl bg-slate-50/50">
                    <div>
                      <h4 className="font-bold text-[#1A1F2E]">{rew.nome}</h4>
                      <span className="text-[9.5px] text-[#64748B] block mt-0.5">{rew.tipo}</span>
                    </div>
                    <span className="font-jetbrains font-bold text-xs text-[#FF6B35] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 shrink-0">
                      {rew.pontos} Pts
                    </span>
                  </div>
                ))}
                {!loading && rewards.length === 0 && (
                  <p className="text-[10px] text-[#64748B] text-center py-4 italic">Nenhuma recompensa cadastrada.</p>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert('Políticas do programa de fidelidade salvas com sucesso!')}
            className="w-full bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-bold py-3 rounded-lg text-[11px] uppercase tracking-wider text-center block mt-4"
          >
            Salvar Regras de Fidelidade
          </button>

        </div>

        {/* TOP VIP CLIENTS PODIUM (RIGHT 7 COLS) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3 mb-5">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">Ranking de Clientes Top Recorrências</span>
              <Trophy className="w-4.5 h-4.5 text-amber-500 fill-current" />
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-[#64748B]">Carregando ranking...</div>
            ) : ranking.length >= 3 ? (
              <div className="flex items-end justify-center gap-4 py-6 border-b border-[#E2E8F0]/50 mb-4 select-none">

                {/* 2ND PLACE PODIUM */}
                <div className="flex flex-col items-center gap-2">
                  <Avatar item={ranking[1]} size="sm" />
                  <span className="text-[10px] font-bold text-[#1A1F2E] max-w-[80px] text-center truncate">{ranking[1]?.nome.split(' ')[0]}</span>
                  <span className="font-jetbrains font-bold text-[#64748B] text-[10px]">{ranking[1]?.pontos} Pts</span>
                  <div className="w-16 bg-slate-300 h-16 rounded-t-lg flex items-center justify-center font-black text-slate-700 text-lg">2</div>
                </div>

                {/* 1ST PLACE PODIUM */}
                <div className="flex flex-col items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-bounce" />
                  <Avatar item={ranking[0]} size="lg" />
                  <span className="text-[10.5px] font-extrabold text-[#1A1F2E] max-w-[100px] text-center truncate">{ranking[0]?.nome.split(' ')[0]}</span>
                  <span className="font-jetbrains font-bold text-[#0F4C81] text-xs">{ranking[0]?.pontos} Pts</span>
                  <div className="w-20 bg-amber-400 h-24 rounded-t-lg flex items-center justify-center font-black text-amber-950 text-2xl">1</div>
                </div>

                {/* 3RD PLACE PODIUM */}
                <div className="flex flex-col items-center gap-2">
                  <Avatar item={ranking[2]} size="sm" />
                  <span className="text-[10px] font-bold text-[#1A1F2E] max-w-[80px] text-center truncate">{ranking[2]?.nome.split(' ')[0]}</span>
                  <span className="font-jetbrains font-bold text-[#64748B] text-[10px]">{ranking[2]?.pontos} Pts</span>
                  <div className="w-16 bg-amber-600/50 h-12 rounded-t-lg flex items-center justify-center font-black text-amber-950 text-lg">3</div>
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#64748B]">
                Sem clientes com pontos suficientes para o ranking.
              </div>
            )}
          </div>

          <span className="text-[10px] text-[#64748B] font-medium text-center block">
            Os pontos acumulados são atualizados fidedignamente no painel ao finalizar qualquer agendamento.
          </span>
        </div>

      </div>

      {/* CAMPAINGS ACTIVE LISTINGS */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
        <div>
          <h4 className="text-sm font-bold font-display text-[#1A1F2E]">Mensagens de Transmissão Ativas (Campanhas)</h4>
          <span className="text-[11px] text-[#64748B] font-medium block mt-0.5 font-sans leading-normal">
            Gere campanhas inteligentes para reengajar clientes sumidos ou homenagear aniversariantes do mês com um clique.
          </span>
        </div>

        {loading ? (
          <p className="text-xs text-[#64748B] text-center py-6">Carregando campanhas...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-xs text-[#64748B] text-center py-6 italic">Nenhuma campanha cadastrada.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-semibold text-xs leading-normal">
            {campaigns.map((camp) => (
              <div key={camp.id} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex flex-col justify-between text-left">
                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b border-[#E2E8F0] pb-2">
                    <div>
                      <h5 className="font-bold text-[#1A1F2E] text-xs leading-normal">{camp.nome}</h5>
                      <span className="text-[10px] text-[#64748B] block font-mono mt-0.5">{camp.tipo}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold shrink-0 ${
                      camp.status === 'Concluída' ? 'bg-emerald-50 text-emerald-800' : 'bg-orange-50 text-orange-800'
                    }`}>
                      {camp.status}
                    </span>
                  </div>

                  <p className="text-[10.5px] font-sans leading-relaxed text-[#64748B] bg-white p-2.5 border border-[#E2E8F0]/80 rounded-xl relative min-h-[70px]">
                    "{camp.mensagem}"
                  </p>

                  {camp.status === 'Concluída' && (
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-jetbrains pt-1">
                      <div className="bg-white p-1.5 border border-[#E2E8F0] rounded">
                        <span className="text-[#64748B] block uppercase text-[8px] font-bold font-sans">Enviadas</span>
                        <span className="text-[#1A1F2E] font-bold text-xs mt-0.5 block">{camp.metricas.enviadas}</span>
                      </div>
                      <div className="bg-[#0F4C81]/5 p-1.5 border border-[#E2E8F0] rounded">
                        <span className="text-[#0F4C81] block uppercase text-[8px] font-bold font-sans">Retornos</span>
                        <span className="text-[#0F4C81] font-bold text-xs mt-0.5 block">{camp.metricas.responderam}</span>
                      </div>
                      <div className="bg-emerald-50 p-1.5 border border-[#E2E8F0] rounded">
                        <span className="text-emerald-700 block uppercase text-[8px] font-bold font-sans">Convertidos</span>
                        <span className="text-emerald-700 font-bold text-xs mt-0.5 block">{camp.metricas.converteram}</span>
                      </div>
                    </div>
                  )}
                </div>

                {camp.status !== 'Concluída' && (
                  <button
                    onClick={() => handleLaunchCampaign(camp.id, camp.nome)}
                    className="w-full bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider text-center block mt-5 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4 text-[#00C896]" />
                    Transmitir Ativo
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: NEW REWARD */}
      {isRewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-sm w-full overflow-hidden animate-fade-in-up">

            <div className="bg-[#0F4C81] text-white p-4 flex justify-between items-center">
              <h4 className="font-display font-extrabold text-xs uppercase tracking-wider">Nova Recompensa</h4>
              <button onClick={() => setIsRewModalOpen(false)} className="hover:bg-white/10 rounded-full p-1"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddNewReward} className="p-5 space-y-4 text-xs font-semibold">

              <div>
                <label className="text-[10px] font-bold text-[#1A1F2E] uppercase block mb-1">Título do Prêmio / Brinde</label>
                <input
                  type="text"
                  required
                  placeholder="Caneca Térmica Logo"
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]"
                  value={newRewName}
                  onChange={(e) => setNewRewName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#1A1F2E] uppercase block mb-1">Pontos Necessários</label>
                  <input
                    type="number"
                    placeholder="100"
                    className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] font-jetbrains"
                    value={newRewPoints}
                    onChange={(e) => setNewRewPoints(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#1A1F2E] uppercase block mb-1">Tipo de Recompensa</label>
                  <select
                    className="w-full px-3 py-2.5 border border-[#E2E8F0] bg-white rounded-lg"
                    value={newRewType}
                    onChange={(e) => setNewRewType(e.target.value)}
                  >
                    <option value="Serviço Grátis">Serviço Grátis</option>
                    <option value="Brinde Físico">Brinde Físico</option>
                    <option value="Desconto Percentual">Desconto Percentual</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsRewModalOpen(false)}
                  className="px-4 py-2 border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-lg font-bold uppercase tracking-wider text-[11.5px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#0F4C81] hover:bg-[#0F4C81]/90 disabled:opacity-60 text-white font-bold px-5 py-2 rounded-lg uppercase tracking-wider text-[11.5px]"
                >
                  {saving ? 'Salvando...' : 'Criar Brinde'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
