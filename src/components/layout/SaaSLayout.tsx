/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Sliders, 
  BrainCircuit, 
  LogOut, 
  DollarSign, 
  Bell, 
  Search, 
  Settings, 
  Menu, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Flame, 
  MessageSquare,
  Award,
  ChevronDown,
  Building,
  Smartphone
} from 'lucide-react';

interface SaaSLayoutProps {
  children: React.ReactNode;
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
}

export default function SaaSLayout({ children, activeScreen, setActiveScreen }: SaaSLayoutProps) {
  const { user, tenant, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Unread status mocks
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Carlos agendou Combo via WhatsApp', time: 'Há 5m', read: false },
    { id: 2, text: 'Dra. Beatriz concluiu atendimento de Mariana', time: 'Há 12m', read: false },
    { id: 3, text: 'Alerta: Cliente Roberto solicitou cancelamento', time: 'Há 45m', read: true },
  ]);

  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: BarChart3, role: ['Admin', 'Gerente'] },
    { id: 'agenda', label: 'Agenda do Dia', icon: Calendar, role: ['Admin', 'Gerente', 'Profissional', 'Recepcionista'] },
    { id: 'clientes', label: 'Clientes (CRM)', icon: Users, role: ['Admin', 'Gerente', 'Recepcionista'] },
    { id: 'profissionais', label: 'Profissionais', icon: Sliders, role: ['Admin', 'Gerente'] },
    { id: 'servicos', label: 'Serviços/Menu', icon: CheckCircle2, role: ['Admin', 'Gerente', 'Recepcionista'] },
    { id: 'financeiro', label: 'Fluxo Financeiro', icon: DollarSign, role: ['Admin', 'Gerente'] },
    { id: 'chatbot', label: 'Config. Chatbot', icon: BrainCircuit, role: ['Admin'] },
    { id: 'fidelidade', label: 'Fidelidade & Pontos', icon: Award, role: ['Admin', 'Gerente'] },
    { id: 'relatorios', label: 'Relatórios Hub', icon: BarChart3, role: ['Admin', 'Gerente'] },
    { id: 'configuracoes', label: 'Preferências', icon: Settings, role: ['Admin', 'Gerente'] },
  ];

  // Filtering modules depending on mockup user privileges
  const visibleMenuItems = menuItems.filter(item => {
    if (!user) return false;
    return item.role.includes(user.papel);
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row antialiased text-[#1A1F2E]">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-[260px] bg-[#0F4C81] text-white shrink-0 shadow-xl border-r border-[#1a6bb5]">
        {/* LOGO AREA */}
        <div className="p-6 border-b border-[#1a6bb5]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <BrainCircuit className="w-6 h-6 text-[#00C896]" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-xl tracking-tight text-white leading-tight">AgendaBot</h1>
              <span className="text-[10px] text-white/60 font-mono tracking-wider uppercase">SaaS WhatsApp AI</span>
            </div>
          </div>
        </div>

        {/* TENANT CARD */}
        <div className="p-4 mx-3 my-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
          <img 
            src={tenant.logo} 
            alt={tenant.nome} 
            className="w-10 h-10 rounded-lg object-cover border border-white/20"
          />
          <div className="overflow-hidden">
            <h4 className="font-display font-bold text-sm text-white truncate">{tenant.nome}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2.5 h-2.5 bg-[#00C896] rounded-full animate-pulse shrink-0"></span>
              <span className="text-[10px] text-white/70 font-mono truncate">Bot Ativo (Evolution)</span>
            </div>
          </div>
        </div>

        {/* GENERAL MENU NAVIGATION */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => {
                  setActiveScreen(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-white text-[#0F4C81] font-bold shadow-md shadow-[#0F4C81]/20' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#0F4C81]' : 'text-white/60'}`} />
                <span>{item.label}</span>
                {item.id === 'chatbot' && (
                  <span className="ml-auto bg-[#00C896]/20 border border-[#00C896]/40 text-[#00C896] text-[10px] uppercase font-mono tracking-wide px-1.5 py-0.5 rounded">
                    IA
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* LOGOUT FOOTER */}
        <div className="p-4 border-t border-[#1a6bb5]/30">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-red-300" />
            <span>Sair do Painel</span>
          </button>
          <div className="text-center mt-3 text-[11px] text-white/40 font-mono">
            v1.2.0 • 2026-05-20 UTC
          </div>
        </div>
      </aside>

      {/* MOBILE NAVBAR TOP */}
      <header className="md:hidden bg-[#0F4C81] text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-[#00C896]" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-base text-white">AgendaBot</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            className="relative p-1.5 bg-white/10 rounded-lg text-white"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF6B35] text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0F4C81]">
                {unreadCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 bg-white/10 rounded-lg text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE NAV DROPDOWN PANEL */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] z-40 bg-[#0F4C81] text-white flex flex-col p-6 animate-fade-in">
          <div className="mb-6 flex items-center gap-3 pb-4 border-b border-white/10">
            <img src={tenant.logo} alt={tenant.nome} className="w-10 h-10 rounded-lg object-cover" />
            <div>
              <h3 className="font-bold font-display text-sm whitespace-nowrap">{tenant.nome}</h3>
              <span className="text-[11px] text-[#00C896] font-mono">Unidade Única (Pro Plano)</span>
            </div>
          </div>

          <nav className="space-y-2 flex-1 overflow-y-auto">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveScreen(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold ${
                    isActive ? 'bg-white text-[#0F4C81]' : 'hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-white/10 mt-auto">
            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 text-red-300 rounded-lg text-sm font-semibold"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair do Painel</span>
            </button>
          </div>
        </div>
      )}

      {/* WORKSPACE AREA CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto relative">
        
        {/* HEADER / TOPBAR (DESKTOP ONLY) */}
        <header className="hidden md:flex h-[76px] items-center justify-between px-8 bg-white border-b border-[#E2E8F0] shrink-0 sticky top-0 z-30 shadow-xs">
          
          {/* SEARCH DESKTOP */}
          <div className="relative w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Buscar cliente, número, serviço..."
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* STATUS TRADING BOX & ALERTS */}
          <div className="flex items-center gap-6">
            
            {/* WHATSAPP ONLINE STATUS */}
            <div className="flex items-center gap-2 bg-[#00C896]/10 px-3 py-1.5 rounded-full border border-[#00C896]/20">
              <span className="w-2 h-2 bg-[#00C896] rounded-full animate-pulse"></span>
              <span className="text-xs font-semibold text-[#0f5132] font-display">WhatsApp Ativo (Connected)</span>
            </div>

            {/* NOTIFICATIONS CONTAINER BUTTON */}
            <div className="relative">
              <button
                id="btn-notifications-desk"
                onClick={() => {
                  setShowNotificationDropdown(!showNotificationDropdown);
                  setShowProfileDropdown(false);
                }}
                className="relative p-2 text-[#64748B] hover:text-[#0F4C81] hover:bg-[#F8FAFC] rounded-lg transition-colors cursor-pointer"
              >
                <Bell className="w-5.5 h-5.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#FF6B35] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATION FLOTATION DROPDOWN */}
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-50 animate-fade-in-down">
                  <div className="px-4 py-2 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC] rounded-t-xl">
                    <span className="text-xs font-bold font-display uppercase tracking-wider text-[#1A1F2E]">Notificações</span>
                    <button 
                      onClick={handleMarkAllRead} 
                      className="text-[10px] text-[#0F4C81] hover:underline font-semibold cursor-pointer"
                    >
                      Limpar novas
                    </button>
                  </div>
                  <div className="divide-y divide-[#E2E8F0] max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-3 text-xs transition-colors hover:bg-[#F8FAFC] ${!n.read ? 'bg-[#0F4C81]/5 font-medium' : ''}`}>
                        <p className="text-[#1A1F2E]">{n.text}</p>
                        <span className="text-[10px] text-[#64748B] block mt-1">{n.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 text-center border-t border-[#E2E8F0] bg-[#F8FAFC] rounded-b-xl">
                    <span className="text-[11px] text-[#64748B] font-medium block">Exibindo logs de IA evolutiva</span>
                  </div>
                </div>
              )}
            </div>

            {/* DIVIDER */}
            <div className="h-6 w-px bg-[#E2E8F0]"></div>

            {/* USER PERFIL POPOUT */}
            <div className="relative">
              <button
                id="btn-profile-desk"
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotificationDropdown(false);
                }}
                className="flex items-center gap-3 p-1 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                <img 
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                  alt={user?.nome} 
                  className="w-10 h-10 rounded-full border border-[#E2E8F0] object-cover"
                />
                <div className="text-left hidden lg:block">
                  <h5 className="text-sm font-bold truncate max-w-[150px] leading-tight text-[#1A1F2E]">{user?.nome}</h5>
                  <span className="text-xs text-[#64748B] font-medium inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0F4C81]" />
                    {user?.papel}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-[#64748B] hidden lg:block" />
              </button>

              {/* PROFILE DROPDOWN */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-50 divide-y divide-[#E2E8F0]">
                  <div className="px-4 py-3 bg-[#F8FAFC]">
                    <span className="text-xs font-mono text-[#64748B] block">Conectado como</span>
                    <p className="text-sm font-bold text-[#1A1F2E] truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={() => { setActiveScreen('configuracoes'); setShowProfileDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-[#1A1F2E] hover:bg-[#F8FAFC] font-medium flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-[#64748B]" />
                      Configurações do Sistema
                    </button>
                    <button 
                      onClick={() => { setActiveScreen('chatbot'); setShowProfileDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-[#1A1F2E] hover:bg-[#F8FAFC] font-medium flex items-center gap-2"
                    >
                      <BrainCircuit className="w-4 h-4 text-[#00C896]" />
                      Configurações do WhatsApp IA
                    </button>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={() => { logout(); setShowProfileDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Encerrar Sessão
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* WORKSPACE SCROLL CONTENT */}
        <main className="flex-grow p-4 md:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>

      </div>
    </div>
  );
}
