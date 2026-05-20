/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Users, 
  Check, 
  X, 
  Info, 
  MessageSquare, 
  Trash2, 
  FileText,
  Clock,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { MOCK_BOOKINGS, MOCK_PROFESSIONALS, MOCK_SERVICES, MOCK_CLIENTS } from '../../constants/mockData';
import { Agendamento, BookingStatus, Profissional } from '../../types';

export default function AgendaPage() {
  const [currentView, setCurrentView] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [selectedProId, setSelectedProId] = useState<string>('todos');
  const [bookings, setBookings] = useState<Agendamento[]>(MOCK_BOOKINGS);
  const [proActiveAlert, setProActiveAlert] = useState<string>('');

  // Sider and modal triggers
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Agendamento | null>(null);

  // Form Fields for New Booking
  const [formClientSearch, setFormClientSearch] = useState('');
  const [chosenClientId, setChosenClientId] = useState('');
  const [chosenClientName, setChosenClientName] = useState('');
  const [chosenClientPhone, setChosenClientPhone] = useState('');
  const [chosenServiceId, setChosenServiceId] = useState(MOCK_SERVICES[0].id);
  const [chosenProId, setChosenProId] = useState(MOCK_PROFESSIONALS[0].id);
  const [formDate, setFormDate] = useState('2026-05-20');
  const [formTime, setFormTime] = useState('11:00');
  const [formNotes, setFormNotes] = useState('');
  const [formNotify, setFormNotify] = useState(true);
  const [formSinal, setFormSinal] = useState(false);
  const [formSinalValor, setFormSinalValor] = useState('30.00');

  // Time slots array
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  // Professional colors mapping
  const proColors: { [key: string]: { border: string; bg: string; text: string } } = {
    'p-1': { border: 'border-l-4 border-l-[#0F4C81]', bg: 'bg-[#0F4C81]/5 hover:bg-[#0F4C81]/10', text: 'text-[#0F4C81]' },
    'p-2': { border: 'border-l-4 border-l-[#FF6B35]', bg: 'bg-[#FF6B35]/5 hover:bg-[#FF6B35]/10', text: 'text-[#FF6B35]' },
    'p-3': { border: 'border-l-4 border-l-emerald-600', bg: 'bg-emerald-50 hover:bg-emerald-100', text: 'text-emerald-700' },
    'p-4': { border: 'border-l-4 border-l-slate-400', bg: 'bg-slate-50 hover:bg-slate-100', text: 'text-slate-700' },
  };

  // Autocomplete search handler
  const filteredClientsSearch = formClientSearch.trim() === ''
    ? []
    : MOCK_CLIENTS.filter(c => c.nome.toLowerCase().includes(formClientSearch.toLowerCase()) || c.telefone.includes(formClientSearch));

  // Filter Bookings by active professional filter and date context
  const filteredBookings = bookings.filter((b) => {
    const isProMatch = selectedProId === 'todos' || b.profissionalId === selectedProId;
    return isProMatch;
  });

  const bookingsByDate = (date: string) => filteredBookings.filter(b => b.data === date);

  // Quick Action triggers on Detail Sidebar
  const updateStatus = (id: string, newStatus: BookingStatus) => {
    const dStr = '2026-05-20 15:16';
    const updated = bookings.map((b) => {
      if (b.id === id) {
        const hist = b.historico ? [...b.historico] : [];
        hist.push({ dataHora: dStr, acao: `Alterou status para ${newStatus}`, usuario: 'Gabriel Gustavo' });
        return { ...b, status: newStatus, historico: hist };
      }
      return b;
    });
    setBookings(updated);
    
    // update current focus card details
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking(updated.find(item => item.id === id) || null);
    }
  };

  // Booking creator submission form
  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chosenClientName) {
      alert('Favor selecionar um cliente válido.');
      return;
    }

    // Verify double booking collision (RN01)
    const hasCollision = bookings.some(b => 
      b.data === formDate && 
      b.horario === formTime && 
      b.profissionalId === chosenProId && 
      b.status !== BookingStatus.CANCELADO
    );

    if (hasCollision) {
      setProActiveAlert(`Este horário (${formTime}) já está ocupado para o profissional escolhido.`);
      return;
    }

    const serviceObj = MOCK_SERVICES.find(s => s.id === chosenServiceId)!;
    const proObj = MOCK_PROFESSIONALS.find(p => p.id === chosenProId)!;

    const newBooking: Agendamento = {
      id: `b-custom-${Date.now()}`,
      clienteId: chosenClientId || 'custom-client-id',
      clienteNome: chosenClientName,
      clienteTelefone: chosenClientPhone,
      clienteEmail: 'cadastro@email.com',
      servicoId: chosenServiceId,
      servicoNome: serviceObj.nome,
      profissionalId: chosenProId,
      profissionalNome: proObj.nome,
      data: formDate,
      horario: formTime,
      status: BookingStatus.CONFIRMADO,
      valor: serviceObj.preco,
      observacoes: formNotes,
      notificarWhats: formNotify,
      cobrarSinal: formSinal,
      sinalValor: formSinal ? parseFloat(formSinalValor) : 0,
      historico: [
        { dataHora: '2026-05-20 15:16', acao: 'Agendamento Criado no Painel', usuario: 'Gabriel Gustavo' }
      ]
    };

    setBookings([newBooking, ...bookings]);
    setIsNewBookingOpen(false);
    
    // Reset Form Fields
    setFormClientSearch('');
    setChosenClientId('');
    setChosenClientName('');
    setChosenClientPhone('');
    setFormNotes('');
    setProActiveAlert('');
  };

  return (
    <div className="space-y-6 relative">
      
      {/* HEADER SECTION CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <h2 className="text-xl font-display font-black text-[#1A1F2E]">Agenda Automatizada</h2>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            Arraste ou clique nos cards para visualizar históricos conversacionais do bot.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* VIEW SELECTOR TOGGLE */}
          <div className="flex items-center gap-1 bg-white border border-[#E2E8F0] p-1 rounded-lg">
            {(['dia', 'semana', 'mes'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md tracking-wider transition-all ${
                  currentView === view 
                    ? 'bg-[#0F4C81] text-white' 
                    : 'text-[#64748B] hover:text-[#1A1F2E]'
                }`}
              >
                {view}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsNewBookingOpen(true)}
            className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-bold px-4 py-2 rounded-lg text-xs tracking-wider uppercase shadow-md shadow-[#FF6B35]/15 flex items-center gap-2 cursor-pointer ml-auto md:ml-0"
          >
            <Plus className="w-4.5 h-4.5" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* PROFESSIONALS FILTER LINE CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E2E8F0]/50">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] pr-2 shrink-0">Filtrar Equipe:</span>
        <button
          onClick={() => setSelectedProId('todos')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all select-none border whitespace-nowrap ${
            selectedProId === 'todos'
              ? 'bg-[#0F4C81] border-[#0F4C81] text-white'
              : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#64748B]'
          }`}
        >
          Equipe Completa
        </button>
        {MOCK_PROFESSIONALS.map((pro) => (
          <button
            key={pro.id}
            onClick={() => setSelectedProId(pro.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all flex items-center gap-2 border whitespace-nowrap ${
              selectedProId === pro.id
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#64748B]'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${pro.id === 'p-1' ? 'bg-[#0F4C81]' : pro.id === 'p-2' ? 'bg-[#FF6B35]' : 'bg-emerald-500'}`}></span>
            {pro.nome}
          </button>
        ))}
      </div>

      {/* VIEWPORT CONTROLS CONTAINER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* CALENDAR CONTENT AREA (LEFT 8 COLS) */}
        <div className="md:col-span-8 lg:col-span-9 bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          
          {/* DIARIO SCREEN (TIMELINE EXPANSION) */}
          {currentView === 'dia' && (
            <div className="divide-y divide-[#E2E8F0]">
              
              {/* CURRENT DATE BANNER */}
              <div className="px-5 py-3.5 bg-[#F8FAFC] flex justify-between items-center text-xs font-bold text-[#1A1F2E]">
                <span>Agenda do Dia • Quarta-feira</span>
                <div className="flex items-center gap-2">
                  <button className="p-1 hover:bg-[#E2E8F0] rounded cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                  <span>20 de Maio de 2026</span>
                  <button className="p-1 hover:bg-[#E2E8F0] rounded cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>

              {/* TIMELINE LIST */}
              <div className="p-4 max-h-[600px] overflow-y-auto space-y-3">
                {timeSlots.map((slot) => {
                  const slotBookings = bookingsByDate('2026-05-20').filter(b => b.horario === slot);
                  const isOccupied = slotBookings.length > 0;

                  return (
                    <div key={slot} className="flex gap-4 items-center group min-h-[46px]">
                      {/* SLOT TIMING */}
                      <span className="font-jetbrains text-xs font-bold text-[#64748B] w-12 shrink-0">{slot}</span>
                      
                      {/* CARD CONTAINER LINE */}
                      <div className="flex-grow border-t border-dashed border-[#E2E8F0] flex gap-2 items-center min-h-[40px]">
                        {isOccupied ? (
                          slotBookings.map((b) => {
                            const proColor = proColors[b.profissionalId] || { border: 'border-l-4 border-l-gray-400', bg: 'bg-gray-50' };
                            return (
                              <button
                                key={b.id}
                                onClick={() => setSelectedBooking(b)}
                                className={`flex-grow md:flex-grow-0 md:w-56 text-left p-2.5 rounded-lg border border-[#E2E8F0] cursor-pointer shadow-xs transition-all hover:shadow-md ${proColor.border} ${proColor.bg}`}
                              >
                                <div className="flex justify-between items-start">
                                  <h5 className="font-bold text-[#1A1F2E] text-xs truncate max-w-[140px]">{b.clienteNome}</h5>
                                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#64748B]">{b.status}</span>
                                </div>
                                <p className="text-[10px] text-[#64748B] truncate mt-0.5">
                                  {b.servicoNome} • <b>{b.profissionalNome}</b>
                                </p>
                              </button>
                            );
                          })
                        ) : (
                          <button
                            onClick={() => {
                              setFormTime(slot);
                              setIsNewBookingOpen(true);
                            }}
                            className="text-[10px] text-[#64748B]/40 hover:text-[#0F4C81] opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all pl-3 font-semibold cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Reservar {slot}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* WEEKLY COMPACT (GRID COLUMN MATRIX) */}
          {currentView === 'semana' && (
            <div className="divide-y divide-[#E2E8F0]">
              <div className="px-5 py-3.5 bg-[#F8FAFC] text-xs font-bold text-[#1A1F2E]">
                Atividades Semanais (Semana 21)
              </div>
              <div className="grid grid-cols-7 divide-x divide-[#E2E8F0] bg-[#F8FAFC]">
                {['Seg 18', 'Ter 19', 'Qua 20', 'Qui 21', 'Sex 22', 'Sáb 23', 'Dom 24'].map((day, idx) => {
                  const dateStr = `2026-05-${18 + idx}`;
                  const dayBookings = filteredBookings.filter(b => b.data === dateStr);
                  
                  return (
                    <div key={day} className="p-2 min-h-[400px] space-y-2">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase block text-center pb-2 border-b border-[#E2E8F0]">
                        {day}
                      </span>
                      <div className="space-y-1.5">
                        {dayBookings.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => setSelectedBooking(b)}
                            className="w-full text-left p-1.5 rounded bg-slate-50 border border-[#E2E8F0] shadow-2xs hover:bg-[#F8FAFC] transition-colors overflow-hidden"
                          >
                            <span className="font-jetbrains text-[9px] font-bold text-[#0F4C81] block">{b.horario}</span>
                            <span className="font-bold text-[#1A1F2E] text-[10px] block truncate">{b.clienteNome}</span>
                            <span className="text-[8px] text-[#64748B] truncate block">{b.servicoNome}</span>
                          </button>
                        ))}
                        {dayBookings.length === 0 && (
                          <div className="py-8 text-center text-[9px] text-[#64748B]/30 font-medium">Livre</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MONTH CALENDAR COUNTERS */}
          {currentView === 'mes' && (
            <div className="p-5 space-y-4">
              <span className="text-xs font-mono text-[#64748B] uppercase tracking-wider block font-semibold text-center">Maio de 2026</span>
              <div className="grid grid-cols-7 gap-1 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] select-none text-center">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                  <span key={d} className="font-bold text-xs text-[#64748B] py-1.5 block">{d}</span>
                ))}
                {/* padding pre-days */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-3"></div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayStr = `2026-05-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                  const dayBookingsCount = bookings.filter(b => b.data === dayStr).length;
                  return (
                    <button
                      key={i}
                      disabled={dayBookingsCount === 0}
                      className={`p-3 text-xs rounded-lg flex flex-col items-center relative gap-1 transition-all ${
                        dayNum === 20 
                          ? 'bg-[#0F4C81] text-white font-bold ring-2 ring-[#0F4C81]/25' 
                          : dayBookingsCount > 0 
                            ? 'bg-emerald-50 border border-emerald-100 text-emerald-900 font-semibold' 
                            : 'text-[#64748B]/50 hover:bg-slate-100 disabled:opacity-40'
                      }`}
                    >
                      <span>{dayNum}</span>
                      {dayBookingsCount > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* SIDEBAR FOR APP DETAILS KEY (RIGHT 4 COLS) */}
        <div className="md:col-span-4 lg:col-span-3 space-y-4">
          
          {selectedBooking ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-5 animate-fade-in">
              <div className="flex justify-between items-start border-b border-[#E2E8F0] pb-3.5">
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] uppercase">Código: {selectedBooking.id.slice(0, 8)}</span>
                  <h4 className="font-display font-black text-sm text-[#1A1F2E] mt-0.5">{selectedBooking.clienteNome}</h4>
                </div>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="p-1 hover:bg-red-50 text-red-500 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* INFORMATION */}
              <div className="space-y-3 text-xs font-semibold">
                
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Contato</span>
                  <span className="text-[#1A1F2E]">{selectedBooking.clienteTelefone}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#64748B]">Serviço</span>
                  <span className="text-[#0F4C81]">{selectedBooking.servicoNome}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#64748B]">Profissional</span>
                  <span className="text-[#1A1F2E]">{selectedBooking.profissionalNome}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#64748B]">Valor</span>
                  <span className="text-emerald-700 font-bold">R$ {selectedBooking.valor.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#64748B]">Data e Horário</span>
                  <span className="text-[#1A1F2E]">{selectedBooking.data} às {selectedBooking.horario}</span>
                </div>

                {selectedBooking.cobrarSinal && (
                  <div className="bg-[#00C896]/10 px-3 py-2.5 rounded-lg border border-[#00C896]/20 flex justify-between items-center text-[11px] text-[#0f5132]">
                    <span>Sinal Recebido:</span>
                    <span className="font-bold">R$ {selectedBooking.sinalValor?.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* ACTION LIFECYCLE TRIGGERS */}
              <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block mb-1">Ações do Agendamento:</span>
                
                {selectedBooking.status !== BookingStatus.CONCLUIDO && (
                  <button
                    onClick={() => updateStatus(selectedBooking.id, BookingStatus.CONCLUIDO)}
                    className="w-full bg-[#00C896] hover:bg-[#00C896]/90 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Marcar Concluído
                  </button>
                )}

                {selectedBooking.status === BookingStatus.PENDENTE && (
                  <button
                    onClick={() => updateStatus(selectedBooking.id, BookingStatus.CONFIRMADO)}
                    className="w-full bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Confirmar Horário
                  </button>
                )}

                {selectedBooking.status !== BookingStatus.CANCELADO && (
                  <button
                    onClick={() => updateStatus(selectedBooking.id, BookingStatus.CANCELADO)}
                    className="w-full border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2 rounded-lg text-xs uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" /> Cancelar Reserva
                  </button>
                )}

                {/* SIMULATE DIRECT WHATSAPP TEXT */}
                <a
                  href={`https://wa.me/55${selectedBooking.clienteTelefone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full border border-[#E2E8F0] text-[#1A1F2E] hover:bg-slate-50 font-bold py-2 rounded-lg text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <MessageSquare className="w-4 h-4 text-[#00C896]" /> Enviar WhatsApp
                </a>
              </div>

              {/* TIMELINES HISTORIC LOG */}
              <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">Histórico de Alterações:</span>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {selectedBooking.historico?.map((h, i) => (
                    <div key={i} className="text-[10px] bg-[#F8FAFC] border border-[#E2E8F0] rounded p-2 text-slate-800">
                      <p className="font-bold">{h.acao}</p>
                      <span className="text-[9px] text-[#64748B] block mt-1">{h.dataHora} por {h.usuario}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-[#0F4C81]/5 rounded-xl border border-[#0F4C81]/10 p-5 text-center text-xs text-[#64748B] font-medium space-y-3">
              <Info className="w-10 h-10 text-[#0F4C81] mx-auto opacity-70" />
              <p>Nenhum agendamento selecionado.</p>
              <p className="text-[11px] leading-relaxed">Selecione qualquer card ativo ao lado para abrir opções de reagendamento, confirmação manual e log do painel.</p>
            </div>
          )}

        </div>

      </div>

      {/* MODAL: "NOVO AGENDAMENTO" FORM */}
      {isNewBookingOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-lg w-full overflow-hidden animate-fade-in-up my-8">
            
            {/* BRAND HEADER */}
            <div className="bg-[#0F4C81] text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#00C896]" />
                <h4 className="font-display font-extrabold text-sm uppercase tracking-wider">Novo Agendamento</h4>
              </div>
              <button 
                onClick={() => setIsNewBookingOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleCreateBooking} className="p-5 space-y-4">
              
              {proActiveAlert && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold">
                  {proActiveAlert}
                </div>
              )}

              {/* CLIENT INPUT WITH SEARCH AUTOCOMPLETE PREVIEW */}
              <div className="relative">
                <label className="text-[11px] font-bold text-[#1A1F2E] uppercase block mb-1">Buscar Cliente</label>
                <input
                  type="text"
                  placeholder="Busque por nome ou nº de telefone..."
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-xs leading-none bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]"
                  value={formClientSearch}
                  onChange={(e) => {
                    setFormClientSearch(e.target.value);
                    setChosenClientName(e.target.value); // support typing standalone guest names
                  }}
                />
                
                {/* MATCH DROPDOWN */}
                {filteredClientsSearch.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-lg max-h-40 overflow-y-auto z-50 divide-y divide-[#E2E8F0]">
                    {filteredClientsSearch.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setChosenClientId(c.id);
                          setChosenClientName(c.nome);
                          setChosenClientPhone(c.telefone);
                          setFormClientSearch(c.nome);
                        }}
                        className="w-full text-left p-3 text-xs text-[#1A1F2E] hover:bg-[#F8FAFC] font-medium flex justify-between items-center"
                      >
                        <span>{c.nome}</span>
                        <span className="text-[#64748B] font-mono text-[10px]">{c.telefone}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {chosenClientName && (
                  <span className="text-[10px] text-emerald-600 font-bold block mt-1.5">
                    ✓ Cliente selecionado: <b>{chosenClientName} {chosenClientPhone ? `(${chosenClientPhone})` : ''}</b>
                  </span>
                )}
              </div>

              {/* SERVICE & PROS DROP SELECT */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#1A1F2E] uppercase block mb-1">Selecionar Serviço</label>
                  <select
                    className="w-full px-3 py-2.5 border border-[#E2E8F0] bg-white rounded-lg text-xs"
                    value={chosenServiceId}
                    onChange={(e) => setChosenServiceId(e.target.value)}
                  >
                    {MOCK_SERVICES.map(s => (
                      <option key={s.id} value={s.id}>{s.nome} — R$ {s.preco.toFixed(2)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#1A1F2E] uppercase block mb-1">Profissional Responsável</label>
                  <select
                    className="w-full px-3 py-2.5 border border-[#E2E8F0] bg-white rounded-lg text-xs"
                    value={chosenProId}
                    onChange={(e) => setChosenProId(e.target.value)}
                  >
                    {MOCK_PROFESSIONALS.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DATE & TIME SELECTOR */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#1A1F2E] uppercase block mb-1">Data</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#1A1F2E] uppercase block mb-1">Horário</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs font-jetbrains"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                  />
                </div>
              </div>

              {/* OBSERVATIONS NOTES TEXTAREA */}
              <div>
                <label className="text-[11px] font-bold text-[#1A1F2E] uppercase block mb-1">Observações / Preferências</label>
                <textarea
                  placeholder="Alguma restrição alérgica, detalhe de técnica, etc..."
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-xs h-16 resize-none bg-[#F8FAFC]"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>

              {/* TOGGLE OPTIONS */}
              <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-lg space-y-3.5">
                
                {/* WHATSAPP TOGGLE */}
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h5 className="text-xs font-bold text-[#1A1F2E] flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#00C896]" /> Notificar via WhatsApp
                    </h5>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">Envia lembrete de confirmação ao criar.</span>
                  </div>
                  <input 
                    type="checkbox"
                    className="w-4 h-4 text-[#0F4C81] border-[#E2E8F0] rounded"
                    checked={formNotify}
                    onChange={(e) => setFormNotify(e.target.checked)}
                  />
                </div>

                {/* SIGNAL TOGGLE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h5 className="text-xs font-bold text-[#1A1F2E] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#FF6B35]" /> Cobrar Sinal Financeiro?
                      </h5>
                      <span className="text-[10px] text-[#64748B] block mt-0.5">Gera link de pagamento preventivo Pix.</span>
                    </div>
                    <input 
                      type="checkbox"
                      className="w-4 h-4 text-[#0F4C81] border-[#E2E8F0] rounded"
                      checked={formSinal}
                      onChange={(e) => setFormSinal(e.target.checked)}
                    />
                  </div>

                  {formSinal && (
                    <div className="flex items-center gap-3 bg-white p-2 border border-[#E2E8F0] rounded-lg animate-fade-in">
                      <span className="text-xs font-bold text-[#64748B]">Valor do Sinal: R$</span>
                      <input
                        type="number"
                        placeholder="30.00"
                        className="px-2 py-1 border border-[#E2E8F0] rounded text-xs w-28 font-jetbrains font-bold text-[#1A1F2E]"
                        value={formSinalValor}
                        onChange={(e) => setFormSinalValor(e.target.value)}
                      />
                    </div>
                  )}
                </div>

              </div>

              {/* ACTIONS CONTROLS */}
              <div className="flex gap-2 justify-end pt-3.5 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsNewBookingOpen(false)}
                  className="px-4 py-2 border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg uppercase tracking-wider cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Salvar Agendamento
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
