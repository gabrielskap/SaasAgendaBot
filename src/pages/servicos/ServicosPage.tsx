/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Trash2, 
  Edit2, 
  Plus, 
  Grid, 
  Heart, 
  ArrowRight, 
  DollarSign, 
  Clock, 
  ChevronRight, 
  Filter,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { fetchServices, createService, fetchProfessionals } from '../../services/supabaseService';
import { Profissional, Servico } from '../../types';

export default function ServicosPage() {
  const { tenant } = useAuthStore();
  const [services, setServices] = useState<Servico[]>([]);
  const [professionals, setProfessionals] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Cabelo');
  const [newPrice, setNewPrice] = useState('50.00');
  const [newDuration, setNewDuration] = useState('30min');
  const [newDesc, setNewDesc] = useState('');

  const categories = ['todas', 'Cabelo', 'Barba', 'Combos', 'Estética'];

  useEffect(() => {
    if (!tenant?.id) return;
    setLoading(true);
    Promise.all([fetchServices(tenant.id), fetchProfessionals(tenant.id)])
      .then(([svcs, pros]) => {
        setServices(svcs);
        setProfessionals(pros);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [tenant?.id]);

  const filteredServices = selectedCategory === 'todas'
    ? services
    : services.filter(s => s.categoria === selectedCategory);

  const handleAddNewService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !tenant?.id) return;
    setSaving(true);
    try {
      const created = await createService(tenant.id, {
        nome: newName,
        categoria: newCat,
        duracao: newDuration,
        preco: parseFloat(newPrice) || 50.00,
        descricao: newDesc,
      });
      setServices(prev => [...prev, created]);
      setIsAddOpen(false);
      setNewName('');
      setNewPrice('50.00');
      setNewDesc('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold">
          Erro: {error}
        </div>
      )}

      {/* TITLE OPTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-display font-black text-[#1A1F2E]">Serviços & Procedimentos</h2>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            Lista de procedimentos, tempos operacionais e mapeamento de equipe técnica.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-[#0F4C81] text-white px-4 py-2.5 rounded-lg text-xs font-bold font-display tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-md shadow-[#0F4C81]/15"
        >
          <Plus className="w-4.5 h-4.5" />
          Novo Serviço
        </button>
      </div>

      {/* FILTER BUTTON ROW CLUSTER */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 border-b border-[#E2E8F0]/50">
        <Filter className="w-4 h-4 text-[#64748B] shrink-0" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] pr-2 shrink-0">Categorias:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border uppercase tracking-wider whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#0F4C81] border-[#0F4C81] text-white'
                : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#64748B]'
            }`}
          >
            {cat === 'todas' ? 'Visualizar Todos' : cat}
          </button>
        ))}
      </div>

      {/* COMPACT DETAILED TABLE */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-display font-bold uppercase text-[10px] text-[#64748B]">
              <tr>
                <th className="px-5 py-4">Nome do Serviço</th>
                <th className="px-4 py-4">Categoria</th>
                <th className="px-4 py-4">Duração</th>
                <th className="px-4 py-4 text-right">Preço Sugerido</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] font-medium text-[#1A1F2E]">
              {loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#64748B] font-medium">
                    Carregando serviços...
                  </td>
                </tr>
              )}
              {!loading && filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-bold text-[#0F4C81]">{service.nome}</p>
                      {service.descricao && (
                        <p className="text-[10px] text-[#64748B] mt-0.5 leading-relaxed max-w-sm">{service.descricao}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 uppercase tracking-wider text-[10px] font-bold text-[#64748B]">
                    {service.categoria}
                  </td>
                  <td className="px-4 py-4 font-mono text-[#64748B]">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#0F4C81]" /> {service.duracao}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-jetbrains text-xs text-emerald-700 font-bold">
                    R$ {service.preco.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-display font-medium px-2 py-0.5 rounded-full border border-emerald-100 uppercase">
                      {service.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => alert(`Sincronizando ficha técnica do serviço: ${service.nome}`)}
                      className="text-xs text-[#0F4C81] hover:underline font-bold"
                    >
                      Editar Ficha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CREATE SERVICE */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-md w-full overflow-hidden animate-fade-in-up">
            
            <div className="bg-[#0F4C81] text-white p-4.5 flex justify-between items-center">
              <h4 className="font-display font-extrabold text-xs uppercase tracking-wider">Novo Serviço</h4>
              <button onClick={() => setIsAddOpen(false)} className="hover:bg-white/10 rounded-full p-1"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddNewService} className="p-5 space-y-4 text-xs font-semibold">
              
              <div>
                <label className="text-[10px] font-bold text-[#1A1F2E] uppercase block mb-1">Nome do Serviço</label>
                <input
                  type="text"
                  required
                  placeholder="Escova Reconstrutora"
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#1A1F2E] uppercase block mb-1">Categoria</label>
                  <select
                    className="w-full px-3 py-2.5 border border-[#E2E8F0] bg-white rounded-lg"
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                  >
                    <option value="Cabelo">Cabelo</option>
                    <option value="Barba">Barba</option>
                    <option value="Combos">Combos</option>
                    <option value="Estética">Estética</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#1A1F2E] uppercase block mb-1">Tempo de Duração</label>
                  <select
                    className="w-full px-3 py-2.5 border border-[#E2E8F0] bg-white rounded-lg font-mono"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                  >
                    <option value="15min">15 min</option>
                    <option value="30min">30 min</option>
                    <option value="45min">45 min</option>
                    <option value="60min">60 min (1h)</option>
                    <option value="90min">90 min (1h30)</option>
                    <option value="120min">120 min (2h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#1A1F2E] uppercase block mb-1">Preço Cobrado (R$)</label>
                <input
                  type="text"
                  required
                  placeholder="75.00"
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] font-jetbrains font-bold text-emerald-800"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#1A1F2E] uppercase block mb-1">Descrição Comercial</label>
                <textarea
                  placeholder="Explique o diferencial comercial deste serviço para clientes que consultarem via card online..."
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg h-16 resize-none bg-[#F8FAFC] font-medium"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              {professionals.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold text-[#1A1F2E] uppercase block mb-2">Quem Pode Realizar:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {professionals.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 bg-[#F8FAFC] p-2 border border-[#E2E8F0] rounded-lg cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-3.5 h-3.5 text-[#0F4C81] border-[#E2E8F0]" />
                        <span className="text-[10px] font-bold text-[#1A1F2E]">{p.nome}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-[#E2E8F0] hover:bg-slate-50 text-[#64748B] rounded-lg font-bold uppercase tracking-wider text-[11.5px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#0F4C81] hover:bg-[#0F4C81]/90 disabled:opacity-60 text-white font-bold px-5 py-2 rounded-lg uppercase tracking-wider text-[11.5px]"
                >
                  {saving ? 'Salvando...' : 'Confirmar Serviço'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
