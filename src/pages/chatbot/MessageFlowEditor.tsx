/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Save, 
  Grid3X3, 
  Minimize2, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  Settings, 
  HelpCircle,
  FileText,
  HelpCircle as QuestionIcon,
  Clock,
  Image,
  AlertCircle,
  Send,
  User,
  Bot
} from 'lucide-react';

interface FlowNode {
  id: string;
  type: 'inicio' | 'texto' | 'pergunta' | 'condicao' | 'delay';
  title: string;
  text: string;
  x: number;
  y: number;
  options: string[]; // Options for pergunta (buttons) or conditions
  delaySeconds: number;
}

interface FlowConnection {
  id: string;
  fromNodeId: string;
  fromPort: string; // 'output' or 'option_0', 'option_1', etc.
  toNodeId: string;
  label?: string;
}

interface MessageFlowEditorProps {
  onBack: () => void;
  onSave: (flowJson: string) => void;
  initialTemplates?: Array<{ id: string; label: string; text: string }>;
}

export default function MessageFlowEditor({ onBack, onSave, initialTemplates }: MessageFlowEditorProps) {
  // Nodes state
  const [nodes, setNodes] = useState<FlowNode[]>(() => {
    // Attempt loading or create beautiful defaults
    return [
      {
        id: 'inicio',
        type: 'inicio',
        title: 'Boas-vindas (Início)',
        text: 'Olá, {nome_cliente}! 🤖 Seja bem-vindo à Barbearia Navalha de Ouro.\n Como posso te ajudar hoje?\n\n1. Agendar novo horário\n2. Ver nossos serviços\n3. Falar com Atendente',
        x: 80,
        y: 200,
        options: ['Agendar Horário', 'Ver Serviços', 'Falar com Atendente'],
        delaySeconds: 1
      },
      {
        id: 'agendar',
        type: 'texto',
        title: 'Agendar Horário',
        text: 'Excelente! Vamos receber seu agendamento. Digite a data e horário desejados ou confirme no link a seguir: barber.com/agendar 🚀',
        x: 480,
        y: 120,
        options: ['Confirmar', 'Voltar ao início'],
        delaySeconds: 1
      },
      {
        id: 'servicos',
        type: 'pergunta',
        title: 'Escolher Serviço',
        text: 'Conheça nossos principais serviços:\n💈 Corte Degradê - R$ 45\n🧔 Barba Completa - R$ 35\n🔥 Combo Premium - R$ 75',
        x: 480,
        y: 350,
        options: ['Agendar Combo', 'Voltar'],
        delaySeconds: 1
      },
      {
        id: 'atendente',
        type: 'texto',
        title: 'Transbordo Humano',
        text: 'Encaminhando seu contato para nosso atendimento humano de plantão. Aguarde 1 minuto por favor...',
        x: 480,
        y: 600,
        options: [],
        delaySeconds: 2
      }
    ];
  });

  // Connections state
  const [connections, setConnections] = useState<FlowConnection[]>([
    { id: 'conn_1', fromNodeId: 'inicio', fromPort: 'option_0', toNodeId: 'agendar', label: 'Opção 1' },
    { id: 'conn_2', fromNodeId: 'inicio', fromPort: 'option_1', toNodeId: 'servicos', label: 'Opção 2' },
    { id: 'conn_3', fromNodeId: 'inicio', fromPort: 'option_2', toNodeId: 'atendente', label: 'Opção 3' }
  ]);

  // Variables list
  const [variables] = useState([
    '{nome_cliente}',
    '{horario}',
    '{data}',
    '{profissional}',
    '{servico}',
    '{valor_total}',
    '{codigo_fidelidade}'
  ]);

  // Viewport parameters state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Selected elements
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('inicio');
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  // Drag-to-connect operational state
  const [dragConnection, setDragConnection] = useState<{
    fromNodeId: string;
    fromPort: string;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Node dragging operational state
  const [draggedNode, setDraggedNode] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simMessages, setSimMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([]);
  const [simActiveNodeId, setSimActiveNodeId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Dynamic values helper
  const NODE_WIDTH = 250;
  const PORT_RADIUS = 6;

  // Compute precise coordinates for ports in Canvas Space:
  const getPortCoordinates = (node: FlowNode, portType: 'input' | 'output' | string) => {
    const x = node.x;
    const y = node.y;
    
    // Header is 40px height. Let's place inputs and outputs dynamically.
    if (portType === 'input') {
      return { x: x, y: y + 55 };
    }
    
    if (portType === 'output') {
      return { x: x + NODE_WIDTH, y: y + 55 };
    }
    
    if (portType.startsWith('option_')) {
      const idx = parseInt(portType.split('_')[1], 10);
      // Options are rendered inside cards starting around y + 100 with spacing
      return { x: x + NODE_WIDTH, y: y + 120 + idx * 34 };
    }
    
    return { x: x + NODE_WIDTH, y: y + 55 };
  };

  // Drag variables directly to textareas via HTML5 drag-and-drop
  const handleDragVarStart = (e: React.DragEvent, val: string) => {
    e.dataTransfer.setData('text/plain', val);
  };

  // Pan canvas handler
  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicking ports or node cards, don't pan canvas
    const target = e.target as HTMLElement;
    if (target.closest('.node-card') || target.closest('.port-dots')) {
      return;
    }
    
    if (e.button === 0 || e.button === 1) { // Left click background or middle click
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (draggedNode) {
      // Calculate delta position adjusted with scale
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseXInCanvas = (e.clientX - rect.left - pan.x) / scale;
        const mouseYInCanvas = (e.clientY - rect.top - pan.y) / scale;
        
        setNodes(prev => prev.map(node => {
          if (node.id === draggedNode.id) {
            return {
              ...node,
              x: Math.round(mouseXInCanvas - draggedNode.offsetX),
              y: Math.round(mouseYInCanvas - draggedNode.offsetY)
            };
          }
          return node;
        }));
      }
      return;
    }

    if (dragConnection) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseXInCanvas = (e.clientX - rect.left - pan.x) / scale;
        const mouseYInCanvas = (e.clientY - rect.top - pan.y) / scale;
        
        setDragConnection(prev => prev ? {
          ...prev,
          currentX: mouseXInCanvas,
          currentY: mouseYInCanvas
        } : null);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsPanning(false);
    setDraggedNode(null);

    if (dragConnection) {
      // Check if dropped near any input port of nodes (excluding the originator itself)
      let foundNodeId: string | null = null;
      
      for (const node of nodes) {
        if (node.id === dragConnection.fromNodeId) continue;
        
        const inputCoords = getPortCoordinates(node, 'input');
        const distance = Math.hypot(dragConnection.currentX - inputCoords.x, dragConnection.currentY - inputCoords.y);
        
        // Match margin tolerance of 24px
        if (distance < 28) {
          foundNodeId = node.id;
          break;
        }
      }

      if (foundNodeId) {
        // Create new unique connection
        const newConnection: FlowConnection = {
          id: 'conn_' + Date.now(),
          fromNodeId: dragConnection.fromNodeId,
          fromPort: dragConnection.fromPort,
          toNodeId: foundNodeId,
          label: nodes.find(n => n.id === dragConnection.fromNodeId)?.options[
            parseInt(dragConnection.fromPort.split('_')[1], 10)
          ] || 'Progresso'
        };

        // Enforce max 1 connection per unique source port && max 1 input per node (as per rule)
        setConnections(prev => {
          // Remove old connection originating from the exact same port or targeting same node
          const cleared = prev.filter(c => 
            !(c.fromNodeId === newConnection.fromNodeId && c.fromPort === newConnection.fromPort) &&
            !(c.toNodeId === newConnection.toNodeId)
          );
          return [...cleared, newConnection];
        });
      }
      
      setDragConnection(null);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomIntensity = 0.05;
    let nextScale = scale;
    if (e.deltaY < 0) {
      nextScale = Math.min(2.0, scale + zoomIntensity);
    } else {
      nextScale = Math.max(0.4, scale - zoomIntensity);
    }
    setScale(nextScale);
  };

  // Add a new node
  const handleAddNewNode = (type: 'texto' | 'pergunta' | 'condicao' | 'delay') => {
    // Spawn new node on a clear offset of active viewport center
    const id = 'node_' + Date.now();
    const titles_map = {
      texto: 'Mensagem de Texto',
      pergunta: 'Pergunta com Opções',
      condicao: 'Condição Se / Senão',
      delay: 'Temporizador'
    };

    const text_map = {
      texto: 'Digite o conteúdo da sua nova mensagem aqui...',
      pergunta: 'Deseja confirmar nossa sugestão?\n\nSelecione uma opção alternativa abaixo:',
      condicao: 'Se {horario} for maior que 18:00...',
      delay: 'Aguardar 5 segundos antes de responder...'
    };

    const options_map = {
      texto: [],
      pergunta: ['Opção A', 'Opção B'],
      condicao: ['Sucesso', 'Caso Contrário'],
      delay: []
    };

    const newNode: FlowNode = {
      id,
      type,
      title: titles_map[type],
      text: text_map[type],
      x: Math.round(-pan.x / scale + 150 + Math.random() * 80),
      y: Math.round(-pan.y / scale + 100 + Math.random() * 80),
      options: options_map[type],
      delaySeconds: type === 'delay' ? 5 : 1
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(id);
    setSelectedConnectionId(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === 'inicio') {
      alert('O nó inicial de boas-vindas não pode ser excluído por razões de integridade do bot.');
      return;
    }

    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  const handleDeleteConnection = (connId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
    if (selectedConnectionId === connId) {
      setSelectedConnectionId(null);
    }
  };

  // Auto layout organization algorithm (Breadth-First Search Layout Tree helper)
  const handleAutoOrganize = () => {
    const arrangedIds = new Set<string>();
    const nodeLevels: { [key: string]: number } = {};
    const queue: string[] = ['inicio'];
    
    nodeLevels['inicio'] = 0;
    arrangedIds.add('inicio');

    // Mapped adj list for tree organization direction
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentLevel = nodeLevels[currentId];

      const childrenConns = connections.filter(c => c.fromNodeId === currentId);
      childrenConns.forEach((conn, index) => {
        const childId = conn.toNodeId;
        if (!arrangedIds.has(childId)) {
          nodeLevels[childId] = currentLevel + 1;
          arrangedIds.add(childId);
          queue.push(childId);
        }
      });
    }

    // Place unconected nodes on level 0 but segregated vertically
    let unconnectedOffset = 1;
    nodes.forEach(node => {
      if (nodeLevels[node.id] === undefined) {
        nodeLevels[node.id] = 0;
        unconnectedOffset++;
      }
    });

    // Positions mapping based on levels
    const levelCounts: { [key: number]: number } = {};
    
    setNodes(prev => {
      return prev.map(node => {
        const lvl = nodeLevels[node.id] ?? 0;
        const indexInLvl = levelCounts[lvl] ?? 0;
        levelCounts[lvl] = indexInLvl + 1;

        // Custom grid coordinates
        const xPos = 80 + lvl * 320;
        const yPos = 180 + indexInLvl * 210;

        return {
          ...node,
          x: xPos,
          y: yPos
        };
      });
    });

    // Reset view pan to fit standard initial nodes neatly
    setScale(0.9);
    setPan({ x: 30, y: 10 });
  };

  // Simulator Conversation logic
  const handleStartSimulation = () => {
    setIsSimulating(true);
    setSimMessages([]);
    setSimActiveNodeId('inicio');

    // Auto load starter greeting
    const inicioNode = nodes.find(n => n.id === 'inicio');
    if (inicioNode) {
      setTimeout(() => {
        setSimMessages([{
          sender: 'bot',
          text: renderTemplateText(inicioNode.text),
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 500);
    }
  };

  const handleSimOptionClick = (optionIndex: number, targetNodeId: string) => {
    const parentNode = nodes.find(n => n.id === simActiveNodeId);
    const textOption = parentNode?.options[optionIndex] || 'Opção';

    // 1. User message bubble
    const userMsg = {
      sender: 'user' as const,
      text: textOption,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setSimMessages(prev => [...prev, userMsg]);
    setSimActiveNodeId(targetNodeId);

    // 2. Fetch destination Node & trigger typing delay simulate
    const targetNode = nodes.find(n => n.id === targetNodeId);
    if (targetNode) {
      setTimeout(() => {
        const botMsg = {
          sender: 'bot' as const,
          text: renderTemplateText(targetNode.text),
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        setSimMessages(prev => [...prev, botMsg]);
      }, 800 + (targetNode.delaySeconds * 400));
    }
  };

  // Simple string replacing variables with readable mockup stats
  const renderTemplateText = (text: string) => {
    let output = text;
    // Mock mapping values
    const mapObj: { [key: string]: string } = {
      '{nome_cliente}': 'Gabriel Gustavo',
      '{horario}': '16:30',
      '{data}': '21/05/2026',
      '{profissional}': 'Alan Mota (Barbeiro)',
      '{servico}': 'Corte Degradê + Sobrancelha',
      '{valor_total}': 'R$ 55,00',
      '{codigo_fidelidade}': 'FID-9921'
    };

    Object.keys(mapObj).forEach(key => {
      output = output.replace(new RegExp(key, 'g'), mapObj[key]);
    });
    return output;
  };

  // Verify warning statuses for nodes
  const isNodeWarning = (id: string) => {
    if (id === 'inicio') return false;
    // Check if there is any inbound wire
    const hasIncoming = connections.some(c => c.toNodeId === id);
    return !hasIncoming;
  };

  // Verify custom label for sink nodes
  const isNodeSink = (id: string) => {
    // Check if there is any outbound wire
    const hasOutgoing = connections.some(c => c.fromNodeId === id);
    return !hasOutgoing;
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A] text-slate-100 flex flex-col font-sans z-50 overflow-hidden text-left text-xs">
      
      {/* HEADER BAR */}
      <div className="bg-[#1E293B] border-b border-[#334155] px-5 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Voltar ao Editor Simples"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 bg-[#0F4C81] text-white rounded text-[10px] font-bold font-sans tracking-wide">PRO FLOV</span>
              <h2 className="text-sm font-display font-black text-white">Visual Flow Builder (Canvas)</h2>
            </div>
            <p className="text-[10.5px] text-slate-400 font-medium">Configure as condicionais de resposta arrastando nós e conexões do chatbot.</p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoOrganize}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reorganizar Nós Automático"
          >
            <Grid3X3 className="w-3.5 h-3.5 text-[#00C896]" />
            Auto-organizar
          </button>

          <button
            onClick={handleStartSimulation}
            className="px-3 py-1.5 rounded-lg bg-[#00C896] hover:bg-[#00C896]/90 text-white font-black text-[11px] flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Testar Fluxo
          </button>

          <button
            onClick={() => {
              onSave(JSON.stringify({ nodes, connections }));
              alert('Estrutura de fluxo de chatbot visual salva com extremo sucesso!');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-black text-[11px] flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Salvar Fluxo
          </button>

          <button 
            type="button"
            onClick={onBack}
            className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer font-bold shrink-0 ml-1.5"
            title="Fechar Editor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CORE WORKSPACE AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* PANEL LEFT: ADD NODES & VARIABLE TAGS */}
        <div className="w-56 bg-[#111827] border-r border-[#1F2937] p-4 flex flex-col justify-between shrink-0 overflow-y-auto select-none">
          
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">1. Elementos do Chat</span>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleAddNewNode('texto')}
                  className="w-full text-left p-2.5 rounded-lg bg-[#1F2937] border border-[#374151] hover:border-[#0F4C81] hover:bg-[#1E293B]/60 text-slate-200 transition-colors cursor-pointer flex items-center gap-2 font-semibold"
                >
                  <FileText className="w-4 h-4 text-[#00C896]" />
                  <div>
                    <p className="text-[11px] font-bold">Mensagem Texto</p>
                    <p className="text-[9px] text-slate-400 -mt-0.5">Resposta direta imediata</p>
                  </div>
                </button>

                <button
                  onClick={() => handleAddNewNode('pergunta')}
                  className="w-full text-left p-2.5 rounded-lg bg-[#1F2937] border border-[#374151] hover:border-[#0F4C81] hover:bg-[#1E293B]/60 text-slate-200 transition-colors cursor-pointer flex items-center gap-2 font-semibold"
                >
                  <QuestionIcon className="w-4 h-4 text-[#FF6B35]" />
                  <div>
                    <p className="text-[11px] font-bold">Menu / Botões</p>
                    <p className="text-[9px] text-slate-400 -mt-0.5">Com opções de escolha</p>
                  </div>
                </button>

                <button
                  onClick={() => handleAddNewNode('condicao')}
                  className="w-full text-left p-2.5 rounded-lg bg-[#1F2937] border border-[#374151] hover:border-[#0F4C81] hover:bg-[#1E293B]/60 text-slate-200 transition-colors cursor-pointer flex items-center gap-2 font-semibold"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-[11px] font-bold">Condição Inteligente</p>
                    <p className="text-[9px] text-slate-400 -mt-0.5">Valida dia/hora ou campo</p>
                  </div>
                </button>

                <button
                  onClick={() => handleAddNewNode('delay')}
                  className="w-full text-left p-2.5 rounded-lg bg-[#1F2937] border border-[#374151] hover:border-[#0F4C81] hover:bg-[#1E293B]/60 text-slate-200 transition-colors cursor-pointer flex items-center gap-2 font-semibold"
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-[11px] font-bold">Atraso / Delay</p>
                    <p className="text-[9px] text-slate-400 -mt-0.5">Simula digitação real</p>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">2. Variáveis Arrastáveis</span>
              <p className="text-[9.5px] text-slate-500 mb-2 leading-relaxed">Arraste uma variável do painel diretamente para o campo de texto do nó ou clique para copiar.</p>
              
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {variables.map(v => (
                  <div
                    key={v}
                    draggable
                    onDragStart={(e) => handleDragVarStart(e, v)}
                    onClick={() => {
                      navigator.clipboard.writeText(v);
                      alert(`Variável "${v}" copiada! Role qualquer nó selecionado e cole nela.`);
                    }}
                    className="px-2 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-300 font-mono text-[9px] flex items-center justify-between cursor-grab font-bold shadow-xs active:cursor-grabbing transition-colors"
                    title="Segure para arrastar ao textarea d-n-d ou clique para copiar"
                  >
                    <span>{v}</span>
                    <span className="text-[8.5px] text-[#00C896] bg-[#00C896]/10 px-1 py-0.5 rounded uppercase">Variável</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#1F2937]/50 rounded-xl p-3 border border-[#374151] mt-6">
            <h5 className="font-bold text-slate-300 text-[10px] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              Como Funciona?
            </h5>
            <ol className="list-decimal list-inside text-[9px] text-slate-400 space-y-1 mt-1 leading-normal">
              <li>Arraste o fundo do canvas para andar pela tela.</li>
              <li>Arraste as <b>bolinhas verdes (saídas)</b> até um nó para criar fluxos.</li>
              <li>Dê duplo-clique em conexões para deletá-las.</li>
            </ol>
          </div>
        </div>

        {/* MAIN VIEWER CANVAS */}
        <div 
          className="flex-1 bg-[#0F172A] relative overflow-hidden outline-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          ref={canvasRef}
          style={{
            backgroundImage: 'radial-gradient(#334155 1.1px, transparent 1.1px)',
            backgroundSize: '24px 24px'
          }}
        >
          {/* FLOATING ZOOM CONTROLS */}
          <div className="absolute bottom-5 left-5 bg-slate-900/90 border border-slate-700 p-1.5 rounded-lg flex items-center gap-1 text-slate-300 z-10 select-none shadow-lg">
            <button
              onClick={() => setScale(prev => Math.min(2.0, prev + 0.1))}
              className="p-1.5 hover:bg-slate-800 rounded cursor-pointer text-slate-200"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-slate-400 font-bold">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(prev => Math.max(0.4, prev - 0.1))}
              className="p-1.5 hover:bg-slate-800 rounded cursor-pointer text-slate-200"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>
            <button
              onClick={() => {
                setScale(1.0);
                setPan({ x: 0, y: 0 });
              }}
              className="px-2 py-1 text-[9px] font-bold hover:bg-slate-800 rounded cursor-pointer text-slate-200"
              title="Centralizar Visualização"
            >
              Centralizar
            </button>
          </div>

          {/* INFINITE PAN CONTAINER */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '1px',  // Dummy size since we visually absolute position contents
              height: '1px'
            }}
          >
            {/* CONNECTIONS SVG LAYER */}
            <svg 
              className="absolute pointer-events-none overflow-visible"
              style={{ top: 0, left: 0 }}
            >
              {/* DEFS FOR ARROW MARKERS */}
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
                </marker>
                <marker
                  id="arrow-selected"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
                </marker>
              </defs>

              {/* RENDER ACTIVE CONNECTIONS BETWEEN NODES */}
              {connections.map((conn) => {
                const sourceNode = nodes.find(n => n.id === conn.fromNodeId);
                const targetNode = nodes.find(n => n.id === conn.toNodeId);
                
                if (!sourceNode || !targetNode) return null;
                
                const start = getPortCoordinates(sourceNode, conn.fromPort);
                const end = getPortCoordinates(targetNode, 'input');
                
                // SVG Bezier path computation
                const distanceX = Math.abs(end.x - start.x);
                const cp1x = start.x + Math.max(40, distanceX * 0.5);
                const cp1y = start.y;
                const cp2x = end.x - Math.max(40, distanceX * 0.5);
                const cp2y = end.y;
                
                const isSelected = selectedConnectionId === conn.id;

                const centerPointX = (start.x + end.x) / 2;
                const centerPointY = (start.y + end.y) / 2;

                return (
                  <g key={conn.id} className="pointer-events-auto">
                    {/* Ghost selection wider line for easy hovering */}
                    <path
                      d={`M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="15"
                      className="cursor-pointer"
                      onClick={(e) => {
                        setSelectedConnectionId(conn.id);
                        setSelectedNodeId(null);
                        e.stopPropagation();
                      }}
                    />
                    
                    {/* Main visible curve path */}
                    <path
                      d={`M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`}
                      fill="none"
                      stroke={isSelected ? '#38bdf8' : '#64748B'}
                      strokeWidth={isSelected ? '3.5' : '2'}
                      strokeDasharray={conn.fromPort.startsWith('option_') ? undefined : '4 3'}
                      markerEnd="url(#arrow)"
                      className="transition-all cursor-pointer"
                    />

                    {/* Mid line connection label */}
                    <g 
                      transform={`translate(${centerPointX}, ${centerPointY})`}
                      className="cursor-pointer font-sans"
                      onClick={(e) => {
                        setSelectedConnectionId(conn.id);
                        setSelectedNodeId(null);
                        e.stopPropagation();
                      }}
                    >
                      <rect
                        x="-45"
                        y="-10"
                        width="90"
                        height="20"
                        rx="4"
                        fill="#1E293B"
                        stroke={isSelected ? '#38bdf8' : '#334155'}
                        strokeWidth="1"
                      />
                      <text
                        textAnchor="middle"
                        y="4"
                        fill={isSelected ? '#38bdf8' : '#94A3B8'}
                        className="text-[8px] font-bold select-none tracking-wide font-sans"
                        style={{ fontSize: '8.5px' }}
                      >
                        {conn.label || 'Botão Escolha'}
                      </text>
                    </g>

                    {/* Small delete trigger right beside label */}
                    <g
                      transform={`translate(${centerPointX + 50}, ${centerPointY - 12})`}
                      className="cursor-pointer opacity-80 hover:opacity-100"
                      onClick={(e) => {
                        handleDeleteConnection(conn.id);
                        e.stopPropagation();
                      }}
                    >
                      <circle r="7.5" fill="#EF4444" />
                      <text y="2.5" textAnchor="middle" fill="white" className="text-[8px] font-bold font-sans">×</text>
                    </g>
                  </g>
                );
              })}

              {/* RENDER DRAGGING TEMP CONNECTION WIRE */}
              {dragConnection && (() => {
                const start = { x: dragConnection.startX, y: dragConnection.startY };
                const end = { x: dragConnection.currentX, y: dragConnection.currentY };
                
                const distanceX = Math.abs(end.x - start.x);
                const cp1x = start.x + Math.max(40, distanceX * 0.5);
                const cp1y = start.y;
                const cp2x = end.x - Math.max(40, distanceX * 0.5);
                const cp2y = end.y;

                return (
                  <path
                    d={`M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`}
                    fill="none"
                    stroke="#00C896"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    markerEnd="url(#arrow)"
                  />
                );
              })()}
            </svg>

            {/* NODE CARD INSTANCES LAYER */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const hasWarning = isNodeWarning(node.id);
              const isSink = isNodeSink(node.id);

              return (
                <div
                  key={node.id}
                  className={`node-card absolute bg-[#1E293B] border rounded-xl select-none flex flex-col justify-between font-semibold shadow-2xl transition-all ${
                    isSelected 
                      ? 'ring-2 ring-[#0F4C81] border-[#38bdf8] scale-[1.01]' 
                      : hasWarning
                        ? 'border-yellow-500/80 shadow-yellow-500/5'
                        : 'border-[#334155]'
                  }`}
                  style={{
                    width: `${NODE_WIDTH}px`,
                    transform: `translate(${node.x}px, ${node.y}px)`
                  }}
                  onMouseDown={(e) => {
                    // Start dragging node, prevent pan triggers
                    const target = e.target as HTMLElement;
                    if (target.closest('.port-dots') || target.closest('input') || target.closest('textarea')) {
                      return;
                    }
                    
                    setDraggedNode({
                      id: node.id,
                      offsetX: (e.clientX - canvasRef.current!.getBoundingClientRect().left - pan.x) / scale - node.x,
                      offsetY: (e.clientY - canvasRef.current!.getBoundingClientRect().top - pan.y) / scale - node.y
                    });
                    
                    setSelectedNodeId(node.id);
                    setSelectedConnectionId(null);
                    e.stopPropagation();
                  }}
                  onDragOver={(e) => {
                    // Accept variable drops
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const textDragged = e.dataTransfer.getData('text/plain');
                    if (textDragged) {
                      setNodes(prev => prev.map(n => {
                        if (n.id === node.id) {
                          return {
                            ...n,
                            text: n.text + ' ' + textDragged
                          };
                        }
                        return n;
                      }));
                    }
                  }}
                >
                  
                  {/* CARD HEADER */}
                  <div className={`px-3 py-2.5 rounded-t-xl flex justify-between items-center border-b border-[#334155]/60 ${
                    node.type === 'inicio' ? 'bg-[#1E3A8A]' : 'bg-[#0F172A]'
                  }`}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      {node.type === 'inicio' && <Sparkles className="w-3.5 h-3.5 text-[#00C896] shrink-0" />}
                      {node.type === 'texto' && <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      {node.type === 'pergunta' && <QuestionIcon className="w-3.5 h-3.5 text-[#FF6B35] shrink-0" />}
                      {node.type === 'condicao' && <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                      {node.type === 'delay' && <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      
                      <span className="text-[10.5px] text-slate-100 font-black truncate leading-tight tracking-wide uppercase">
                        {node.title}
                      </span>
                    </div>

                    {node.id !== 'inicio' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node.id);
                        }}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                        title="Deletar Nó"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* INPUT PORT DOT (LEFT SIDE EXCEPT FOR INICIO NODE) */}
                  {node.type !== 'inicio' && (
                    <div
                      className="port-dots absolute left-0 top-[55px] w-3 h-3 bg-slate-700 hover:bg-[#00C896] border-2 border-slate-900 rounded-full cursor-pointer -translate-x-[6px] -translate-y-[6px] flex items-center justify-center transition-all group"
                      title="Entrada do fluxo"
                    >
                      <div className="w-1 h-1 bg-[#00C896] rounded-full scale-0 group-hover:scale-100 transition-transform"></div>
                    </div>
                  )}

                  {/* CARD CONTENT */}
                  <div className="p-3.5 space-y-3 font-medium text-[10.5px]">
                    
                    {/* Node Preview Container */}
                    <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 text-slate-300 font-normal leading-relaxed line-clamp-3 select-none">
                      {node.text ? node.text : <em className="text-slate-500">Sem conteúdo definido...</em>}
                    </div>

                    {/* Delay marker */}
                    {node.type === 'delay' && (
                      <div className="flex items-center gap-1.5 text-amber-500 text-[10px] bg-amber-500/10 px-2 py-1 rounded">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Atrasar resposta por: <strong>{node.delaySeconds}s</strong></span>
                      </div>
                    )}

                    {/* Node warnings */}
                    {hasWarning && (
                      <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 text-[9px] px-2 py-0.5 rounded border border-yellow-500/20">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>Precisa de uma conexão de entrada</span>
                      </div>
                    )}

                    {isSink && (
                      <span className="text-[9px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded italic w-max block font-mono">
                        🚩 Fim do fluxo
                      </span>
                    )}

                    {/* Option outcomes menu */}
                    {node.options.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Portas de Decisão:</span>
                        {node.options.map((opt, oIdx) => {
                          const portKey = `option_${oIdx}`;
                          
                          return (
                            <div 
                              key={portKey}
                              className="relative flex justify-between items-center bg-slate-900 px-2.5 py-1.5 rounded text-slate-200 border border-slate-800 text-[10px] font-semibold"
                            >
                              <span className="truncate pr-4">{opt}</span>
                              
                              {/* Port interactive bullet */}
                              <div
                                className="port-dots absolute right-0 top-1/2 w-3.5 h-3.5 bg-slate-800 hover:bg-[#00C896] border-2 border-[#1E293B] rounded-full cursor-pointer translate-x-[7px] -translate-y-1/2 flex items-center justify-center transition-all hover:scale-125 select-none"
                                onMouseDown={(e) => {
                                  const coords = getPortCoordinates(node, portKey);
                                  setDragConnection({
                                    fromNodeId: node.id,
                                    fromPort: portKey,
                                    startX: coords.x,
                                    startY: coords.y,
                                    currentX: coords.x,
                                    currentY: coords.y
                                  });
                                  e.stopPropagation();
                                  e.preventDefault();
                                }}
                                title="Arraste para ligar a outro nó"
                              >
                                <Plus className="w-2 h-2 text-[#00C896]" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Standard direct output for simple cards */}
                    {node.options.length === 0 && (
                      <div className="flex justify-between items-center pt-1 text-[9.5px] text-slate-500">
                        <span>Ligar Próximo</span>
                        <div
                          className="port-dots w-3.5 h-3.5 bg-slate-800 hover:bg-[#00C896] border-2 border-[#1E293B] rounded-full cursor-pointer flex items-center justify-center transition-all hover:scale-125 select-none"
                          onMouseDown={(e) => {
                            const coords = getPortCoordinates(node, 'output');
                            setDragConnection({
                              fromNodeId: node.id,
                              fromPort: 'output',
                              startX: coords.x,
                              startY: coords.y,
                              currentX: coords.x,
                              currentY: coords.y
                            });
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          title="Arraste para ligar à próxima ação"
                        >
                          <Plus className="w-2 h-2 text-blue-400" />
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* PANEL RIGHT: DETAILED CONFIG PANEL FOR SELECTED NODE OR CONNECTION */}
        <div className="w-72 bg-[#111827] border-l border-[#1F2937] flex flex-col select-none overflow-y-auto font-sans leading-normal shrink-0">
          
          {selectedNodeId && (() => {
            const node = nodes.find(n => n.id === selectedNodeId);
            if (!node) return <div className="p-4 text-slate-500">Nenhum elemento selecionado...</div>;

            return (
              <div className="p-4 space-y-5 font-semibold">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] uppercase font-bold text-[#00C896] tracking-wider">Editor de Nós</span>
                  <h4 className="font-display font-black text-xs text-white uppercase mt-1">{node.title}</h4>
                </div>

                {/* Edit Title */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Nome Personalizado:</label>
                  <input
                    type="text"
                    value={node.title}
                    onChange={(e) => {
                      setNodes(prev => prev.map(n => n.id === node.id ? { ...n, title: e.target.value } : n));
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0F4C81]"
                  />
                </div>

                {/* Edit Delay if applicable */}
                {node.type === 'delay' && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block">Tempo de Espera (segundos):</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={node.delaySeconds}
                      onChange={(e) => {
                        setNodes(prev => prev.map(n => n.id === node.id ? { ...n, delaySeconds: parseInt(e.target.value) || 1 } : n));
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0F4C81]"
                    />
                  </div>
                )}

                {/* Edit Content Textarea */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block">Texto de Resposta:</label>
                    <span className="text-[8px] text-slate-500 bg-slate-900 px-1 py-0.5 rounded font-mono font-bold tracking-tight">Sincronizado</span>
                  </div>
                  <textarea
                    value={node.text}
                    onChange={(e) => {
                      setNodes(prev => prev.map(n => n.id === node.id ? { ...n, text: e.target.value } : n));
                    }}
                    rows={6}
                    placeholder="Olá, marque seu corte..."
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs leading-relaxed font-medium focus:outline-none focus:border-[#0F4C81]"
                  />
                  <p className="text-[9px] text-slate-500 italic leading-normal">
                    Nota: Digite "{"{"}" para autocompletar com variáveis ou use as do painel esquerdo arrastando-as aqui.
                  </p>
                </div>

                {/* Edit Custom decision option terms */}
                {node.options.length > 0 && (
                  <div className="space-y-2 border-t border-slate-800 pt-4">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wide block">Botões de Opção</span>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {node.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex gap-1.5 items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...node.options];
                              updated[oIdx] = e.target.value;
                              
                              // Also sync connection label
                              setConnections(prev => prev.map(c => 
                                c.fromNodeId === node.id && c.fromPort === `option_${oIdx}`
                                  ? { ...c, label: e.target.value }
                                  : c
                              ));

                              setNodes(prev => prev.map(n => n.id === node.id ? { ...n, options: updated } : n));
                            }}
                            className="bg-slate-900 border border-slate-800 text-slate-200 px-2 py-1 rounded text-[11px] focus:outline-none flex-1 font-semibold"
                          />
                          <button
                            onClick={() => {
                              const updated = node.options.filter((_, idx) => idx !== oIdx);
                              // Filter out matching connection
                              setConnections(prev => prev.filter(c => !(c.fromNodeId === node.id && c.fromPort === `option_${oIdx}`)));
                              
                              setNodes(prev => prev.map(n => n.id === node.id ? { ...n, options: updated } : n));
                            }}
                            className="p-1 hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded cursor-pointer"
                            title="Remover Opção"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const updated = [...node.options, `Nova Opção  ${node.options.length + 1}`];
                        setNodes(prev => prev.map(n => n.id === node.id ? { ...n, options: updated } : n));
                      }}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 rounded-lg text-[10px] uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#00C896]" />
                      Adicionar Nova Opção
                    </button>
                  </div>
                )}

                {/* Type converter dropdown */}
                <div className="space-y-1.5 pt-4 border-t border-slate-800">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Converter Tipo de Nó:</label>
                  <select
                    value={node.type}
                    onChange={(e) => {
                      const nextType = e.target.value as any;
                      const initialOptsMap: { [key: string]: string[] } = {
                        inicio: ['Opção 1', 'Opção 2'],
                        texto: [],
                        pergunta: ['Sim', 'Não'],
                        condicao: ['Caso Verdadeiro', 'Caso Falso'],
                        delay: []
                      };
                      
                      setNodes(prev => prev.map(n => n.id === node.id ? { 
                        ...n, 
                        type: nextType,
                        options: initialOptsMap[nextType] || []
                      } : n));
                      
                      // Clear stale ports
                      setConnections(prev => prev.filter(c => c.fromNodeId !== node.id));
                    }}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="texto">Mensagem de Texto</option>
                    <option value="pergunta">Pergunta com Menu/Botões</option>
                    <option value="condicao">Condição Bifurcada</option>
                    <option value="delay">Atraso temporal (Delay)</option>
                  </select>
                </div>

                {node.id !== 'inicio' && (
                  <button
                    onClick={() => handleDeleteNode(node.id)}
                    className="w-full py-2 bg-red-600/10 hover:bg-red-600 border border-red-500/10 hover:border-red-600 text-red-500 hover:text-white font-black text-[10.5px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir Nó de Conversa
                  </button>
                )}

              </div>
            );
          })()}

          {selectedConnectionId && (() => {
            const conn = connections.find(c => c.id === selectedConnectionId);
            if (!conn) return <div className="p-4 text-slate-500">Nenhum elemento selecionado...</div>;

            return (
              <div className="p-4 space-y-4 font-semibold">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] uppercase font-bold text-[#FF6B35] tracking-wider">Editor de Link</span>
                  <h4 className="font-display font-black text-xs text-white uppercase mt-1">Opção Escolha</h4>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Rótulo da Tecla (Label):</label>
                  <input
                    type="text"
                    value={conn.label || ''}
                    onChange={(e) => {
                      setConnections(prev => prev.map(c => c.id === conn.id ? { ...c, label: e.target.value } : c));
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0F4C81]"
                  />
                  <p className="text-[9.5px] text-slate-500 leading-normal">
                    Este texto aparece no botão prévio de mensagens de escolha do WhatsApp.
                  </p>
                </div>

                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[9.5px] font-normal leading-normal text-slate-400">
                  <p><strong>Origem:</strong> {nodes.find(n => n.id === conn.fromNodeId)?.title}</p>
                  <p><strong>Destino:</strong> {nodes.find(n => n.id === conn.toNodeId)?.title}</p>
                </div>

                <button
                  onClick={() => handleDeleteConnection(conn.id)}
                  className="w-full py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white font-black text-[10.5px] uppercase tracking-wider rounded-lg border border-red-500/10 hover:border-red-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Deletar Conexão
                </button>
              </div>
            );
          })()}

          {!selectedNodeId && !selectedConnectionId && (
            <div className="p-8 text-center my-auto space-y-3">
              <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
              <div>
                <p className="text-slate-400 text-xs font-bold leading-normal">Nenhum elemento selecionado</p>
                <p className="text-slate-500 text-[10px] font-medium leading-relaxed mt-1">Selecione qualquer nó de conversa ou seta no canvas infinito para inspecionar parâmetros técnicos.</p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* FLOATING SIMULATOR MODAL (CONVERSATIONAL SANDBOX MOCKUP) */}
      {isSimulating && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl h-[520px]">
            
            {/* Simulator Header */}
            <div className="bg-[#075e54] text-white p-4 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Bot className="w-9 h-9 p-1.5 bg-[#128C7E] rounded-full border border-teal-500" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#075e54] rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-bold text-xs truncate">Simulador Chatbot IA</h4>
                  <span className="text-[10px] text-teal-100 block -mt-0.5">Testando resposta automática</span>
                </div>
              </div>

              <button
                onClick={() => setIsSimulating(false)}
                className="p-1 hover:bg-black/10 rounded-lg text-teal-100 hover:text-white transition-colors cursor-pointer"
                title="Fechar Simulador"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation Messages area */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col"
              style={{
                backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                backgroundSize: 'contain',
                backgroundColor: '#efeae2'
              }}
            >
              {simMessages.length === 0 && (
                <div className="my-auto text-center p-6 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200 max-w-[80%] mx-auto">
                  <span className="text-xl">🤖</span>
                  <p className="text-slate-800 font-bold text-xs mt-1">Carregando fluxo conversacional...</p>
                </div>
              )}

              {simMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-xs max-w-[85%] leading-relaxed shadow-xs relative ${
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

            {/* Dynamic Buttons options of current Active simulating node */}
            <div className="bg-[#F0F2F5] border-t border-slate-200 p-4 shrink-0 flex flex-col gap-2 font-semibold">
              <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold block">Respostas do Cliente:</span>
              
              {simActiveNodeId && (() => {
                // Find all output connections starting from this node
                const childConns = connections.filter(c => c.fromNodeId === simActiveNodeId);
                const currentNode = nodes.find(n => n.id === simActiveNodeId);
                
                if (childConns.length === 0) {
                  return (
                    <div className="text-center py-2 text-[10px] text-slate-500 italic font-medium">
                      🏁 Fim do fluxo. Inicie uma nova conversa para simular do início.
                    </div>
                  );
                }

                // Render matching action buttons
                return (
                  <div className="grid grid-cols-2 gap-2">
                    {childConns.map((conn) => {
                      // Work out index from option port
                      let relativeIndex = 0;
                      if (conn.fromPort.startsWith('option_')) {
                        relativeIndex = parseInt(conn.fromPort.split('_')[1], 10);
                      }
                      
                      const triggerLabel = conn.label || currentNode?.options[relativeIndex] || 'Avançar';
                      
                      return (
                        <button
                          key={conn.id}
                          onClick={() => handleSimOptionClick(relativeIndex, conn.toNodeId)}
                          className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-teal-600 rounded-lg text-[10.5px] truncate font-bold text-center block cursor-pointer transition-colors shadow-xs active:bg-teal-50"
                        >
                          {triggerLabel}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              <div className="flex gap-2.5 pt-3 border-t border-slate-200/80 mt-2">
                <button
                  onClick={handleStartSimulation}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-bold text-[10px] uppercase block text-center cursor-pointer flex-1 transition-colors"
                >
                  Reiniciar Simulação 
                </button>
                <button
                  onClick={() => setIsSimulating(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-350 hover:bg-slate-400 text-slate-700 bg-slate-200 hover:bg-slate-300 font-bold text-[10px] uppercase block text-center cursor-pointer transition-colors"
                >
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
