/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  BrainCircuit, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle, 
  Smartphone, 
  Sparkles, 
  Building2, 
  CreditCard,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface AuthenticationProps {
  initialScreen?: 'login' | 'register' | 'forgot-password' | 'register-plan-select';
  planSelected?: string;
  onNavigateHome: () => void;
}

export default function Authentication({ initialScreen = 'login', planSelected = 'Pro', onNavigateHome }: AuthenticationProps) {
  const { login, loginWithGoogle, registerUser } = useAuthStore();
  const [screen, setScreen] = useState<'login' | 'register' | 'forgot-password'>(initialScreen === 'register-plan-select' ? 'register' : initialScreen);
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register Form States (Steps)
  const [registerStep, setRegisterStep] = useState(initialScreen === 'register-plan-select' ? 3 : 1);
  const [step1Data, setStep1Data] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
  });
  const [step2Data, setStep2Data] = useState({
    nomeEstabelecimento: '',
    tipo: 'Barbearia',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: 'SP'
  });
  const [chosenPlan, setChosenPlan] = useState(planSelected);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('pix');
  const [registerError, setRegisterError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!email || !password) {
      setLoginError('Preencha todos os campos.');
      return;
    }
    setIsLoggingIn(true);
    const result = await login(email, password);
    setIsLoggingIn(false);
    if (!result.success) {
      setLoginError(result.error || 'Erro inesperado.');
    }
  };

  // Step 1 Validation
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    if (!step1Data.nome || !step1Data.email || !step1Data.telefone || !step1Data.senha || !step1Data.confirmarSenha) {
      setRegisterError('Preencha os dados obrigatórios.');
      return;
    }
    if (step1Data.senha !== step1Data.confirmarSenha) {
      setRegisterError('As senhas digitadas não coincidem.');
      return;
    }
    if (step1Data.senha.length < 6) {
      setRegisterError('Escolha uma senha de pelo menos 6 caracteres.');
      return;
    }
    setRegisterStep(2);
  };

  // Step 2 Validation
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    if (!step2Data.nomeEstabelecimento || !step2Data.endereco || !step2Data.cidade) {
      setRegisterError('Endereço e Nome do estabelecimento são obrigatórios.');
      return;
    }
    setRegisterStep(3);
  };

  // Final Registration Step
  const handleFinalRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setIsRegistering(true);
    try {
      await registerUser(step1Data, step2Data, { plano: chosenPlan, pagamento: paymentMethod });
    } catch (err: any) {
      setRegisterError('Erro ao registrar.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Forgot Password handler
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail) {
      setForgotError('Insira seu email cadastrado.');
      return;
    }
    // Simulate sending email
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased font-sans">
      
      {/* BRAND INFO BAR PANEL (LEFT SIDE ON DESKTOP) */}
      <div className="hidden md:flex md:w-5/12 bg-gradient-to-tr from-[#0F4C81] to-[#1a6bb5] p-12 text-white flex-col justify-between select-none relative overflow-hidden shrink-0 border-r border-[#1a6bb5]">
        
        {/* TOP GREETINGS LOGO */}
        <div className="flex items-center gap-3 cursor-pointer relative z-10" onClick={onNavigateHome}>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <BrainCircuit className="w-6 h-6 text-[#00C896]" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl tracking-tight leading-tight">AgendaBot</h1>
            <span className="text-[11px] text-white/60 tracking-widest uppercase">Inteligência que foca em faturamento</span>
          </div>
        </div>

        {/* HERO BENEFIT CAROSEL STATIC ILLUSTRATION */}
        <div className="space-y-8 relative z-10 my-auto">
          <div className="space-y-3">
            <span className="bg-[#FF6B35] text-white text-[10px] tracking-widest uppercase font-bold px-3 py-1 rounded-full w-fit block font-sans">
              Automação B2B SaaS
            </span>
            <h2 className="text-3xl lg:text-4xl font-display font-black leading-tight tracking-tight">
              Sua recepção funcionando de dia e de noite pelo WhatsApp
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5 bg-white/5 border border-white/10 p-4 rounded-xl">
              <CheckCircle className="w-5 h-5 text-[#00C896] shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-bold">Respostas em Tempo Real</h5>
                <p className="text-xs text-white/70 mt-1">Nossa IA atende dúvidas, confirma regras de agendamento e fecha marcações sem precisar digitar.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-white/5 border border-white/10 p-4 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-[#00C896] shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-bold">Bloqueio Automático de No-Shows</h5>
                <p className="text-xs text-white/70 mt-1">Cobrança ágil de reserva parcial (sinal) no PIX reduz as faltas em até 80% do volume.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER OF BRAND SIDE */}
        <div className="text-xs text-white/40 font-mono relative z-10">
          © 2026 AgendaBot Ltda. Certificação de Inovação Digital.
        </div>

        {/* BLURRY BACKGROUND DECORATIONS */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#00C896]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-[#FF6B35]/15 rounded-full blur-3xl"></div>
      </div>

      {/* FORM SUITE (RIGHT SIDE OR MOBILE COMPARTMENT) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative animate-fade-in bg-white">
        
        {/* MOBILE GREETINGS LOGO PANEL */}
        <div className="md:hidden flex items-center gap-2 mb-8 cursor-pointer" onClick={onNavigateHome}>
          <BrainCircuit className="w-7 h-7 text-[#0F4C81]" />
          <h1 className="font-display font-black text-xl text-[#0F4C81]">AgendaBot</h1>
          <span className="text-[9px] bg-[#00C896]/10 text-[#00C896] px-2 py-0.5 rounded font-bold uppercase font-sans">IA</span>
        </div>

        {/* SCREEN CARDS ROUTING MANAGER */}

        {/* 1. LOGIN SCREEN CARD */}
        {screen === 'login' && (
          <div className="w-full max-w-[440px] space-y-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-display font-black text-[#1A1F2E]">Entrar no painel</h2>
              <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                Utilize suas credenciais ou configure emails modelo para testes rápidos:
              </p>
              
              {/* TEST USERS GUIDE BOX */}
              <div className="bg-[#0F4C81]/5 border border-[#0F4C81]/20 rounded-lg p-3 text-left mt-3">
                <span className="text-[10px] font-bold text-[#0F4C81] uppercase block mb-1">Acesso Demonstração Sandbox:</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-[#64748B]">
                  <div>📧 <b className="text-[#1A1F2E]">admin@teste.com</b></div>
                  <div>🔑 <b className="text-[#1A1F2E]">123456</b> (Admin)</div>
                  <div>📧 <b className="text-[#1A1F2E]">prof@teste.com</b></div>
                  <div>🔑 <b className="text-[#1A1F2E]">123456</b> (Profissional)</div>
                </div>
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1A1F2E] block mb-1.5 uppercase tracking-wide">Endereço de E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@email.com"
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-xs leading-none bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-[#1A1F2E] uppercase tracking-wide">Senha</label>
                  <button 
                    type="button"
                    onClick={() => setScreen('forgot-password')}
                    className="text-[11px] text-[#0F4C81] hover:underline font-bold"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full pl-4 pr-11 py-3 border border-[#E2E8F0] rounded-lg text-xs bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F4C81]"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md shadow-[#0F4C81]/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? 'Autenticando...' : 'Acessar AgendaBot'}
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#E2E8F0]"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-[#64748B] uppercase">ou</span>
              <div className="flex-grow border-t border-[#E2E8F0]"></div>
            </div>

            <button
              onClick={() => loginWithGoogle()}
              className="w-full border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1A1F2E] font-bold py-3 rounded-lg text-xs flex items-center justify-center gap-3 transition-colors cursor-pointer"
            >
              <Smartphone className="w-4.5 h-4.5 text-[#0F4C81]" />
              <span>Entrar com a conta Google</span>
            </button>

            <p className="text-xs text-center text-[#64748B]">
              Ainda não possui conta?{' '}
              <button 
                onClick={() => { setScreen('register'); setRegisterStep(1); }} 
                className="text-[#0F4C81] hover:underline font-bold"
              >
                Criar conta grátis
              </button>
            </p>
          </div>
        )}

        {/* 2. REGISTER SCREEN STEPPED WIZARD */}
        {screen === 'register' && (
          <div className="w-full max-w-[500px] space-y-6">
            
            {/* STEP PROGRESS TRACKER */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (registerStep > 1) setRegisterStep(registerStep - 1);
                    else setScreen('login');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#0F4C81] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
                <span className="text-[10px] bg-[#00C896]/10 text-[#00C896] font-mono font-bold px-2.5 py-1 rounded-full uppercase">
                  Etapa {registerStep} de 3
                </span>
              </div>

              {/* PROGRESS BAR */}
              <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                <div 
                  className="bg-[#00C896] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(registerStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {registerError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg">
                {registerError}
              </div>
            )}

            {/* STEP 1: PERSONAL INFORMATION */}
            {registerStep === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-black text-[#1A1F2E]">Dados Pessoais</h3>
                  <p className="text-xs text-[#64748B] font-medium">Insira seus dados herdeiros de comunicação padrão.</p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1A1F2E] block mb-1 uppercase tracking-wider">Seu Nome Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Gabriel Gustavo"
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-xs leading-none bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] transition-all"
                    value={step1Data.nome}
                    onChange={(e) => setStep1Data({ ...step1Data, nome: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1A1F2E] block mb-1 uppercase tracking-wider">E-mail Corporativo</label>
                  <input
                    type="email"
                    required
                    placeholder="exemplo@empresa.com"
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-xs leading-none bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] transition-all"
                    value={step1Data.email}
                    onChange={(e) => setStep1Data({ ...step1Data, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1A1F2E] block mb-1 uppercase tracking-wider">WhatsApp com DDD</label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-xs leading-none bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] transition-all"
                    value={step1Data.telefone}
                    onChange={(e) => setStep1Data({ ...step1Data, telefone: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#1A1F2E] block mb-1 uppercase tracking-wider">Sua Senha</label>
                    <input
                      type="password"
                      required
                      placeholder="Min 6 caracteres"
                      className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-xs leading-none bg-[#F8FAFC] focus:outline-none"
                      value={step1Data.senha}
                      onChange={(e) => setStep1Data({ ...step1Data, senha: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#1A1F2E] block mb-1 uppercase tracking-wider">Confirmar Senha</label>
                    <input
                      type="password"
                      required
                      placeholder="Repita a senha"
                      className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-xs leading-none bg-[#F8FAFC] focus:outline-none"
                      value={step1Data.confirmarSenha}
                      onChange={(e) => setStep1Data({ ...step1Data, confirmarSenha: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#0F4C81]/20 mt-2"
                >
                  <span>Continuar Cadastro</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 2: BUSINESS DETAILS */}
            {registerStep === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-black text-[#1A1F2E]">Dados do Negócio</h3>
                  <p className="text-xs text-[#64748B] font-medium">Conte-nos sobre o seu estabelecimento físico ou estúdio.</p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1A1F2E] block mb-1 uppercase tracking-wider">Nome da Empresa / Marca</label>
                  <input
                    type="text"
                    required
                    placeholder="Barbearia Estilo Moderno"
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-xs leading-none bg-[#F8FAFC] focus:outline-none"
                    value={step2Data.nomeEstabelecimento}
                    onChange={(e) => setStep2Data({ ...step2Data, nomeEstabelecimento: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#1A1F2E] block mb-1 uppercase tracking-wider">Ramo Comercial</label>
                    <select
                      className="w-full px-4 py-3 border border-[#E2E8F0] bg-white rounded-lg text-xs leading-none"
                      value={step2Data.tipo}
                      onChange={(e) => setStep2Data({ ...step2Data, tipo: e.target.value })}
                    >
                      <option value="Barbearia">Barbearia</option>
                      <option value="Salão de Beleza">Salão de Beleza</option>
                      <option value="Clínica Estética">Clínica Estética</option>
                      <option value="Clínica Odontológica">Clínica Odontológica</option>
                      <option value="Personal Trainer">Personal Trainer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#1A1F2E] block mb-1 uppercase tracking-wider">CNPJ (Opcional)</label>
                    <input
                      type="text"
                      placeholder="00.000.000/0001-00"
                      className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-xs leading-none bg-[#F8FAFC]"
                      value={step2Data.cnpj}
                      onChange={(e) => setStep2Data({ ...step2Data, cnpj: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1A1F2E] block mb-1 uppercase tracking-wider">Endereço Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Av. Paulista, 1000 - Centro"
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-xs leading-none bg-[#F8FAFC] focus:outline-none"
                    value={step2Data.endereco}
                    onChange={(e) => setStep2Data({ ...step2Data, endereco: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#1A1F2E] block mb-1 uppercase tracking-wider">Cidade</label>
                    <input
                      type="text"
                      required
                      placeholder="São Paulo"
                      className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-xs leading-none bg-[#F8FAFC]"
                      value={step2Data.cidade}
                      onChange={(e) => setStep2Data({ ...step2Data, cidade: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#1A1F2E] block mb-1 uppercase tracking-wider">Estado</label>
                    <input
                      type="text"
                      required
                      placeholder="SP"
                      className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-xs leading-none bg-[#F8FAFC]"
                      value={step2Data.estado}
                      onChange={(e) => setStep2Data({ ...step2Data, estado: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#0F4C81]/20 mt-2"
                >
                  <span>Avançar para Planos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 3: PLAN DEFINITIONS & SIMULATED PAYMENTS */}
            {registerStep === 3 && (
              <form onSubmit={handleFinalRegisterSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-black text-[#1A1F2E]">Plano & Cobrança teste</h3>
                  <p className="text-xs text-[#64748B] font-medium">Nenhum valor real será cobrado no ambiente simulado Sandbox.</p>
                </div>

                {/* DYNAMIC COMPACT PLAN ROW CHOICE */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Starter', price: 'R$ 97' },
                    { id: 'Pro', price: 'R$ 197' },
                    { id: 'Business', price: 'R$ 397' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setChosenPlan(p.id)}
                      className={`p-3 rounded-lg border-2 text-center transition-all cursor-pointer ${
                        chosenPlan === p.id 
                          ? 'border-[#00C896] bg-[#00C896]/5 text-[#1A1F2E]' 
                          : 'border-[#E2E8F0] text-[#64748B] hover:border-[#64748B]'
                      }`}
                    >
                      <span className="font-display font-bold text-xs uppercase block">{p.id}</span>
                      <span className="font-jetbrains font-bold text-sm block mt-1">{p.price}</span>
                      {p.id === 'Pro' && (
                        <span className="text-[8px] bg-[#0F4C81] text-white px-1.5 py-0.2 rounded mt-1 inline-block uppercase tracking-wider">
                          Recomendado
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* PAYMENT TYPE TOGGLE */}
                <div>
                  <label className="text-[11px] font-bold text-[#1A1F2E] block mb-2 uppercase tracking-wider">Método de Ativação</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-3.5 rounded-lg border flex items-center justify-center gap-2 font-display font-bold text-xs cursor-pointer ${
                        paymentMethod === 'pix' ? 'border-[#0F4C81] bg-[#0F4C81]/5 text-[#0F4C81]' : 'border-[#E2E8F0] text-[#64748B]'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-[#00C896]" />
                      PIX Instantâneo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cartao')}
                      className={`p-3.5 rounded-lg border flex items-center justify-center gap-2 font-display font-bold text-xs cursor-pointer ${
                        paymentMethod === 'cartao' ? 'border-[#0F4C81] bg-[#0F4C81]/5 text-[#0F4C81]' : 'border-[#E2E8F0] text-[#64748B]'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-[#FF6B35]" />
                      Cartão de Crédito
                    </button>
                  </div>
                </div>

                {/* SIMULATORY WARNING INFO */}
                <div className="bg-[#00C896]/10 px-3 py-4 rounded-xl border border-[#00C896]/20 text-xs text-[#0F5132] font-medium leading-relaxed">
                  🚀 <b>Você está ativando em Modo Sandbox!</b><br />
                  Você usufruirá de 14 dias de acesso completo sem travas com o seu número de WhatsApp pronto para sincronizar logs. Clique abaixo para finalizar!
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full bg-[#00C896] hover:bg-[#00C896]/90 text-white font-bold py-4 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00C896]/20 mt-2"
                >
                  <Building2 className="w-4.5 h-4.5" />
                  <span>{isRegistering ? 'Provisionando ambiente...' : 'Ativar Minha Conta AgendaBot'}</span>
                </button>
              </form>
            )}

          </div>
        )}

        {/* 3. FORGOT PASSWORD CARD */}
        {screen === 'forgot-password' && (
          <div className="w-full max-w-[420px] space-y-6">
            <div className="space-y-2">
              <button
                onClick={() => setScreen('login')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#0F4C81]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para Login</span>
              </button>
              <h3 className="text-2xl font-display font-black text-[#1A1F2E]">Recuperar senha</h3>
              <p className="text-xs text-[#64748B] font-medium">Insira seu e-mail cadastrado. Enviaremos um link de autenticação segura para redefinir sua credencial.</p>
            </div>

            {forgotError && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold">
                {forgotError}
              </div>
            )}

            {forgotSent ? (
              <div className="bg-[#00C896]/15 border border-[#00C896]/20 p-5 rounded-xl space-y-3 text-xs text-[#0f5132]">
                <p className="font-bold">✓ E-mail de redefinição enviado!</p>
                <p className="leading-relaxed">Verifique sua caixa de entrada e spam do endereço <b className="text-[#1A1F2E]">{forgotEmail}</b>. Siga os passos contidos.</p>
                <button
                  onClick={() => { setForgotSent(false); setScreen('login'); }}
                  className="bg-[#0F4C81] text-white font-bold px-4 py-2 rounded text-[11px] block text-center"
                >
                  Ok, entendi
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#1A1F2E] block mb-1.5 uppercase tracking-wider">Endereço de E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="exemplo@email.com"
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-xs bg-[#F8FAFC] focus:outline-none"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-bold py-3 text-xs uppercase tracking-wider rounded-lg shadow-md cursor-pointer"
                >
                  Enviar link de redefinição
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
