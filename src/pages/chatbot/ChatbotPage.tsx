/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  BrainCircuit,
  QrCode,
  Network,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Wifi,
  WifiOff,
  Phone,
  BadgeCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { fetchConversations, updateConversationStatus } from '../../services/supabaseService';
import { ConversaChat } from '../../types';
import MessageFlowEditor from './MessageFlowEditor';
import { api } from '../../services/api';

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

interface WhatsAppInstance {
  connected: boolean;
  loggedIn: boolean;
  jid: string | null;
  instanceId: string | null;
  instanceName: string | null;
  status: string | null;
  profileName: string | null;
  profilePicUrl: string | null;
  owner: string | null;
  isBusiness: boolean;
  platform: string | null;
}

interface FlowRecord {
  id: string;
  name: string;
  nodes: unknown[];
  connections: unknown[];
  is_active: boolean;
  updated_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function ChatbotPage() {
  const { tenant } = useAuthStore();
  const [botActive, setBotActive] = useState(true);
  const [chats, setChats] = useState<ConversaChat[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [instanceData, setInstanceData] = useState<WhatsAppInstance | null>(null);

  // Multi-flow state
  const [flows, setFlows] = useState<FlowRecord[]>([]);
  const [flowsLoading, setFlowsLoading] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<FlowRecord | null>(null);
  const [showFlowEditor, setShowFlowEditor] = useState(false);

  // Create flow
  const [creatingFlow, setCreatingFlow] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [creating, setCreating] = useState(false);

  // Rename flow
  const [renamingFlowId, setRenamingFlowId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Delete confirm
  const [deletingFlowId, setDeletingFlowId] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant?.id) return;
    setLoadingChats(true);
    fetchConversations(tenant.id)
      .then(data => {
        if (Array.isArray(data)) {
          setChats(data);
        } else {
          setChats([]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingChats(false));
  }, [tenant?.id]);

  useEffect(() => {
    if (!tenant?.id) return;
    setFlowsLoading(true);
    api.get('/chatbot/flows')
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setFlows(data);
        } else {
          setFlows([]);
        }
      })
      .catch(() => {})
      .finally(() => setFlowsLoading(false));
  }, [tenant?.id]);

  useEffect(() => {
    if (renamingFlowId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingFlowId]);

  const handleTestConnection = async () => {
    setTestStatus('loading');
    setTestMessage('');
    setInstanceData(null);
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();

      if (!res.ok) {
        setTestStatus('error');
        setTestMessage(data.error ?? data.message ?? `Erro ${res.status} ao verificar conexão.`);
        return;
      }

      if (data.connected) {
        setTestStatus('success');
        setInstanceData(data as WhatsAppInstance);
      } else {
        setTestStatus('error');
        setTestMessage('Instância desconectada ou inativa.');
      }
    } catch {
      setTestStatus('error');
      setTestMessage('Não foi possível alcançar o servidor.');
    }
  };

  const handleToggleHandoff = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || !tenant?.id) return;
    const nextStatus = chat.status === 'bot' ? 'humano' : 'bot';
    try {
      await updateConversationStatus(chatId, tenant.id, nextStatus);
      const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setChats(prev => prev.map(c => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          status: nextStatus as any,
          mensagens: [
            ...c.mensagens,
            {
              remetente: 'bot' as const,
              texto: nextStatus === 'humano'
                ? 'Atendimento transferido para operador humano.'
                : 'O Chatbot reassumiu o controle da conversa.',
              timestamp: now,
            },
          ],
        };
      }));
    } catch {
      // non-critical
    }
  };

  const handleCreateFlow = async () => {
    const name = newFlowName.trim() || 'Novo Fluxo';
    setCreating(true);
    try {
      const { data } = await api.post('/chatbot/flows', { name });
      setFlows(prev => [...prev, data]);
      setCreatingFlow(false);
      setNewFlowName('');
      setSelectedFlow(data);
      setShowFlowEditor(true);
    } catch {
      // non-critical
    } finally {
      setCreating(false);
    }
  };

  const handleOpenFlow = (flow: FlowRecord) => {
    setSelectedFlow(flow);
    setShowFlowEditor(true);
  };

  const handleSaveFlow = async (flowJson: string): Promise<void> => {
    if (!selectedFlow) return;
    const parsed = JSON.parse(flowJson);
    await api.put(`/chatbot/flows/${selectedFlow.id}`, parsed);
    setFlows(prev => prev.map(f =>
      f.id === selectedFlow.id
        ? { ...f, nodes: parsed.nodes, connections: parsed.connections, updated_at: new Date().toISOString() }
        : f
    ));
    setSelectedFlow(prev => prev ? { ...prev, nodes: parsed.nodes, connections: parsed.connections } : prev);
  };

  const handleStartRename = (flow: FlowRecord) => {
    setRenamingFlowId(flow.id);
    setRenamingName(flow.name);
  };

  const handleConfirmRename = async (flowId: string) => {
    const name = renamingName.trim();
    if (!name) { setRenamingFlowId(null); return; }
    try {
      await api.put(`/chatbot/flows/${flowId}`, { name });
      setFlows(prev => prev.map(f => f.id === flowId ? { ...f, name } : f));
    } catch {
      // non-critical
    } finally {
      setRenamingFlowId(null);
    }
  };

  const handleDeleteFlow = async (flowId: string) => {
    try {
      await api.delete(`/chatbot/flows/${flowId}`);
      setFlows(prev => prev.filter(f => f.id !== flowId));
    } catch {
      // non-critical
    } finally {
      setDeletingFlowId(null);
    }
  };

  const handleToggleFlowActive = async (flowId: string, currentActive: boolean) => {
    const next = !currentActive;
    setFlows(prev => prev.map(f => f.id === flowId ? { ...f, is_active: next } : f));
    try {
      await api.put(`/chatbot/flows/${flowId}`, { is_active: next });
    } catch {
      setFlows(prev => prev.map(f => f.id === flowId ? { ...f, is_active: currentActive } : f));
    }
  };

  if (showFlowEditor && selectedFlow) {
    return (
      <MessageFlowEditor
        onBack={() => setShowFlowEditor(false)}
        onSave={handleSaveFlow}
        flowName={selectedFlow.name}
        initialFlow={
          (selectedFlow.nodes?.length || selectedFlow.connections?.length)
            ? { nodes: selectedFlow.nodes, connections: selectedFlow.connections }
            : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-6">

      {/* TITLE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-display font-black text-[#1A1F2E]">Atendimento Automatizado (Chatbot)</h2>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            Controle finamente os fluxos conversacionais inteligentes via Evolution API.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold font-display uppercase tracking-wide ${botActive ? 'text-[#00C896]' : 'text-[#64748B]'}`}>
            {botActive ? 'Bot On-line' : 'Bot Off-line'}
          </span>
          <button
            onClick={() => setBotActive(!botActive)}
            className={`w-14 h-7 rounded-full p-1 relative flex items-center transition-colors cursor-pointer ${
              botActive ? 'bg-[#00C896]' : 'bg-[#64748B]'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${botActive ? 'translate-x-7' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      {/* GRID: Connection card + Flow manager */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">

        {/* CONNECTION CARD */}
        <div className="md:col-span-4 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs text-xs font-semibold space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Instância WhatsApp</span>
            {testStatus === 'success' && instanceData?.connected ? (
              <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-[#00926d] bg-[#00C896]/10 px-2 py-0.5 rounded-full">
                <Wifi className="w-3 h-3" /> Conectado
              </span>
            ) : testStatus === 'error' ? (
              <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                <WifiOff className="w-3 h-3" /> Offline
              </span>
            ) : null}
          </div>

          {/* Profile info when connected */}
          {instanceData?.connected ? (
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                {instanceData.profilePicUrl ? (
                  <img
                    src={instanceData.profilePicUrl}
                    alt="foto perfil"
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#00C896]/30 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#0F4C81]/10 flex items-center justify-center border-2 border-[#0F4C81]/20 shrink-0">
                    <QrCode className="w-7 h-7 text-[#0F4C81]" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-[12px] font-black text-[#1A1F2E] truncate">{instanceData.profileName ?? instanceData.instanceName}</p>
                    {instanceData.isBusiness && (
                      <BadgeCheck className="w-3.5 h-3.5 text-[#0F4C81] shrink-0" title="Conta Business" />
                    )}
                  </div>
                  <p className="text-[10px] text-[#64748B] font-mono mt-0.5 truncate">
                    @{instanceData.instanceName}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-[10.5px]">
                <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-lg px-3 py-2">
                  <Phone className="w-3.5 h-3.5 text-[#0F4C81] shrink-0" />
                  <span className="font-mono text-[#1A1F2E] font-bold">
                    +{instanceData.owner ?? '—'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-center">
                    <span className="text-[9px] uppercase text-[#64748B] block font-bold">Status</span>
                    <span className="text-[10px] font-bold text-[#00926d] capitalize">{instanceData.status}</span>
                  </div>
                  <div className="bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-center">
                    <span className="text-[9px] uppercase text-[#64748B] block font-bold">Plataforma</span>
                    <span className="text-[10px] font-bold text-[#1A1F2E] uppercase">{instanceData.platform ?? '—'}</span>
                  </div>
                  <div className="bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-center">
                    <span className="text-[9px] uppercase text-[#64748B] block font-bold">Logado</span>
                    <span className={`text-[10px] font-bold ${instanceData.loggedIn ? 'text-[#00926d]' : 'text-red-500'}`}>
                      {instanceData.loggedIn ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  <div className="bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-center">
                    <span className="text-[9px] uppercase text-[#64748B] block font-bold">Business</span>
                    <span className={`text-[10px] font-bold ${instanceData.isBusiness ? 'text-[#0F4C81]' : 'text-[#64748B]'}`}>
                      {instanceData.isBusiness ? 'Sim' : 'Não'}
                    </span>
                  </div>
                </div>

                {instanceData.jid && (
                  <div className="bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5">
                    <span className="text-[9px] uppercase text-[#64748B] block font-bold mb-0.5">JID</span>
                    <span className="font-mono text-[9.5px] text-[#64748B] break-all">{instanceData.jid}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
              <QrCode className="w-16 h-16 mx-auto text-[#0F4C81]/30" />
              <p className="text-[11px] text-[#64748B] font-medium">Verifique a conexão para ver os dados da instância.</p>
            </div>
          )}

          {/* Error message */}
          {testStatus === 'error' && (
            <div className="flex items-start gap-1.5 rounded-lg px-3 py-2 bg-red-50 text-red-600 text-[10px] font-semibold">
              <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{testMessage}</span>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'loading'}
              className="w-full bg-[#0F4C81] hover:bg-[#0F4C81]/90 disabled:opacity-60 text-white font-bold py-2 rounded-lg text-[10.5px] uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {testStatus === 'loading'
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5" />}
              {testStatus === 'loading' ? 'Verificando…' : 'Verificar Conexão'}
            </button>

            <button
              onClick={() => { setTestStatus('idle'); setTestMessage(''); setInstanceData(null); }}
              className="w-full border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2 rounded-lg text-[10.5px] uppercase tracking-wide text-center block cursor-pointer"
            >
              Desconectar WhatsApp
            </button>
          </div>
        </div>

        {/* FLOW MANAGER */}
        <div className="md:col-span-8 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col gap-4">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center border border-[#0F4C81]/15">
                <BrainCircuit className="w-4 h-4 text-[#0F4C81]" />
              </div>
              <div>
                <h3 className="text-sm font-display font-black text-[#1A1F2E]">Visual Flow Builder</h3>
                <p className="text-[10.5px] text-[#64748B] font-medium">Gerencie seus fluxos de atendimento automatizado.</p>
              </div>
            </div>
            <button
              onClick={() => { setCreatingFlow(true); setNewFlowName(''); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-black text-[11px] rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Fluxo
            </button>
          </div>

          {/* Loading */}
          {flowsLoading && (
            <div className="flex-1 flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-[#0F4C81]" />
            </div>
          )}

          {/* Empty state */}
          {!flowsLoading && flows.length === 0 && !creatingFlow && (
            <div className="flex-1 flex flex-col items-center justify-center py-10 gap-4 text-center">
              <Network className="w-12 h-12 text-[#0F4C81]/25" />
              <div>
                <p className="text-sm font-bold text-[#1A1F2E]">Nenhum fluxo criado ainda</p>
                <p className="text-[11px] text-[#64748B] font-medium mt-0.5">Crie seu primeiro fluxo de atendimento.</p>
              </div>
              <button
                onClick={() => { setCreatingFlow(true); setNewFlowName(''); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-black text-xs rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar primeiro fluxo
              </button>
            </div>
          )}

          {/* Flow list */}
          {!flowsLoading && flows.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {flows.map(flow => (
                <div
                  key={flow.id}
                  className={`border rounded-xl p-4 transition-colors group ${
                    flow.is_active
                      ? 'border-[#00C896]/40 bg-[#00C896]/3 hover:border-[#00C896]/60'
                      : 'border-[#E2E8F0] hover:border-[#0F4C81]/30 hover:bg-[#F8FAFC]'
                  }`}
                >
                  {/* Name row */}
                  {renamingFlowId === flow.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        ref={renameInputRef}
                        value={renamingName}
                        onChange={e => setRenamingName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleConfirmRename(flow.id);
                          if (e.key === 'Escape') setRenamingFlowId(null);
                        }}
                        className="flex-1 text-sm font-bold text-[#1A1F2E] border border-[#0F4C81]/40 rounded-md px-2 py-0.5 outline-none focus:border-[#0F4C81]"
                      />
                      <button
                        onClick={() => handleConfirmRename(flow.id)}
                        className="p-1 rounded text-[#00C896] hover:bg-[#00C896]/10 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setRenamingFlowId(null)}
                        className="p-1 rounded text-[#64748B] hover:bg-slate-100 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-[#1A1F2E] truncate flex-1">{flow.name}</h4>
                      <button
                        onClick={() => handleStartRename(flow)}
                        className="p-1 rounded text-[#64748B] hover:text-[#0F4C81] hover:bg-[#0F4C81]/8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Renomear"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Active toggle */}
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      flow.is_active
                        ? 'text-[#00926d] bg-[#00C896]/12'
                        : 'text-[#64748B] bg-slate-100'
                    }`}>
                      {flow.is_active ? 'Produção' : 'Standby'}
                    </span>
                    <button
                      onClick={() => handleToggleFlowActive(flow.id, flow.is_active)}
                      title={flow.is_active ? 'Colocar em standby' : 'Ativar em produção'}
                      className={`w-10 h-5 rounded-full p-0.5 relative flex items-center transition-colors cursor-pointer ${
                        flow.is_active ? 'bg-[#00C896]' : 'bg-[#CBD5E1]'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        flow.is_active ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Meta */}
                  <p className="text-[10px] text-[#64748B] font-medium mt-1">
                    {(flow.nodes as unknown[]).length} nós · atualizado {formatDate(flow.updated_at)}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleOpenFlow(flow)}
                      className="flex-1 py-1.5 bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-black text-[11px] rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Network className="w-3 h-3" />
                      Abrir Editor
                    </button>

                    {deletingFlowId === flow.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteFlow(flow.id)}
                          className="px-2 py-1.5 bg-red-500 hover:bg-red-600 text-white font-black text-[10px] rounded-lg cursor-pointer"
                        >
                          Excluir
                        </button>
                        <button
                          onClick={() => setDeletingFlowId(null)}
                          className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-100 text-[#64748B] cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingFlowId(flow.id)}
                        className="p-1.5 rounded-lg border border-[#E2E8F0] hover:border-red-200 hover:bg-red-50 text-[#64748B] hover:text-red-500 transition-colors cursor-pointer"
                        title="Excluir fluxo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create form */}
          {creatingFlow && (
            <div className="border border-dashed border-[#0F4C81]/40 rounded-xl p-4 bg-[#0F4C81]/3 space-y-3">
              <p className="text-[11px] font-bold text-[#0F4C81] uppercase tracking-wide">Novo Fluxo</p>
              <input
                autoFocus
                value={newFlowName}
                onChange={e => setNewFlowName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreateFlow();
                  if (e.key === 'Escape') { setCreatingFlow(false); setNewFlowName(''); }
                }}
                placeholder="Nome do fluxo..."
                className="w-full border border-[#E2E8F0] focus:border-[#0F4C81] rounded-lg px-3 py-2 text-sm font-semibold text-[#1A1F2E] outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateFlow}
                  disabled={creating}
                  className="flex-1 py-2 bg-[#0F4C81] hover:bg-[#0F4C81]/90 disabled:opacity-60 text-white font-black text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  {creating ? 'Criando…' : 'Criar e Abrir'}
                </button>
                <button
                  onClick={() => { setCreatingFlow(false); setNewFlowName(''); }}
                  className="px-4 py-2 border border-[#E2E8F0] hover:bg-slate-100 text-[#64748B] font-bold text-xs rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* CHAT HANDOFFS LOG */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
        <div>
          <h4 className="text-sm font-bold font-display text-[#1A1F2E]">Controle de Transbordos (Handoff AI / Humano)</h4>
          <p className="text-[11px] text-[#64748B] font-medium leading-relaxed mt-0.5">
            Ao transferir para operador humano, nossa inteligência desliga-se do chat de WhatsApp instantaneamente, prevenindo interrupções ou loops.
          </p>
        </div>
        {loadingChats && (
          <p className="text-xs text-[#64748B] text-center py-6">Carregando conversas...</p>
        )}
        {!loadingChats && chats.length === 0 && (
          <p className="text-xs text-[#64748B] text-center py-6 italic">Nenhuma conversa ativa.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-semibold text-xs leading-normal">
          {!loadingChats && chats.map((c) => (
            <div
              key={c.id}
              className={`p-4 border rounded-xl flex flex-col justify-between relative bg-slate-50/50 ${
                c.status === 'humano' ? 'border-[#FF6B35]/35 bg-[#FF6B35]/2.5' : 'border-[#E2E8F0]'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <h5 className="font-bold text-[#1a1f2e] text-xs truncate max-w-[140px]">{c.clienteNome}</h5>
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                    c.status === 'humano' ? 'bg-[#FF6B35]/15 text-[#e4511d]' : 'bg-[#00C896]/15 text-[#00926d]'
                  }`}>
                    {c.status === 'humano' ? 'Humano Handed' : 'Ia On-line'}
                  </span>
                </div>
                <p className="text-[10px] text-[#64748B] font-mono mt-0.5">{c.clienteTelefone}</p>
                <p className="text-[11px] italic text-[#1A1F2E] mt-3 bg-white p-2.5 rounded-lg border border-[#E2E8F0] font-sans leading-relaxed">
                  "{c.ultimaMensagem}"
                </p>
              </div>
              <button
                onClick={() => handleToggleHandoff(c.id)}
                className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider mt-4 cursor-pointer text-center block ${
                  c.status === 'humano'
                    ? 'bg-[#00C896] hover:bg-[#00C896]/90 text-white shadow-sm'
                    : 'bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white shadow-sm'
                }`}
              >
                {c.status === 'humano' ? 'Deixar Bot Conversar' : 'Assumir Atendimento 👤'}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
