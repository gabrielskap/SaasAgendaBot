/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Settings, 
  Smartphone, 
  QrCode, 
  Check, 
  X, 
  Sparkles, 
  RefreshCw, 
  MessageSquare, 
  ArrowRight, 
  Users,
  Eye
} from 'lucide-react';
import { MOCK_CHATS } from '../../constants/mockData';
import MessageFlowEditor from './MessageFlowEditor';

export default function ChatbotPage() {
  const [botActive, setBotActive] = useState(true);
  const [connectedNum, setConnectedNum] = useState('(11) 98765-4321');
  const [chats, setChats] = useState(MOCK_CHATS);
  const [showFlowEditor, setShowFlowEditor] = useState(false);

  // Template custom editors
  const [templates, setTemplates] = useState([
    { id: 'welcome', label: 'Boas-vindas 🤖', text: 'Olá, {nome_cliente}! 🤖 Seja bem-vindo à Barbearia Navalha de Ouro. Como posso te ajudar hoje?\n\n1. Agendar novo horário\n2. Ver nossos serviços\n3. Cancelar agendamento' },
    { id: 'confirm', label: 'Confirmação 🚀', text: 'Excelente! Seu agendamento foi marcado com sucesso para dia {data} às {horario} com {profissional}. Te aguardamos! 🚀' },
    { id: 'reminder', label: 'Lembrete ⏱️', text: 'Olá, {nome_cliente}! Passando para lembrar de seu agendamento amanhã, {data} às {horario} para {servico}. Tudo certo?' },
  ]);
  const [activeTemplate, setActiveTemplate] = useState('welcome');

  // Dynamic variable tags
  const [variables, setVariables] = useState(['{nome_cliente}', '{horario}', '{data}', '{profissional}', '{servico}']);

  // UI toggle status
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [newTemplateLabel, setNewTemplateLabel] = useState('');
  const [isAddingVariable, setIsAddingVariable] = useState(false);
  const [newVariableName, setNewVariableName] = useState('');

  const currentTemplate = templates.find((t) => t.id === activeTemplate) || templates[0];
  const currText = currentTemplate ? currentTemplate.text : '';

  const setCurrText = (newText: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === activeTemplate ? { ...t, text: newText } : t))
    );
  };

  const handleAddTemplate = () => {
    if (!newTemplateLabel.trim()) return;
    const cleanId = 'custom_' + Date.now();
    const newTempl = {
      id: cleanId,
      label: newTemplateLabel.trim(),
      text: `Olá! Digite aqui a mensagem para "${newTemplateLabel.trim()}"`
    };
    setTemplates([...templates, newTempl]);
    setActiveTemplate(cleanId);
    setNewTemplateLabel('');
    setIsAddingTemplate(false);
  };

  const handleAddVariable = () => {
    if (!newVariableName.trim()) return;
    let cleanVar = newVariableName.trim();
    if (!cleanVar.startsWith('{')) cleanVar = '{' + cleanVar;
    if (!cleanVar.endsWith('}')) cleanVar = cleanVar + '}';

    if (!variables.includes(cleanVar)) {
      setVariables([...variables, cleanVar]);
    }
    setNewVariableName('');
    setIsAddingVariable(false);
  };

  // Simulate human handoff toggle
  const handleToggleHandoff = (chatId: string) => {
    setChats(chats.map((c) => {
      if (c.id === chatId) {
        const nextStatus = c.status === 'bot' ? 'humano' : 'bot';
        return {
          ...c,
          status: nextStatus as any,
          mensagens: [
            ...c.mensagens,
            { remetente: 'bot', texto: nextStatus === 'humano' ? 'Atendimento transferido para operador humano.' : 'O Chatbot reassumiu o controle da conversa.', timestamp: '15:16' }
          ]
        };
      }
      return c;
    }));
  };

  if (showFlowEditor) {
    return (
      <MessageFlowEditor 
        onBack={() => setShowFlowEditor(false)}
        onSave={(flowJson) => {
          console.log('Saved Flow structure:', flowJson);
          try {
            const parsed = JSON.parse(flowJson);
            if (parsed.nodes && Array.isArray(parsed.nodes)) {
              setTemplates(prev => {
                let updated = [...prev];
                parsed.nodes.forEach((node: any) => {
                  if (node.text) {
                    const existingIdx = updated.findIndex(u => u.id === node.id || u.label.toLowerCase().includes(node.title.toLowerCase()));
                    if (existingIdx !== -1) {
                      updated[existingIdx].text = node.text;
                    } else if (node.id !== 'inicio') {
                      updated.push({
                        id: node.id,
                        label: node.title,
                        text: node.text
                      });
                    } else {
                      const welcomeIdx = updated.findIndex(u => u.id === 'welcome');
                      if (welcomeIdx !== -1) {
                        updated[welcomeIdx].text = node.text;
                      }
                    }
                  }
                });
                return updated;
              });
            }
          } catch (e) {
            console.error('Error syncing flow JSON:', e);
          }
        }}
        initialTemplates={templates}
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* TITLE GREETINGS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-display font-black text-[#1A1F2E]">Atendimento Automatizado (Chatbot)</h2>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            Controle finamente os fluxos conversacionais inteligentes via Evolution API.
          </p>
        </div>

        {/* COMPREHENSIVE BOT ACTIVE TOGGLES */}
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

      {/* WHATSAPP CREDENTIAL PORTAL */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        
        {/* CONNECTION CARD */}
        <div className="md:col-span-4 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs text-xs font-semibold space-y-4">
          <span className="text-[10px] uppercase font-bold text-[#64748B] block tracking-wider">Conectar Instância</span>
          
          <div className="text-center py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl relative overflow-hidden space-y-3">
            <QrCode className="w-20 h-20 mx-auto text-[#0F4C81]" />
            <div>
              <p className="text-[11px] text-[#1A1F2E] font-bold">QR-Code Sincronizado</p>
              <span className="text-[9.5px] text-[#00C896] block font-mono mt-0.5">Número: {connectedNum}</span>
            </div>
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => alert('Sua instância de WhatsApp já se encontra fully synced no ambiente sandbox.')}
              className="w-full bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-bold py-2 rounded-lg text-[10.5px] uppercase tracking-wide text-center block cursor-pointer"
            >
              Testar Conexão API
            </button>
            <button 
              onClick={() => alert('Parando conexão... Sincronize um novo número de telefone relendo o QR Code.')}
              className="w-full border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2 rounded-lg text-[10.5px] uppercase tracking-wide text-center block cursor-pointer"
            >
              Desconectar WhatsApp
            </button>
          </div>
        </div>

        {/* SMS/WHATSAPP TEMPLATE EDITOR CARD (RIGHT 8 COLS) */}
        <div className="md:col-span-8 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* EDITOR FIELDS */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">Editor de Mensagens</span>
                <button
                  type="button"
                  onClick={() => setShowFlowEditor(true)}
                  className="bg-sky-50 hover:bg-sky-100 text-[#0F4C81] border border-sky-150 text-[10px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Abrir construtor visual de fluxos"
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  Fluxo de Mensagem 🌿
                </button>
              </div>
              <span className="bg-[#0F4C81]/10 text-[#0F4C81] text-[10px] tracking-wide uppercase px-2 py-0.5 rounded font-bold font-sans">SaaS Template</span>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {templates.map((templ) => (
                <button
                  key={templ.id}
                  type="button"
                  onClick={() => setActiveTemplate(templ.id)}
                  className={`px-3 py-1.5 rounded-lg border text-[10.5px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTemplate === templ.id 
                      ? 'bg-[#0F4C81]/5 border-[#0F4C81] text-[#0F4C81]' 
                      : 'bg-white border-[#E2E8F0] text-[#64748B]'
                  }`}
                >
                  {templ.label}
                </button>
              ))}

              {!isAddingTemplate ? (
                <button
                  type="button"
                  onClick={() => setIsAddingTemplate(true)}
                  className="px-3 py-1.5 rounded-lg border border-dashed border-[#0F4C81]/40 bg-[#0F4C81]/5 text-[#0F4C81] text-[10.5px] font-bold hover:bg-[#0F4C81]/10 cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#0F4C81]" />
                  + Nova Mensagem
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-[#E2E8F0] shrink-0">
                  <input
                    type="text"
                    value={newTemplateLabel}
                    onChange={(e) => setNewTemplateLabel(e.target.value)}
                    placeholder="Nome da template..."
                    className="px-2 py-1 border border-[#E2E8F0] rounded bg-white text-[10.5px] focus:outline-none w-28 font-semibold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTemplate();
                      if (e.key === 'Escape') setIsAddingTemplate(false);
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTemplate}
                    className="bg-[#00C896] text-white font-bold p-1 rounded hover:bg-[#00C896]/90 cursor-pointer"
                    title="Confirmar"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingTemplate(false)}
                    className="bg-slate-200 text-slate-600 font-bold p-1 rounded hover:bg-slate-300 cursor-pointer"
                    title="Cancelar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* TEXTAREA EDITOR */}
            <div className="space-y-2">
              <textarea
                className="w-full p-3 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] h-32 resize-none text-[11px] focus:outline-none font-medium leading-relaxed text-[#1A1F2E]"
                value={currText}
                onChange={(e) => setCurrText(e.target.value)}
              />
              {/* VARIABLE TAGS INSTRUCTION */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9.5px] text-[#64748B] font-bold">Variáveis disponíveis:</span>
                {variables.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCurrText(currText + ' ' + v)}
                    className="bg-[#0F4C81]/5 text-[#0F4C81] font-mono text-[9px] px-1.5 py-0.5 rounded border border-[#0F4C81]/10 font-bold hover:bg-[#0F4C81]/10 cursor-pointer"
                  >
                    {v}
                  </button>
                ))}

                {!isAddingVariable ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingVariable(true)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-sans text-[9px] px-2 py-0.5 rounded border border-emerald-200 font-bold cursor-pointer flex items-center gap-0.5"
                  >
                    + Variável
                  </button>
                ) : (
                  <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded border border-[#E2E8F0] shrink-0">
                    <span className="text-[9px] font-mono text-slate-400 font-bold ml-1">{"{"}</span>
                    <input
                      type="text"
                      value={newVariableName}
                      onChange={(e) => setNewVariableName(e.target.value)}
                      placeholder="nome"
                      className="px-1.5 py-0.5 border border-[#E2E8F0] rounded bg-white text-[9px] font-mono focus:outline-none w-16 font-semibold"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddVariable();
                        if (e.key === 'Escape') setIsAddingVariable(false);
                      }}
                    />
                    <span className="text-[9px] font-mono text-slate-400 font-bold">{"}"}</span>
                    <button
                      type="button"
                      onClick={handleAddVariable}
                      className="bg-[#00C896] text-white p-0.5 rounded hover:bg-[#00C896]/95 cursor-pointer flex items-center justify-center"
                      title="Adicionar"
                    >
                      <Check className="w-2.5 h-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingVariable(false)}
                      className="bg-slate-200 text-slate-600 p-0.5 rounded hover:bg-slate-300 cursor-pointer flex items-center justify-center"
                      title="Cancelar"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* GREEN CHAT PREVIEW WRAPPER */}
          <div className="lg:col-span-5 bg-[#E5DDD5] rounded-xl border border-[#d1c8bd] p-4 flex flex-col justify-between relative overflow-hidden select-none min-h-[220px]">
            {/* FLOATING HEADER TIMELINE */}
            <div className="flex items-center gap-2 bg-[#075e54] text-white p-2.5 rounded-t-lg -mx-4 -mt-4 text-[10px] font-bold border-b border-[#053d36] shrink-0">
              <span className="w-2.5 h-2.5 bg-[#00C896] rounded-full shrink-0"></span>
              <span className="truncate">Preview AgendaBot (IA)</span>
            </div>

            {/* SPEECH WRAPPERS */}
            <div className="my-auto space-y-2.5 py-3">
              <div className="bg-[#DCF8C6] text-[#303030] p-3 rounded-xl rounded-tr-none text-[10px] leading-relaxed max-w-[85%] ml-auto shadow-xs relative border border-[#c1e8a2]">
                <p className="whitespace-pre-line font-medium">{currText}</p>
                <span className="text-[8.5px] text-[#64748B] font-mono select-none block text-right mt-1.5">15:16</span>
              </div>
            </div>

            <span className="text-[10px] font-bold text-center block text-slate-500 font-sans tracking-wide">Padrão de Layout WhatsApp</span>
          </div>

        </div>

      </div>

      {/* CHAT HANDOFFS LOG LIST */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
        <div>
          <h4 className="text-sm font-bold font-display text-[#1A1F2E]">Controle de Transbordos (Handoff AI / Humano)</h4>
          <p className="text-[11px] text-[#64748B] font-medium leading-relaxed mt-0.5">
            Ao transferir para operador humano, nossa inteligência desliga-se do chat de WhatsApp instantaneamente, prevenindo interrupções ou loops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-semibold text-xs leading-normal">
          {chats.map((c) => (
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

              {/* ACTION TOGGLER DIRECT */}
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
