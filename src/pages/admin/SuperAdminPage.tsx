import React, { useState, useEffect } from 'react';
import {
  Crown, Users, Shield, Database, Activity, Settings2,
  Plus, Search, Edit2, Trash2, Lock, Unlock, RefreshCw,
  Download, Upload, Eye, AlertTriangle, CheckCircle2,
  XCircle, Clock, Server, Cpu, HardDrive, Wifi,
  TrendingUp, BarChart3, LogOut, Key, UserCheck,
  UserX, ChevronDown, Filter, MoreVertical
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { UserRole } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SysUser {
  id: string;
  auth_id: string;
  nome: string;
  email: string;
  papel: string;
  bloqueado: boolean;
  created_at: string;
  tenant_nome?: string;
}

interface AuditLog {
  id: string;
  usuario: string;
  acao: string;
  detalhe: string;
  created_at: string;
  nivel: 'info' | 'warning' | 'error';
}

type Tab = 'dashboard' | 'usuarios' | 'permissoes' | 'logs' | 'banco' | 'configuracoes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  'Super Admin': 'bg-purple-100 text-purple-700 border-purple-200',
  'Admin':       'bg-blue-100 text-blue-700 border-blue-200',
  'Gerente':     'bg-teal-100 text-teal-700 border-teal-200',
  'Profissional':'bg-green-100 text-green-700 border-green-200',
  'Recepcionista':'bg-amber-100 text-amber-700 border-amber-200',
};

function RoleBadge({ papel }: { papel: string }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ROLE_COLORS[papel] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {papel}
    </span>
  );
}

function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${ok ? 'bg-[#00C896] animate-pulse' : 'bg-red-500'}`} />
      <span className="text-xs text-[#64748B]">{label}</span>
    </div>
  );
}

// ─── Modal: Criar/Editar Usuário ───────────────────────────────────────────────

interface UserModalProps {
  user?: SysUser | null;
  onClose: () => void;
  onSaved: () => void;
}

function UserModal({ user, onClose, onSaved }: UserModalProps) {
  const [form, setForm] = useState({
    nome: user?.nome ?? '',
    email: user?.email ?? '',
    papel: user?.papel ?? UserRole.ADMIN,
    senha: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.nome || !form.email) { setError('Nome e email são obrigatórios.'); return; }
    setSaving(true);
    setError('');

    if (user) {
      // Editar
      const { error: err } = await supabase
        .from('AgendaBot_User')
        .update({ nome: form.nome, papel: form.papel })
        .eq('id', user.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      // Criar via Supabase Auth Admin
      if (!form.senha || form.senha.length < 6) { setError('Senha mínima de 6 caracteres.'); setSaving(false); return; }
      const { data, error: authErr } = await supabase.auth.admin.createUser({
        email: form.email,
        password: form.senha,
        email_confirm: true,
      });
      if (authErr || !data.user) { setError(authErr?.message ?? 'Erro ao criar usuário'); setSaving(false); return; }
      const { error: dbErr } = await supabase.from('AgendaBot_User').insert({
        auth_id: data.user.id,
        nome: form.nome,
        email: form.email,
        papel: form.papel,
        bloqueado: false,
      });
      if (dbErr) { setError(dbErr.message); setSaving(false); return; }
    }

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-[#1A1F2E] mb-5">
          {user ? 'Editar Usuário' : 'Novo Usuário'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-1">Nome completo</label>
            <input
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20"
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
            />
          </div>
          {!user && (
            <div>
              <label className="text-xs font-semibold text-[#64748B] block mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
          )}
          {!user && (
            <div>
              <label className="text-xs font-semibold text-[#64748B] block mb-1">Senha inicial</label>
              <input
                type="password"
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20"
                value={form.senha}
                onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
              />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-1">Papel / Cargo</label>
            <select
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 bg-white"
              value={form.papel}
              onChange={e => setForm(f => ({ ...f, papel: e.target.value }))}
            >
              {Object.values(UserRole).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-[#E2E8F0] rounded-lg py-2 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#0F4C81] text-white rounded-lg py-2 text-sm font-semibold hover:bg-[#0d3f6e] disabled:opacity-60"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Reset de Senha ─────────────────────────────────────────────────────

function ResetPasswordModal({ user, onClose }: { user: SysUser; onClose: () => void }) {
  const [senha, setSenha] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    if (senha.length < 6) { setError('Mínimo 6 caracteres.'); return; }
    setSaving(true);
    const { error: err } = await supabase.auth.admin.updateUserById(user.auth_id, { password: senha });
    if (err) { setError(err.message); setSaving(false); return; }
    setDone(true);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-lg font-bold text-[#1A1F2E] mb-1">Resetar Senha</h3>
        <p className="text-xs text-[#64748B] mb-5">{user.email}</p>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 className="w-10 h-10 text-[#00C896]" />
            <p className="text-sm font-semibold text-[#1A1F2E]">Senha alterada com sucesso!</p>
            <button onClick={onClose} className="mt-2 px-5 py-2 bg-[#0F4C81] text-white text-sm rounded-lg font-semibold">Fechar</button>
          </div>
        ) : (
          <>
            <input
              type="password"
              placeholder="Nova senha"
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 mb-3"
              value={senha}
              onChange={e => setSenha(e.target.value)}
            />
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 border border-[#E2E8F0] rounded-lg py-2 text-sm text-[#64748B] hover:bg-[#F8FAFC]">Cancelar</button>
              <button onClick={handleReset} disabled={saving} className="flex-1 bg-[#0F4C81] text-white rounded-lg py-2 text-sm font-semibold hover:bg-[#0d3f6e] disabled:opacity-60">
                {saving ? '…' : 'Resetar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Dashboard ────────────────────────────────────────────────────────────

function TabDashboard() {
  const [stats, setStats] = useState({ users: 0, tenants: 0, admins: 0, bloqueados: 0 });

  useEffect(() => {
    (async () => {
      const { count: users }    = await supabase.from('AgendaBot_User').select('*', { count: 'exact', head: true });
      const { count: tenants }  = await supabase.from('AgendaBot_Tenant').select('*', { count: 'exact', head: true });
      const { count: admins }   = await supabase.from('AgendaBot_User').select('*', { count: 'exact', head: true }).eq('papel', 'Admin');
      const { count: bloqueados } = await supabase.from('AgendaBot_User').select('*', { count: 'exact', head: true }).eq('bloqueado', true);
      setStats({ users: users ?? 0, tenants: tenants ?? 0, admins: admins ?? 0, bloqueados: bloqueados ?? 0 });
    })();
  }, []);

  const kpis = [
    { label: 'Usuários Totais',    value: stats.users,     icon: Users,     color: '#0F4C81' },
    { label: 'Tenants Ativos',     value: stats.tenants,   icon: Server,    color: '#00C896' },
    { label: 'Administradores',    value: stats.admins,    icon: Shield,    color: '#8B5CF6' },
    { label: 'Usuários Bloqueados',value: stats.bloqueados,icon: UserX,     color: '#FF6B35' },
  ];

  const systemStatus = [
    { label: 'API Supabase',     ok: true },
    { label: 'Auth Service',     ok: true },
    { label: 'Storage',          ok: true },
    { label: 'Realtime',         ok: true },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#64748B]">{k.label}</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${k.color}15` }}>
                  <Icon className="w-4.5 h-4.5" style={{ color: k.color }} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-[#1A1F2E]">{k.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status do Sistema */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
          <h4 className="text-sm font-bold text-[#1A1F2E] mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0F4C81]" />
            Status do Sistema
          </h4>
          <div className="space-y-3">
            {systemStatus.map(s => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0">
                <StatusDot ok={s.ok} label={s.label} />
                <span className={`text-xs font-semibold ${s.ok ? 'text-[#00C896]' : 'text-red-500'}`}>
                  {s.ok ? 'Operacional' : 'Falha'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Infos do Servidor */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
          <h4 className="text-sm font-bold text-[#1A1F2E] mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-[#0F4C81]" />
            Informações do Servidor
          </h4>
          <div className="space-y-3 text-xs">
            {[
              { label: 'Plataforma',  value: 'Supabase Self-hosted' },
              { label: 'Banco',       value: 'PostgreSQL 15' },
              { label: 'Framework',   value: 'React 19 + Vite' },
              { label: 'Versão App',  value: 'v1.2.0' },
              { label: 'Ambiente',    value: 'Produção' },
            ].map(item => (
              <div key={item.label} className="flex justify-between border-b border-[#F1F5F9] pb-2 last:border-0 last:pb-0">
                <span className="text-[#64748B] font-medium">{item.label}</span>
                <span className="font-semibold text-[#1A1F2E]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Usuários ─────────────────────────────────────────────────────────────

function TabUsuarios() {
  const [users, setUsers]         = useState<SysUser[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState<'create' | 'edit' | 'reset' | null>(null);
  const [selected, setSelected]   = useState<SysUser | null>(null);
  const [filterRole, setFilterRole] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('AgendaBot_User')
      .select('*, AgendaBot_Tenant(nome)')
      .order('created_at', { ascending: false });
    setUsers((data ?? []).map((u: any) => ({ ...u, tenant_nome: u.AgendaBot_Tenant?.nome })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleToggleBloqueio = async (u: SysUser) => {
    await supabase.from('AgendaBot_User').update({ bloqueado: !u.bloqueado }).eq('id', u.id);
    if (u.auth_id) {
      await supabase.auth.admin.updateUserById(u.auth_id, { ban_duration: u.bloqueado ? 'none' : '876600h' });
    }
    load();
  };

  const handleDelete = async (u: SysUser) => {
    if (!confirm(`Excluir permanentemente ${u.nome}?`)) return;
    await supabase.from('AgendaBot_User').delete().eq('id', u.id);
    if (u.auth_id) await supabase.auth.admin.deleteUser(u.auth_id);
    load();
  };

  const filtered = users.filter(u => {
    const matchSearch = u.nome.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = filterRole ? u.papel === filterRole : true;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20"
            placeholder="Buscar por nome ou email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20"
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
        >
          <option value="">Todos os cargos</option>
          {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button
          onClick={() => { setSelected(null); setModal('create'); }}
          className="flex items-center gap-2 bg-[#0F4C81] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0d3f6e] shrink-0"
        >
          <Plus className="w-4 h-4" /> Novo Usuário
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#64748B] text-sm">Carregando…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-[#64748B]">
            <Users className="w-8 h-8 opacity-30" />
            <p className="text-sm">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#64748B] uppercase tracking-wider">Usuário</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#64748B] uppercase tracking-wider hidden md:table-cell">Cargo</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#64748B] uppercase tracking-wider hidden lg:table-cell">Tenant</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#64748B] uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#64748B] uppercase tracking-wider hidden lg:table-cell">Criado em</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-semibold text-[#1A1F2E]">{u.nome}</p>
                        <p className="text-xs text-[#64748B]">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell"><RoleBadge papel={u.papel} /></td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-[#64748B]">{u.tenant_nome ?? '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {u.bloqueado ? (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          <XCircle className="w-3 h-3" /> Bloqueado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-[#00C896] font-semibold bg-[#00C896]/10 px-2 py-0.5 rounded-full border border-[#00C896]/20">
                          <CheckCircle2 className="w-3 h-3" /> Ativo
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-[#64748B]">
                        {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => { setSelected(u); setModal('edit'); }}
                          title="Editar"
                          className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F4C81]"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelected(u); setModal('reset'); }}
                          title="Resetar senha"
                          className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-amber-600"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleBloqueio(u)}
                          title={u.bloqueado ? 'Desbloquear' : 'Bloquear'}
                          className={`p-1.5 rounded-lg hover:bg-[#F1F5F9] ${u.bloqueado ? 'text-[#00C896]' : 'text-amber-500 hover:text-amber-600'}`}
                        >
                          {u.bloqueado ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                        {u.papel !== UserRole.SUPER_ADMIN && (
                          <button
                            onClick={() => handleDelete(u)}
                            title="Excluir"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[#64748B] hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modais */}
      {(modal === 'create' || modal === 'edit') && (
        <UserModal user={modal === 'edit' ? selected : null} onClose={() => setModal(null)} onSaved={load} />
      )}
      {modal === 'reset' && selected && (
        <ResetPasswordModal user={selected} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

// ─── Tab: Permissões ───────────────────────────────────────────────────────────

function TabPermissoes() {
  const roles = [
    {
      role: UserRole.SUPER_ADMIN,
      descricao: 'Acesso irrestrito. Pode gerenciar toda a plataforma, tenants, usuários e configurações.',
      permissoes: ['Tudo sem restrição'],
      cor: 'purple',
    },
    {
      role: UserRole.ADMIN,
      descricao: 'Gestão completa do tenant: equipe, agenda, financeiro, chatbot, relatórios.',
      permissoes: ['Painel', 'Agenda', 'Clientes', 'Profissionais', 'Serviços', 'Financeiro', 'Chatbot', 'Fidelidade', 'Relatórios', 'Configurações'],
      cor: 'blue',
    },
    {
      role: UserRole.GERENTE,
      descricao: 'Gerenciamento operacional. Sem acesso a chatbot e configurações avançadas.',
      permissoes: ['Painel', 'Agenda', 'Clientes', 'Profissionais', 'Serviços', 'Financeiro', 'Fidelidade', 'Relatórios'],
      cor: 'teal',
    },
    {
      role: UserRole.PROFISSIONAL,
      descricao: 'Acesso apenas à agenda pessoal e atendimentos do dia.',
      permissoes: ['Agenda do Dia'],
      cor: 'green',
    },
    {
      role: UserRole.RECEPCIONISTA,
      descricao: 'Gerenciamento de clientes, agendamentos e serviços.',
      permissoes: ['Agenda', 'Clientes', 'Serviços'],
      cor: 'amber',
    },
  ];

  const colorMap: Record<string, string> = {
    purple: 'border-purple-200 bg-purple-50',
    blue:   'border-blue-200 bg-blue-50',
    teal:   'border-teal-200 bg-teal-50',
    green:  'border-green-200 bg-green-50',
    amber:  'border-amber-200 bg-amber-50',
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-amber-800">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        Os cargos são hierárquicos. Alterações de permissões requerem deploy de nova versão do sistema.
      </div>

      <div className="grid gap-4">
        {roles.map(r => (
          <div key={r.role} className={`rounded-2xl border p-5 ${colorMap[r.cor]}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <RoleBadge papel={r.role} />
                  {r.role === UserRole.SUPER_ADMIN && <Crown className="w-4 h-4 text-purple-600" />}
                </div>
                <p className="text-xs text-[#64748B] mt-2">{r.descricao}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {r.permissoes.map(p => (
                    <span key={p} className="text-xs bg-white/70 border border-white/50 px-2 py-0.5 rounded-full text-[#1A1F2E] font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Logs & Auditoria ─────────────────────────────────────────────────────

function TabLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('AgendaBot_AuditLog')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setLogs(data ?? []);
      setLoading(false);
    })();
  }, []);

  const nivelColor = (n: string) => {
    if (n === 'error')   return 'text-red-600 bg-red-50 border-red-200';
    if (n === 'warning') return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-[#0F4C81] bg-blue-50 border-blue-200';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-[#64748B]">Últimas 100 entradas de auditoria</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 text-xs text-[#0F4C81] hover:underline font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Atualizar
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#64748B] text-sm">Carregando logs…</div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-[#64748B]">
            <Activity className="w-8 h-8 opacity-30" />
            <p className="text-sm">Nenhum log registrado ainda</p>
            <p className="text-xs opacity-70">Os logs aparecerão aqui conforme o sistema for utilizado</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {logs.map(log => (
              <div key={log.id} className="px-5 py-3.5 flex items-start gap-4 hover:bg-[#F8FAFC]">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 mt-0.5 ${nivelColor(log.nivel)}`}>
                  {log.nivel}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1F2E] truncate">{log.acao}</p>
                  <p className="text-xs text-[#64748B] truncate">{log.detalhe}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-[#64748B] font-medium">{log.usuario}</p>
                  <p className="text-[10px] text-[#94A3B8]">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Banco de Dados ───────────────────────────────────────────────────────

function TabBanco() {
  const [exportando, setExportando] = useState(false);
  const [msg, setMsg] = useState('');

  const handleExport = async () => {
    setExportando(true);
    setMsg('');
    try {
      const tables = ['AgendaBot_Tenant', 'AgendaBot_User', 'AgendaBot_Service', 'AgendaBot_Booking', 'AgendaBot_Client'];
      const backup: Record<string, any[]> = {};
      for (const t of tables) {
        const { data } = await supabase.from(t).select('*');
        backup[t] = data ?? [];
      }
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `agendabot-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Backup exportado com sucesso!');
    } catch {
      setMsg('Erro ao exportar backup.');
    }
    setExportando(false);
  };

  const tabelas = [
    { nome: 'AgendaBot_Tenant',     descricao: 'Estabelecimentos / tenants' },
    { nome: 'AgendaBot_User',       descricao: 'Usuários do sistema' },
    { nome: 'AgendaBot_Service',    descricao: 'Serviços oferecidos' },
    { nome: 'AgendaBot_Booking',    descricao: 'Agendamentos' },
    { nome: 'AgendaBot_Client',     descricao: 'Clientes dos tenants' },
    { nome: 'AgendaBot_AuditLog',   descricao: 'Logs de auditoria' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Backup */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
          <h4 className="text-sm font-bold text-[#1A1F2E] mb-1 flex items-center gap-2">
            <Download className="w-4 h-4 text-[#0F4C81]" /> Exportar Backup
          </h4>
          <p className="text-xs text-[#64748B] mb-4">Baixa todos os dados principais em JSON.</p>
          <button
            onClick={handleExport}
            disabled={exportando}
            className="w-full bg-[#0F4C81] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#0d3f6e] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {exportando ? 'Exportando…' : 'Baixar Backup JSON'}
          </button>
          {msg && <p className="text-xs text-[#00C896] font-semibold mt-3 text-center">{msg}</p>}
        </div>

        {/* Restauração */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
          <h4 className="text-sm font-bold text-[#1A1F2E] mb-1 flex items-center gap-2">
            <Upload className="w-4 h-4 text-amber-500" /> Restaurar Backup
          </h4>
          <p className="text-xs text-[#64748B] mb-4">Restauração via SQL Editor no Supabase Dashboard.</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" />
            Para restaurar, acesse o <strong>Supabase SQL Editor</strong> e execute o script de restauração gerado pelo backup.
          </div>
        </div>
      </div>

      {/* Tabelas do sistema */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
        <h4 className="text-sm font-bold text-[#1A1F2E] mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#0F4C81]" /> Tabelas do Sistema
        </h4>
        <div className="space-y-2">
          {tabelas.map(t => (
            <div key={t.nome} className="flex items-center justify-between py-2.5 px-3 rounded-xl border border-[#F1F5F9] hover:bg-[#F8FAFC]">
              <div>
                <p className="text-xs font-bold text-[#1A1F2E] font-mono">{t.nome}</p>
                <p className="text-[11px] text-[#64748B]">{t.descricao}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-[#00C896]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Configurações Globais ────────────────────────────────────────────────

function TabConfiguracoes() {
  const [form, setForm] = useState({
    nomeApp: 'AgendaBot',
    suporte: 'suporte@agendabot.com.br',
    maxTenants: '100',
    maxUsersPerTenant: '50',
    modoManutencao: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await supabase.from('AgendaBot_SystemConfig').upsert({
      chave: 'global',
      valor: form,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-5">
        <h4 className="text-sm font-bold text-[#1A1F2E] flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-[#0F4C81]" /> Configurações Globais da Plataforma
        </h4>

        {[
          { label: 'Nome da Aplicação', key: 'nomeApp' },
          { label: 'Email de Suporte', key: 'suporte' },
          { label: 'Máx. Tenants', key: 'maxTenants' },
          { label: 'Máx. Usuários por Tenant', key: 'maxUsersPerTenant' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs font-semibold text-[#64748B] block mb-1">{f.label}</label>
            <input
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20"
              value={(form as any)[f.key]}
              onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
            />
          </div>
        ))}

        <div className="flex items-center justify-between py-3 border-t border-[#F1F5F9]">
          <div>
            <p className="text-sm font-semibold text-[#1A1F2E]">Modo Manutenção</p>
            <p className="text-xs text-[#64748B]">Bloqueia acesso de todos exceto Super Admin</p>
          </div>
          <button
            onClick={() => setForm(f => ({ ...f, modoManutencao: !f.modoManutencao }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.modoManutencao ? 'bg-[#FF6B35]' : 'bg-[#E2E8F0]'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.modoManutencao ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-[#0F4C81] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#0d3f6e] flex items-center justify-center gap-2"
        >
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Salvo!</> : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
}

// ─── Página Principal ──────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard',    label: 'Dashboard',      icon: BarChart3   },
  { id: 'usuarios',     label: 'Usuários',        icon: Users       },
  { id: 'permissoes',   label: 'Permissões',      icon: Shield      },
  { id: 'logs',         label: 'Logs & Auditoria',icon: Activity    },
  { id: 'banco',        label: 'Banco de Dados',  icon: Database    },
  { id: 'configuracoes',label: 'Configurações',   icon: Settings2   },
];

export default function SuperAdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1F2E] leading-tight">Painel Super Admin</h1>
          <p className="text-sm text-[#64748B]">Controle total da plataforma AgendaBot</p>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full">
          <Shield className="w-3.5 h-3.5 text-purple-600" />
          <span className="text-xs font-bold text-purple-700">Acesso Irrestrito</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 bg-[#F1F5F9] p-1 rounded-xl scrollbar-hide">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-white text-[#0F4C81] shadow-sm'
                  : 'text-[#64748B] hover:text-[#1A1F2E]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      {tab === 'dashboard'    && <TabDashboard />}
      {tab === 'usuarios'     && <TabUsuarios />}
      {tab === 'permissoes'   && <TabPermissoes />}
      {tab === 'logs'         && <TabLogs />}
      {tab === 'banco'        && <TabBanco />}
      {tab === 'configuracoes'&& <TabConfiguracoes />}
    </div>
  );
}
