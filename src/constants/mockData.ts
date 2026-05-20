/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Cliente, Profissional, Servico, Agendamento, BookingStatus, ConversaChat, CampanhaReengajamento } from '../types';

export const MOCK_SERVICES: Servico[] = [
  {
    id: 's-1',
    nome: 'Corte de Cabelo Premium',
    categoria: 'Cabelo',
    duracao: '30min',
    preco: 60.00,
    profissionaisIds: ['p-1', 'p-2', 'p-4'],
    status: 'Ativo',
    descricao: 'Corte moderno personalizado com lavagem inclusa, toalha quente e massagem capilar.',
    imagem: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 's-2',
    nome: 'Barba de Respeito',
    categoria: 'Barba',
    duracao: '30min',
    preco: 45.00,
    profissionaisIds: ['p-1', 'p-2'],
    status: 'Ativo',
    descricao: 'Alinhamento com navalha, esfoliação facial, vapor de ozônio, balm perfumado e finalização impecável.',
    imagem: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 's-3',
    nome: 'Combo Cabelo e Barba',
    categoria: 'Combos',
    duracao: '60min',
    preco: 95.00,
    profissionaisIds: ['p-1', 'p-2', 'p-4'],
    status: 'Ativo',
    descricao: 'O pacote completo dos campeões: Corte de cabelo premium + Barba completa, economizando R$ 10.',
  },
  {
    id: 's-4',
    nome: 'Limpeza de Pele Profunda',
    categoria: 'Estética',
    duracao: '60min',
    preco: 120.00,
    profissionaisIds: ['p-3'],
    status: 'Ativo',
    descricao: 'Extração de cravos manual, hidratação profunda, peeling ultrassônico e fototerapia led.',
    imagem: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 's-5',
    nome: 'Design de Sobrancelha',
    categoria: 'Estética',
    duracao: '30min',
    preco: 30.00,
    profissionaisIds: ['p-1', 'p-3'],
    status: 'Ativo',
    descricao: 'Marcação simétrica com paquímetro e pinçamento de precisão para harmonizar o olhar.',
  },
  {
    id: 's-6',
    nome: 'Selagem Térmica Capilar',
    categoria: 'Cabelo',
    duracao: '120min',
    preco: 180.00,
    profissionaisIds: ['p-2', 'p-4'],
    status: 'Ativo',
    descricao: 'Alinhamento dos fios rebeldes, redução drástica de frizz e nutrição profunda com aminoácidos.',
  }
];

export const MOCK_PROFESSIONALS: Profissional[] = [
  {
    id: 'p-1',
    nome: 'Marcos Navalha',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    especialidades: ['Corte Masculino', 'Degradê', 'Barba Tradicional'],
    status: 'Ativo',
    atendimentosMes: 142,
    faturamento: 8520.00,
    avaliacao: 4.9,
    comissaoPercentual: 40,
  },
  {
    id: 'p-2',
    nome: 'Rodrigo Barber (Fuba)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    especialidades: ['Combos', 'Química Capilar', 'Corte Premium'],
    status: 'Ativo',
    atendimentosMes: 118,
    faturamento: 7120.00,
    avaliacao: 4.8,
    comissaoPercentual: 35,
  },
  {
    id: 'p-3',
    nome: 'Dra. Beatriz Santos',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    especialidades: ['Limpeza de Pele', 'Peeling', 'Estética Avançada'],
    status: 'Ativo',
    atendimentosMes: 89,
    faturamento: 10680.00,
    avaliacao: 5.0,
    comissaoPercentual: 50,
  },
  {
    id: 'p-4',
    nome: 'Julio Cortês',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    especialidades: ['Corte Tesoura', 'Cabelo Longo', 'Penteados'],
    status: 'Férias',
    atendimentosMes: 0,
    faturamento: 0,
    avaliacao: 4.7,
    comissaoPercentual: 40,
  }
];

export const MOCK_CLIENTS: Cliente[] = [
  {
    id: 'c-1',
    nome: 'Carlos Eduardo Nogueira',
    telefone: '(11) 98122-3456',
    email: 'cadu.nogueira@hotmail.com',
    totalVisitas: 14,
    ultimoAgendamento: '2026-05-18',
    valorTotalGasto: 890.00,
    status: 'Ativo',
    vip: true,
    observacoes: 'Alergia a loções pós-barba mentoladas. Prefere pomada matte seca.',
    dataCadastro: '2025-01-10',
    servicosFavoritos: [
      { nome: 'Corte de Cabelo Premium', quantidade: 8 },
      { nome: 'Barba de Respeito', quantidade: 6 },
    ],
    profissionalPreferido: 'Marcos Navalha',
  },
  {
    id: 'c-2',
    nome: 'Mariana Fontes Lima',
    telefone: '(11) 99123-8844',
    email: 'mari.fontes@outlook.com',
    totalVisitas: 8,
    ultimoAgendamento: '2026-05-20',
    valorTotalGasto: 960.00,
    status: 'Ativo',
    vip: true,
    observacoes: 'Pele extremamente sensível. Somente vapor frio para limpeza.',
    dataCadastro: '2025-02-15',
    servicosFavoritos: [
      { nome: 'Limpeza de Pele Profunda', quantidade: 6 },
      { nome: 'Design de Sobrancelha', quantidade: 2 },
    ],
    profissionalPreferido: 'Dra. Beatriz Santos',
  },
  {
    id: 'c-3',
    nome: 'Roberto Firmino Costa',
    telefone: '(11) 97411-9002',
    email: 'robertofc@gmail.com',
    totalVisitas: 1,
    ultimoAgendamento: '2026-02-10',
    valorTotalGasto: 60.00,
    status: 'Inativo', // > 60 dias sem agendar
    vip: false,
    observacoes: 'Trabalha viajando, agendamentos de última hora.',
    dataCadastro: '2026-02-09',
    servicosFavoritos: [
      { nome: 'Corte de Cabelo Premium', quantidade: 1 }
    ],
    profissionalPreferido: 'Julio Cortês',
  },
  {
    id: 'c-4',
    nome: 'Gustavo Henrique Dias',
    telefone: '(11) 98822-4411',
    email: 'gustavo.henrique@gmail.com',
    totalVisitas: 12,
    ultimoAgendamento: '2026-05-19',
    valorTotalGasto: 1140.00,
    status: 'Ativo',
    vip: true,
    observacoes: 'Prefere corte totalmente na tesoura (sem máquina).',
    dataCadastro: '2025-01-05',
    servicosFavoritos: [
      { nome: 'Combo Cabelo e Barba', quantidade: 12 }
    ],
    profissionalPreferido: 'Rodrigo Barber (Fuba)',
  },
  {
    id: 'c-5',
    nome: 'Lucas Albuquerque Prado',
    telefone: '(11) 97500-2211',
    email: 'lucas.prado@gmail.com',
    totalVisitas: 3,
    ultimoAgendamento: '2026-05-15',
    valorTotalGasto: 165.00,
    status: 'Ativo',
    vip: false,
    observacoes: 'Dá preferência por atendimentos no final da tarde.',
    dataCadastro: '2026-03-20',
    servicosFavoritos: [
      { nome: 'Corte de Cabelo Premium', quantidade: 2 },
      { nome: 'Barba de Respeito', quantidade: 1 },
    ],
    profissionalPreferido: 'Rodrigo Barber (Fuba)',
  }
];

export const MOCK_BOOKINGS: Agendamento[] = [
  {
    id: 'b-1',
    clienteId: 'c-1',
    clienteNome: 'Carlos Eduardo Nogueira',
    clienteTelefone: '(11) 98122-3456',
    clienteEmail: 'cadu.nogueira@hotmail.com',
    servicoId: 's-3',
    servicoNome: 'Combo Cabelo e Barba',
    profissionalId: 'p-1',
    profissionalNome: 'Marcos Navalha',
    data: '2026-05-20',
    horario: '10:00',
    status: BookingStatus.CONCLUIDO,
    valor: 95.00,
    observacoes: 'Agendou pelo bot',
    notificarWhats: true,
    cobrarSinal: false,
    historico: [
      { dataHora: '2026-05-19 14:10', acao: 'Agendamento Inicial via WhatsApp', usuario: 'AgendaBot (IA)' },
      { dataHora: '2026-05-20 10:00', acao: 'Status alterado para Em Atendimento', usuario: 'Marcos Navalha' },
      { dataHora: '2026-05-20 11:00', acao: 'Atendimento concluído e pago', usuario: 'Marcos Navalha' },
    ]
  },
  {
    id: 'b-2',
    clienteId: 'c-2',
    clienteNome: 'Mariana Fontes Lima',
    clienteTelefone: '(11) 99123-8844',
    clienteEmail: 'mari.fontes@outlook.com',
    servicoId: 's-4',
    servicoNome: 'Limpeza de Pele Profunda',
    profissionalId: 'p-3',
    profissionalNome: 'Dra. Beatriz Santos',
    data: '2026-05-20',
    horario: '15:30',
    status: BookingStatus.EM_ANDAMENTO,
    valor: 120.00,
    observacoes: 'Cliente extremamente sensível.',
    notificarWhats: true,
    cobrarSinal: true,
    sinalValor: 30.00,
    historico: [
      { dataHora: '2026-05-18 09:12', acao: 'Agendamento Criado no Painel', usuario: 'Ana Souza' },
      { dataHora: '2026-05-18 09:15', acao: 'Sinal de R$ 30,00 recebido via PIX', usuario: 'Gabriel Gustavo' },
      { dataHora: '2026-05-20 15:30', acao: 'Iniciou o atendimento', usuario: 'Dra. Beatriz Santos' },
    ]
  },
  {
    id: 'b-3',
    clienteId: 'c-4',
    clienteNome: 'Gustavo Henrique Dias',
    clienteTelefone: '(11) 98822-4411',
    clienteEmail: 'gustavo.henrique@gmail.com',
    servicoId: 's-3',
    servicoNome: 'Combo Cabelo e Barba',
    profissionalId: 'p-2',
    profissionalNome: 'Rodrigo Barber (Fuba)',
    data: '2026-05-20',
    horario: '17:00',
    status: BookingStatus.CONFIRMADO,
    valor: 95.00,
    notificarWhats: true,
    cobrarSinal: false,
    historico: [
      { dataHora: '2026-05-19 12:40', acao: 'Criado via WhatsApp (IA)', usuario: 'AgendaBot (IA)' },
      { dataHora: '2026-05-19 18:00', acao: 'Auto-confirmação enviada e confirmada via clique', usuario: 'AgendaBot (IA)' },
    ]
  },
  {
    id: 'b-4',
    clienteId: 'c-5',
    clienteNome: 'Lucas Albuquerque Prado',
    clienteTelefone: '(11) 97500-2211',
    clienteEmail: 'lucas.prado@gmail.com',
    servicoId: 's-1',
    servicoNome: 'Corte de Cabelo Premium',
    profissionalId: 'p-1',
    profissionalNome: 'Marcos Navalha',
    data: '2026-05-20',
    horario: '19:30',
    status: BookingStatus.PENDENTE,
    valor: 60.00,
    notificarWhats: true,
    cobrarSinal: false,
    historico: [
      { dataHora: '2026-05-20 11:22', acao: 'Pré-reserva via Link Web', usuario: 'Sistema Online' }
    ]
  },
  {
    id: 'b-5',
    clienteId: 'c-1',
    clienteNome: 'Carlos Eduardo Nogueira',
    clienteTelefone: '(11) 98122-3456',
    clienteEmail: 'cadu.nogueira@hotmail.com',
    servicoId: 's-2',
    servicoNome: 'Barba de Respeito',
    profissionalId: 'p-2',
    profissionalNome: 'Rodrigo Barber (Fuba)',
    data: '2026-05-21',
    horario: '09:00',
    status: BookingStatus.CONFIRMADO,
    valor: 45.00,
    notificarWhats: true,
    cobrarSinal: false,
    historico: [
      { dataHora: '2026-05-20 14:00', acao: 'Agendado via central WhatsApp', usuario: 'Ana Souza' }
    ]
  },
  {
    id: 'b-6',
    clienteId: 'c-3',
    clienteNome: 'Roberto Firmino Costa',
    clienteTelefone: '(11) 97411-9002',
    clienteEmail: 'robertofc@gmail.com',
    servicoId: 's-1',
    servicoNome: 'Corte de Cabelo Premium',
    profissionalId: 'p-1',
    profissionalNome: 'Marcos Navalha',
    data: '2026-05-20',
    horario: '13:00',
    status: BookingStatus.CANCELADO,
    valor: 60.00,
    observacoes: 'Desistiu por compromisso de trabalho.',
    notificarWhats: true,
    cobrarSinal: false,
    historico: [
      { dataHora: '2026-05-20 08:30', acao: 'Cliente mandou "Cancelar" via WhatsApp', usuario: 'AgendaBot (IA)' },
      { dataHora: '2026-05-20 08:31', acao: 'Status de agendamento alterado para Cancelado', usuario: 'AgendaBot (IA)' },
    ]
  },
  {
    id: 'b-7',
    clienteId: 'c-2',
    clienteNome: 'Mariana Fontes Lima',
    clienteTelefone: '(11) 99123-8844',
    clienteEmail: 'mari.fontes@outlook.com',
    servicoId: 's-5',
    servicoNome: 'Design de Sobrancelha',
    profissionalId: 'p-3',
    profissionalNome: 'Dra. Beatriz Santos',
    data: '2026-05-21',
    horario: '14:00',
    status: BookingStatus.CONFIRMADO,
    valor: 30.00,
    notificarWhats: true,
    cobrarSinal: false,
  }
];

export const MOCK_CHATS: ConversaChat[] = [
  {
    id: 'ch-1',
    clienteNome: 'Roberto Firmino Costa',
    clienteTelefone: '(11) 97411-9002',
    status: 'bot',
    ultimaMensagem: 'Ok, cancelamento confirmado com sucesso.',
    ultimoTimestamp: '15:10',
    mensagens: [
      { remetente: 'cliente', texto: 'Boa tarde! Preciso cancelar meu corte de cabelo hoje de 13:00', timestamp: '15:08' },
      { remetente: 'bot', texto: 'Olá Roberto! Entendi, posso cancelar sim. Só um minuto por favor...', timestamp: '15:08' },
      { remetente: 'bot', texto: 'Localizei seu agendamento às 13:00 com Marcos Navalha. Deseja realmente efetuar o cancelamento gratuito?', timestamp: '15:09' },
      { remetente: 'cliente', texto: 'Sim, por favor', timestamp: '15:09' },
      { remetente: 'bot', texto: 'Ok, cancelamento confirmado com sucesso. Você gostaria de verificar novos horários para outro dia?', timestamp: '15:10' },
    ]
  },
  {
    id: 'ch-2',
    clienteNome: 'Amanda Rebeca Silva',
    clienteTelefone: '(11) 98222-1111',
    status: 'humano',
    ultimaMensagem: 'Olá! Beatriz faz preenchimento labial?',
    ultimoTimestamp: '14:45',
    mensagens: [
      { remetente: 'cliente', texto: 'Quais os valores de pacotes de estética de vocês?', timestamp: '14:40' },
      { remetente: 'bot', texto: 'Olá! Digite a opção correspondente:\n1. Nossos Serviços\n2. Agendar Horário\n3. Localização\n4. Falar com Atendente', timestamp: '14:40' },
      { remetente: 'cliente', texto: 'Quero falar com atendente por favor', timestamp: '14:42' },
      { remetente: 'bot', texto: 'Transferindo para nossa recepção agora! Aguarde um instante que já vão te atender por aqui.', timestamp: '14:42' },
      { remetente: 'cliente', texto: 'Olá! Beatriz faz preenchimento labial?', timestamp: '14:45' }
    ]
  },
  {
    id: 'ch-3',
    clienteNome: 'João Pedro Mendes',
    clienteTelefone: '(11) 97100-3022',
    status: 'bot',
    ultimaMensagem: 'Seu agendamento foi confirmado para amanhã, 21/05 às 16:30.',
    ultimoTimestamp: '12:35',
    mensagens: [
      { remetente: 'cliente', texto: 'Quero marcar um corte para amanhã à tarde', timestamp: '12:30' },
      { remetente: 'bot', texto: 'Perfeito! Quais destes profissionais você prefere?\n1. Marcos Navalha\n2. Rodrigo Barber\n3. Tanto faz', timestamp: '12:31' },
      { remetente: 'cliente', texto: 'Tanto faz', timestamp: '12:32' },
      { remetente: 'bot', texto: 'Os horários disponíveis para amanhã (21/05) à tarde são:\n1. 14:00\n2. 15:30\n3. 16:30\n\nQual deseja?', timestamp: '12:33' },
      { remetente: 'cliente', texto: 'Opção 3, 16:30', timestamp: '12:34' },
      { remetente: 'bot', texto: 'Excelente escolha! Para qual WhatsApp posso enviar o lembrete? É este mesmo que você está falando?', timestamp: '12:34' },
      { remetente: 'cliente', texto: 'Sim este mesmo', timestamp: '12:35' },
      { remetente: 'bot', texto: 'Perfeito, João! Seu agendamento foi confirmado para amanhã, 21/05 às 16:30 com nosso profissional Marcos Navalha. Te aguardamos!', timestamp: '12:35' },
    ]
  }
];

export const MOCK_FINANCIAL_TRANSACTIONS = [
  { id: 't-1', hora: '10:00', cliente: 'Carlos Eduardo Nogueira', tipo: 'Entrada', servico: 'Combo Cabelo e Barba', profissional: 'Marcos Navalha', formaPagamento: 'PIX', valor: 95.00 },
  { id: 't-2', hora: '11:15', cliente: 'Avulso (Detergente)', tipo: 'Saída', servico: 'Compra materiais de limpeza', profissional: '-', formaPagamento: 'Dinheiro', valor: 25.00 },
  { id: 't-3', hora: '13:00', cliente: 'Lucas Albuquerque Prado', tipo: 'Entrada', servico: 'Corte de Cabelo Premium', profissional: 'Marcos Navalha', formaPagamento: 'Cartão de Crédito', valor: 60.00 },
  { id: 't-4', hora: '15:30', cliente: 'Mariana Fontes Lima', tipo: 'Entrada', servico: 'Limpeza de Pele Profunda', profissional: 'Dra. Beatriz Santos', formaPagamento: 'PIX', valor: 90.00 }, // Descontou R$ 30,00 do sinal recebido
  { id: 't-5', hora: '16:00', cliente: 'Comissão Dra. Beatriz Santos', tipo: 'Saída', servico: 'Repasse profissional Beatriz', profissional: 'Dra. Beatriz Santos', formaPagamento: 'Transferência', valor: 60.00 }, // 50% de comissão
];

export const MOCK_CAMPAIGNS: CampanhaReengajamento[] = [
  {
    id: 'camp-1',
    nome: 'Clientes Sumidos (60+ dias)',
    publicoAlvo: 'Clientes sem agendar há 60 dias ou mais',
    mensagem: 'Olá, {nome_cliente}! Que saudade de te ver na Barbearia. Use o link a seguir para agendar seu corte essa semana e ganhe 15% de desconto no Combo: {link_reagendamento}',
    dataAgendada: '2026-05-15 10:00',
    tipo: 'Recorrente',
    status: 'Ativa',
    metricas: { enviadas: 45, responderam: 12, converteram: 6 }
  },
  {
    id: 'camp-2',
    nome: 'Aniversariantes de Maio',
    publicoAlvo: 'Aniversariantes do mês de Maio',
    mensagem: 'Parabéns pelo seu dia, {nome_cliente}! 🎂 Queremos comemorar com você: agendando qualquer serviço hoje, você ganha uma cerveja artesanal trincando ou higienização especial.',
    dataAgendada: '2026-05-01 09:00',
    tipo: 'Recorrente',
    status: 'Ativa',
    metricas: { enviadas: 18, responderam: 8, converteram: 5 }
  },
  {
    id: 'camp-3',
    nome: 'Lançamento Dra. Beatriz (Aesthetics)',
    publicoAlvo: 'Clientes de estética e pele',
    mensagem: 'Olá, {nome_cliente}! A Dra. Beatriz trouxe uma nova fototerapia facial de LED. Marque uma limpeza de pele e experimente grátis esta inovação pioneira na região!',
    dataAgendada: '2026-05-22 14:00',
    tipo: 'Única',
    status: 'Agendada',
    metricas: { enviadas: 0, responderam: 0, converteram: 0 }
  }
];

export const FIDELITY_RANKING = [
  { id: 'r-1', nome: 'Carlos Eduardo Nogueira', pontos: 420, visitas: 14, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', posicao: 1 },
  { id: 'r-2', nome: 'Marcos Almeida Fonseca', pontos: 390, visitas: 13, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80', posicao: 2 },
  { id: 'r-3', nome: 'Gustavo Henrique Dias', pontos: 360, visitas: 12, avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80', posicao: 3 },
  { id: 'r-4', nome: 'Mariana Fontes Lima', pontos: 240, visitas: 8, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', posicao: 4 },
  { id: 'r-5', nome: 'Lucas Albuquerque Prado', pontos: 90, visitas: 3, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', posicao: 5 },
];

export const MOCK_FAQ = [
  { p: 'Como funciona o teste de 14 dias?', r: 'Você pode testar todas as funcionalidades do plano Pro gratuitamente sem inserir cartão de crédito.' },
  { p: 'Preciso instalar algum aplicativo no celular?', r: 'Não, o AgendaBot é uma aplicação web hospedada na nuvem. Você pode acessá-la de qualquer dispositivo via navegador.' },
  { p: 'Como funciona a integração com o WhatsApp?', r: 'Nós conectamos seu número do WhatsApp à nossa API (Evolution API) de forma rápida e segura através da leitura de um QR-Code.' },
  { p: 'O chatbot consegue responder dúvidas de clientes?', r: 'Sim, você pode configurar um menu de respostas rápidas e perguntas frequentes. Para dúvidas fora disso, ele transfere para humanos.' },
  { p: 'Como são calculadas as comissões?', r: 'As comissões são liquidadas no momento da conclusão do atendimento com base nos percentuais individuais de comissão declarados por profissional.' },
  { p: 'Posso migrar meus dados de outra plataforma?', r: 'Com certeza. Nossa equipe de suporte realiza a importação de planilhas de clientes e equipe de forma totalmente gratuita.' },
  { p: 'Há amarras ou contrato de fidelidade?', r: 'Nenhum. Nossos planos são de faturamento mensal ou anual recorrente, e você cancela na hora que quiser de forma instantânea.' },
  { p: 'O que acontece em caso de cancelamento em cima da hora?', r: 'Você pode habilitar a cobrança automática de um sinal securitário (Pix ou Cartão) no ato do agendamento para diminuir agendamentos falsos.' },
];
