import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Plus, Edit, Trash2, Search, Dumbbell, ShieldAlert, Award } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export interface Routine {
  id: number;
  routineName: string;
  exerciseName: string;
  description?: string;
  sets: number;
  reps: string;
  intensityPct?: number;
  difficulty: "Principiante" | "Intermedio" | "Avanzado" | string;
  createdAt?: string;
  updatedAt?: string;
}

interface RoutinesManagerProps {
  onRefreshTrigger?: number;
  onRoutinesUpdated?: () => void;
}

export function RoutinesManager({ onRefreshTrigger = 0, onRoutinesUpdated }: RoutinesManagerProps) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("todos");
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Routine>>({});

  const API_URL = ""; // Relative URL works since it's same host

  const loadRoutines = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/routines`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json() as Routine[];
        setRoutines(data);
      }
    } catch (error) {
      console.error("Failed to load routines:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutines();
  }, [onRefreshTrigger]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ difficulty: "Intermedio", sets: 3, reps: "10" });
    setShowDialog(true);
  };

  const handleOpenEdit = (routine: Routine) => {
    setEditingId(routine.id);
    setForm(routine);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.routineName?.trim() || !form.exerciseName?.trim() || !form.sets || !form.reps || !form.difficulty) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId 
        ? `${API_URL}/api/admin/routines/${editingId}`
        : `${API_URL}/api/admin/routines`;

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        await loadRoutines();
        setShowDialog(false);
        setForm({});
        setEditingId(null);
        if (onRoutinesUpdated) onRoutinesUpdated();
      }
    } catch (error) {
      console.error("Failed to save routine:", error);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar el ejercicio "${name}"?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/routines/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        await loadRoutines();
        if (onRoutinesUpdated) onRoutinesUpdated();
      }
    } catch (error) {
      console.error("Failed to delete routine:", error);
    }
  };

  // Filter routines based on search query and difficulty
  const filteredRoutines = routines.filter((r) => {
    const matchesSearch = 
      r.routineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.exerciseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesDifficulty = 
      difficultyFilter === "todos" || 
      r.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "principiante":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "intermedio":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "avanzado":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  return (
    <div className="flex flex-col h-[600px] rounded-2xl border border-white/8 bg-zinc-950/80 overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-white/8 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Dumbbell size={16} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-white">Base de Rutinas</p>
            <p className="text-[10px] text-light/50 font-medium">Gestión del Repositorio</p>
          </div>
        </div>
        <Button 
          onClick={handleOpenAdd} 
          size="sm" 
          className="bg-primary text-white hover:scale-105 transition-all duration-200 text-xs font-bold px-3 py-1.5 h-8"
        >
          <Plus size={14} className="mr-1" />
          <span>Nueva</span>
        </Button>
      </div>

      {/* Filters bar */}
      <div className="px-4 py-2 border-b border-white/5 bg-zinc-900/20 flex flex-col sm:flex-row gap-2 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-zinc-500" size={13} />
          <input
            type="text"
            placeholder="Buscar por rutina, ejercicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-light/80 outline-none focus:border-primary/40"
        >
          <option value="todos">Todos los niveles</option>
          <option value="principiante">Principiante</option>
          <option value="intermedio">Intermedio</option>
          <option value="avanzado">Avanzado</option>
        </select>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
        {loading ? (
          <div className="h-full flex items-center justify-center flex-col gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-xs text-light/50">Cargando rutinas...</p>
          </div>
        ) : filteredRoutines.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/5 rounded-xl bg-white/1">
            <ShieldAlert size={24} className="text-zinc-600 mb-2" />
            <p className="text-xs font-bold text-light/70">No se encontraron rutinas</p>
            <p className="text-[10px] text-light/40 mt-1 max-w-[200px]">
              Crea una rutina usando el botón "Nueva" o chatea con el Coach IA para diseñarlas y guardarlas aquí.
            </p>
          </div>
        ) : (
          filteredRoutines.map((routine) => (
            <div
              key={routine.id}
              className="group p-3 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all duration-200 relative overflow-hidden"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase text-primary tracking-wider truncate max-w-[150px]">
                      {routine.routineName}
                    </span>
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${getDifficultyColor(routine.difficulty)}`}>
                      {routine.difficulty}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1 leading-tight flex items-center gap-1.5">
                    <Award size={12} className="text-zinc-500 flex-shrink-0" />
                    <span className="truncate">{routine.exerciseName}</span>
                  </h4>
                  <div className="flex gap-3 text-[11px] text-light/60 mt-1.5 font-medium">
                    <span>{routine.sets} series</span>
                    <span className="text-white/20">•</span>
                    <span>{routine.reps} reps</span>
                    {routine.intensityPct && (
                      <>
                        <span className="text-white/20">•</span>
                        <span className="text-primary">{routine.intensityPct}% int.</span>
                      </>
                    )}
                  </div>
                  {routine.description && (
                    <p className="text-[10px] text-light/40 mt-1.5 leading-relaxed line-clamp-2">
                      {routine.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => handleOpenEdit(routine)}
                    className="p-1 rounded bg-zinc-800 text-light/70 hover:text-white hover:bg-zinc-700 transition-all"
                    title="Editar"
                  >
                    <Edit size={11} />
                  </button>
                  <button
                    onClick={() => handleDelete(routine.id, routine.exerciseName)}
                    className="p-1 rounded bg-red-950/20 text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/10 transition-all"
                    title="Eliminar"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer count */}
      <div className="px-4 py-2 bg-zinc-950 border-t border-white/5 flex justify-between items-center flex-shrink-0">
        <p className="text-[9px] text-light/40">
          Total: {routines.length} ejercicios registrados
        </p>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[450px] bg-zinc-950 border border-white/10 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingId ? 'Editar Ejercicio' : 'Registrar Ejercicio'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Nombre de la Rutina *</label>
              <input
                type="text"
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white"
                value={form.routineName || ''}
                onChange={(e) => setForm({ ...form, routineName: e.target.value })}
                placeholder="Ej: Fuerza de Piernas"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Nombre del Ejercicio *</label>
              <input
                type="text"
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white"
                value={form.exerciseName || ''}
                onChange={(e) => setForm({ ...form, exerciseName: e.target.value })}
                placeholder="Ej: Peso Muerto (Deadlift)"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Series (Sets) *</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white"
                  value={form.sets || ''}
                  onChange={(e) => setForm({ ...form, sets: parseInt(e.target.value) || 0 })}
                  placeholder="3"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Reps *</label>
                <input
                  type="text"
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white"
                  value={form.reps || ''}
                  onChange={(e) => setForm({ ...form, reps: e.target.value })}
                  placeholder="8-10 o AMRAP"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Intensidad (%)</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white"
                  value={form.intensityPct || ''}
                  onChange={(e) => setForm({ ...form, intensityPct: parseInt(e.target.value) || undefined })}
                  placeholder="75%"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Dificultad *</label>
                <select
                  value={form.difficulty || 'Intermedio'}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white"
                >
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Técnica / Descripción</label>
              <textarea
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white"
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe la técnica, descansos o consideraciones médicas"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end pt-3 border-t border-white/5">
              <Button variant="outline" size="sm" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                className="bg-primary text-white hover:scale-105 transition-all duration-300 font-bold text-xs"
              >
                {editingId ? "Actualizar" : "Registrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
