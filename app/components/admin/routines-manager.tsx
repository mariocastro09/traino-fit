import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Plus, Edit, Trash2, Search, Dumbbell, ShieldAlert, Clock, Layers,
  Wand2, ChevronRight, CheckCircle2, RotateCcw, Flame, Zap, Brain,
} from "lucide-react";
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
  restSeconds?: number;
  section?: string;
  difficulty: "Principiante" | "Intermedio" | "Avanzado" | string;
  createdAt?: string;
  updatedAt?: string;
}

interface RoutinesManagerProps {
  onRefreshTrigger?: number;
  onRoutinesUpdated?: () => void;
}

// ─── Deterministic Routine Builder Templates ──────────────────────────────────

const BUILDER_GOALS = [
  { id: "fuerza", label: "Fuerza Máxima", emoji: "🏋️", desc: "1-5 reps, 80-95% RM, descanso largo", sets: [4,5], repsRange: "3-5", intensity: [80, 90], rest: 240 },
  { id: "hipertrofia", label: "Hipertrofia", emoji: "💪", desc: "8-12 reps, 65-75% RM, descanso moderado", sets: [3,4], repsRange: "8-12", intensity: [65, 75], rest: 90 },
  { id: "resistencia", label: "Resistencia Muscular", emoji: "🔥", desc: "15-20 reps, 50-60% RM, descanso corto", sets: [3,3], repsRange: "15-20", intensity: [50, 60], rest: 45 },
  { id: "metabolico", label: "Metabólico / WOD", emoji: "⚡", desc: "AMRAP/EMOM, alta intensidad, mínimo descanso", sets: [1,1], repsRange: "AMRAP 10 min", intensity: [0, 0], rest: 60 },
  { id: "movilidad", label: "Movilidad y Recuperación", emoji: "🧘", desc: "Peso corporal, 2 series, descanso libre", sets: [2,2], repsRange: "10-12", intensity: [0, 0], rest: 30 },
];

const BUILDER_LEVELS = [
  { id: "Principiante", label: "Principiante", emoji: "🌱" },
  { id: "Intermedio", label: "Intermedio", emoji: "💪" },
  { id: "Avanzado", label: "Avanzado", emoji: "🏆" },
];

const BUILDER_MUSCLES = [
  { id: "piernas", label: "Tren Inferior", emoji: "🦵" },
  { id: "empuje", label: "Empuje Superior", emoji: "🤜" },
  { id: "jalon", label: "Jalón / Espalda", emoji: "🏹" },
  { id: "fullbody", label: "Full Body", emoji: "🔄" },
  { id: "core", label: "Core / Zona Media", emoji: "🧘" },
];

type ExerciseTemplate = {
  name: string;
  section: string;
  description: string;
  bodyweight?: boolean;
};

const EXERCISE_LIBRARY: Record<string, Record<string, ExerciseTemplate[]>> = {
  piernas: {
    Principiante: [
      { name: "Sentadilla de Aire (Air Squat)", section: "Calentamiento", description: "Rompe el paralelo, rodillas alineadas con los pies.", bodyweight: true },
      { name: "Sentadilla Goblet con Mancuerna", section: "Principal", description: "Mancuerna contra el pecho, espalda recta durante toda la bajada." },
      { name: "Estocadas Caminando (Walking Lunges)", section: "Principal", description: "Paso amplio, rodilla trasera casi toca el suelo. Torso erguido." },
      { name: "Peso Muerto Rumano con Mancuernas", section: "Principal", description: "Bisagra de cadera, mantén la espalda neutra durante el descenso." },
      { name: "Puente de Glúteos (Glute Bridge)", section: "Finalizador", description: "Aprieta glúteos en la parte superior, mantén 1-2 segundos." },
    ],
    Intermedio: [
      { name: "Sentadilla Trasera (Back Squat)", section: "Calentamiento", description: "2 series de activación al 50%. Foco en profundidad y postura." },
      { name: "Sentadilla Trasera (Back Squat)", section: "Principal", description: "Espalda neutra, rodillas empujando hacia afuera, profundidad completa." },
      { name: "Peso Muerto Convencional (Deadlift)", section: "Principal", description: "Empuja el suelo, no jales. Espalda plana, cadera baja al inicio." },
      { name: "Zancadas con Barra (Barbell Lunges)", section: "Principal", description: "Paso controlado, baja sin golpear la rodilla. Alternando piernas." },
      { name: "Extensión de Cuádriceps en Máquina", section: "Principal", description: "Rango completo de movimiento, contrae al subir, baja lento." },
      { name: "Curl de Isquiotibiales (Leg Curl)", section: "Finalizador", description: "Contrae fuerte arriba, baja de manera excéntrica y controlada." },
    ],
    Avanzado: [
      { name: "Sentadilla Trasera Pesada (Heavy Back Squat)", section: "Calentamiento", description: "Activación progresiva al 60-70%. Movilidad de tobillo y cadera." },
      { name: "Sentadilla Frontal (Front Squat)", section: "Principal", description: "Codos altos, rack alto, torso vertical. Profundidad completa." },
      { name: "Peso Muerto Convencional (Deadlift)", section: "Principal", description: "Barra sobre el mediopié, jalón explosivo con las piernas." },
      { name: "Sentadilla Búlgara (Bulgarian Split Squat)", section: "Principal", description: "Pie trasero elevado, desciende controlado, rodilla delantera sobre el pie." },
      { name: "Prensa de Piernas (Leg Press)", section: "Principal", description: "Pies a la anchura de los hombros, profundidad sin despegar la cadera." },
      { name: "Good Mornings con Barra", section: "Finalizador", description: "Bisagra de cadera, espalda neutra, peso ligero, foco en isquiotibiales." },
    ],
  },
  empuje: {
    Principiante: [
      { name: "Flexiones de Brazo (Push-ups)", section: "Calentamiento", description: "Cuerpo recto como tabla, codos a 45°. Rodillas si es necesario.", bodyweight: true },
      { name: "Press de Mancuernas en Banco Plano", section: "Principal", description: "Codos a 45° del torso, empuja explosivo, baja controlado." },
      { name: "Press de Hombros con Mancuernas (Sentado)", section: "Principal", description: "Codos a 90° al bajar, empuja directo arriba sin arquear la espalda." },
      { name: "Aperturas con Mancuernas (Banco Plano)", section: "Principal", description: "Ligera flexión del codo, baja hasta sentir estiramiento, no más." },
      { name: "Extensión de Tríceps con Cuerda (Polea)", section: "Finalizador", description: "Codos pegados al cuerpo. Extiende completamente y contrae." },
    ],
    Intermedio: [
      { name: "Press de Banca con Barra (Bench Press)", section: "Calentamiento", description: "Serie de activación al 50%. Retracción escapular completa." },
      { name: "Press de Banca con Barra (Bench Press)", section: "Principal", description: "Retracción escapular, codos a 45°, toca pecho y empuja explosivo." },
      { name: "Press Militar con Barra (Standing OHP)", section: "Principal", description: "De pie sin impulso. Aprieta el core, empuja directo sobre la cabeza." },
      { name: "Fondos en Paralelas (Dips)", section: "Principal", description: "Torso ligeramente inclinado para pectoral, codos no van más allá de 90°.", bodyweight: true },
      { name: "Elevaciones Laterales con Mancuernas", section: "Principal", description: "Ligera flexión del codo, no balancees el torso, llega a la altura del hombro." },
      { name: "Extensión Tríceps en Banco (Skull Crushers)", section: "Finalizador", description: "Codos fijos, baja la barra hacia la frente de forma controlada." },
    ],
    Avanzado: [
      { name: "Press de Banca con Barra (Bench Press)", section: "Calentamiento", description: "Activación progresiva al 60-70%. Foco en retracción escapular." },
      { name: "Press de Banca Pesado (Heavy Bench)", section: "Principal", description: "Arco natural de espalda, barra baja al esternón. Empuje máximo." },
      { name: "Press Militar Pesado (Heavy OHP)", section: "Principal", description: "Barra desde el rack, sin impulso de piernas. Core tenso al máximo." },
      { name: "Press Inclinado con Mancuernas", section: "Principal", description: "Banco a 30-45°, mancuernas alineadas con el pectoral superior." },
      { name: "Fondos Lastrados (Weighted Dips)", section: "Principal", description: "Disco colgante del cinturón, rango completo de movimiento.", bodyweight: false },
      { name: "Elevaciones Laterales en Polea", section: "Finalizador", description: "Contrae el deltoides lateral, no eleves por encima del hombro." },
    ],
  },
  jalon: {
    Principiante: [
      { name: "Remo con Mancuerna (Dumbbell Row)", section: "Calentamiento", description: "Apoyo en banco, tira del codo hacia atrás, no rotes el torso." },
      { name: "Jalón al Pecho en Polea (Lat Pulldown)", section: "Principal", description: "Agarre prono, tira hacia el esternón, contrae dorsales al bajar." },
      { name: "Remo en Polea Baja (Seated Row)", section: "Principal", description: "Espalda recta, tira hacia el abdomen, aprieta omóplatos al final." },
      { name: "Curl de Bíceps con Mancuernas", section: "Principal", description: "Codos fijos al costado, sube sin balancear, baja lento." },
      { name: "Face Pulls con Polea", section: "Finalizador", description: "Polea alta, tira hacia la cara, codos arriba para trabajar los romboides." },
    ],
    Intermedio: [
      { name: "Dominadas (Pull-ups)", section: "Calentamiento", description: "Agarre prono amplio, activa los dorsales antes de jalar.", bodyweight: true },
      { name: "Peso Muerto Rumano con Barra", section: "Principal", description: "Bisagra de cadera perfecta, espalda neutra, siente el estiramiento." },
      { name: "Remo con Barra (Barbell Row)", section: "Principal", description: "Torso a 45°, tira hacia el abdomen bajo, codos hacia atrás." },
      { name: "Jalón al Pecho en Polea Agarre Neutro", section: "Principal", description: "Agarre neutro, mayor activación de dorsales medios, controlado." },
      { name: "Curl Martillo con Mancuernas (Hammer Curl)", section: "Principal", description: "Agarre neutro, activa el braquial, codos pegados al cuerpo." },
      { name: "Face Pulls con Cuerda", section: "Finalizador", description: "Codos en línea con los hombros, rotación externa al final del movimiento." },
    ],
    Avanzado: [
      { name: "Dominadas Lastradas (Weighted Pull-ups)", section: "Calentamiento", description: "Activación con peso corporal primero, luego añade disco.", bodyweight: false },
      { name: "Peso Muerto Convencional (Deadlift)", section: "Principal", description: "Barra rasando las espinillas, extensión explosiva, lock-out completo." },
      { name: "Remo con Barra Pendlay (Pendlay Row)", section: "Principal", description: "Desde el suelo cada rep, torso paralelo, explosivo hacia la cintura." },
      { name: "Remo con Mancuerna Pesada", section: "Principal", description: "Rango completo, tira hasta tocar la cadera, contrae el dorsal." },
      { name: "Dominadas Agarre Estrecho (Close-Grip Pull-ups)", section: "Principal", description: "Agarre neutro o supino estrecho, activa bíceps y dorsal bajo.", bodyweight: true },
      { name: "Curl de Bíceps con Barra", section: "Finalizador", description: "Codos fijos, sin balanceo lumbar, baja eccéntrico en 3 segundos." },
    ],
  },
  fullbody: {
    Principiante: [
      { name: "Trote Suave / Saltos de Tijera", section: "Calentamiento", description: "3-5 minutos para elevar la temperatura corporal.", bodyweight: true },
      { name: "Sentadilla Goblet con Mancuerna", section: "Principal", description: "Mancuerna contra el pecho, espalda recta, profundidad sobre el paralelo." },
      { name: "Press de Mancuernas en Banco Plano", section: "Principal", description: "Codos a 45°, empuja explosivo, baja en 2-3 segundos." },
      { name: "Remo con Mancuerna (Dumbbell Row)", section: "Principal", description: "Un brazo apoyado, tira del codo hacia atrás, espalda plana." },
      { name: "Peso Muerto con Mancuernas (Dumbbell Deadlift)", section: "Principal", description: "Espalda neutral, empuja el suelo con las piernas, barra cerca del cuerpo." },
      { name: "Plank / Plancha Abdominal", section: "Finalizador", description: "Core apretado, cadera neutra, respira. 30-45 segundos por serie.", bodyweight: true },
    ],
    Intermedio: [
      { name: "Movilidad Articular Dinámica", section: "Calentamiento", description: "Círculos de cadera, hombros y tobillos. Leg swings. 5 min.", bodyweight: true },
      { name: "Sentadilla Trasera (Back Squat)", section: "Principal", description: "Profundidad completa, rodillas empujando afuera, espalda neutral." },
      { name: "Press de Banca con Barra (Bench Press)", section: "Principal", description: "Retracción escapular, barra al esternón, empuje controlado." },
      { name: "Peso Muerto Convencional (Deadlift)", section: "Principal", description: "Barra rasando el cuerpo, extensión completa, no hiperextiendas." },
      { name: "Press Militar con Mancuernas (Dumbbell OHP)", section: "Principal", description: "De pie, core apretado, empuja directo arriba. Sin arqueo lumbar." },
      { name: "Remo en Polea (Cable Row)", section: "Principal", description: "Tira hacia el abdomen, aprieta omóplatos al final de cada rep." },
      { name: "Kettlebell Swings", section: "Finalizador", description: "Bisagra de cadera potente, no es una sentadilla. Glúteos impulsan." },
    ],
    Avanzado: [
      { name: "Activación con Movimientos Olímpicos", section: "Calentamiento", description: "Hang power clean o cargada de potencia al 50% de 1RM. 3×5." },
      { name: "Sentadilla Frontal (Front Squat)", section: "Principal", description: "Codos altos en el rack, torso vertical, profundidad completa." },
      { name: "Press de Banca Pesado (Heavy Bench)", section: "Principal", description: "Arco natural, retracción máxima, leg drive controlado." },
      { name: "Peso Muerto Pesado (Heavy Deadlift)", section: "Principal", description: "Máxima tensión de cintura escapular y lumbar, jalón explosivo." },
      { name: "Press Militar con Barra Pesado (Heavy OHP)", section: "Principal", description: "Sin impulso de piernas. Core máximo. Barra sobre los hombros." },
      { name: "Dominadas Lastradas (Weighted Pull-ups)", section: "Principal", description: "Rango completo, contrae dorsal en la posición superior.", bodyweight: false },
      { name: "Cargada de Potencia (Power Clean)", section: "Finalizador", description: "Tirón explosivo desde el suelo. Recepción en cuarto de sentadilla." },
    ],
  },
  core: {
    Principiante: [
      { name: "Respiración Diafragmática + Activación", section: "Calentamiento", description: "Tumbado, inhala expandiendo el abdomen, exhala con tensión del core.", bodyweight: true },
      { name: "Plancha Abdominal (Plank)", section: "Principal", description: "Cuerpo recto, core apretado, no dejes caer la cadera. 30s.", bodyweight: true },
      { name: "Crunch Abdominal Básico", section: "Principal", description: "Lumbares en el suelo, levanta solo los hombros, exhala al subir.", bodyweight: true },
      { name: "Elevación de Cadera (Glute Bridge)", section: "Principal", description: "Aprieta glúteos y core, mantén 2 segundos arriba.", bodyweight: true },
      { name: "Rodillas al Pecho Alternadas (Mountain Climbers)", section: "Finalizador", description: "Posición de push-up, lleva las rodillas al pecho sin mover la cadera.", bodyweight: true },
    ],
    Intermedio: [
      { name: "Hollow Body Hold", section: "Calentamiento", description: "Espalda pegada al suelo, piernas y brazos extendidos levemente elevados.", bodyweight: true },
      { name: "Plancha con Elevación de Pierna (Plank + Leg Raise)", section: "Principal", description: "Mantén la posición de plank y eleva una pierna a la vez. Alterna.", bodyweight: true },
      { name: "Rueda Abdominal (Ab Wheel Rollout)", section: "Principal", description: "Extiende lento, mantén el core, regresa sin colapsar la zona lumbar.", bodyweight: true },
      { name: "Russian Twist con Disco", section: "Principal", description: "Pies levantados, rota el torso manteniendo la espalda recta a 45°." },
      { name: "Levantamiento de Piernas Colgado (Hanging Leg Raise)", section: "Principal", description: "Desde la barra, sube las piernas sin impulso. Lento y controlado.", bodyweight: true },
      { name: "Dead Bug", section: "Finalizador", description: "Baja brazo y pierna opuesta manteniendo la zona lumbar pegada al suelo.", bodyweight: true },
    ],
    Avanzado: [
      { name: "L-Sit en Paralelas (L-Sit Hold)", section: "Calentamiento", description: "Piernas paralelas al suelo desde las paralelas. Mantén la posición.", bodyweight: true },
      { name: "Dragon Flag", section: "Principal", description: "Controlado con el core completo. Baja excéntrico en 4-5 segundos.", bodyweight: true },
      { name: "Levantamiento de Piernas con Twist (Toes-to-Bar)", section: "Principal", description: "Colgado en barra, lleva los pies a las manos. Sin columpio.", bodyweight: true },
      { name: "Plancha con Lastre (Weighted Plank)", section: "Principal", description: "Disco en la espalda. Mantén posición sin desviarse. 45-60s." },
      { name: "Ab Rollout de Pie (Standing Ab Wheel)", section: "Principal", description: "Desde de pie, extiende completamente, regresa con fuerza del core.", bodyweight: true },
      { name: "Hollow Body Rocks", section: "Finalizador", description: "Balanceo lento manteniendo forma de hollow durante todo el movimiento.", bodyweight: true },
    ],
  },
};

const WARMUP_EXERCISES: Record<string, ExerciseTemplate> = {
  piernas: { name: "Movilidad de Cadera + Air Squats", section: "Calentamiento", description: "Círculos de cadera, 10 sentadillas de aire al 50% de profundidad.", bodyweight: true },
  empuje: { name: "Rotaciones de Hombro + Push-up de Activación", section: "Calentamiento", description: "20 rotaciones por brazo, 10 push-ups lentos de activación escapular.", bodyweight: true },
  jalon: { name: "Band Pull-Aparts + Activación Dorsal", section: "Calentamiento", description: "Separa los brazos con goma tensora, 15 reps. Activa los omóplatos.", bodyweight: true },
  fullbody: { name: "Movilidad Articular General (5 min)", section: "Calentamiento", description: "Rotaciones de tobillos, caderas, hombros y cuello. Trote suave.", bodyweight: true },
  core: { name: "Cat-Cow + Activación de Transverso", section: "Calentamiento", description: "4 rondas de cat-cow + 10 exhalas forzadas apretando el abdomen.", bodyweight: true },
};

function buildRoutineFromTemplate(
  routineName: string,
  goal: typeof BUILDER_GOALS[0],
  level: string,
  muscle: string
): Omit<Routine, "id" | "createdAt" | "updatedAt">[] {
  const exercises: ExerciseTemplate[] = EXERCISE_LIBRARY[muscle]?.[level] || EXERCISE_LIBRARY[muscle]?.["Intermedio"] || [];
  const warmup = WARMUP_EXERCISES[muscle];
  const allExercises: ExerciseTemplate[] = warmup ? [warmup, ...exercises] : exercises;

  return allExercises.map((ex) => {
    const isWarmup = ex.section === "Calentamiento";
    const isFinisher = ex.section === "Finalizador";
    const isMetabolic = goal.id === "metabolico";

    let sets = isWarmup ? 2 : (goal.sets[0] + goal.sets[1]) / 2;
    let reps = isWarmup ? "12" : goal.repsRange;
    let intensityPct: number | undefined = undefined;
    let restSeconds = isWarmup ? 30 : (isFinisher ? 45 : goal.rest);

    if (isMetabolic) {
      sets = 1;
      reps = isWarmup ? "10" : "AMRAP 10 min";
      restSeconds = 60;
    }

    if (!isWarmup && !isFinisher && !isMetabolic && !ex.bodyweight) {
      intensityPct = goal.intensity[0] + Math.round((goal.intensity[1] - goal.intensity[0]) / 2);
    }

    return {
      routineName,
      exerciseName: ex.name,
      description: ex.description,
      section: ex.section,
      sets: Math.round(sets),
      reps,
      intensityPct: intensityPct || undefined,
      restSeconds,
      difficulty: level,
    };
  });
}

// ─── Section pill colors ──────────────────────────────────────────────────────
const SECTION_COLORS: Record<string, string> = {
  "Calentamiento": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Principal": "bg-primary/10 text-primary border-primary/20",
  "Finalizador": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "WOD": "bg-red-500/10 text-red-400 border-red-500/20",
  "Skill/Fuerza": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Cooldown": "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

function getSectionColor(section?: string) {
  if (!section) return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  return SECTION_COLORS[section] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
}

// ─── Component ────────────────────────────────────────────────────────────────
export function RoutinesManager({ onRefreshTrigger = 0, onRoutinesUpdated }: RoutinesManagerProps) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("todos");
  const [activeTab, setActiveTab] = useState<"library" | "builder">("library");

  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Routine>>({});

  // Builder state
  const [builderStep, setBuilderStep] = useState<"goal" | "level" | "muscle" | "name" | "preview">("goal");
  const [builderGoal, setBuilderGoal] = useState<typeof BUILDER_GOALS[0] | null>(null);
  const [builderLevel, setBuilderLevel] = useState<string | null>(null);
  const [builderMuscle, setBuilderMuscle] = useState<string | null>(null);
  const [builderName, setBuilderName] = useState("");
  const [previewRoutine, setPreviewRoutine] = useState<Omit<Routine, "id" | "createdAt" | "updatedAt">[]>([]);
  const [builderSaving, setBuilderSaving] = useState(false);
  const [builderSaved, setBuilderSaved] = useState(false);

  const loadRoutines = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/routines`, { credentials: "include" });
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

  useEffect(() => { loadRoutines(); }, [onRefreshTrigger]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ difficulty: "Intermedio", sets: 3, reps: "10", section: "Principal" });
    setShowDialog(true);
  };

  const handleOpenAddForRoutine = (routineName: string, difficulty: string) => {
    setEditingId(null);
    setForm({ routineName, difficulty, sets: 3, reps: "10", section: "Principal" });
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
      const url = editingId ? `/api/admin/routines/${editingId}` : `/api/admin/routines`;
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
      const response = await fetch(`/api/admin/routines/${id}`, { method: "DELETE", credentials: "include" });
      if (response.ok) {
        await loadRoutines();
        if (onRoutinesUpdated) onRoutinesUpdated();
      }
    } catch (error) {
      console.error("Failed to delete routine:", error);
    }
  };

  const resetBuilder = () => {
    setBuilderStep("goal");
    setBuilderGoal(null);
    setBuilderLevel(null);
    setBuilderMuscle(null);
    setBuilderName("");
    setPreviewRoutine([]);
    setBuilderSaved(false);
  };

  const handleBuilderPreview = () => {
    if (!builderGoal || !builderLevel || !builderMuscle || !builderName.trim()) return;
    const exercises = buildRoutineFromTemplate(builderName.trim(), builderGoal, builderLevel, builderMuscle);
    setPreviewRoutine(exercises);
    setBuilderStep("preview");
  };

  const handleBuilderSave = async () => {
    if (!previewRoutine.length) return;
    setBuilderSaving(true);
    try {
      const response = await fetch("/api/admin/routines", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(previewRoutine),
      });
      if (response.ok) {
        setBuilderSaved(true);
        await loadRoutines();
        if (onRoutinesUpdated) onRoutinesUpdated();
      }
    } catch (err) {
      console.error("Builder save failed:", err);
    } finally {
      setBuilderSaving(false);
    }
  };

  const filteredRoutines = routines.filter((r) => {
    const matchesSearch =
      r.routineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.exerciseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty =
      difficultyFilter === "todos" || r.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "principiante": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "intermedio": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "avanzado": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const groupedRoutines: Record<string, { difficulty: string; items: Routine[] }> = {};
  filteredRoutines.forEach((r) => {
    if (!groupedRoutines[r.routineName]) {
      groupedRoutines[r.routineName] = { difficulty: r.difficulty, items: [] };
    }
    groupedRoutines[r.routineName].items.push(r);
  });

  return (
    <div className="flex flex-col h-[680px] rounded-2xl border border-white/8 bg-zinc-950/80 overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-white/8 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Dumbbell size={16} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-white">Rutinas y Programas</p>
            <p className="text-[10px] text-light/50 font-medium">Biblioteca + Constructor Inteligente</p>
          </div>
        </div>
        {activeTab === "library" && (
          <Button onClick={handleOpenAdd} size="sm" className="bg-primary text-white hover:scale-105 transition-all duration-200 text-xs font-bold px-3 py-1.5 h-8">
            <Plus size={14} className="mr-1" /> Nueva
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 flex-shrink-0 bg-zinc-950/40">
        <button
          onClick={() => setActiveTab("library")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-extrabold uppercase tracking-wider transition-all ${
            activeTab === "library"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Layers size={11} /> Biblioteca
        </button>
        <button
          onClick={() => { setActiveTab("builder"); if (builderSaved) resetBuilder(); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-extrabold uppercase tracking-wider transition-all ${
            activeTab === "builder"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Wand2 size={11} /> Constructor
        </button>
      </div>

      {/* ── LIBRARY TAB ── */}
      {activeTab === "library" && (
        <>
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

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
            {loading ? (
              <div className="h-full flex items-center justify-center flex-col gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <p className="text-xs text-light/50">Cargando rutinas...</p>
              </div>
            ) : Object.keys(groupedRoutines).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/5 rounded-xl">
                <ShieldAlert size={24} className="text-zinc-600 mb-2" />
                <p className="text-xs font-bold text-light/70">No se encontraron rutinas</p>
                <p className="text-[10px] text-light/40 mt-1 max-w-[200px]">
                  Usa el <span className="text-primary font-bold">Constructor</span> para crear tu primera rutina, o el Coach IA para generarla.
                </p>
              </div>
            ) : (
              Object.entries(groupedRoutines).map(([routineName, group]) => (
                <div key={routineName} className="group p-4 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all duration-200 space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-black uppercase text-primary tracking-wider truncate max-w-[220px]">{routineName}</span>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${getDifficultyColor(group.difficulty)}`}>{group.difficulty}</span>
                      <span className="text-[8px] text-zinc-500 font-semibold">{group.items.length} ejercicios</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenAddForRoutine(routineName, group.difficulty)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all text-[9px] font-extrabold uppercase tracking-wider"
                      >
                        <Plus size={10} /> Añadir
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pl-3 border-l-2 border-white/8">
                    {group.items.map((routine) => (
                      <div key={routine.id} className="group/item flex justify-between items-start gap-3 text-xs">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {routine.section && (
                              <span className={`text-[7px] font-extrabold uppercase px-1 py-0.5 rounded border ${getSectionColor(routine.section)}`}>
                                {routine.section}
                              </span>
                            )}
                            <span className="font-bold text-white text-[11px] leading-tight">{routine.exerciseName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] flex-wrap">
                            <span className="text-primary font-bold">{routine.sets}×{routine.reps}</span>
                            {routine.intensityPct ? (
                              <span className="text-orange-400 font-semibold flex items-center gap-0.5"><Flame size={8} />{routine.intensityPct}% RM</span>
                            ) : null}
                            {routine.restSeconds ? (
                              <span className="text-cyan-400 font-semibold flex items-center gap-0.5"><Clock size={8} />{routine.restSeconds}s desc.</span>
                            ) : null}
                          </div>
                          {routine.description && (
                            <p className="text-[10px] text-light/35 leading-relaxed">{routine.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={() => handleOpenEdit(routine)} className="p-1 rounded bg-zinc-800 text-light/70 hover:text-white hover:bg-zinc-700 transition-all" title="Editar">
                            <Edit size={10} />
                          </button>
                          <button onClick={() => handleDelete(routine.id, routine.exerciseName)} className="p-1 rounded bg-red-950/20 text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/10 transition-all" title="Eliminar">
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 bg-zinc-950 border-t border-white/5 flex-shrink-0">
            <p className="text-[9px] text-light/40">Total: {routines.length} ejercicios registrados en {Object.keys(groupedRoutines).length} rutinas</p>
          </div>
        </>
      )}

      {/* ── BUILDER TAB ── */}
      {activeTab === "builder" && (
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10">
          {builderSaved ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <CheckCircle2 size={40} className="text-emerald-400" />
              <div>
                <p className="text-sm font-black text-white">¡Rutina guardada exitosamente!</p>
                <p className="text-[10px] text-zinc-500 mt-1">La puedes ver en la Biblioteca.</p>
              </div>
              <button
                onClick={resetBuilder}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
              >
                <RotateCcw size={12} /> Crear Otra Rutina
              </button>
            </div>
          ) : builderStep === "preview" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary">Vista Previa</p>
                  <p className="text-xs font-bold text-white mt-0.5">{builderName}</p>
                </div>
                <button onClick={() => setBuilderStep("name")} className="text-[10px] text-zinc-400 hover:text-white border border-zinc-800 rounded px-2 py-1 transition-all">← Volver</button>
              </div>
              <div className="space-y-2">
                {previewRoutine.map((ex, i) => (
                  <div key={i} className="p-3 rounded-lg bg-zinc-900/50 border border-white/5 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[7px] font-extrabold uppercase px-1 py-0.5 rounded border ${getSectionColor(ex.section)}`}>{ex.section}</span>
                      <span className="text-xs font-bold text-white">{ex.exerciseName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] flex-wrap">
                      <span className="text-primary font-bold">{ex.sets}×{ex.reps}</span>
                      {ex.intensityPct ? <span className="text-orange-400 flex items-center gap-0.5"><Flame size={8} />{ex.intensityPct}% RM</span> : null}
                      {ex.restSeconds ? <span className="text-cyan-400 flex items-center gap-0.5"><Clock size={8} />{ex.restSeconds}s desc.</span> : null}
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">{ex.description}</p>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleBuilderSave}
                disabled={builderSaving}
                className="w-full bg-primary text-white font-bold uppercase tracking-wider text-xs h-10 hover:scale-[1.01] transition-all"
              >
                {builderSaving ? "Guardando..." : "💾 Guardar en Biblioteca"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 max-w-md mx-auto">
              {/* Progress */}
              {builderStep !== "goal" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                    <span>Paso {["goal","level","muscle","name"].indexOf(builderStep) + 1} de 4</span>
                    <span>{Math.round((["goal","level","muscle","name"].indexOf(builderStep) + 1) / 4 * 100)}%</span>
                  </div>
                  <div className="h-0.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${(["goal","level","muscle","name"].indexOf(builderStep) + 1) / 4 * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Step: Goal */}
              {builderStep === "goal" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={14} className="text-primary" />
                    <p className="text-xs font-bold text-white uppercase tracking-wider">¿Cuál es el objetivo de esta rutina?</p>
                  </div>
                  {BUILDER_GOALS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => { setBuilderGoal(g); setBuilderStep("level"); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all bg-zinc-900/30 border-zinc-800 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                    >
                      <span className="text-xl flex-shrink-0">{g.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white">{g.label}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{g.desc}</p>
                      </div>
                      <ChevronRight size={14} className="text-zinc-600 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Step: Level */}
              {builderStep === "level" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Nivel del alumno</p>
                    <button onClick={() => setBuilderStep("goal")} className="text-[10px] text-zinc-400 hover:text-white border border-zinc-800 rounded px-2 py-1 transition-all">← Volver</button>
                  </div>
                  {BUILDER_LEVELS.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => { setBuilderLevel(l.id); setBuilderStep("muscle"); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all bg-zinc-900/30 border-zinc-800 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                    >
                      <span className="text-xl">{l.emoji}</span>
                      <p className="text-xs font-bold text-white">{l.label}</p>
                      <ChevronRight size={14} className="text-zinc-600 ml-auto flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Step: Muscle Group */}
              {builderStep === "muscle" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Grupo muscular / Enfoque</p>
                    <button onClick={() => setBuilderStep("level")} className="text-[10px] text-zinc-400 hover:text-white border border-zinc-800 rounded px-2 py-1 transition-all">← Volver</button>
                  </div>
                  {BUILDER_MUSCLES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setBuilderMuscle(m.id); setBuilderStep("name"); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all bg-zinc-900/30 border-zinc-800 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <p className="text-xs font-bold text-white">{m.label}</p>
                      <ChevronRight size={14} className="text-zinc-600 ml-auto flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Step: Name */}
              {builderStep === "name" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Nombre de la rutina</p>
                    <button onClick={() => setBuilderStep("muscle")} className="text-[10px] text-zinc-400 hover:text-white border border-zinc-800 rounded px-2 py-1 transition-all">← Volver</button>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5 space-y-1">
                    <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Configuración seleccionada</p>
                    <p className="text-xs text-white">{builderGoal?.emoji} {builderGoal?.label} · {builderLevel} · {BUILDER_MUSCLES.find(m => m.id === builderMuscle)?.emoji} {BUILDER_MUSCLES.find(m => m.id === builderMuscle)?.label}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Nombre de la rutina *</label>
                    <input
                      type="text"
                      autoFocus
                      value={builderName}
                      onChange={(e) => setBuilderName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && builderName.trim()) handleBuilderPreview(); }}
                      placeholder="Ej: Fuerza de Piernas · Martes"
                      className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                  <Button
                    onClick={handleBuilderPreview}
                    disabled={!builderName.trim()}
                    className="w-full bg-primary text-white font-bold uppercase tracking-wider text-xs h-10 hover:scale-[1.01] transition-all disabled:opacity-40"
                  >
                    <Zap size={13} className="mr-1.5" /> Generar Rutina
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[480px] bg-zinc-950 border border-white/10 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{editingId ? "Editar Ejercicio" : "Registrar Ejercicio"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Nombre de la Rutina *</label>
                <input type="text" className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white" value={form.routineName || ""} onChange={(e) => setForm({ ...form, routineName: e.target.value })} placeholder="Ej: Fuerza de Piernas" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Sección</label>
                <select value={form.section || ""} onChange={(e) => setForm({ ...form, section: e.target.value })} className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white">
                  <option value="">Sin sección</option>
                  <option value="Calentamiento">Calentamiento</option>
                  <option value="Principal">Principal</option>
                  <option value="Finalizador">Finalizador</option>
                  <option value="Skill/Fuerza">Skill/Fuerza</option>
                  <option value="WOD">WOD</option>
                  <option value="Cooldown">Cooldown</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Nombre del Ejercicio *</label>
              <input type="text" className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white" value={form.exerciseName || ""} onChange={(e) => setForm({ ...form, exerciseName: e.target.value })} placeholder="Ej: Peso Muerto (Deadlift)" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Series *</label>
                <input type="number" min="1" max="20" className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white" value={form.sets || ""} onChange={(e) => setForm({ ...form, sets: parseInt(e.target.value) || 0 })} placeholder="3" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Reps *</label>
                <input type="text" className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white" value={form.reps || ""} onChange={(e) => setForm({ ...form, reps: e.target.value })} placeholder="8-10" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">% RM</label>
                <input type="number" min="0" max="120" className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white" value={form.intensityPct || ""} onChange={(e) => setForm({ ...form, intensityPct: parseInt(e.target.value) || undefined })} placeholder="75" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Desc. (s)</label>
                <input type="number" min="0" max="600" className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white" value={(form as any).restSeconds || ""} onChange={(e) => setForm({ ...form, restSeconds: parseInt(e.target.value) || undefined } as any)} placeholder="90" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Dificultad *</label>
              <select value={form.difficulty || "Intermedio"} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white">
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Técnica / Descripción</label>
              <textarea className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-xs text-white" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Cue técnico principal + consideración de seguridad" rows={3} />
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-white/5">
              <Button variant="outline" size="sm" onClick={() => setShowDialog(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="bg-primary text-white hover:scale-105 transition-all duration-300 font-bold text-xs">{editingId ? "Actualizar" : "Registrar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
