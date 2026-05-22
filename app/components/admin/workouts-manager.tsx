import { useState, useEffect } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { 
  Plus, Trash2, Search, Dumbbell, Award, Share2, Link2, 
  Sparkles, Check, Clipboard, List, AlertCircle, X, ChevronDown, ChevronUp
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface WorkoutExercise {
  id?: number;
  routineName: string;
  exerciseName: string;
  description?: string;
  sets: number;
  reps: string;
  intensityPct?: number;
  restSeconds?: number;
  difficulty: string;
}

interface Workout {
  id: number;
  name: string;
  description?: string;
  difficulty: string;
  magicToken: string;
  exercises: WorkoutExercise[];
  createdAt?: string;
  updatedAt?: string;
}

interface TemplateExercise {
  id: number;
  routineName: string;
  exerciseName: string;
  description?: string;
  sets: number;
  reps: string;
  intensityPct?: number;
  restSeconds?: number;
  difficulty: string;
}

interface WorkoutsManagerProps {
  onWorkoutsUpdated?: () => void;
  // Trigger loading or syncing
  refreshTrigger?: number;
}

export function WorkoutsManager({ onWorkoutsUpdated, refreshTrigger = 0 }: WorkoutsManagerProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [templates, setTemplates] = useState<TemplateExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("todos");

  // Dialog & Form State
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Intermedio");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  // Search Template state inside dialog
  const [templateSearch, setTemplateSearch] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Expandable list items
  const [expandedWorkouts, setExpandedWorkouts] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadWorkouts();
    loadTemplates();
  }, [refreshTrigger]);

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/workouts", { credentials: "include" });
      if (res.ok) {
        const data = await res.json() as Workout[];
        setWorkouts(data);
      }
    } catch (err) {
      console.error("Failed to load workouts:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await fetch("/api/admin/routines", { credentials: "include" });
      if (res.ok) {
        const data = await res.json() as TemplateExercise[];
        setTemplates(data);
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setDifficulty("Intermedio");
    setExercises([
      { routineName: "Calentamiento", exerciseName: "", sets: 3, reps: "10", restSeconds: 60, difficulty: "Intermedio" }
    ]);
    setShowDialog(true);
  };

  const handleOpenEdit = (workout: Workout) => {
    setEditingId(workout.id);
    setName(workout.name);
    setDescription(workout.description || "");
    setDifficulty(workout.difficulty);
    setExercises(workout.exercises.map(e => ({ ...e })));
    setShowDialog(true);
  };

  const handleAddExerciseRow = () => {
    // Guess default routine section based on the last row
    const lastSection = exercises.length > 0 ? exercises[exercises.length - 1].routineName : "Calentamiento";
    setExercises([
      ...exercises,
      { routineName: lastSection, exerciseName: "", sets: 3, reps: "10", restSeconds: 60, difficulty }
    ]);
  };

  const handleAddTemplateToExercises = (tpl: TemplateExercise) => {
    // Add template details into exercises list
    setExercises([
      ...exercises,
      {
        routineName: tpl.routineName,
        exerciseName: tpl.exerciseName,
        description: tpl.description || "",
        sets: tpl.sets,
        reps: tpl.reps,
        intensityPct: tpl.intensityPct,
        restSeconds: tpl.restSeconds || 60,
        difficulty: tpl.difficulty
      }
    ]);
  };

  const handleRemoveExerciseRow = (index: number) => {
    const nextEx = [...exercises];
    nextEx.splice(index, 1);
    setExercises(nextEx);
  };

  const handleExerciseChange = (index: number, key: keyof WorkoutExercise, val: any) => {
    const nextEx = [...exercises];
    nextEx[index] = {
      ...nextEx[index],
      [key]: val
    };
    setExercises(nextEx);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Por favor escribe un nombre para el entrenamiento.");
      return;
    }
    if (exercises.length === 0) {
      alert("Por favor añade al menos un ejercicio.");
      return;
    }
    // Validate rows
    const invalidRow = exercises.some(e => !e.routineName.trim() || !e.exerciseName.trim() || !e.sets || !e.reps);
    if (invalidRow) {
      alert("Por favor completa los campos de sección, ejercicio, series y repeticiones.");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/admin/workouts/${editingId}` : "/api/admin/workouts";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          difficulty,
          exercises
        })
      });

      if (res.ok) {
        await loadWorkouts();
        setShowDialog(false);
        if (onWorkoutsUpdated) onWorkoutsUpdated();
      } else {
        const data = await res.json() as { error?: string };
        alert(`Error al guardar: ${data.error || "desconocido"}`);
      }
    } catch (error) {
      console.error("Failed to save workout:", error);
      alert("Error de conexión.");
    }
  };

  const handleDelete = async (id: number, workoutName: string) => {
    if (!confirm(`¿Eliminar el entrenamiento "${workoutName}"? Todos los enlaces compartidos dejarán de funcionar.`)) return;

    try {
      const res = await fetch(`/api/admin/workouts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        await loadWorkouts();
        if (onWorkoutsUpdated) onWorkoutsUpdated();
      }
    } catch (err) {
      console.error("Failed to delete workout:", err);
    }
  };

  const handleCopyLink = async (token: string) => {
    const origin = window.location.origin;
    const link = `${origin}/workout/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedWorkouts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filters
  const filteredWorkouts = workouts.filter((w) => {
    const matchesSearch = 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty = 
      difficultyFilter === "todos" || 
      w.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

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

  const filteredTemplates = templates.filter(t => 
    t.exerciseName.toLowerCase().includes(templateSearch.toLowerCase()) ||
    t.routineName.toLowerCase().includes(templateSearch.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="flex flex-col h-[600px] rounded-2xl border border-white/8 bg-zinc-950/80 overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-white/8 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Sparkles size={16} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-white">Entrenamientos (Workouts)</p>
            <p className="text-[10px] text-light/50 font-medium">Enlaces Mágicos para Alumnos</p>
          </div>
        </div>
        <Button 
          onClick={handleOpenAdd} 
          size="sm" 
          className="bg-primary text-white hover:scale-105 transition-all duration-200 text-xs font-bold px-3 py-1.5 h-8"
        >
          <Plus size={14} className="mr-1" />
          <span>Crear Workout</span>
        </Button>
      </div>

      {/* Filters bar */}
      <div className="px-4 py-2 border-b border-white/5 bg-zinc-900/20 flex flex-col sm:flex-row gap-2 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-zinc-500" size={13} />
          <input
            type="text"
            placeholder="Buscar por entrenamiento..."
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

      {/* Workouts List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
        {loading ? (
          <div className="h-full flex items-center justify-center flex-col gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-xs text-light/50">Cargando entrenamientos...</p>
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/5 rounded-xl bg-white/1">
            <AlertCircle size={24} className="text-zinc-600 mb-2" />
            <p className="text-xs font-bold text-light/70">No hay workouts registrados</p>
            <p className="text-[10px] text-light/40 mt-1 max-w-[220px]">
              Crea tu primer entrenamiento para generar un enlace mágico que puedas compartir con tus alumnos.
            </p>
          </div>
        ) : (
          filteredWorkouts.map((w) => {
            const isExpanded = !!expandedWorkouts[w.id];
            
            // Group exercises in this workout by routine section for summary
            const sectMap: Record<string, number> = {};
            w.exercises.forEach(e => {
              sectMap[e.routineName] = (sectMap[e.routineName] || 0) + 1;
            });
            const sectionsCount = Object.keys(sectMap).length;

            return (
              <div
                key={w.id}
                className="group rounded-xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all duration-200 overflow-hidden"
              >
                {/* Header Row */}
                <div className="p-3 flex justify-between items-center gap-3">
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => toggleExpand(w.id)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${getDifficultyColor(w.difficulty)}`}>
                        {w.difficulty}
                      </span>
                      <span className="text-[9px] text-light/40 font-bold">
                        {sectionsCount} sección(es) · {w.exercises.length} ejercicio(s)
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1 leading-tight flex items-center gap-1.5">
                      <Dumbbell size={12} className="text-primary flex-shrink-0" />
                      <span>{w.name}</span>
                      {isExpanded ? <ChevronUp size={12} className="text-light/30" /> : <ChevronDown size={12} className="text-light/30" />}
                    </h4>
                    {w.description && (
                      <p className="text-[10px] text-light/40 mt-1 truncate">
                        {w.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 items-center flex-shrink-0">
                    <button
                      onClick={() => handleCopyLink(w.magicToken)}
                      className={`p-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 border transition-all ${
                        copiedToken === w.magicToken
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                      }`}
                      title="Copiar Enlace Mágico"
                    >
                      {copiedToken === w.magicToken ? <Check size={11} /> : <Share2 size={11} />}
                      <span className="text-[9px]">{copiedToken === w.magicToken ? "Copiado" : "Compartir"}</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(w)}
                      className="p-1.5 rounded bg-zinc-800 text-light/75 hover:text-white border border-white/5 transition-all text-[9px]"
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(w.id, w.name)}
                      className="p-1.5 rounded bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-500/10 transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 bg-black/20 border-t border-white/5 space-y-2 text-xs">
                    <div className="bg-zinc-950/80 rounded-lg p-2 border border-white/5 flex items-center gap-2 justify-between">
                      <span className="text-[10px] text-light/50 font-mono select-all truncate max-w-[220px]">
                        {window.location.origin}/workout/{w.magicToken}
                      </span>
                      <button 
                        onClick={() => handleCopyLink(w.magicToken)}
                        className="text-[9px] font-bold text-primary flex items-center gap-1 hover:underline"
                      >
                        <Clipboard size={10} /> Copiar Link
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {Object.keys(sectMap).map((sectionName) => (
                        <div key={sectionName} className="space-y-1">
                          <p className="text-[9px] font-black uppercase text-primary tracking-wider">{sectionName}</p>
                          <div className="pl-2 border-l border-white/10 space-y-1">
                            {w.exercises
                              .filter(e => e.routineName === sectionName)
                              .map((e, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[10px] text-light/80">
                                  <span>{e.exerciseName}</span>
                                  <span className="text-light/40 flex items-center gap-1">
                                    {e.sets}x{e.reps} {e.intensityPct ? `(${e.intensityPct}%)` : ""}
                                    {e.restSeconds ? <span className="text-cyan-400">· {e.restSeconds}s</span> : ""}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer info */}
      <div className="px-4 py-2 bg-zinc-950 border-t border-white/5 flex justify-between items-center flex-shrink-0 text-[9px] text-light/40">
        <span>Total: {workouts.length} entrenamientos</span>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[850px] max-h-[85vh] overflow-y-auto bg-zinc-950 border border-white/10 text-white shadow-2xl scrollbar-thin">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingId ? "Editar Entrenamiento" : "Crear Nuevo Entrenamiento"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            
            {/* Form details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1">Nombre del Workout *</label>
                <input
                  type="text"
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Lunes - Fuerza de Squat + Metcon"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1">Dificultad *</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white"
                >
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1">Instrucciones / Notas generales</label>
              <textarea
                className="w-full p-2 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Calentar bien hombros. El Metcon es de alta intensidad, ritmo constante."
                rows={2}
              />
            </div>

            {/* Base de Rutinas search templates panel */}
            <div className="p-3 bg-zinc-900/50 rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">Importar desde Base de Rutinas</span>
                <span className="text-[9px] text-light/40">Busca y añade ejercicios guardados</span>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 text-zinc-500" size={12} />
                <input
                  type="text"
                  placeholder="Buscar ejercicio en la Base de Rutinas..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
              {templateSearch.trim() && (
                <div className="bg-zinc-950 border border-white/5 rounded-lg p-1.5 divide-y divide-white/5">
                  {filteredTemplates.length === 0 ? (
                    <p className="text-[10px] text-light/40 p-2">No se encontraron plantillas.</p>
                  ) : (
                    filteredTemplates.map(tpl => (
                      <div key={tpl.id} className="flex justify-between items-center p-1.5 text-[10px] group/item">
                        <div>
                          <span className="font-extrabold text-white">{tpl.exerciseName}</span>
                          <span className="text-light/50 ml-1.5">({tpl.routineName} · {tpl.sets}x{tpl.reps})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleAddTemplateToExercises(tpl);
                            setTemplateSearch("");
                          }}
                          className="px-2 py-0.5 rounded bg-primary text-white font-bold hover:scale-105 active:scale-95 transition-all text-[9px]"
                        >
                          Añadir
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Exercises checklist section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/60">Ejercicios Asignados *</label>
                <Button 
                  type="button" 
                  onClick={handleAddExerciseRow} 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-[10px] border-white/10 hover:bg-zinc-800 text-light"
                >
                  <Plus size={11} className="mr-1" /> Añadir Fila
                </Button>
              </div>

              {/* Table Header for inputs */}
              {exercises.length > 0 && (
                <div className="grid grid-cols-12 gap-2 pb-1.5 border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-light/40 hidden sm:grid pl-1">
                  <div className="col-span-2">Sección / Grupo</div>
                  <div className="col-span-3">Ejercicio</div>
                  <div className="col-span-1 text-center">Sets</div>
                  <div className="col-span-2 text-center">Repeticiones</div>
                  <div className="col-span-1 text-center">Int. %</div>
                  <div className="col-span-2 text-center">Descanso (s)</div>
                  <div className="col-span-1 text-center">Acción</div>
                </div>
              )}

              {/* Rows */}
              <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-1 divide-y divide-white/5">
                {exercises.length === 0 ? (
                  <p className="text-[11px] text-light/40 text-center py-4">No hay ejercicios asignados. Añade uno con "Añadir Fila" o búscalo en el panel superior.</p>
                ) : (
                  exercises.map((ex, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 pt-3 first:pt-0 items-start">
                      {/* Routine name group */}
                      <div className="col-span-2">
                        <input
                          type="text"
                          required
                          value={ex.routineName}
                          onChange={(e) => handleExerciseChange(idx, "routineName", e.target.value)}
                          placeholder="Sección"
                          title="Sección / Grupo"
                          className="w-full p-2 bg-zinc-900 border border-white/5 rounded-lg text-xs text-white outline-none focus:border-primary"
                        />
                      </div>
                      
                      {/* Exercise name */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          required
                          value={ex.exerciseName}
                          onChange={(e) => handleExerciseChange(idx, "exerciseName", e.target.value)}
                          placeholder="Ejercicio"
                          title="Nombre del Ejercicio"
                          className="w-full p-2 bg-zinc-900 border border-white/5 rounded-lg text-xs text-white outline-none focus:border-primary"
                        />
                      </div>

                      {/* Sets */}
                      <div className="col-span-1">
                        <input
                          type="number"
                          min="1"
                          required
                          value={ex.sets}
                          onChange={(e) => handleExerciseChange(idx, "sets", parseInt(e.target.value) || 0)}
                          placeholder="Sets"
                          title="Sets"
                          className="w-full p-2 bg-zinc-900 border border-white/5 rounded-lg text-xs text-white outline-none text-center"
                        />
                      </div>

                      {/* Reps */}
                      <div className="col-span-2">
                        <input
                          type="text"
                          required
                          value={ex.reps}
                          onChange={(e) => handleExerciseChange(idx, "reps", e.target.value)}
                          placeholder="Reps (ej: 8-10)"
                          title="Repeticiones"
                          className="w-full p-2 bg-zinc-900 border border-white/5 rounded-lg text-xs text-white outline-none text-center"
                        />
                      </div>

                      {/* Intensity */}
                      <div className="col-span-1">
                        <input
                          type="number"
                          value={ex.intensityPct || ""}
                          onChange={(e) => handleExerciseChange(idx, "intensityPct", e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="Int %"
                          title="Intensidad % (Opcional)"
                          className="w-full p-2 bg-zinc-900 border border-white/5 rounded-lg text-xs text-white outline-none text-center"
                        />
                      </div>

                      {/* Rest Seconds */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          value={ex.restSeconds || ""}
                          onChange={(e) => handleExerciseChange(idx, "restSeconds", e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="Desc. (s)"
                          title="Descanso en segundos (Opcional)"
                          className="w-full p-2 bg-zinc-900 border border-white/5 rounded-lg text-xs text-white outline-none text-center"
                        />
                      </div>

                      {/* Remove Row Button */}
                      <div className="col-span-1 flex justify-center pt-1.5">
                        <button
                          type="button"
                          onClick={() => handleRemoveExerciseRow(idx)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/10 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      {/* Description column (full-width under the inputs) */}
                      <div className="col-span-11 pl-1">
                        <input
                          type="text"
                          value={ex.description || ""}
                          onChange={(e) => handleExerciseChange(idx, "description", e.target.value)}
                          placeholder="Descripción opcional: ritmo de ejecución, indicaciones de técnica, recomendaciones de seguridad..."
                          className="w-full py-1.5 px-3 bg-zinc-900/40 border border-dashed border-white/5 rounded-lg text-[10px] text-light/50 outline-none focus:border-white/10 placeholder-zinc-600 focus:bg-zinc-900 transition-all"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-white/5">
              <Button variant="outline" size="sm" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                className="bg-primary text-white hover:scale-105 transition-all duration-300 font-bold text-xs"
              >
                {editingId ? "Actualizar Workout" : "Crear Workout"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
