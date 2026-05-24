/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BrainCircuit,
  QrCode,
  Network
} from 'lucide-react';
import { MOCK_CHATS } from '../../constants/mockData';
import MessageFlowEditor from './MessageFlowEditor';

export default function ChatbotPage() {
  const [botActive, setBotActive] = useState(true);
  const [connectedNum] = useState('(11) 98765-4321');
  const [chats, setChats] = useState(MOCK_CHATS);
  const [showFlowEditor, setShowFlowEditor] = useState(false);

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
          setShowFlowEditor(false);
        }}
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

      {/* GRID: Connection card + Big flow button */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">

        {/* CONNECTION CARD */}
        <div className="md:col-span-4 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs text-xs font-semibold space-y-4">
          <span className="text-[10px] uppercase font-bold text-[#64748B] block tracking-wider">Conectar Instância</span>
          <div className="text-center py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
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

        {/* BIG FLOW BUTTON */}
        <div className="md:col-span-8 bg-white rounded-xl border border-[#E2E8F0] p-8 shadow-xs flex flex-col items-center justify-center gap-7 min-h-[280px]">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0F4C81]/10 to-[#0F4C81]/20 flex items-center justify-center mx-auto border border-[#0F4C81]/15">
              <BrainCircuit className="w-10 h-10 text-[#0F4C81]" />
            </div>
            <h3 className="text-base font-display font-black text-[#1A1F2E]">Visual Flow Builder</h3>
            <p className="text-[11.5px] text-[#64748B] font-medium max-w-sm mx-auto leading-relaxed">
              Configure os fluxos de atendimento, edite templates de mensagem e gerencie variáveis diretamente no editor visual interativo.
            </p>
          </div>
          <button
            onClick={() => setShowFlowEditor(true)}
            className="bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-black py-4 px-12 rounded-xl text-sm uppercase tracking-wider flex items-center gap-3 shadow-lg transition-all cursor-pointer hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            <Network className="w-5 h-5" />
            Fluxo de Mensagem
          </button>
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
