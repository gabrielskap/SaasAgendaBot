/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import SaaSLayout from './components/layout/SaaSLayout';

// Modular Page Imports
import LandingPage from './pages/LandingPage';
import Authentication from './pages/Authentication';
import DashboardPage from './pages/dashboard/DashboardPage';
import AgendaPage from './pages/agenda/AgendaPage';
import ClientesPage from './pages/clientes/ClientesPage';
import ProfissionaisPage from './pages/profissionais/ProfissionaisPage';
import ServicosPage from './pages/servicos/ServicosPage';
import FinanceiroPage from './pages/financeiro/FinanceiroPage';
import ChatbotPage from './pages/chatbot/ChatbotPage';
import FidelidadePage from './pages/fidelidade/FidelidadePage';
import RelatoriosPage from './pages/relatorios/RelatoriosPage';
import ConfiguracoesPage from './pages/configuracoes/ConfiguracoesPage';

type ViewMode = 'landing' | 'auth' | 'app';

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const [rootView, setRootView] = useState<ViewMode>('app');
  const [authSubView, setAuthSubView] = useState<'login' | 'register' | 'forgot-password' | 'register-plan-select'>('login');
  const [selectedPlanName, setSelectedPlanName] = useState('Pro');

  // Active platform dashboard page
  const [activeScreen, setActiveScreen] = useState('dashboard');

  // Guard routing side-effect
  useEffect(() => {
    if (isAuthenticated) {
      setRootView('app');
    } else {
      setRootView('landing');
    }
  }, [isAuthenticated]);

  const handleGoToLogin = () => {
    setAuthSubView('login');
    setRootView('auth');
  };

  const handleGoToRegister = (planName?: string) => {
    if (planName) {
      setSelectedPlanName(planName);
    }
    setAuthSubView('register');
    setRootView('auth');
  };

  return (
    <>
      {rootView === 'landing' && (
        <LandingPage 
          onNavigateToLogin={handleGoToLogin}
          onNavigateToRegister={handleGoToRegister}
        />
      )}

      {rootView === 'auth' && (
        <Authentication 
          initialScreen={authSubView}
          planSelected={selectedPlanName}
          onNavigateHome={() => setRootView('landing')}
        />
      )}

      {rootView === 'app' && (
        <SaaSLayout activeScreen={activeScreen} setActiveScreen={setActiveScreen}>
          {activeScreen === 'dashboard' && (
            <DashboardPage onNavigateToScreen={setActiveScreen} />
          )}
          {activeScreen === 'agenda' && (
            <AgendaPage />
          )}
          {activeScreen === 'clientes' && (
            <ClientesPage />
          )}
          {activeScreen === 'profissionais' && (
            <ProfissionaisPage />
          )}
          {activeScreen === 'servicos' && (
            <ServicosPage />
          )}
          {activeScreen === 'financeiro' && (
            <FinanceiroPage />
          )}
          {activeScreen === 'chatbot' && (
            <ChatbotPage />
          )}
          {activeScreen === 'fidelidade' && (
            <FidelidadePage />
          )}
          {activeScreen === 'relatorios' && (
            <RelatoriosPage />
          )}
          {activeScreen === 'configuracoes' && (
            <ConfiguracoesPage />
          )}
        </SaaSLayout>
      )}
    </>
  );
}
