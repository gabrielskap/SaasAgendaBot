/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Play, Save, Grid3X3, ZoomIn, ZoomOut,
  Sparkles, Trash2, Plus, Check, X, HelpCircle,
  FileText, Clock, Image, AlertCircle, Bot,
  Search, ChevronDown, ChevronRight,
  Video, MonitorPlay, Headphones,
  Type as InputTextIcon, Hash, Mail, Globe, Calendar, Phone, Pointer,
  ImagePlus, CreditCard, Star, Upload, LayoutGrid,
  Variable, GitBranch, CornerUpRight, Terminal, Timer, Shuffle, SkipForward, CornerDownLeft,
  MousePointerClick
} from 'lucide-react';

// ── Node registry types ──────────────────────────────────────────────────────

type NodeCategory = 'bubble' | 'input' | 'conditional';

type FlowNodeType =
  | 'inicio' | 'texto' | 'pergunta' | 'condicao' | 'delay'
  | 'imagem' | 'video' | 'incorporar' | 'audio'
  | 'input_texto' | 'numero' | 'email' | 'website' | 'data_input' | 'time_input'
  | 'telefone' | 'selecao_imagem' | 'pagamento' | 'avaliacao' | 'arquivo' | 'cards'
  | 'variavel' | 'redirecionar' | 'script' | 'typebot' | 'teste_ab' | 'pular' | 'return_node';

type IconComponent = React.ComponentType<{ className?: string }>;

interface NodeDefinition {
  type: FlowNodeType;
  label: string;
  Icon: IconComponent;
  category: NodeCategory;
  iconColor: string;
  tooltip: string;
  defaultData: { title: string; text: string; options: string[]; delaySeconds: number };
}

// Colors mapped to system tokens:
// bubble   → sky-400   (#38bdf8)
// input    → --color-accent (#FF6B35)
// conditional → --color-secondary (#00C896)
// delay    → amber-500 (approved)

const NODE_DEFINITIONS: NodeDefinition[] = [
  // Bubbles
  { type: 'texto',          label: 'Texto',              Icon: FileText,      category: 'bubble',      iconColor: 'text-sky-400',   tooltip: 'Envia uma mensagem de texto para o cliente',          defaultData: { title: 'Mensagem de Texto',     text: 'Digite o conteúdo da sua nova mensagem aqui...',                             options: [],                        delaySeconds: 1 } },
  { type: 'imagem',         label: 'Imagem',             Icon: Image,         category: 'bubble',      iconColor: 'text-sky-400',   tooltip: 'Envia uma imagem ao usuário',                         defaultData: { title: 'Enviar Imagem',         text: 'https://exemplo.com/imagem.jpg',                                             options: [],                        delaySeconds: 1 } },
  { type: 'video',          label: 'Vídeo',              Icon: Video,         category: 'bubble',      iconColor: 'text-sky-400',   tooltip: 'Envia um vídeo ao usuário',                           defaultData: { title: 'Enviar Vídeo',          text: 'https://exemplo.com/video.mp4',                                              options: [],                        delaySeconds: 1 } },
  { type: 'incorporar',     label: 'Incorporar',         Icon: MonitorPlay,   category: 'bubble',      iconColor: 'text-sky-400',   tooltip: 'Incorpora conteúdo externo (embed)',                  defaultData: { title: 'Conteúdo Incorporado',  text: 'https://exemplo.com/embed',                                                  options: [],                        delaySeconds: 1 } },
  { type: 'audio',          label: 'Áudio',              Icon: Headphones,    category: 'bubble',      iconColor: 'text-sky-400',   tooltip: 'Envia um arquivo de áudio',                           defaultData: { title: 'Enviar Áudio',          text: 'https://exemplo.com/audio.mp3',                                              options: [],                        delaySeconds: 1 } },
  // Inputs
  { type: 'input_texto',    label: 'Texto',              Icon: InputTextIcon, category: 'input',       iconColor: 'text-[#FF6B35]', tooltip: 'Captura uma resposta de texto do usuário',            defaultData: { title: 'Capturar Texto',        text: 'Digite sua resposta...',                                                     options: [],                        delaySeconds: 1 } },
  { type: 'numero',         label: 'Número',             Icon: Hash,          category: 'input',       iconColor: 'text-[#FF6B35]', tooltip: 'Captura um número do usuário',                        defaultData: { title: 'Capturar Número',       text: 'Digite um número...',                                                        options: [],                        delaySeconds: 1 } },
  { type: 'email',          label: 'Email',              Icon: Mail,          category: 'input',       iconColor: 'text-[#FF6B35]', tooltip: 'Captura o endereço de email do usuário',              defaultData: { title: 'Capturar Email',        text: 'Qual é o seu email?',                                                        options: [],                        delaySeconds: 1 } },
  { type: 'website',        label: 'Website',            Icon: Globe,         category: 'input',       iconColor: 'text-[#FF6B35]', tooltip: 'Captura a URL de um website',                         defaultData: { title: 'Capturar Website',      text: 'Digite o endereço do site...',                                               options: [],                        delaySeconds: 1 } },
  { type: 'data_input',     label: 'Data',               Icon: Calendar,      category: 'input',       iconColor: 'text-[#FF6B35]', tooltip: 'Captura uma data do usuário',                         defaultData: { title: 'Selecionar Data',       text: 'Selecione uma data...',                                                      options: [],                        delaySeconds: 1 } },
  { type: 'time_input',     label: 'Time',               Icon: Clock,         category: 'input',       iconColor: 'text-[#FF6B35]', tooltip: 'Captura um horário do usuário',                       defaultData: { title: 'Selecionar Horário',    text: 'Selecione um horário...',                                                    options: [],                        delaySeconds: 1 } },
  { type: 'telefone',       label: 'Telefone',           Icon: Phone,         category: 'input',       iconColor: 'text-[#FF6B35]', tooltip: 'Captura o número de telefone do usuário',             defaultData: { title: 'Capturar Telefone',     text: 'Qual é o seu telefone?',                                                     options: [],                        delaySeconds: 1 } },
  { type: 'pergunta',       label: 'Botão',              Icon: Pointer,       category: 'input',       iconColor: 'text-[#FF6B35]', tooltip: 'Apresenta opções clicáveis ao cliente',               defaultData: { title: 'Pergunta com Opções',   text: 'Deseja confirmar nossa sugestão?\n\nSelecione uma opção alternativa abaixo:', options: ['Opção A', 'Opção B'],  delaySeconds: 1 } },
  { type: 'selecao_imagem', label: 'Seleção de Imagem',  Icon: ImagePlus,     category: 'input',       iconColor: 'text-[#FF6B35]', tooltip: 'Permite selecionar uma imagem',                       defaultData: { title: 'Seleção de Imagem',     text: 'Escolha uma imagem...',                                                      options: [],                        delaySeconds: 1 } },
  { type: 'pagamento',      label: 'Pagamento',          Icon: CreditCard,    category: 'input',       iconColor: 'text-[#FF6B35]', tooltip: 'Processa um pagamento do usuário',                    defaultData: { title: 'Pagamento',             text: 'Valor: R$ 0,00',                                                             options: [],                        delaySeconds: 1 } },
  { type: 'avaliacao',      label: 'Avaliação',          Icon: Star,          category: 'input',       iconColor: 'text-[#FF6B35]', tooltip: 'Captura uma avaliação (rating) do usuário',           defaultData: { title: 'Avaliação',             text: 'Como você avalia nosso atendimento? (1-5 ⭐)',                              options: [],                        delaySeconds: 1 } },
  { type: 'arquivo',        label: 'Arquivo',            Icon: Upload,        category: 'input',       iconColor: 'text-[#FF6B35]', tooltip: 'Permite ao usuário enviar um arquivo',                defaultData: { title: 'Enviar Arquivo',        text: 'Envie um arquivo...',                                                        options: [],                        delaySeconds: 1 } },
  { type: 'cards',          label: 'Cards',              Icon: LayoutGrid,    category: 'input',       iconColor: 'text-[#FF6B35]', tooltip: 'Exibe um carrossel de cards',                         defaultData: { title: 'Cards',                 text: 'Selecione um card...',                                                       options: [],                        delaySeconds: 1 } },
  // Condicionais
  { type: 'variavel',       label: 'Variável',           Icon: Variable,      category: 'conditional', iconColor: 'text-[#00C896]', tooltip: 'Define ou modifica uma variável no fluxo',            defaultData: { title: 'Definir Variável',      text: 'variavel = valor',                                                           options: [],                        delaySeconds: 1 } },
  { type: 'condicao',       label: 'Condição',           Icon: GitBranch,     category: 'conditional', iconColor: 'text-[#00C896]', tooltip: 'Direciona o fluxo com base em uma regra',             defaultData: { title: 'Condição Se / Senão',   text: 'Se {horario} for maior que 18:00...',                                        options: ['Sucesso', 'Caso Contrário'], delaySeconds: 1 } },
  { type: 'redirecionar',   label: 'Redirecionar',       Icon: CornerUpRight, category: 'conditional', iconColor: 'text-[#00C896]', tooltip: 'Redireciona para outro fluxo ou URL',                 defaultData: { title: 'Redirecionar',          text: 'https://exemplo.com/pagina',                                                 options: [],                        delaySeconds: 1 } },
  { type: 'script',         label: 'Script',             Icon: Terminal,      category: 'conditional', iconColor: 'text-[#00C896]', tooltip: 'Executa um script JavaScript customizado',            defaultData: { title: 'Script Customizado',    text: '// Código JavaScript aqui...\nconsole.log("Executando...");',              options: [],                        delaySeconds: 1 } },
  { type: 'typebot',        label: 'Typebot',            Icon: Bot,           category: 'conditional', iconColor: 'text-[#00C896]', tooltip: 'Conecta a outro bot ou fluxo Typebot',                defaultData: { title: 'Conectar Typebot',      text: 'ID do Typebot: ...',                                                         options: [],                        delaySeconds: 1 } },
  { type: 'delay',          label: 'Espera',             Icon: Timer,         category: 'conditional', iconColor: 'text-amber-500', tooltip: 'Aguarda um tempo antes de continuar o fluxo',         defaultData: { title: 'Temporizador',          text: 'Aguardar 5 segundos antes de responder...',                                  options: [],                        delaySeconds: 5 } },
  { type: 'teste_ab',       label: 'Teste AB',           Icon: Shuffle,       category: 'conditional', iconColor: 'text-[#00C896]', tooltip: 'Divide o fluxo em dois caminhos A/B',                 defaultData: { title: 'Teste A/B',             text: '50% → Caminho A / 50% → Caminho B',                                          options: ['Caminho A', 'Caminho B'], delaySeconds: 1 } },
  { type: 'pular',          label: 'Pular',              Icon: SkipForward,   category: 'conditional', iconColor: 'text-[#00C896]', tooltip: 'Pula para um nó específico do fluxo',                 defaultData: { title: 'Pular para Nó',         text: 'Pular para: ...',                                                            options: [],                        delaySeconds: 1 } },
  { type: 'return_node',    label: 'Return',             Icon: CornerDownLeft,category: 'conditional', iconColor: 'text-[#00C896]', tooltip: 'Retorna ao início ou a um ponto anterior',             defaultData: { title: 'Retornar',              text: 'Retornar ao início do fluxo',                                                options: [],                        delaySeconds: 1 } },
];

const CATEGORY_CONFIG: { key: NodeCategory; label: string; accent: string; borderColor: string }[] = [
  { key: 'bubble',      label: 'Bubbles',      accent: 'text-sky-400',    borderColor: '#38bdf8' },
  { key: 'input',       label: 'Inputs',       accent: 'text-[#FF6B35]',  borderColor: '#FF6B35' },
  { key: 'conditional', label: 'Condicionais', accent: 'text-[#00C896]',  borderColor: '#00C896' },
];

const IMPLEMENTED_TYPES = new Set<FlowNodeType>(['inicio', 'texto', 'pergunta', 'condicao', 'delay']);

// ── FlowNode & connection interfaces ─────────────────────────────────────────

interface FlowNode {
  id: string;
  type: FlowNodeType;
  title: string;
  text: string;
  x: number;
  y: number;
  options: string[];
  delaySeconds: number;
}

interface FlowConnection {
  id: string;
  fromNodeId: string;
  fromPort: string;
  toNodeId: string;
  label?: string;
}

interface MessageFlowEditorProps {
  onBack: () => void;
  onSave: (flowJson: string) => Promise<void>;
  initialTemplates?: Array<{ id: string; label: string; text: string }>;
  initialFlow?: { nodes: unknown[]; connections: unknown[] };
}

// ── Helper: get category accent color hex for a node type ────────────────────
function getNodeAccentColor(type: FlowNodeType): string {
  if (type === 'inicio') return '#00C896';
  if (type === 'delay') return '#f59e0b';
  const def = NODE_DEFINITIONS.find(d => d.type === type);
  if (!def) return '#38bdf8';
  return CATEGORY_CONFIG.find(c => c.key === def.category)?.borderColor ?? '#38bdf8';
}

const DEFAULT_NODES: FlowNode[] = [
  {
    id: 'inicio', type: 'inicio', title: 'Boas-vindas (Início)',
    text: 'Olá, {nome_cliente}! 🤖 Seja bem-vindo à Barbearia Navalha de Ouro.\n Como posso te ajudar hoje?\n\n1. Agendar novo horário\n2. Ver nossos serviços\n3. Falar com Atendente',
    x: 80, y: 200, options: ['Agendar Horário', 'Ver Serviços', 'Falar com Atendente'], delaySeconds: 1
  },
  {
    id: 'agendar', type: 'texto', title: 'Agendar Horário',
    text: 'Excelente! Vamos receber seu agendamento. Digite a data e horário desejados ou confirme no link a seguir: barber.com/agendar 🚀',
    x: 480, y: 120, options: ['Confirmar', 'Voltar ao início'], delaySeconds: 1
  },
  {
    id: 'servicos', type: 'pergunta', title: 'Escolher Serviço',
    text: 'Conheça nossos principais serviços:\n💈 Corte Degradê - R$ 45\n🧔 Barba Completa - R$ 35\n🔥 Combo Premium - R$ 75',
    x: 480, y: 350, options: ['Agendar Combo', 'Voltar'], delaySeconds: 1
  },
  {
    id: 'atendente', type: 'texto', title: 'Transbordo Humano',
    text: 'Encaminhando seu contato para nosso atendimento humano de plantão. Aguarde 1 minuto por favor...',
    x: 480, y: 600, options: [], delaySeconds: 2
  }
];

const DEFAULT_CONNECTIONS: FlowConnection[] = [
  { id: 'conn_1', fromNodeId: 'inicio', fromPort: 'option_0', toNodeId: 'agendar',   label: 'Opção 1' },
  { id: 'conn_2', fromNodeId: 'inicio', fromPort: 'option_1', toNodeId: 'servicos',  label: 'Opção 2' },
  { id: 'conn_3', fromNodeId: 'inicio', fromPort: 'option_2', toNodeId: 'atendente', label: 'Opção 3' },
];

export default function MessageFlowEditor({ onBack, onSave, initialTemplates, initialFlow }: MessageFlowEditorProps) {
  const [nodes, setNodes] = useState<FlowNode[]>(() =>
    (initialFlow?.nodes?.length ? initialFlow.nodes as FlowNode[] : DEFAULT_NODES)
  );

  const [connections, setConnections] = useState<FlowConnection[]>(() =>
    (initialFlow?.connections?.length ? initialFlow.connections as FlowConnection[] : DEFAULT_CONNECTIONS)
  );

  const [variables, setVariables] = useState([
    '{nome_cliente}', '{horario}', '{data}', '{profissional}',
    '{servico}', '{valor_total}', '{codigo_fidelidade}'
  ]);

  const [templates, setTemplates] = useState(() => {
    if (initialTemplates && initialTemplates.length > 0) return initialTemplates;
    return [
      { id: 'welcome', label: 'Boas-vindas 🤖', text: 'Olá, {nome_cliente}! 🤖 Seja bem-vindo à Barbearia Navalha de Ouro. Como posso te ajudar hoje?\n\n1. Agendar novo horário\n2. Ver nossos serviços\n3. Cancelar agendamento' },
      { id: 'confirm', label: 'Confirmação 🚀', text: 'Excelente! Seu agendamento foi marcado com sucesso para dia {data} às {horario} com {profissional}. Te aguardamos! 🚀' },
      { id: 'reminder', label: 'Lembrete ⏱️', text: 'Olá, {nome_cliente}! Passando para lembrar de seu agendamento amanhã, {data} às {horario} para {servico}. Tudo certo?' },
    ];
  });
  const [activeTemplate, setActiveTemplate] = useState('welcome');
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [newTemplateLabel, setNewTemplateLabel] = useState('');
  const [isAddingVariable, setIsAddingVariable] = useState(false);
  const [newVariableName, setNewVariableName] = useState('');

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('inicio');
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  const [dragConnection, setDragConnection] = useState<{
    fromNodeId: string; fromPort: string;
    startX: number; startY: number;
    currentX: number; currentY: number;
  } | null>(null);

  const [draggedNode, setDraggedNode] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [simMessages, setSimMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([]);
  const [simActiveNodeId, setSimActiveNodeId] = useState<string | null>(null);

  // Save status + toast
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setSaveStatus('unsaved');
  }, [nodes, connections]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<NodeCategory>>(new Set());

  const toggleCategory = (cat: NodeCategory) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        searchInputRef.current?.blur();
        setSearchQuery('');
        setSelectedNodeId(null);
        setSelectedConnectionId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const NODE_WIDTH = 250;

  const getPortCoordinates = (node: FlowNode, portType: 'input' | 'output' | string) => {
    const { x, y } = node;
    if (portType === 'input')  return { x, y: y + 55 };
    if (portType === 'output') return { x: x + NODE_WIDTH, y: y + 55 };
    if (portType.startsWith('option_')) {
      const idx = parseInt(portType.split('_')[1], 10);
      return { x: x + NODE_WIDTH, y: y + 120 + idx * 34 };
    }
    return { x: x + NODE_WIDTH, y: y + 55 };
  };

  const handleDragVarStart = (e: React.DragEvent, val: string) => {
    e.dataTransfer.setData('text/plain', val);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.node-card') || target.closest('.port-dots')) return;
    if (e.button === 0 || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    if (draggedNode) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mx = (e.clientX - rect.left - pan.x) / scale;
        const my = (e.clientY - rect.top - pan.y) / scale;
        setNodes(prev => prev.map(n =>
          n.id === draggedNode.id
            ? { ...n, x: Math.round(mx - draggedNode.offsetX), y: Math.round(my - draggedNode.offsetY) }
            : n
        ));
      }
      return;
    }
    if (dragConnection) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setDragConnection(prev => prev ? {
          ...prev,
          currentX: (e.clientX - rect.left - pan.x) / scale,
          currentY: (e.clientY - rect.top - pan.y) / scale
        } : null);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsPanning(false);
    setDraggedNode(null);
    if (dragConnection) {
      let foundNodeId: string | null = null;
      for (const node of nodes) {
        if (node.id === dragConnection.fromNodeId) continue;
        const inp = getPortCoordinates(node, 'input');
        if (Math.hypot(dragConnection.currentX - inp.x, dragConnection.currentY - inp.y) < 28) {
          foundNodeId = node.id;
          break;
        }
      }
      if (foundNodeId) {
        const newConn: FlowConnection = {
          id: 'conn_' + Date.now(),
          fromNodeId: dragConnection.fromNodeId,
          fromPort: dragConnection.fromPort,
          toNodeId: foundNodeId,
          label: nodes.find(n => n.id === dragConnection.fromNodeId)?.options[
            parseInt(dragConnection.fromPort.split('_')[1], 10)
          ] || 'Progresso'
        };
        setConnections(prev => [
          ...prev.filter(c =>
            !(c.fromNodeId === newConn.fromNodeId && c.fromPort === newConn.fromPort) &&
            !(c.toNodeId === newConn.toNodeId)
          ),
          newConn
        ]);
      }
      setDragConnection(null);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setScale(prev => Math.min(2.0, Math.max(0.4, prev + delta)));
  };

  const handleAddNewNode = (type: FlowNodeType) => {
    if (type === 'inicio') return;
    const def = NODE_DEFINITIONS.find(d => d.type === type);
    if (!def) return;
    const id = 'node_' + Date.now();
    setNodes(prev => [...prev, {
      id, type, title: def.defaultData.title, text: def.defaultData.text,
      x: Math.round(-pan.x / scale + 150 + Math.random() * 80),
      y: Math.round(-pan.y / scale + 100 + Math.random() * 80),
      options: [...def.defaultData.options], delaySeconds: def.defaultData.delaySeconds
    }]);
    setSelectedNodeId(id);
    setSelectedConnectionId(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === 'inicio') { alert('O nó inicial não pode ser excluído.'); return; }
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const handleDeleteConnection = (connId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
    if (selectedConnectionId === connId) setSelectedConnectionId(null);
  };

  const handleAutoOrganize = () => {
    const arranged = new Set<string>();
    const levels: { [k: string]: number } = { inicio: 0 };
    const queue = ['inicio'];
    arranged.add('inicio');
    while (queue.length > 0) {
      const cur = queue.shift()!;
      connections.filter(c => c.fromNodeId === cur).forEach(conn => {
        if (!arranged.has(conn.toNodeId)) {
          levels[conn.toNodeId] = levels[cur] + 1;
          arranged.add(conn.toNodeId);
          queue.push(conn.toNodeId);
        }
      });
    }
    nodes.forEach(n => { if (levels[n.id] === undefined) levels[n.id] = 0; });
    const counts: { [k: number]: number } = {};
    setNodes(prev => prev.map(node => {
      const lvl = levels[node.id] ?? 0;
      const idx = counts[lvl] ?? 0;
      counts[lvl] = idx + 1;
      return { ...node, x: 80 + lvl * 320, y: 180 + idx * 210 };
    }));
    setScale(0.9);
    setPan({ x: 30, y: 10 });
  };

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setSimMessages([]);
    setSimActiveNodeId('inicio');
    const inicioNode = nodes.find(n => n.id === 'inicio');
    if (inicioNode) {
      setTimeout(() => {
        setSimMessages([{ sender: 'bot', text: renderTemplateText(inicioNode.text), time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
      }, 500);
    }
  };

  const handleSimOptionClick = (optionIndex: number, targetNodeId: string) => {
    const parentNode = nodes.find(n => n.id === simActiveNodeId);
    setSimMessages(prev => [...prev, {
      sender: 'user', text: parentNode?.options[optionIndex] || 'Opção',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }]);
    setSimActiveNodeId(targetNodeId);
    const targetNode = nodes.find(n => n.id === targetNodeId);
    if (targetNode) {
      setTimeout(() => {
        setSimMessages(prev => [...prev, {
          sender: 'bot', text: renderTemplateText(targetNode.text),
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 800 + targetNode.delaySeconds * 400);
    }
  };

  const renderTemplateText = (text: string) => {
    const map: { [k: string]: string } = {
      '{nome_cliente}': 'Gabriel Gustavo', '{horario}': '16:30', '{data}': '21/05/2026',
      '{profissional}': 'Alan Mota (Barbeiro)', '{servico}': 'Corte Degradê + Sobrancelha',
      '{valor_total}': 'R$ 55,00', '{codigo_fidelidade}': 'FID-9921'
    };
    return Object.entries(map).reduce((out, [k, v]) => out.replace(new RegExp(k, 'g'), v), text);
  };

  const handleAddTemplate = () => {
    if (!newTemplateLabel.trim()) return;
    const id = 'custom_' + Date.now();
    setTemplates(prev => [...prev, { id, label: newTemplateLabel.trim(), text: `Olá! Digite aqui a mensagem para "${newTemplateLabel.trim()}"` }]);
    setActiveTemplate(id);
    setNewTemplateLabel('');
    setIsAddingTemplate(false);
  };

  const handleAddVariable = () => {
    if (!newVariableName.trim()) return;
    let v = newVariableName.trim();
    if (!v.startsWith('{')) v = '{' + v;
    if (!v.endsWith('}')) v = v + '}';
    if (!variables.includes(v)) setVariables(prev => [...prev, v]);
    setNewVariableName('');
    setIsAddingVariable(false);
  };

  const isNodeWarning = (id: string) => id !== 'inicio' && !connections.some(c => c.toNodeId === id);
  const isNodeSink    = (id: string) => !connections.some(c => c.fromNodeId === id);

  // ── Canvas empty state: only show when just the start node exists ────────────
  const isCanvasEmpty = nodes.length <= 1;

  return (
    <div className="fixed inset-0 bg-[#0F172A] text-slate-100 flex flex-col font-sans z-50 overflow-hidden text-left text-xs">

      {/* TOAST */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-slate-800 border border-[#00C896]/40 text-[#00C896] text-[11px] font-bold px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 pointer-events-none select-none animate-[fadeInDown_0.2s_ease-out]">
          <Check className="w-3.5 h-3.5" />
          {toastMsg}
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────────────── */}
      <div className="bg-[#1E293B] border-b border-[#334155] px-5 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Voltar ao editor simples"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0F4C81]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 bg-[#0F4C81] text-white rounded text-[10px] font-bold tracking-wide">PRO FLOV</span>
              <h2 className="text-sm font-display font-black text-white">Visual Flow Builder</h2>
            </div>
            <p className="text-[10.5px] text-slate-400 font-medium">Configure as respostas arrastando nós e conexões.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Save status indicator */}
          <div className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors duration-300 ${saveStatus === 'saved' ? 'text-[#00C896]' : saveStatus === 'saving' ? 'text-sky-400' : 'text-amber-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saved' ? 'bg-[#00C896]' : saveStatus === 'saving' ? 'bg-sky-400 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
            {saveStatus === 'saved' ? 'Salvo' : saveStatus === 'saving' ? 'Salvando…' : 'Não salvo'}
          </div>

          {/* Ghost: Auto-organizar */}
          <button
            onClick={handleAutoOrganize}
            aria-label="Reorganizar nós automaticamente"
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-bold text-[11px] flex items-center gap-1.5 transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0F4C81]"
          >
            <Grid3X3 className="w-3.5 h-3.5 text-[#00C896]" />
            Auto-organizar
          </button>

          {/* Secondary: Testar */}
          <button
            onClick={handleStartSimulation}
            className="px-3 py-1.5 rounded-lg border border-[#00C896]/50 bg-[#00C896]/10 hover:bg-[#00C896]/20 text-[#00C896] font-black text-[11px] flex items-center gap-1.5 transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00C896]"
          >
            <Play className="w-3.5 h-3.5 fill-[#00C896]" />
            Testar Fluxo
          </button>

          {/* Primary: Salvar */}
          <button
            disabled={saveStatus === 'saving'}
            onClick={async () => {
              setSaveStatus('saving');
              try {
                await onSave(JSON.stringify({ nodes, connections }));
                setSaveStatus('saved');
                showToast('Fluxo salvo com sucesso!');
              } catch {
                setSaveStatus('unsaved');
                showToast('Erro ao salvar. Tente novamente.');
              }
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#0F4C81] hover:bg-[#0F4C81]/90 disabled:opacity-60 text-white font-black text-[11px] flex items-center gap-1.5 shadow-sm transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0F4C81]/60"
          >
            <Save className="w-3.5 h-3.5" />
            {saveStatus === 'saving' ? 'Salvando…' : 'Salvar Fluxo'}
          </button>

          <button
            type="button"
            onClick={onBack}
            aria-label="Fechar editor"
            className="p-1.5 text-slate-500 hover:text-white transition-colors duration-150 cursor-pointer ml-1 focus-visible:ring-2 focus-visible:ring-slate-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── WORKSPACE ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── PANEL LEFT ─────────────────────────────────────────────────────── */}
        <div className="w-56 bg-[#111827] border-r border-[#1F2937] flex flex-col shrink-0 overflow-hidden select-none">

          {/* Search */}
          <div className="px-3 py-2.5 border-b border-[#1F2937] shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar… (pressione /)"
                className="w-full pl-7 pr-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10.5px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-600 focus-visible:ring-1 focus-visible:ring-[#0F4C81] transition-colors duration-150"
              />
            </div>
          </div>

          {/* Elements */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2.5 space-y-1">
              {CATEGORY_CONFIG.map(({ key, label, accent, borderColor }) => {
                const defs = NODE_DEFINITIONS.filter(d =>
                  d.category === key &&
                  (searchQuery === '' ||
                    d.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    d.tooltip.toLowerCase().includes(searchQuery.toLowerCase()))
                );
                if (defs.length === 0 && searchQuery !== '') return null;
                const collapsed = collapsedCategories.has(key);

                return (
                  <div key={key}>
                    {/* Category header */}
                    <button
                      onClick={() => toggleCategory(key)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-800/40 transition-colors duration-150 cursor-pointer focus-visible:ring-1 focus-visible:ring-slate-600"
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${accent}`}>{label}</span>
                      <ChevronDown
                        className={`w-3 h-3 ${accent} transition-transform duration-200 ${collapsed ? '-rotate-90' : 'rotate-0'}`}
                      />
                    </button>

                    {!collapsed && (
                      <div className="grid grid-cols-2 gap-1.5 mb-3 px-0.5 pt-1">
                        {defs.map(def => {
                          const { Icon } = def;
                          return (
                            <button
                              key={def.type}
                              onClick={() => handleAddNewNode(def.type)}
                              title={def.tooltip}
                              style={{ borderLeftColor: borderColor }}
                              className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-[#1F2937] border border-[#374151] border-l-[3px] hover:border-slate-600 hover:bg-[#263245] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-grab active:cursor-grabbing group focus-visible:ring-1 focus-visible:ring-slate-600"
                            >
                              <Icon className={`w-4 h-4 ${def.iconColor} group-hover:scale-110 transition-transform duration-150 shrink-0`} />
                              <span className="text-[9.5px] font-semibold text-center leading-tight text-slate-300 line-clamp-2">{def.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Category separator */}
                    {!collapsed && (
                      <div
                        className="h-px mx-1 mb-2 opacity-20 rounded"
                        style={{ backgroundColor: borderColor }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Variables */}
            <div className="px-3 pb-3 border-t border-[#1F2937] pt-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Variáveis Arrastáveis</span>
              <p className="text-[9px] text-slate-500 mb-2 leading-relaxed">Arraste para o campo de texto ou clique para copiar.</p>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
                {variables.map(v => (
                  <div
                    key={v}
                    draggable
                    onDragStart={e => handleDragVarStart(e, v)}
                    onClick={() => {
                      navigator.clipboard.writeText(v).catch(() => {});
                      showToast(`"${v}" copiada!`);
                    }}
                    title="Arraste ou clique para copiar"
                    className="px-2 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-300 font-mono text-[9px] flex items-center justify-between cursor-grab active:cursor-grabbing transition-colors duration-150 font-bold"
                  >
                    <span>{v}</span>
                    <span className="text-[8px] text-[#00C896] bg-[#00C896]/10 px-1 py-0.5 rounded uppercase shrink-0">Var</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Help pinned */}
          <div className="px-3 py-2.5 border-t border-[#1F2937] bg-[#1F2937]/20 shrink-0">
            <h5 className="font-bold text-slate-300 text-[10px] flex items-center gap-1.5">
              <HelpCircle className="w-3 h-3 text-sky-400" />
              Como Funciona?
            </h5>
            <ol className="list-decimal list-inside text-[9px] text-slate-400 space-y-0.5 mt-1 leading-normal">
              <li>Arraste o fundo para navegar.</li>
              <li>Arraste as <b>bolinhas</b> para conectar nós.</li>
              <li>Duplo-clique em conexões para deletar.</li>
            </ol>
          </div>
        </div>

        {/* ── CANVAS ─────────────────────────────────────────────────────────── */}
        <div
          className="flex-1 bg-[#0F172A] relative overflow-hidden outline-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          ref={canvasRef}
          style={{
            backgroundImage: 'radial-gradient(rgba(51,65,85,0.55) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        >
          {/* Empty canvas overlay */}
          {isCanvasEmpty && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <div className="flex flex-col items-center gap-3 text-center max-w-xs px-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                  <MousePointerClick className="w-7 h-7 text-slate-500" />
                </div>
                <p className="text-slate-400 text-[12px] font-semibold leading-relaxed">
                  Arraste um elemento do painel esquerdo para começar
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <span className="animate-bounce">←</span>
                  <span>Escolha um bloco no painel</span>
                </div>
              </div>
            </div>
          )}

          {/* Zoom controls pill */}
          <div className="absolute bottom-5 left-5 bg-slate-900/70 backdrop-blur-sm border border-slate-700/60 px-1 py-1 rounded-2xl flex items-center gap-0.5 text-slate-300 z-10 select-none shadow-xl">
            <button
              onClick={() => setScale(prev => Math.min(2.0, prev + 0.1))}
              aria-label="Aumentar zoom"
              className="p-1.5 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-slate-600"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-slate-400 font-bold tabular-nums">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(prev => Math.max(0.4, prev - 0.1))}
              aria-label="Diminuir zoom"
              className="p-1.5 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-slate-600"
            >
              <ZoomIn className="w-3.5 h-3.5 rotate-180" />
            </button>
            <div className="w-px h-4 bg-slate-700 mx-0.5" />
            <button
              onClick={() => { setScale(1.0); setPan({ x: 0, y: 0 }); }}
              className="px-2 py-1 text-[9px] font-bold hover:bg-slate-800 rounded-xl cursor-pointer transition-colors duration-150 text-slate-400 hover:text-slate-200"
            >
              Reset
            </button>
          </div>

          {/* Pan container */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              position: 'absolute', top: 0, left: 0, width: '1px', height: '1px'
            }}
          >
            {/* SVG connections */}
            <svg className="absolute pointer-events-none overflow-visible" style={{ top: 0, left: 0 }}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
                </marker>
              </defs>

              {connections.map(conn => {
                const src = nodes.find(n => n.id === conn.fromNodeId);
                const tgt = nodes.find(n => n.id === conn.toNodeId);
                if (!src || !tgt) return null;
                const start = getPortCoordinates(src, conn.fromPort);
                const end   = getPortCoordinates(tgt, 'input');
                const dx    = Math.abs(end.x - start.x);
                const cp1x  = start.x + Math.max(40, dx * 0.5);
                const cp2x  = end.x - Math.max(40, dx * 0.5);
                const path  = `M ${start.x} ${start.y} C ${cp1x} ${start.y}, ${cp2x} ${end.y}, ${end.x} ${end.y}`;
                const isSel = selectedConnectionId === conn.id;
                const cx = (start.x + end.x) / 2;
                const cy = (start.y + end.y) / 2;

                return (
                  <g key={conn.id} className="pointer-events-auto">
                    <path d={path} fill="none" stroke="transparent" strokeWidth="15" className="cursor-pointer"
                      onClick={e => { setSelectedConnectionId(conn.id); setSelectedNodeId(null); e.stopPropagation(); }}
                    />
                    <path d={path} fill="none"
                      stroke={isSel ? '#38bdf8' : '#64748B'} strokeWidth={isSel ? '3' : '2'}
                      strokeDasharray={conn.fromPort.startsWith('option_') ? undefined : '4 3'}
                      markerEnd="url(#arrow)"
                      className="transition-all duration-150 cursor-pointer"
                    />
                    <g transform={`translate(${cx}, ${cy})`} className="cursor-pointer"
                      onClick={e => { setSelectedConnectionId(conn.id); setSelectedNodeId(null); e.stopPropagation(); }}
                    >
                      <rect x="-40" y="-9" width="80" height="18" rx="4" fill="#1E293B" stroke={isSel ? '#38bdf8' : '#334155'} strokeWidth="1" />
                      <text textAnchor="middle" y="4" fill={isSel ? '#38bdf8' : '#94A3B8'} style={{ fontSize: '8.5px', fontFamily: 'inherit' }}>
                        {conn.label || 'Botão Escolha'}
                      </text>
                    </g>
                    <g transform={`translate(${cx + 46}, ${cy - 11})`} className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                      onClick={e => { handleDeleteConnection(conn.id); e.stopPropagation(); }}
                    >
                      <circle r="7" fill="#EF4444" />
                      <text y="2.5" textAnchor="middle" fill="white" style={{ fontSize: '9px' }}>×</text>
                    </g>
                  </g>
                );
              })}

              {/* Drag wire */}
              {dragConnection && (() => {
                const s = { x: dragConnection.startX, y: dragConnection.startY };
                const e = { x: dragConnection.currentX, y: dragConnection.currentY };
                const dx = Math.abs(e.x - s.x);
                return (
                  <path
                    d={`M ${s.x} ${s.y} C ${s.x + Math.max(40, dx * 0.5)} ${s.y}, ${e.x - Math.max(40, dx * 0.5)} ${e.y}, ${e.x} ${e.y}`}
                    fill="none" stroke="#00C896" strokeWidth="2.5" strokeDasharray="4 4" markerEnd="url(#arrow)"
                  />
                );
              })()}
            </svg>

            {/* Node cards */}
            {nodes.map(node => {
              const isSelected  = selectedNodeId === node.id;
              const hasWarning  = isNodeWarning(node.id);
              const isSink      = isNodeSink(node.id);
              const accentColor = getNodeAccentColor(node.type);
              const def         = NODE_DEFINITIONS.find(d => d.type === node.type);

              return (
                <div
                  key={node.id}
                  className={`node-card group absolute rounded-xl select-none flex flex-col shadow-2xl transition-all duration-150 ${
                    isSelected
                      ? 'ring-2 ring-[#0F4C81] shadow-[0_0_18px_rgba(15,76,129,0.35)] scale-[1.01]'
                      : hasWarning
                        ? 'ring-1 ring-amber-500/50'
                        : ''
                  }`}
                  style={{
                    width: `${NODE_WIDTH}px`,
                    transform: `translate(${node.x}px, ${node.y}px)`,
                    backgroundColor: '#1E293B',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: isSelected ? '#38bdf8' : hasWarning ? 'rgba(245,158,11,0.6)' : '#334155',
                  }}
                  onMouseDown={e => {
                    const target = e.target as HTMLElement;
                    if (target.closest('.port-dots') || target.closest('input') || target.closest('textarea')) return;
                    setDraggedNode({
                      id: node.id,
                      offsetX: (e.clientX - canvasRef.current!.getBoundingClientRect().left - pan.x) / scale - node.x,
                      offsetY: (e.clientY - canvasRef.current!.getBoundingClientRect().top  - pan.y) / scale - node.y,
                    });
                    setSelectedNodeId(node.id);
                    setSelectedConnectionId(null);
                    e.stopPropagation();
                  }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const txt = e.dataTransfer.getData('text/plain');
                    if (txt) setNodes(prev => prev.map(n => n.id === node.id ? { ...n, text: n.text + ' ' + txt } : n));
                  }}
                >
                  {/* Card header with category accent */}
                  <div
                    className="px-3 py-2.5 rounded-t-xl flex justify-between items-center border-b"
                    style={{
                      borderBottomColor: 'rgba(51,65,85,0.5)',
                      backgroundColor: node.type === 'inicio' ? '#1E3A8A' : `${accentColor}12`,
                    }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {node.type === 'inicio'
                        ? <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: '#00C896' }} />
                        : def && <def.Icon className={`w-3.5 h-3.5 ${def.iconColor} shrink-0`} />
                      }
                      <span
                        className="text-[10.5px] font-black truncate leading-tight tracking-wide uppercase"
                        style={{ color: node.type === 'inicio' ? '#e2e8f0' : accentColor }}
                      >
                        {node.title}
                      </span>
                    </div>

                    {node.id !== 'inicio' && (
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteNode(node.id); }}
                        aria-label="Deletar nó"
                        className="p-1 hover:bg-slate-800 text-slate-500 hover:text-red-400 rounded transition-all duration-150 cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Input port */}
                  {node.type !== 'inicio' && (
                    <div
                      className="port-dots absolute left-0 top-[55px] w-3 h-3 border-2 border-slate-900 rounded-full cursor-crosshair -translate-x-[6px] -translate-y-[6px] flex items-center justify-center transition-all duration-150 hover:scale-150 group/port"
                      style={{ backgroundColor: '#334155' }}
                      title="Arraste para conectar"
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#00C896')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#334155')}
                    />
                  )}

                  {/* Card content */}
                  <div className="p-3 space-y-2.5 font-medium text-[10.5px]">
                    <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 text-slate-300 font-normal leading-relaxed line-clamp-3 select-none">
                      {node.text || <em className="text-slate-500">Sem conteúdo definido…</em>}
                    </div>

                    {!IMPLEMENTED_TYPES.has(node.type) && (
                      <div className="flex items-center gap-1 bg-slate-800/50 text-slate-500 text-[8.5px] px-2 py-0.5 rounded border border-slate-700/50">
                        <span>⚙ Em desenvolvimento</span>
                      </div>
                    )}

                    {node.type === 'delay' && (
                      <div className="flex items-center gap-1.5 text-amber-500 text-[10px] bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Esperar <strong>{node.delaySeconds}s</strong></span>
                      </div>
                    )}

                    {hasWarning && (
                      <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[9px] px-2 py-0.5 rounded border border-amber-500/20">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>Sem conexão de entrada</span>
                      </div>
                    )}

                    {isSink && (
                      <span className="text-[9px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded italic w-max block font-mono">
                        🚩 Fim do fluxo
                      </span>
                    )}

                    {node.options.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Portas:</span>
                        {node.options.map((opt, oIdx) => {
                          const portKey = `option_${oIdx}`;
                          return (
                            <div key={portKey} className="relative flex justify-between items-center bg-slate-900 px-2.5 py-1.5 rounded text-slate-200 border border-slate-800 text-[10px] font-semibold">
                              <span className="truncate pr-4">{opt}</span>
                              <div
                                className="port-dots absolute right-0 top-1/2 w-3.5 h-3.5 border-2 border-[#1E293B] rounded-full cursor-crosshair translate-x-[7px] -translate-y-1/2 flex items-center justify-center transition-all duration-150 hover:scale-125 select-none"
                                style={{ backgroundColor: '#334155' }}
                                title="Arraste para ligar a outro nó"
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#00C896')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#334155')}
                                onMouseDown={e => {
                                  const coords = getPortCoordinates(node, portKey);
                                  setDragConnection({ fromNodeId: node.id, fromPort: portKey, startX: coords.x, startY: coords.y, currentX: coords.x, currentY: coords.y });
                                  e.stopPropagation();
                                  e.preventDefault();
                                }}
                              >
                                <Plus className="w-2 h-2 text-[#00C896]" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {node.options.length === 0 && (
                      <div className="flex justify-between items-center pt-1 text-[9.5px] text-slate-500">
                        <span>Ligar Próximo</span>
                        <div
                          className="port-dots w-3.5 h-3.5 border-2 border-[#1E293B] rounded-full cursor-crosshair flex items-center justify-center transition-all duration-150 hover:scale-125 select-none"
                          style={{ backgroundColor: '#334155' }}
                          title="Arraste para ligar à próxima ação"
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#00C896')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#334155')}
                          onMouseDown={e => {
                            const coords = getPortCoordinates(node, 'output');
                            setDragConnection({ fromNodeId: node.id, fromPort: 'output', startX: coords.x, startY: coords.y, currentX: coords.x, currentY: coords.y });
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                        >
                          <Plus className="w-2 h-2 text-sky-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── PANEL RIGHT ────────────────────────────────────────────────────── */}
        <div className="w-72 bg-[#111827] border-l border-[#1F2937] flex flex-col select-none overflow-y-auto font-sans leading-normal shrink-0">

          {/* Node editor */}
          {selectedNodeId && (() => {
            const node = nodes.find(n => n.id === selectedNodeId);
            if (!node) return <div className="p-4 text-slate-500 text-[11px]">Nenhum elemento selecionado…</div>;
            const accentColor = getNodeAccentColor(node.type);

            return (
              <div className="p-4 space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: accentColor }}>Editor de Nó</span>
                  <h4 className="font-display font-black text-xs text-white uppercase mt-0.5">{node.title}</h4>
                </div>

                {/* Title */}
                <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/60 space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Nome Personalizado</label>
                  <input
                    type="text" value={node.title}
                    onChange={e => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, title: e.target.value } : n))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0F4C81] focus-visible:ring-1 focus-visible:ring-[#0F4C81] transition-colors duration-150"
                  />
                </div>

                {/* Delay */}
                {node.type === 'delay' && (
                  <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/60 space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block">Tempo de Espera (segundos)</label>
                    <input
                      type="number" min="1" max="60" value={node.delaySeconds}
                      onChange={e => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, delaySeconds: parseInt(e.target.value) || 1 } : n))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0F4C81] transition-colors duration-150"
                    />
                  </div>
                )}

                {/* Text */}
                <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/60 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Texto de Resposta</label>
                    <span className="text-[8px] text-slate-600 bg-slate-900 px-1 py-0.5 rounded font-mono font-bold">Sincronizado</span>
                  </div>
                  <textarea
                    value={node.text} rows={6} placeholder="Olá, marque seu corte…"
                    onChange={e => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, text: e.target.value } : n))}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs leading-relaxed font-medium focus:outline-none focus:border-[#0F4C81] focus-visible:ring-1 focus-visible:ring-[#0F4C81] transition-colors duration-150 resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] text-slate-600 italic">Use {'{}'} variáveis do painel esquerdo.</p>
                    <span className="text-[9px] text-slate-600 font-mono tabular-nums">{node.text.length}c</span>
                  </div>
                </div>

                {/* Options */}
                {node.options.length > 0 && (
                  <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/60 space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wide block">Botões de Opção</span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {node.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex gap-1.5 items-center">
                          <input
                            type="text" value={opt}
                            onChange={e => {
                              const updated = [...node.options];
                              updated[oIdx] = e.target.value;
                              setConnections(prev => prev.map(c =>
                                c.fromNodeId === node.id && c.fromPort === `option_${oIdx}`
                                  ? { ...c, label: e.target.value } : c
                              ));
                              setNodes(prev => prev.map(n => n.id === node.id ? { ...n, options: updated } : n));
                            }}
                            className="bg-slate-900 border border-slate-800 text-slate-200 px-2 py-1 rounded text-[11px] focus:outline-none flex-1 font-semibold focus:border-[#0F4C81] transition-colors duration-150"
                          />
                          <button
                            onClick={() => {
                              const updated = node.options.filter((_, i) => i !== oIdx);
                              setConnections(prev => prev.filter(c => !(c.fromNodeId === node.id && c.fromPort === `option_${oIdx}`)));
                              setNodes(prev => prev.map(n => n.id === node.id ? { ...n, options: updated } : n));
                            }}
                            className="p-1 hover:bg-slate-800 text-slate-500 hover:text-red-400 rounded cursor-pointer transition-colors duration-150"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, options: [...n.options, `Nova Opção ${n.options.length + 1}`] } : n))}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 rounded-lg text-[10px] uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-slate-600"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#00C896]" />
                      Adicionar Opção
                    </button>
                  </div>
                )}

                {/* Type converter */}
                <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/60 space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Converter Tipo de Nó</label>
                  <select
                    value={node.type}
                    onChange={e => {
                      const nextType = e.target.value as FlowNodeType;
                      const optsMap: { [k: string]: string[] } = {
                        inicio: ['Opção 1', 'Opção 2'], texto: [], pergunta: ['Sim', 'Não'],
                        condicao: ['Caso Verdadeiro', 'Caso Falso'], delay: []
                      };
                      setNodes(prev => prev.map(n => n.id === node.id ? { ...n, type: nextType, options: optsMap[nextType] || [] } : n));
                      setConnections(prev => prev.filter(c => c.fromNodeId !== node.id));
                    }}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#0F4C81] transition-colors duration-150"
                  >
                    <option value="texto">Mensagem de Texto</option>
                    <option value="pergunta">Pergunta com Botões</option>
                    <option value="condicao">Condição Bifurcada</option>
                    <option value="delay">Atraso (Delay)</option>
                  </select>
                </div>

                {node.id !== 'inicio' && (
                  <button
                    onClick={() => handleDeleteNode(node.id)}
                    className="w-full py-2 bg-red-600/10 hover:bg-red-600 border border-red-500/20 hover:border-red-600 text-red-400 hover:text-white font-black text-[10.5px] uppercase tracking-wider rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir Nó
                  </button>
                )}
              </div>
            );
          })()}

          {/* Connection editor */}
          {selectedConnectionId && (() => {
            const conn = connections.find(c => c.id === selectedConnectionId);
            if (!conn) return <div className="p-4 text-slate-500 text-[11px]">Nenhum elemento selecionado…</div>;

            return (
              <div className="p-4 space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF6B35]">Editor de Conexão</span>
                  <h4 className="font-display font-black text-xs text-white uppercase mt-0.5">Opção de Escolha</h4>
                </div>

                <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/60 space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Rótulo (Label)</label>
                  <input
                    type="text" value={conn.label || ''}
                    onChange={e => setConnections(prev => prev.map(c => c.id === conn.id ? { ...c, label: e.target.value } : c))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0F4C81] transition-colors duration-150"
                  />
                  <p className="text-[9.5px] text-slate-600 leading-normal">Texto exibido no botão de resposta do WhatsApp.</p>
                </div>

                <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-800/50 space-y-1.5 text-[9.5px] text-slate-400">
                  <p><strong className="text-slate-300">Origem:</strong> {nodes.find(n => n.id === conn.fromNodeId)?.title}</p>
                  <p><strong className="text-slate-300">Destino:</strong> {nodes.find(n => n.id === conn.toNodeId)?.title}</p>
                </div>

                <button
                  onClick={() => handleDeleteConnection(conn.id)}
                  className="w-full py-2 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white font-black text-[10.5px] uppercase tracking-wider rounded-lg border border-red-500/20 hover:border-red-600 transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Deletar Conexão
                </button>
              </div>
            );
          })()}

          {/* Template editor (nothing selected) */}
          {!selectedNodeId && !selectedConnectionId && (() => {
            const currentTemplate = templates.find(t => t.id === activeTemplate) || templates[0];
            return (
              <div className="p-4 space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#00C896]">Editor de Mensagens</span>
                  <h4 className="font-display font-black text-xs text-white uppercase mt-0.5">Templates</h4>
                </div>

                {/* Template selector */}
                <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/60 space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Selecionar Template</label>
                  <div className="flex flex-wrap gap-1.5">
                    {templates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTemplate(t.id)}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all duration-150 cursor-pointer ${
                          activeTemplate === t.id
                            ? 'bg-[#0F4C81]/20 border-[#0F4C81] text-sky-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                    {!isAddingTemplate ? (
                      <button
                        onClick={() => setIsAddingTemplate(true)}
                        className="px-2.5 py-1 rounded-lg border border-dashed border-[#0F4C81]/40 bg-[#0F4C81]/5 text-sky-400 text-[10px] font-bold cursor-pointer flex items-center gap-1 hover:bg-[#0F4C81]/10 transition-colors duration-150"
                      >
                        <Sparkles className="w-3 h-3" />+ Nova
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                        <input
                          type="text" value={newTemplateLabel} placeholder="Nome…" autoFocus
                          onChange={e => setNewTemplateLabel(e.target.value)}
                          className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] focus:outline-none w-20 text-slate-200 font-semibold"
                          onKeyDown={e => { if (e.key === 'Enter') handleAddTemplate(); if (e.key === 'Escape') setIsAddingTemplate(false); }}
                        />
                        <button onClick={handleAddTemplate} className="p-1 bg-[#00C896] text-white rounded cursor-pointer"><Check className="w-2.5 h-2.5" /></button>
                        <button onClick={() => setIsAddingTemplate(false)} className="p-1 bg-slate-700 text-slate-300 rounded cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Textarea */}
                {currentTemplate && (
                  <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/60 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Texto de Resposta</label>
                      <span className="text-[8px] text-slate-600 bg-slate-900 px-1 py-0.5 rounded font-mono font-bold">Sincronizado</span>
                    </div>
                    <textarea
                      value={currentTemplate.text} rows={6}
                      onChange={e => setTemplates(prev => prev.map(t => t.id === activeTemplate ? { ...t, text: e.target.value } : t))}
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs leading-relaxed font-medium focus:outline-none focus:border-[#0F4C81] focus-visible:ring-1 focus-visible:ring-[#0F4C81] transition-colors duration-150 resize-none"
                    />
                    <div className="flex justify-end">
                      <span className="text-[9px] text-slate-600 font-mono tabular-nums">{currentTemplate.text.length}c</span>
                    </div>
                  </div>
                )}

                {/* Variables */}
                <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/60 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block">Variáveis disponíveis</span>
                  <div className="flex flex-wrap gap-1.5">
                    {variables.map(v => (
                      <button
                        key={v}
                        onClick={() => currentTemplate && setTemplates(prev => prev.map(t => t.id === activeTemplate ? { ...t, text: t.text + ' ' + v } : t))}
                        title="Clique para inserir no texto"
                        className="bg-slate-900 text-sky-400 font-mono text-[9px] px-2 py-0.5 rounded border border-slate-700 font-bold hover:bg-slate-800 hover:border-sky-400/40 cursor-pointer transition-colors duration-150"
                      >
                        {v}
                      </button>
                    ))}
                    {!isAddingVariable ? (
                      <button
                        onClick={() => setIsAddingVariable(true)}
                        className="bg-[#00C896]/10 hover:bg-[#00C896]/20 text-[#00C896] text-[9px] px-2 py-0.5 rounded border border-[#00C896]/30 font-bold cursor-pointer transition-colors duration-150"
                      >
                        + Variável
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
                        <span className="text-[9px] font-mono text-slate-500 ml-1">{'{'}</span>
                        <input
                          type="text" value={newVariableName} placeholder="nome" autoFocus
                          onChange={e => setNewVariableName(e.target.value)}
                          className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] font-mono focus:outline-none w-14 text-slate-200 font-semibold"
                          onKeyDown={e => { if (e.key === 'Enter') handleAddVariable(); if (e.key === 'Escape') setIsAddingVariable(false); }}
                        />
                        <span className="text-[9px] font-mono text-slate-500">{'}'}</span>
                        <button onClick={handleAddVariable} className="p-0.5 bg-[#00C896] text-white rounded cursor-pointer"><Check className="w-2.5 h-2.5" /></button>
                        <button onClick={() => setIsAddingVariable(false)} className="p-0.5 bg-slate-700 text-slate-300 rounded cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[9px] text-slate-600 italic leading-normal pt-1">
                  Clique em um nó no canvas para editar suas portas e texto.
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── SIMULATOR ──────────────────────────────────────────────────────────── */}
      {isSimulating && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl h-[520px]">
            <div className="bg-[#075e54] text-white p-4 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Bot className="w-9 h-9 p-1.5 bg-[#128C7E] rounded-full border border-teal-500" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#075e54] rounded-full" />
                </div>
                <div>
                  <h4 className="font-bold text-xs">Simulador Chatbot</h4>
                  <span className="text-[10px] text-teal-100 block -mt-0.5">Testando resposta automática</span>
                </div>
              </div>
              <button
                onClick={() => setIsSimulating(false)}
                aria-label="Fechar simulador"
                className="p-1 hover:bg-black/10 rounded-lg text-teal-100 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col"
              style={{ backgroundSize: 'contain', backgroundColor: '#efeae2' }}
            >
              {simMessages.length === 0 && (
                <div className="my-auto text-center p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200 max-w-[80%] mx-auto">
                  <span className="text-xl">🤖</span>
                  <p className="text-slate-800 font-bold text-xs mt-1">Carregando fluxo…</p>
                </div>
              )}
              {simMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-xs max-w-[85%] leading-relaxed shadow-sm relative ${
                    msg.sender === 'bot'
                      ? 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                      : 'bg-[#DCF8C6] text-slate-800 rounded-tr-none ml-auto border border-[#c1e8a2]'
                  }`}
                >
                  <p className="whitespace-pre-line font-medium leading-relaxed text-[11px] text-left">{msg.text}</p>
                  <span className="text-[8px] text-slate-400 mt-1 block text-right font-mono select-none">{msg.time}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#F0F2F5] border-t border-slate-200 p-4 shrink-0 flex flex-col gap-2">
              <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Respostas do Cliente:</span>
              {simActiveNodeId && (() => {
                const childConns = connections.filter(c => c.fromNodeId === simActiveNodeId);
                const currentNode = nodes.find(n => n.id === simActiveNodeId);
                if (childConns.length === 0) {
                  return <div className="text-center py-2 text-[10px] text-slate-500 italic">🏁 Fim do fluxo.</div>;
                }
                return (
                  <div className="grid grid-cols-2 gap-2">
                    {childConns.map(conn => {
                      const idx = conn.fromPort.startsWith('option_') ? parseInt(conn.fromPort.split('_')[1], 10) : 0;
                      return (
                        <button
                          key={conn.id}
                          onClick={() => handleSimOptionClick(idx, conn.toNodeId)}
                          className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-teal-600 rounded-lg text-[10.5px] truncate font-bold cursor-pointer transition-colors shadow-sm active:bg-teal-50"
                        >
                          {conn.label || currentNode?.options[idx] || 'Avançar'}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              <div className="flex gap-2 pt-3 border-t border-slate-200/80 mt-1">
                <button onClick={handleStartSimulation} className="flex-1 px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-bold text-[10px] uppercase cursor-pointer transition-colors">
                  Reiniciar
                </button>
                <button onClick={() => setIsSimulating(false)} className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] uppercase cursor-pointer transition-colors">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
