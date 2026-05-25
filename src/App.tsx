/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import SuperAdminPage from './pages/admin/SuperAdminPage';
import { UserRole } from './types';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.papel !== UserRole.SUPER_ADMIN) return <Navigate to="/app/painel" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/app/painel" replace />;
  return <>{children}</>;
}

function AuthPage({ screen }: { screen: 'login' | 'register' | 'forgot-password' }) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Authentication
      initialScreen={screen}
      planSelected={(location.state as { plan?: string })?.plan ?? 'Pro'}
      onNavigateHome={() => navigate('/')}
    />
  );
}

const screenToPath = (screen: string) =>
  screen === 'dashboard' ? '/app/painel' : `/app/${screen}`;

export default function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={
        <PublicRoute>
          <LandingPage
            onNavigateToLogin={() => navigate('/login')}
            onNavigateToRegister={(plan) => navigate('/cadastro', { state: { plan } })}
          />
        </PublicRoute>
      } />
      <Route path="/login" element={<PublicRoute><AuthPage screen="login" /></PublicRoute>} />
      <Route path="/cadastro" element={<PublicRoute><AuthPage screen="register" /></PublicRoute>} />
      <Route path="/esqueci-senha" element={<PublicRoute><AuthPage screen="forgot-password" /></PublicRoute>} />

      {/* Rotas protegidas — área logada */}
      <Route path="/app" element={<ProtectedRoute><SaaSLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/app/painel" replace />} />
        <Route path="painel"        element={<DashboardPage onNavigateToScreen={(s) => navigate(screenToPath(s))} />} />
        <Route path="agenda"        element={<AgendaPage />} />
        <Route path="clientes"      element={<ClientesPage />} />
        <Route path="profissionais" element={<ProfissionaisPage />} />
        <Route path="servicos"      element={<ServicosPage />} />
        <Route path="financeiro"    element={<FinanceiroPage />} />
        <Route path="chatbot"       element={<ChatbotPage />} />
        <Route path="fidelidade"    element={<FidelidadePage />} />
        <Route path="relatorios"    element={<RelatoriosPage />} />
        <Route path="configuracoes" element={<ConfiguracoesPage />} />
        <Route path="super-admin"   element={<SuperAdminRoute><SuperAdminPage /></SuperAdminRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
