import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, UserRole, Tenant } from '../types';

const DB_ROLE_MAP: Record<string, UserRole> = {
  SUPER_ADMIN: UserRole.SUPER_ADMIN,
  ADMIN: UserRole.ADMIN,
  MANAGER: UserRole.GERENTE,
  PROFESSIONAL: UserRole.PROFISSIONAL,
  RECEPTIONIST: UserRole.RECEPCIONISTA,
};

function mapProfile(profile: any): User {
  return {
    id: profile.id,
    nome: profile.name,
    email: profile.email,
    papel: DB_ROLE_MAP[profile.role] ?? UserRole.RECEPCIONISTA,
    avatar: profile.avatar_url ?? '',
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  tenant: Tenant | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  registerUser: (step1Data: any, step2Data: any, step3Data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateTenant: (tenantData: Partial<Tenant>) => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  tenant: null,
  loading: true,

  initAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: profile } = await supabase
        .from('AgendaBot_User')
        .select('*, AgendaBot_Tenant(*)')
        .eq('auth_id', session.user.id)
        .single();

      if (profile) {
        set({
          user: mapProfile(profile),
          tenant: profile.AgendaBot_Tenant ?? null,
          isAuthenticated: true,
          loading: false,
        });
        return;
      }
    }

    set({ user: null, isAuthenticated: false, tenant: null, loading: false });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('AgendaBot_User')
          .select('*, AgendaBot_Tenant(*)')
          .eq('auth_id', session.user.id)
          .single();

        if (profile) {
          set({
            user: mapProfile(profile),
            tenant: profile.AgendaBot_Tenant ?? null,
            isAuthenticated: true,
          });
        }
      } else {
        set({ user: null, isAuthenticated: false, tenant: null });
      }
    });
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return { success: false, error: error?.message ?? 'Erro ao fazer login' };
    }

    return { success: true };
  },

  loginWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  },

  registerUser: async (step1, step2, _step3) => {
    const { data, error } = await supabase.auth.signUp({
      email: step1.email,
      password: step1.senha,
    });

    if (error || !data.user) {
      return { success: false, error: error?.message ?? 'Erro ao registrar usuário' };
    }

    const { error: tenantError } = await supabase.from('AgendaBot_Tenant').insert({
      nome: step2.nomeEstabelecimento,
      cnpj: step2.cnpj ?? null,
      endereco: `${step2.endereco ?? ''}, ${step2.cidade ?? ''} - ${step2.estado ?? ''}`,
      telefone: step1.telefone ?? null,
      email: step1.email,
    }).select().single();

    if (tenantError) {
      return { success: false, error: tenantError.message };
    }

    return { success: true };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, tenant: null });
  },

  updateTenant: (tenantData) => {
    set((state) => ({
      tenant: state.tenant ? { ...state.tenant, ...tenantData } : null,
    }));
  },
}));
