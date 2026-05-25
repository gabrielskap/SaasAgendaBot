/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  MessageSquare, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Users, 
  Award, 
  ArrowRight, 
  ChevronDown, 
  ShieldCheck, 
  Zap, 
  Check, 
  TrendingUp, 
  Clock, 
  Smartphone,
  Star,
  BrainCircuit
} from 'lucide-react';
const FAQ_ITEMS = [
  { p: 'Como funciona o teste de 14 dias?', r: 'Você pode testar todas as funcionalidades do plano Pro gratuitamente sem inserir cartão de crédito.' },
  { p: 'Preciso instalar algum aplicativo no celular?', r: 'Não, o AgendaBot é uma aplicação web hospedada na nuvem. Você pode acessá-la de qualquer dispositivo via navegador.' },
  { p: 'Como funciona a integração com o WhatsApp?', r: 'Nós conectamos seu número do WhatsApp à nossa API (Evolution API) de forma rápida e segura através da leitura de um QR-Code.' },
  { p: 'O chatbot consegue responder dúvidas de clientes?', r: 'Sim, você pode configurar um menu de respostas rápidas e perguntas frequentes. Para dúvidas fora disso, ele transfere para humanos.' },
  { p: 'Como são calculadas as comissões?', r: 'As comissões são liquidadas no momento da conclusão do atendimento com base nos percentuais individuais de comissão declarados por profissional.' },
  { p: 'Posso migrar meus dados de outra plataforma?', r: 'Com certeza. Nossa equipe de suporte realiza a importação de planilhas de clientes e equipe de forma totalmente gratuita.' },
  { p: 'Há amarras ou contrato de fidelidade?', r: 'Nenhum. Nossos planos são de faturamento mensal ou anual recorrente, e você cancela na hora que quiser de forma instantânea.' },
  { p: 'O que acontece em caso de cancelamento em cima da hora?', r: 'Você pode habilitar a cobrança automática de um sinal securitário (Pix ou Cartão) no ato do agendamento para diminuir agendamentos falsos.' },
];

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: (planName?: string) => void;
}

export default function LandingPage({ onNavigateToLogin, onNavigateToRegister }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');

  const plans = [
    {
      name: 'Starter',
      priceMonthly: 97,
      priceAnnually: 77,
      description: 'Ideal para profissionais autônomos ou novos negócios.',
      features: [
        '1 Profissional cadastrado',
        'Até 100 clientes cadastrados',
        'Chatbot WhatsApp básico',
        'Agenda interativa com 3 vistas',
        'Lembretes via WhatsApp limitados',
        'Suporte via email'
      ],
      popular: false,
      color: '#0F4C81'
    },
    {
      name: 'Pro',
      priceMonthly: 197,
      priceAnnually: 157,
      description: 'Perfeito para salões, barbearias e clínicas em crescimento.',
      features: [
        'Até 5 profissionais cadastrados',
        'Clientes ilimitados',
        'Chatbot WhatsApp avançado com IA',
        'Confirmações e lembretes automáticos',
        'Envio de campanhas de reengajamento',
        'Controle financeiro de caixa e comissões',
        'Programa de fidelidade pontuação ativa',
        'Suporte prioritário via WhatsApp'
      ],
      popular: true,
      color: '#00C896'
    },
    {
      name: 'Business',
      priceMonthly: 397,
      priceAnnually: 317,
      description: 'Para estabelecimentos consolidados e redes multi-unidades.',
      features: [
        'Profissionais ilimitados',
        'Múltiplas unidades unificadas',
        'IA generativa customizável recomendativa',
        'Integração API avançada',
        'Gerente de conta exclusivo',
        'Treinamento da equipe remoto',
        'White-label completo para agendamentos',
        'Backup redundante a cada hora'
      ],
      popular: false,
      color: '#FF6B35'
    }
  ];

  const testimonials = [
    {
      name: 'Ricardo Navalha',
      role: 'Dono da Barbearia Navalha de Ouro',
      business: 'Barbearia • São Paulo',
      quote: 'Depois que ativei o AgendaBot, meu WhatsApp responde os clientes e agenda em menos de 2 minutos. Economizo um funcionário de recepção e meu faturamento subiu 28% no primeiro mês.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    {
      name: 'Dra. Beatriz Santos',
      role: 'Esteticista e Biomédica',
      business: 'Clínica Beatriz Aesthetics • Rio',
      quote: 'Meus clientes elogiam muito a facilidade de agendar de madrugada. O lembrete automático de 2 horas reduziu minhas faltas a quase zero. Sem falar na comissão dos parceiros que é calculada sozinha.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
    },
    {
      name: 'Marcos Almeida',
      role: 'Personal Trainer',
      business: 'Studio Fitness M&A • BH',
      quote: 'Eu vivia perdendo aula porque o cliente desmarcava em cima da hora. Agora cozinho o sinal financeiro no WhatsApp e tudo flui certinho. O chatbot é sensacional, vale cada centavo.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col font-sans">
      
      {/* LANDING NAVIGATION */}
      <nav id="landing-nav" className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F4C81] rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#00C896]" />
            </div>
            <div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-[#0F4C81]">AgendaBot</span>
              <span className="text-[10px] block font-mono text-[#FF6B35] tracking-widest font-bold uppercase leading-none">WhatsApp AI</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#64748B]">
            <a href="#solucoes" className="hover:text-[#0F4C81] transition-colors">Dúvidas Comuns</a>
            <a href="#funcionalidades" className="hover:text-[#0F4C81] transition-colors">Recursos</a>
            <a href="#planos" className="hover:text-[#0F4C81] transition-colors">Planos</a>
            <a href="#depoimentos" className="hover:text-[#0F4C81] transition-colors">Depoimentos</a>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onNavigateToLogin}
              className="px-4 py-2 text-sm font-bold text-[#0F4C81] hover:text-[#0F4C81]/80 transition-colors"
            >
              Fazer Login
            </button>
            <button 
              onClick={() => onNavigateToRegister('Pro')}
              className="bg-[#0F4C81] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-[#0F4C81]/90 transition-all shadow-[#0F4C81]/20 cursor-pointer"
            >
              Criar Conta Grátis
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-24 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#00C896]/10 px-3.5 py-1.5 rounded-full border border-[#00C896]/20">
              <Zap className="w-4 h-4 text-[#00C896] fill-current" />
              <span className="text-xs font-bold text-[#00c896] font-display uppercase tracking-wider">Líder em agendamento automático</span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#1A1F2E] leading-tight tracking-tight">
              Seu negócio agendando enquanto você <span className="text-[#0F4C81] underline decoration-[#00C896] decoration-4">atende</span>.
            </h1>

            <p className="text-base text-[#64748B] leading-relaxed max-w-xl">
              Deixe que nossa inteligência artificial atenda seus clientes via WhatsApp, responda dúvidas, verifique horários livres, cobre sinal financeiro e feche agendamentos sozinho, 24 horas por dia.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button 
                onClick={() => onNavigateToRegister('Pro')}
                className="w-full sm:w-auto bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-3 text-lg shadow-lg shadow-[#FF6B35]/20 cursor-pointer transition-transform hover:-translate-y-0.5"
              >
                <span>Experimentar Grátis</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={onNavigateToLogin}
                className="w-full sm:w-auto border-2 border-[#0F4C81] text-[#0F4C81] hover:bg-[#0F4C81]/5 font-bold px-7 py-3.5 rounded-xl text-md transition-colors cursor-pointer"
              >
                Acessar Demonstração
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#E2E8F0]">
              <div>
                <h4 className="font-jetbrains font-bold text-3xl text-[#0F4C81]">99%</h4>
                <p className="text-xs text-[#64748B] mt-1 font-medium">Uptime dos Bots</p>
              </div>
              <div>
                <h4 className="font-jetbrains font-bold text-3xl text-[#00C896]">10x</h4>
                <p className="text-xs text-[#64748B] mt-1 font-medium">Mais agilidade</p>
              </div>
              <div>
                <h4 className="font-jetbrains font-bold text-3xl text-[#FF6B35]">-80%</h4>
                <p className="text-xs text-[#64748B] mt-1 font-medium font-sans">No-shows (Faltas)</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            {/* HERO SIMULATED DASHBOARD MOCKUP */}
            <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-6 relative z-10 overflow-hidden transform group hover:scale-[1.01] transition-transform duration-300">
              
              {/* TOP BAR SIMULATOR */}
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="bg-[#F8FAFC] px-3 py-1 rounded-md text-xs font-mono text-[#64748B]">
                  painel.agendabot.com.br
                </div>
                <span className="w-2.5 h-2.5 bg-[#00C896] rounded-full animate-pulse"></span>
              </div>

              {/* CONTENTS */}
              <div className="space-y-4">
                
                {/* FLOATING WHATSAPP BOX */}
                <div className="bg-[#EFFFEC] border border-[#d2ffd0] rounded-xl p-4 shadow-sm relative">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1e7e34] mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Conversa (Bot Ativo)</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white p-2.5 rounded-lg text-xs shadow-xs max-w-[80%] font-medium">
                      "Olá! Gostaria de cortar o cabelo amanhã de tarde..."
                    </div>
                    <div className="bg-[#E2F7CB] p-2.5 rounded-lg text-xs shadow-xs max-w-[80%] ml-auto font-medium text-right text-[#1a5f1a]">
                      "Claro! Tenho às 15:30 com o Rodrigo Barber ou 16:30 com o Marcos. Qual prefere?"
                    </div>
                  </div>
                </div>

                {/* KPI CHIP ROW */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                    <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Agendamentos Hoje</span>
                    <h5 className="font-jetbrains text-lg font-bold text-[#0F4C81] mt-0.5">34</h5>
                  </div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                    <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Faturamento Hoje</span>
                    <h5 className="font-jetbrains text-lg font-bold text-[#00C896] mt-0.5">R$ 1.940</h5>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#0F4C81] text-white flex items-center justify-center font-bold text-xs font-display">
                      CN
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1F2E]">Carlos Eduardo</h4>
                      <span className="text-[10px] text-[#64748B] block font-mono">Agendou Combo Cabelo + Barba</span>
                    </div>
                  </div>
                  <span className="bg-[#00C896]/10 text-[#00C896] font-display font-medium text-[10px] px-2 py-0.5 rounded-full border border-[#00C896]/20">
                    Confirmado por IA
                  </span>
                </div>

              </div>
            </div>

            {/* FLOATING SPARKLE DECORATOR */}
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#00C896]/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#FF6B35]/10 rounded-full blur-2xl animate-pulse"></div>
          </div>

        </div>
      </section>

      {/* PAIN & REMEDY GRID */}
      <section id="solucoes" className="bg-white py-20 border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#FF6B35] font-display">O Problema & A Solução</h4>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#1A1F2E]">
              Sua equipe cortando cabelo ou atendendo o WhatsApp?
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Descubra por que dezenas de estabelecimentos estão migrando seus atendimentos das recepções físicas para o nosso chatbot inteligente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            
            {/* PAIN CARD */}
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-8 relative">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6 font-bold text-xl">
                ✕
              </div>
              <h3 className="font-display font-extrabold text-lg text-red-950 mb-4">Como era antes (Sem o AgendaBot)</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-xs text-red-900">
                  <span className="text-red-500 font-bold">●</span>
                  <span>Clientes esperam até 3 horas para conseguir um retorno no WhatsApp.</span>
                </li>
                <li className="flex gap-3 text-xs text-red-900">
                  <span className="text-red-500 font-bold">●</span>
                  <span>Sua equipe para um atendimento para poder falar no celular.</span>
                </li>
                <li className="flex gap-3 text-xs text-red-900">
                  <span className="text-red-500 font-bold">●</span>
                  <span>Esquecimentos de horários geram no-shows constantes sem aviso.</span>
                </li>
                <li className="flex gap-3 text-xs text-red-900">
                  <span className="text-red-500 font-bold">●</span>
                  <span>Cálculo confuso de comissões aos domingos gera atritos com a equipe.</span>
                </li>
              </ul>
            </div>

            {/* REMEDY CARD */}
            <div className="bg-[#00C896]/5 border border-[#00C896]/20 rounded-2xl p-8 relative">
              <div className="w-12 h-12 bg-[#00C896]/10 rounded-xl flex items-center justify-center text-[#00C896] mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-emerald-950 mb-4 font-display">Como fica depois (Com o AgendaBot)</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-xs text-emerald-900">
                  <Check className="w-4 h-4 text-[#00C896] shrink-0" />
                  <span>Respostas instantâneas no WhatsApp em menos de 5 segundos.</span>
                </li>
                <li className="flex gap-3 text-xs text-emerald-900">
                  <Check className="w-4 h-4 text-[#00C896] shrink-0" />
                  <span>O profissional foca 100% no cliente da cadeira enquanto a IA agenda o próximo.</span>
                </li>
                <li className="flex gap-3 text-xs text-emerald-900">
                  <Check className="w-4 h-4 text-[#00C896] shrink-0" />
                  <span>Disparo recorrente de lembretes preventivos via WhatsApp diminuem as faltas.</span>
                </li>
                <li className="flex gap-3 text-xs text-emerald-900">
                  <Check className="w-4 h-4 text-[#00C896] shrink-0" />
                  <span>Comissão calculada centavo por centavo na nuvem automaticamente.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="funcionalidades" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#0F4C81] font-display">Recursos Premium</h4>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#1A1F2E]">
              Tudo o que seu negócio precisa em um único local
            </h2>
            <p className="text-sm text-[#64748B]">
              Desenvolvemos a ferramenta definitiva que acelera seu agendamento, fideliza seus clientes e reduz sua contabilidade semanal de forma simples.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#0F4C81]/10 rounded-lg flex items-center justify-center text-[#0F4C81] mb-5">
                <BrainCircuit className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-md font-bold font-display text-[#1A1F2E] mb-2">IA Conversacional</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Integração inteligente com seu número WhatsApp que reconhece gírias, datas relativas (ex: "sábado de tarde") e sugere os melhores horários de forma espontânea.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#00C896]/10 rounded-lg flex items-center justify-center text-[#00C896] mb-5">
                <Calendar className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-md font-bold font-display text-[#1A1F2E] mb-2">Agenda Multivistas</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Gerencie sua equipe inteira através de painéis diários, semanais ou mensais com suporte a arrastar e soltar (drag and drop) intuitivo.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center text-[#FF6B35] mb-5">
                <DollarSign className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-md font-bold font-display text-[#1A1F2E] mb-2">Financeiro automatizado</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Fluxo de caixa em tempo real, liquidação automática de comissões de parceiros e cobrança segura de sinal financeiro preventivo no PIX.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#0F4C81]/10 rounded-lg flex items-center justify-center text-[#0F4C81] mb-5">
                <Users className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-md font-bold font-display text-[#1A1F2E] mb-2">CRM de Clientes Inteligente</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Armazene preferências técnicas, histórico de faturamento acumulado, produtos favoritos e automatize notas de restrição alérgica.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#00C896]/10 rounded-lg flex items-center justify-center text-[#00C896] mb-5">
                <Award className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-md font-bold font-display text-[#1A1F2E] mb-2">Programa de Fidelidade</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Crie regras de pontuação ativa (R$ 1 = 1 ponto) e permita que seus clientes resgatem brindes ou serviços diretamente via mensagens no WhatsApp.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center text-[#FF6B35] mb-5">
                <MessageSquare className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-md font-bold font-display text-[#1A1F2E] mb-2">Mensagens Ativas IA</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Dispare campanhas automáticas de retorno para clientes inativos (ex: "fora há mais de 60 dias") de forma automática visando as cadeiras vazias.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* PRICING MATRIX SECTION */}
      <section id="planos" className="py-20 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#FF6B35] font-display">Planos de Assinatura</h4>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#1A1F2E]">
              O investimento que se paga na primeira semana
            </h2>
            
            {/* TOGGLE ANNUALLY / MONTHLY */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <span className={`text-sm font-semibold ${billingPeriod === 'monthly' ? 'text-[#0F4C81]' : 'text-[#64748B]'}`}>Mensal</span>
              <button 
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annually' : 'monthly')}
                className="w-12 h-6.5 bg-[#0F4C81] rounded-full p-1 relative flex items-center transition-colors cursor-pointer"
              >
                <div className={`w-4.5 h-4.5 bg-white rounded-full transition-transform ${billingPeriod === 'annually' ? 'translate-x-5.5' : 'translate-x-0'}`}></div>
              </button>
              <span className={`text-sm font-semibold flex items-center gap-1.5 ${billingPeriod === 'annually' ? 'text-[#0F4C81]' : 'text-[#64748B]'}`}>
                Anual
                <span className="bg-[#00C896] text-white text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full font-sans">
                  Economize 20%
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {plans.map((p) => {
              const displayPrice = billingPeriod === 'monthly' ? p.priceMonthly : p.priceAnnually;
              return (
                <div 
                  key={p.name}
                  className={`bg-white rounded-2xl p-8 border-2 flex flex-col justify-between relative transition-shadow ${
                    p.popular 
                      ? 'border-[#0F4C81] shadow-xl ring-4 ring-[#0F4C81]/10 transform scale-[1.03]' 
                      : 'border-[#E2E8F0] shadow-sm hover:shadow-md'
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0F4C81] text-white text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full z-10">
                      Mais Escolhido
                    </span>
                  )}

                  <div>
                    <h3 className="font-display font-extrabold text-xl text-[#1A1F2E]">{p.name}</h3>
                    <p className="text-xs text-[#64748B] mt-1 pr-6 leading-relaxed min-h-[40px]">{p.description}</p>
                    
                    <div className="my-6 border-y border-[#E2E8F0] py-4 flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-[#64748B]">R$</span>
                      <span className="text-4xl font-black font-jetbrains text-[#1A1F2E] leading-none">{displayPrice}</span>
                      <span className="text-xs text-[#64748B] font-medium">/ mês</span>
                    </div>

                    <ul className="space-y-3.5 mb-8">
                      {p.features.map((feat) => (
                        <li key={feat} className="flex gap-2.5 text-xs text-[#1A1F2E]">
                          <Check className="w-4 h-4 text-[#00C896] shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    onClick={() => onNavigateToRegister(p.name)}
                    className={`w-full py-3.5 rounded-xl text-xs font-bold font-display tracking-wider uppercase transition-all cursor-pointer ${
                      p.popular 
                        ? 'bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white shadow-lg shadow-[#FF6B35]/20' 
                        : 'bg-[#0F4C81]/10 border border-[#0F4C81]/20 text-[#0F4C81] hover:bg-[#0F4C81]/20'
                    }`}
                  >
                    Ativar 14 dias grátis
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF TESTIMONIALS */}
      <section id="depoimentos" className="py-20 bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#0F4C81] font-display">Quem já usa aprova</h4>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#1A1F2E]">
              Histórias de sucesso reais de parceiros AgendaBot
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-[#FF6B35] mb-4">
                    <Star className="w-4.5 h-4.5 fill-current" />
                    <Star className="w-4.5 h-4.5 fill-current" />
                    <Star className="w-4.5 h-4.5 fill-current" />
                    <Star className="w-4.5 h-4.5 fill-current" />
                    <Star className="w-4.5 h-4.5 fill-current" />
                  </div>
                  <p className="text-xs text-[#64748B] italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#E2E8F0]">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]" />
                  <div>
                    <h5 className="text-xs font-bold text-[#1A1F2E]">{t.name}</h5>
                    <span className="text-[10px] text-[#64748B] block font-medium">{t.role}</span>
                    <span className="text-[9px] text-[#00C896] font-mono block mt-0.5">{t.business}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#FF6B35] font-display">Ficou com alguma dúvida?</h4>
            <h2 className="font-display font-extrabold text-3xl text-[#1A1F2E]">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#F8FAFC] transition-colors">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left bg-white border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors font-semibold font-display text-sm text-[#1A1F2E] cursor-pointer"
                  >
                    <span>{faq.p}</span>
                    <ChevronDown className={`w-5 h-5 text-[#64748B] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 text-xs text-[#64748B] leading-relaxed bg-[#F8FAFC]">
                      {faq.r}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A1F2E] text-white py-12 px-6 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#00C896]" />
            </div>
            <span className="font-display font-black text-xl text-white">AgendaBot</span>
          </div>

          <p className="text-xs text-white/50 text-center md:text-right max-w-md">
            AgendaBot Ltda • CNPJ 12.345.678/0001-90 • Av. Paulista, 1000 - Bela Vista - São Paulo / SP • CEP 01310-100
          </p>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/40">
          <p>© 2026 AgendaBot. Todos os direitos reservados. Feito com excelência para empresas de serviços.</p>
          <div className="flex gap-6 font-medium">
            <a href="#" className="hover:text-white">Políticas de Privacidade</a>
            <a href="#" className="hover:text-white">Termos de Uso</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
