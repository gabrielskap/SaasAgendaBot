/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
  GERENTE = 'Gerente',
  PROFISSIONAL = 'Profissional',
  RECEPCIONISTA = 'Recepcionista',
}

export interface User {
  id: string;
  nome: string;
  email: string;
  papel: UserRole;
  avatar: string;
}

export interface Tenant {
  id: string;
  nome: string;
  logo: string;
  cnpj?: string;
  endereco: string;
  telefone: string;
  email: string;
  site?: string;
  horarioFuncionamento: {
    [key: string]: { inicio: string; fim: string; ativo: boolean };
  };
}

export enum BookingStatus {
  PENDENTE = 'Pendente',
  CONFIRMADO = 'Confirmado',
  EM_ANDAMENTO = 'Em andamento',
  CONCLUIDO = 'Concluído',
  CANCELADO = 'Cancelado'
}

export interface Agendamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail: string;
  servicoId: string;
  servicoNome: string;
  profissionalId: string;
  profissionalNome: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM
  status: BookingStatus;
  valor: number;
  observacoes?: string;
  notificarWhats: boolean;
  cobrarSinal: boolean;
  sinalValor?: number;
  historico?: { dataHora: string; acao: string; usuario: string }[];
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  totalVisitas: number;
  ultimoAgendamento: string;
  valorTotalGasto: number;
  status: 'Ativo' | 'Inativo';
  vip: boolean;
  observacoes?: string;
  dataCadastro: string;
  servicosFavoritos: { nome: string; quantidade: number }[];
  profissionalPreferido: string;
}

export interface Profissional {
  id: string;
  nome: string;
  avatar: string;
  especialidades: string[];
  status: 'Ativo' | 'Férias' | 'Inativo';
  atendimentosMes: number;
  faturamento: number;
  avaliacao: number;
  comissaoPercentual: number;
  horarios?: { dia: string; inicio: string; fim: string; ativo: boolean }[];
}

export interface Servico {
  id: string;
  nome: string;
  categoria: string;
  duracao: string; // e.g., "30min", "1h"
  preco: number;
  profissionaisIds: string[];
  status: 'Ativo' | 'Inativo';
  descricao?: string;
  imagem?: string;
}

export interface ConversaChat {
  id: string;
  clienteNome: string;
  clienteTelefone: string;
  mensagens: { remetente: 'bot' | 'cliente' | 'humano'; texto: string; timestamp: string }[];
  status: 'bot' | 'humano';
  ultimaMensagem: string;
  ultimoTimestamp: string;
}

export interface CampanhaReengajamento {
  id: string;
  nome: string;
  publicoAlvo: string;
  mensagem: string;
  dataAgendada: string;
  tipo: 'Única' | 'Recorrente';
  status: 'Ativa' | 'Agendada' | 'Concluída';
  metricas: { enviadas: number; responderam: number; converteram: number };
}
