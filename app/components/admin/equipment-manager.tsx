import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Plus, Trash2, Search, Package, Edit2, X, Check,
  Wifi, WifiOff, Dumbbell, Bike, Layers, Wrench, Grid3X3
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface Equipment {
  id: number;
  name: string;
  category: string;
  quantity: number;
  description?: string;
  isAvailable: boolean;
}

const CATEGORIES = [
  { value: "barras", label: "Barras y Discos", icon: "🏋️" },
  { value: "mancuernas", label: "Mancuernas / Pesas", icon: "💪" },
  { value: "funcional", label: "Funcional / CrossFit", icon: "⚡" },
  { value: "cardio", label: "Cardio / Máquinas", icon: "🚴" },
  { value: "calistenia", label: "Calistenia / Gimnasia", icon: "🤸" },
  { value: "accesorios", label: "Accesorios", icon: "🔧" },
];

const CATEGORY_ICONS: Record<string, typeof Dumbbell> = {
  barras: Dumbbell,
  mancuernas: Dumbbell,
  funcional: Grid3X3,
  cardio: Bike,
  calistenia: Layers,
  accesorios: Wrench,
};

const CATEGORY_COLORS: Record<string, string> = {
  barras: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  mancuernas: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  funcional: "text-primary bg-primary/10 border-primary/20",
  cardio: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  calistenia: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  accesorios: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
};

export function EquipmentManager() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todos");

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "funcional",
    quantity: 1,
    description: "",
    isAvailable: true,
  });

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/equipment", { credentials: "include" });
      if (res.ok) {
        setEquipment(await res.json() as Equipment[]);
      }
    } catch (err) {
      console.error("Failed to load equipment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ name: "", category: "funcional", quantity: 1, description: "", isAvailable: true });
    setShowDialog(true);
  };

  const handleOpenEdit = (item: Equipment) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      description: item.description || "",
      isAvailable: item.isAvailable,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/admin/equipment/${editingId}` : "/api/admin/equipment";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await loadEquipment();
        setShowDialog(false);
      }
    } catch (err) {
      console.error("Failed to save equipment:", err);
    }
  };

  const handleToggleAvailable = async (item: Equipment) => {
    try {
      const res = await fetch(`/api/admin/equipment/${item.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      if (res.ok) {
        setEquipment(prev =>
          prev.map(e => e.id === item.id ? { ...e, isAvailable: !e.isAvailable } : e)
        );
      }
    } catch (err) {
      console.error("Failed to toggle equipment:", err);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar "${name}"? Los ejercicios que dependan de este equipo no se actualizarán automáticamente.`)) return;
    try {
      const res = await fetch(`/api/admin/equipment/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setEquipment(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete equipment:", err);
    }
  };

  const filtered = equipment.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === "todos" || e.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const byCategory = CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter(e => e.category === cat.value);
    if (items.length > 0) acc[cat.value] = items;
    return acc;
  }, {} as Record<string, Equipment[]>);

  const availableCount = equipment.filter(e => e.isAvailable).length;
  const totalCount = equipment.length;

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Equipos", value: totalCount, color: "text-white" },
          { label: "Disponibles", value: availableCount, color: "text-emerald-400" },
          { label: "No Disponibles", value: totalCount - availableCount, color: "text-red-400" },
          { label: "Categorías", value: CATEGORIES.filter(c => equipment.some(e => e.category === c.value)).length, color: "text-primary" },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-xl bg-zinc-950/50 border border-white/5 backdrop-blur-xl">
            <p className="text-[9px] font-black uppercase tracking-wider text-light/40">{stat.label}</p>
            <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-2 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 text-zinc-500" size={13} />
            <input
              type="text"
              placeholder="Buscar equipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-primary/40 transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-light/80 outline-none focus:border-primary/40"
          >
            <option value="todos">Todas las categorías</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-primary text-white hover:bg-primary/90 font-bold text-xs uppercase tracking-wider px-4 flex items-center gap-2 flex-shrink-0"
        >
          <Plus size={14} /> Añadir Equipo
        </Button>
      </div>

      {/* Equipment list by category */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-xs text-light/50">Cargando inventario...</p>
        </div>
      ) : Object.keys(byCategory).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-white/10 rounded-2xl">
          <Package size={32} className="text-zinc-600" />
          <p className="text-sm font-bold text-light/60">No hay equipamiento registrado</p>
          <p className="text-xs text-light/40 max-w-xs text-center">
            Registra el inventario del gym para que el Coach IA sepa qué ejercicios puede recomendar.
          </p>
          <Button onClick={handleOpenAdd} className="mt-2 bg-primary text-white text-xs font-bold">
            <Plus size={12} className="mr-1" /> Añadir primer equipo
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byCategory).map(([catKey, items]) => {
            const cat = CATEGORIES.find(c => c.value === catKey)!;
            const CatIcon = CATEGORY_ICONS[catKey] || Package;
            const colorClass = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.accesorios;

            return (
              <div key={catKey} className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${colorClass}`}>
                    <CatIcon size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-white">{cat.label}</p>
                    <p className="text-[9px] text-light/40">{items.length} item(s)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all duration-200 relative group ${
                        item.isAvailable
                          ? "bg-zinc-900/40 border-white/8 hover:border-white/15"
                          : "bg-zinc-950/30 border-white/3 opacity-60"
                      }`}
                    >
                      {/* Availability indicator */}
                      <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${item.isAvailable ? "bg-emerald-400" : "bg-red-500"}`} />

                      <div className="pr-4">
                        <h4 className="text-sm font-bold text-white leading-tight">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${colorClass}`}>
                            {cat.label}
                          </span>
                          <span className="text-[10px] text-light/50 font-semibold">
                            ×{item.quantity}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-[10px] text-light/40 mt-1.5 leading-relaxed line-clamp-2">{item.description}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
                        <button
                          onClick={() => handleToggleAvailable(item)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase border transition-all ${
                            item.isAvailable
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                          }`}
                        >
                          {item.isAvailable ? <><Wifi size={9} /> Disponible</> : <><WifiOff size={9} /> No Disponible</>}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="ml-auto p-1.5 rounded-lg bg-zinc-800 text-light/50 hover:text-white border border-white/5 transition-all"
                          title="Editar"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 rounded-lg bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-500/10 transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px] bg-zinc-950 border border-white/10 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Package size={16} className="text-primary" />
              {editingId ? "Editar Equipamiento" : "Añadir Equipamiento"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1">Nombre del Equipo *</label>
                <input
                  type="text"
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Barra olímpica 20kg, Kettlebell 24kg..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1">Categoría *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1">Cantidad *</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white text-center"
                  value={form.quantity}
                  onChange={(e) => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1">Descripción / Notas</label>
              <textarea
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white resize-none"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Ej: Juego completo 10-50kg, requiere ajuste de cables..."
                rows={2}
              />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-white/5">
              <button
                onClick={() => setForm(f => ({ ...f, isAvailable: !f.isAvailable }))}
                className={`relative w-10 h-5 rounded-full transition-all duration-300 border ${
                  form.isAvailable ? "bg-emerald-500 border-emerald-400" : "bg-zinc-700 border-zinc-600"
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${form.isAvailable ? "left-5" : "left-0.5"}`} />
              </button>
              <div>
                <p className="text-xs font-bold text-white">{form.isAvailable ? "Disponible para uso" : "No disponible"}</p>
                <p className="text-[9px] text-light/40">El Coach IA solo usará equipo marcado como disponible</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-white/5">
              <Button variant="outline" size="sm" onClick={() => setShowDialog(false)} className="border-white/10 text-light hover:bg-zinc-800">
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!form.name.trim()}
                className="bg-primary text-white hover:bg-primary/90 font-bold text-xs"
              >
                <Check size={13} className="mr-1" />
                {editingId ? "Actualizar" : "Añadir al Inventario"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
