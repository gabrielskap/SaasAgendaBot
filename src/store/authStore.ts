/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { User, UserRole, Tenant } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  tenant: Tenant;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  registerUser: (step1Data: any, step2Data: any, step3Data: any) => Promise<void>;
  logout: () => void;
  updateTenant: (tenantData: Partial<Tenant>) => void;
}

const DEFAULT_TENANT: Tenant = {
  id: 'tenant-1',
  nome: 'Barbearia Navalha de Ouro',
  logo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=120&auto=format&fit=crop&q=80',
  cnpj: '12.345.678/0001-90',
  endereco: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  telefone: '(11) 98765-4321',
  email: 'contato@navalhaouro.com.br',
  site: 'www.navalhaouro.com.br',
  horarioFuncionamento: {
    segunda: { inicio: '09:00', fim: '18:00', ativo: false },
    terca: { inicio: '08:00', fim: '20:00', ativo: true },
    quarta: { inicio: '08:00', fim: '20:00', ativo: true },
    quinta: { inicio: '08:00', fim: '20:00', ativo: true },
    sexta: { inicio: '08:00', fim: '21:00', ativo: true },
    sabado: { inicio: '08:00', fim: '21:00', ativo: true },
    domingo: { inicio: '09:00', fim: '14:00', ativo: false },
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'user-admin-1',
    nome: 'Gabriel Gustavo',
    email: 'gabrielgustavo1637@gmail.com',
    papel: UserRole.ADMIN,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
  },
  isAuthenticated: true, // Let it default to true so the user is directly dropped into the system, but fully authenticatable. We will let them toggle out to login as well.
  tenant: DEFAULT_TENANT,
  login: async (email, password) => {
    // Basic verification simulation
    if (email.includes('@') && password.length >= 6) {
      const isProf = email.startsWith('prof');
      const isRecepcionista = email.startsWith('recep');
      const role = isProf ? UserRole.PROFISSIONAL : (isRecepcionista ? UserRole.RECEPCIONISTA : UserRole.ADMIN);
      
      const loggedUser: User = {
        id: isProf ? 'user-prof-1' : (isRecepcionista ? 'user-recep-1' : 'user-admin-1'),
        nome: isProf ? 'Rodrigo Silva' : (isRecepcionista ? 'Ana Souza' : 'Gabriel Gustavo'),
        email: email,
        papel: role,
        avatar: isProf 
          ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      };
      
      set({ user: loggedUser, isAuthenticated: true });
      return { success: true };
    } else {
      return { success: false, error: 'Credenciais inválidas. Use uma senha de pelo menos 6 dígitos.' };
    }
  },
  loginWithGoogle: async () => {
    const loggedUser: User = {
      id: 'google-user-1',
      nome: 'Gabriel Gustavo (Google)',
      email: 'gabrielgustavo1637@gmail.com',
      papel: UserRole.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    };
    set({ user: loggedUser, isAuthenticated: true });
  },
  registerUser: async (step1, step2, step3) => {
    const name = step1.nome || 'Novo Usuário';
    const email = step1.email || 'novo@email.com';
    const businessName = step2.nomeEstabelecimento || 'Meu Estabelecimento';
    const logoUrl = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=120&auto=format&fit=crop&q=80';
    
    const loggedUser: User = {
      id: 'reg-user-1',
      nome: name,
      email: email,
      papel: UserRole.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    };

    const newTenant: Tenant = {
      id: 'tenant-new',
      nome: businessName,
      logo: logoUrl,
      cnpj: step2.cnpj || '',
      endereco: `${step2.endereco || ''}, ${step2.cidade || ''} - ${step2.estado || ''}`,
      telefone: step1.telefone || '',
      email: email,
      horarioFuncionamento: DEFAULT_TENANT.horarioFuncionamento
    };

    set({ user: loggedUser, isAuthenticated: true, tenant: newTenant });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  updateTenant: (tenantData) => {
    set((state) => ({
      tenant: { ...state.tenant, ...tenantData }
    }));
  }
}));
