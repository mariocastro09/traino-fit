import { useState, useEffect, useRef } from "react";
import { 
  Bot, Send, Dumbbell, Zap, RotateCcw, Clipboard, 
  ChevronRight, Package, Check, Plus, Calendar, LayoutGrid 
} from "lucide-react";
import { Button } from "~/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCall?: {
    action: "save_routine";
    routines: Array<{
      routineName: string;
      exerciseName: string;
      description?: string;
      sets: number;
      reps: string;
      intensityPct?: number;
      restSeconds?: number;
      difficulty: string;
    }>;
  };
  toolSaved?: boolean;
}

function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-amber-400 font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="bg-zinc-800/80 px-1.5 py-0.5 rounded text-amber-300 text-xs font-mono border border-zinc-700/50">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 mb-1"><span class="text-primary mt-0.5 flex-shrink-0">▸</span><span>$1</span></li>')
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, "<br/>");
}

// ── Onboarding Questions ────────────────────────────────
type OnboardingStep = "initial" | "program" | "type" | "level" | "duration" | "muscle" | "cycleSplit" | "done";

const WORKOUT_TYPES = [
  { id: "crossfit", label: "CrossFit / WOD", emoji: "⚡", desc: "AMRAP, EMOM, For-time" },
  { id: "pesas", label: "Fuerza / Pesas", emoji: "🏋️", desc: "Barbell, Mancuernas" },
  { id: "acondicionamiento", label: "Acondicionamiento", emoji: "🔥", desc: "Cardio + Funcional" },
  { id: "calistenia", label: "Calistenia", emoji: "🤸", desc: "Peso Corporal" },
  { id: "gimnasia", label: "Gimnasia", emoji: "🎯", desc: "Rings, Handstand" },
];

const LEVELS = [
  { id: "Principiante", label: "Principiante", emoji: "🌱", desc: "Recién empezando" },
  { id: "Intermedio", label: "Intermedio", emoji: "💪", desc: "6+ meses de experiencia" },
  { id: "Avanzado", label: "Avanzado", emoji: "🏆", desc: "Competidor / Atleta" },
];

const DURATIONS = [
  { id: "20", label: "20 min", emoji: "⚡" },
  { id: "45", label: "45 min", emoji: "🎯" },
  { id: "60", label: "60 min", emoji: "💪" },
  { id: "90", label: "90+ min", emoji: "🏆" },
];

const MUSCLE_GROUPS = [
  { id: "fullbody", label: "Full Body / Completo", emoji: "🏋️‍♂️", desc: "Todo el cuerpo" },
  { id: "upper", label: "Tren Superior", emoji: "💪", desc: "Pecho, hombros, espalda, brazos" },
  { id: "lower", label: "Tren Inferior", emoji: "🦵", desc: "Piernas, glúteos y pantorrillas" },
  { id: "core", label: "Core / Zona Media", emoji: "🧘", desc: "Abdomen y lumbares" },
];

const CYCLE_SPLITS = [
  { id: "ppl", label: "Empuje / Jalón / Pierna (PPL)", emoji: "🔄", desc: "Día 1: Empuje, Día 2: Jalón, Día 3: Pierna" },
  { id: "fullbody3x", label: "Full Body x3", emoji: "🏋️‍♂️", desc: "3 sesiones de cuerpo entero con progresión de fuerza" },
  { id: "upper_lower_core", label: "Superior / Inferior / Core", emoji: "⚡", desc: "Día 1: Tren Superior, Día 2: Tren Inferior, Día 3: Core y Cardio" },
];

interface AIChatWidgetProps {
  embedded?: boolean;
  onRoutineSaved?: () => void;
}

export function AIChatWidget({ embedded = false, onRoutineSaved }: AIChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savingWorkoutId, setSavingWorkoutId] = useState<number | null>(null);
  const [createdWorkoutLinks, setCreatedWorkoutLinks] = useState<Record<number, string>>({});
  const [copiedLinks, setCopiedLinks] = useState<Record<number, boolean>>({});
  
  // Equipment selection state
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [showEquipmentPanel, setShowEquipmentPanel] = useState(false);

  // Active tabs for cycle workouts, keyed by message index
  const [activeTabs, setActiveTabs] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const res = await fetch("/api/admin/equipment", { credentials: "include" });
      if (res.ok) {
        setEquipmentList(await res.json() as any[]);
      }
    } catch (err) {
      console.error("Failed to load equipment in chat widget:", err);
    }
  };

  const toggleEquipmentAvailability = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/equipment/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });
      if (res.ok) {
        setEquipmentList(prev => prev.map(e => e.id === id ? { ...e, isAvailable: !e.isAvailable } : e));
      }
    } catch (err) {
      console.error("Failed to toggle equipment availability in chat:", err);
    }
  };

  const groupEquipmentByWorkout = (items: any[]) => {
    const groups: Record<string, { label: string, items: any[], emoji: string }> = {
      chest: { label: "Pectoral / Empuje", emoji: "🏋️", items: [] },
      legs: { label: "Piernas / Tren Inferior", emoji: "🦵", items: [] },
      back: { label: "Espalda / Jalones", emoji: "💪", items: [] },
      arms: { label: "Hombros y Brazos", emoji: "⚡", items: [] },
      cables: { label: "Poleas y Cables", emoji: "🔌", items: [] },
      cardio: { label: "Cardio y Resistencia", emoji: "🚴", items: [] },
      other: { label: "Otros / Peso Corporal", emoji: "🤸", items: [] },
    };

    items.forEach(item => {
      const name = item.name.toLowerCase();
      const cat = item.category.toLowerCase();

      if (name.includes("pecho") || name.includes("chest") || name.includes("banca") || (name.includes("press") && !name.includes("militar") && !name.includes("hombro") && !name.includes("pierna") && !name.includes("leg")) || name.includes("pec")) {
        groups.chest.items.push(item);
      } else if (name.includes("pierna") || name.includes("leg") || name.includes("prensa") || name.includes("sentadilla") || name.includes("squat") || name.includes("femoral") || name.includes("glute") || name.includes("extens") || name.includes("curl") || name.includes("calf") || name.includes("pantorrilla") || name.includes("hack")) {
        groups.legs.items.push(item);
      } else if (name.includes("espalda") || name.includes("back") || name.includes("remo") || name.includes("row") || name.includes("pull") || name.includes("dorsal") || name.includes("dominada") || name.includes("lat")) {
        groups.back.items.push(item);
      } else if (name.includes("biceps") || name.includes("triceps") || name.includes("brazo") || name.includes("hombro") || name.includes("shoulder") || name.includes("militar") || name.includes("lateral") || name.includes("elevacion")) {
        groups.arms.items.push(item);
      } else if (name.includes("cable") || name.includes("polea") || name.includes("crossover") || name.includes("poleas")) {
        groups.cables.items.push(item);
      } else if (cat === "cardio" || name.includes("cardio") || name.includes("trote") || name.includes("correr") || name.includes("rower") || name.includes("bike") || name.includes("remadora") || name.includes("cinta") || name.includes("trotadora") || name.includes("bici") || name.includes("eliptica") || name.includes("saltar")) {
        groups.cardio.items.push(item);
      } else {
        groups.other.items.push(item);
      }
    });

    return Object.fromEntries(Object.entries(groups).filter(([_, g]) => g.items.length > 0));
  };

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("initial");
  const [programType, setProgramType] = useState<"single" | "cycle" | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null); // acts as Split label if programType is cycle

  // Onboarding Back History Navigation Stack
  const [stepHistory, setStepHistory] = useState<OnboardingStep[]>([]);

  const goToStep = (nextStep: OnboardingStep) => {
    setStepHistory(prev => [...prev, onboardingStep]);
    setOnboardingStep(nextStep);
  };

  const goBack = () => {
    if (stepHistory.length > 0) {
      const prev = stepHistory[stepHistory.length - 1];
      setStepHistory(prevHistory => prevHistory.slice(0, -1));
      setOnboardingStep(prev);
    }
  };

  const getStepIndex = () => {
    switch (onboardingStep) {
      case "program": return 1;
      case "type": return 2;
      case "level": return 3;
      case "duration": return 4;
      case "muscle":
      case "cycleSplit": return 5;
      default: return 0;
    }
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading, onboardingStep]);

  useEffect(() => {
    if (onboardingStep === "done" && embedded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [onboardingStep, embedded]);

  // When onboarding completes, fire the first AI message
  const completeOnboarding = async (
    progType: "single" | "cycle",
    type: string,
    level: string,
    duration: string,
    muscleOrSplit: string
  ) => {
    setOnboardingStep("done");
    
    let prompt = "";
    if (progType === "single") {
      prompt = `Soy coach y necesito crear una rutina de **${type}** enfocada en **${muscleOrSplit}** de nivel **${level}** para una duración de **${duration}**. Diseña una rutina usando solo el equipo disponible en nuestro gym. Por favor, proporciona únicamente un breve texto de resumen/overview y delega todos los detalles y estructura específica de la rutina al bloque JSON final, sin repetir la lista de ejercicios en tu respuesta de texto.`;
    } else {
      prompt = `Soy coach y necesito crear un **Ciclo de Entrenamiento de 3 días** del tipo **${type}** de nivel **${level}** con una duración de **${duration}** por sesión. El split de entrenamiento es **${muscleOrSplit}**.
Diseña el ciclo completo usando solo el equipo disponible en nuestro gym.
Por favor:
1. Proporciona únicamente un breve texto de resumen/overview explicando el objetivo general del ciclo de 3 días (máximo 1 párrafo).
2. Delega todos los detalles específicos de los ejercicios del ciclo de 3 días al bloque JSON final.
3. Organiza los ejercicios asignando a 'routineName' el día correspondiente del ciclo, exactamente como: "Día 1: [Enfoque]", "Día 2: [Enfoque]", "Día 3: [Enfoque]". Asegúrate de crear ejercicios para los 3 días en el array de rutinas.`;
    }
    
    await sendMessage(prompt);
  };

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });

      if (res.status === 401) {
        setMessages((prev) => [...prev, { role: "assistant", content: "⛔ Sesión no válida. Inicia sesión en /admin." }]);
        return;
      }

      const data = (await res.json()) as any;
      // Client-side safety shield — strip any leaked JSON/code blocks from text
      let reply: string = data.text || "Lo siento, no pude procesar tu pregunta. ¡Intenta de nuevo!";
      reply = reply
        .replace(/```(?:json)?[\s\S]*?```/g, '')   // fenced code blocks
        .replace(/^\s*\{[\s\S]*?"action"[\s\S]*?\}\s*$/gm, '') // bare JSON on own line
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      if (!reply) reply = data.toolCall ? '✅ Rutina lista para guardar.' : 'Lo siento, intenta de nuevo.';
      setMessages((prev) => [...prev, { role: "assistant", content: reply, toolCall: data.toolCall, toolSaved: false }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Error de conexión. Verifica tu red e inténtalo de nuevo." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setOnboardingStep("initial");
    setProgramType(null);
    setSelectedType(null);
    setSelectedLevel(null);
    setSelectedDuration(null);
    setSelectedMuscle(null);
    setStepHistory([]);
    setActiveTabs({});
    setCreatedWorkoutLinks({});
  };

  const handleSurpriseMe = () => {
    const isCycle = Math.random() > 0.5;
    const randomType = WORKOUT_TYPES[Math.floor(Math.random() * WORKOUT_TYPES.length)];
    const randomLevel = LEVELS[Math.floor(Math.random() * LEVELS.length)];
    const randomDuration = DURATIONS[Math.floor(Math.random() * DURATIONS.length)];

    if (isCycle) {
      const randomSplit = CYCLE_SPLITS[Math.floor(Math.random() * CYCLE_SPLITS.length)];
      setSelectedType(randomType.label);
      setSelectedLevel(randomLevel.id);
      setSelectedDuration(randomDuration.label);
      setSelectedMuscle(randomSplit.label);
      setProgramType("cycle");
      setOnboardingStep("done");

      const introText = `🎲 **¡Sorpresa! He seleccionado de forma aleatoria un ciclo de 3 días:**\n\n` +
        `- **Tipo de Ciclo:** ${randomType.emoji} ${randomType.label}\n` +
        `- **Nivel:** ${randomLevel.emoji} ${randomLevel.label}\n` +
        `- **Duración:** ${randomDuration.emoji} ${randomDuration.label} por sesión\n` +
        `- **Split de Entrenamiento:** ${randomSplit.emoji} ${randomSplit.label}\n\n` +
        `Generando tu ciclo de 3 días con el equipamiento del gimnasio...`;

      setMessages([{ role: "assistant", content: introText }]);

      const prompt = `Soy coach y necesito crear un **Ciclo de Entrenamiento de 3 días** del tipo **${randomType.label}** de nivel **${randomLevel.id}** con una duración de **${randomDuration.label}** por sesión. El split de entrenamiento es **${randomSplit.label}**.
Diseña el ciclo completo usando solo el equipo disponible en nuestro gym.
Por favor:
1. Proporciona únicamente un breve texto de resumen/overview explicando el objetivo general del ciclo de 3 días (máximo 1 párrafo).
2. Delega todos los detalles específicos de los ejercicios del ciclo de 3 días al bloque JSON final.
3. Organiza los ejercicios asignando a 'routineName' el día correspondiente del ciclo, exactamente como: "Día 1: [Enfoque]", "Día 2: [Enfoque]", "Día 3: [Enfoque]". Asegúrate de crear ejercicios para los 3 días en el array de rutinas.`;
      sendMessage(prompt);
    } else {
      const randomMuscle = MUSCLE_GROUPS[Math.floor(Math.random() * MUSCLE_GROUPS.length)];
      setSelectedType(randomType.label);
      setSelectedLevel(randomLevel.id);
      setSelectedDuration(randomDuration.label);
      setSelectedMuscle(randomMuscle.label);
      setProgramType("single");
      setOnboardingStep("done");

      const introText = `🎲 **¡Sorpresa! He seleccionado de forma aleatoria la siguiente configuración:**\n\n` +
        `- **Tipo de Rutina:** ${randomType.emoji} ${randomType.label}\n` +
        `- **Nivel del Alumno:** ${randomLevel.emoji} ${randomLevel.label}\n` +
        `- **Duración:** ${randomDuration.emoji} ${randomDuration.label}\n` +
        `- **Enfoque muscular:** ${randomMuscle.emoji} ${randomMuscle.label}\n\n` +
        `Generando tu rutina personalizada con el equipamiento del gimnasio...`;

      setMessages([{ role: "assistant", content: introText }]);

      const prompt = `Soy coach y necesito crear una rutina de **${randomType.label}** enfocada en **${randomMuscle.label}** de nivel **${randomLevel.id}** para una duración de **${randomDuration.label}**. Diseña una rutina usando solo el equipo disponible en nuestro gym. Por favor, proporciona únicamente un breve texto de resumen/overview y delega todos los detalles y estructura específica de la rutina al bloque JSON final, sin repetir la lista de ejercicios en tu respuesta de texto.`;
      sendMessage(prompt);
    }
  };

  const handleSaveProposedRoutine = async (index: number, toolCallData: any) => {
    if (!toolCallData?.routines) return;
    setSavingId(index);
    try {
      const response = await fetch("/api/admin/routines", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toolCallData.routines),
      });
      if (response.ok) {
        setMessages((prev) => prev.map((msg, i) => (i === index ? { ...msg, toolSaved: true } : msg)));
        onRoutineSaved?.();
      }
    } catch (err) {
      console.error("Failed to save routine:", err);
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveAsWorkout = async (index: number, toolCallData: any) => {
    if (!toolCallData?.routines) return;
    setSavingWorkoutId(index);
    try {
      const response = await fetch("/api/admin/workouts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: toolCallData.routines[0]?.routineName || "Entrenamiento Propuesto",
          difficulty: toolCallData.routines[0]?.difficulty || "Intermedio",
          exercises: toolCallData.routines,
        }),
      });
      if (response.ok) {
        const data = await response.json() as any;
        const magicLink = `${window.location.origin}/workout/${data.magicToken}`;
        setCreatedWorkoutLinks((prev) => ({ ...prev, [index]: magicLink }));
        onRoutineSaved?.();
      }
    } catch (err) {
      console.error("Failed to create workout:", err);
    } finally {
      setSavingWorkoutId(null);
    }
  };

  const handleCopyLink = async (index: number) => {
    const link = createdWorkoutLinks[index];
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopiedLinks((prev) => ({ ...prev, [index]: true }));
    setTimeout(() => setCopiedLinks((prev) => ({ ...prev, [index]: false })), 2000);
  };

  // Helper to group exercises by routineName (sections or days)
  const groupProposedExercises = (routines: any[]) => {
    const groups: Record<string, any[]> = {};
    routines.forEach(r => {
      const key = r.routineName || "Rutina";
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return groups;
  };

  // Onboarding Panel Renderer
  const renderOnboarding = () => {
    const stepIndex = getStepIndex();
    
    return (
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col justify-center bg-zinc-950/20">
        {onboardingStep !== "done" && (
          <div className="space-y-6 max-w-md mx-auto w-full">
            {/* Header / Nav */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Diseño Asistido</p>
                <h3 className="text-sm font-bold text-white mt-0.5">Configura tu entrenamiento</h3>
              </div>
              {onboardingStep !== "initial" && (
                <button
                  onClick={goBack}
                  className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 rounded transition-all cursor-pointer"
                >
                  ← Volver
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {stepIndex > 0 && (
              <div className="w-full space-y-1.5">
                <div className="flex justify-between items-center text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                  <span>Paso {stepIndex} de 5</span>
                  <span>{Math.round((stepIndex / 5) * 100)}% Completado</span>
                </div>
                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${(stepIndex / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Step 0: Mode Selection */}
            {onboardingStep === "initial" && (
              <div className="space-y-3">
                <button
                  onClick={() => goToStep("program")}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-lg border bg-zinc-900/30 border-zinc-800 text-zinc-300 hover:border-primary/40 hover:bg-primary/5 hover:text-white transition-all duration-200 text-left cursor-pointer"
                >
                  <span className="text-2xl flex-shrink-0">📋</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Asistente Guiado (Manual)</p>
                    <p className="text-[10px] text-zinc-500 mt-1">Crea entrenamientos personalizados paso a paso.</p>
                  </div>
                  <ChevronRight size={14} className="text-zinc-600 flex-shrink-0" />
                </button>

                <button
                  onClick={handleSurpriseMe}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-lg border bg-gradient-to-r from-primary/10 to-transparent border-primary/25 text-zinc-300 hover:border-primary/45 hover:bg-primary/15 hover:text-white transition-all duration-200 text-left relative overflow-hidden cursor-pointer"
                >
                  <span className="text-2xl flex-shrink-0">🎲</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Sorpréndeme (AI Magic)</p>
                    <p className="text-[10px] text-zinc-500 mt-1">El coach diseñará una rutina o ciclo aleatorio al instante.</p>
                  </div>
                  <ChevronRight size={14} className="text-primary flex-shrink-0 animate-pulse" />
                </button>
              </div>
            )}

            {/* Step 1: Program Type */}
            {onboardingStep === "program" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <p className="text-xs font-bold text-zinc-350 mb-2 uppercase tracking-wider text-center">¿Qué tipo de estructura deseas?</p>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={() => {
                      setProgramType("single");
                      goToStep("type");
                    }}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-lg border text-left transition-all duration-200 bg-zinc-900/30 border-zinc-800 text-zinc-350 hover:border-primary/40 hover:bg-primary/5 hover:text-white cursor-pointer"
                  >
                    <span className="text-2xl flex-shrink-0">🏋️‍♂️</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Sesión Única</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Una rutina enfocada para un día de entrenamiento.</p>
                    </div>
                    <ChevronRight size={14} className="ml-auto text-primary flex-shrink-0" />
                  </button>

                  <button
                    onClick={() => {
                      setProgramType("cycle");
                      goToStep("type");
                    }}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-lg border text-left transition-all duration-200 bg-zinc-900/30 border-zinc-800 text-zinc-350 hover:border-primary/40 hover:bg-primary/5 hover:text-white cursor-pointer"
                  >
                    <span className="text-2xl flex-shrink-0">🔄</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Ciclo Semanal (3 Días)</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Un microciclo completo de 3 sesiones complementarias.</p>
                    </div>
                    <ChevronRight size={14} className="ml-auto text-primary flex-shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Workout Type */}
            {onboardingStep === "type" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <p className="text-xs font-bold text-zinc-350 mb-2 uppercase tracking-wider text-center">¿Cuál es la modalidad principal?</p>
                <div className="grid grid-cols-1 gap-2">
                  {WORKOUT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedType(type.label);
                        goToStep("level");
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all duration-200 bg-zinc-900/30 border-zinc-800 text-zinc-350 hover:border-primary/30 hover:bg-primary/5 hover:text-white cursor-pointer"
                    >
                      <span className="text-lg leading-none">{type.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white">{type.label}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{type.desc}</p>
                      </div>
                      <ChevronRight size={14} className="ml-auto text-primary flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Level */}
            {onboardingStep === "level" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <p className="text-xs font-bold text-zinc-350 mb-2 uppercase tracking-wider text-center">Nivel del alumno objetivo</p>
                <div className="flex flex-col gap-2">
                  {LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => {
                        setSelectedLevel(level.id);
                        goToStep("duration");
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all duration-200 bg-zinc-900/30 border-zinc-800 text-zinc-350 hover:border-primary/30 hover:bg-primary/5 hover:text-white cursor-pointer"
                    >
                      <span className="text-lg">{level.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white">{level.label}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{level.desc}</p>
                      </div>
                      <ChevronRight size={14} className="ml-auto text-primary flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Duration */}
            {onboardingStep === "duration" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <p className="text-xs font-bold text-zinc-350 mb-2 uppercase tracking-wider text-center">Duración de la sesión</p>
                <div className="grid grid-cols-2 gap-2">
                  {DURATIONS.map((dur) => (
                    <button
                      key={dur.id}
                      onClick={() => {
                        setSelectedDuration(dur.label);
                        if (programType === "single") {
                          goToStep("muscle");
                        } else {
                          goToStep("cycleSplit");
                        }
                      }}
                      className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-lg border text-center transition-all duration-200 bg-zinc-900/30 border-zinc-800 text-zinc-350 hover:border-primary/30 hover:bg-primary/5 hover:text-white cursor-pointer"
                    >
                      <span className="text-xl">{dur.emoji}</span>
                      <p className="text-xs font-bold text-white">{dur.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5 (Single): Muscle Group */}
            {onboardingStep === "muscle" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <p className="text-xs font-bold text-zinc-350 mb-2 uppercase tracking-wider text-center">Grupo Muscular Principal</p>
                <div className="grid grid-cols-1 gap-2">
                  {MUSCLE_GROUPS.map((muscle) => (
                    <button
                      key={muscle.id}
                      onClick={() => {
                        setSelectedMuscle(muscle.label);
                        completeOnboarding("single", selectedType!, selectedLevel!, selectedDuration!, muscle.label);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all duration-200 bg-zinc-900/30 border-zinc-800 text-zinc-355 hover:border-primary/30 hover:bg-primary/5 hover:text-white cursor-pointer"
                    >
                      <span className="text-lg leading-none">{muscle.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white">{muscle.label}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{muscle.desc}</p>
                      </div>
                      <ChevronRight size={14} className="ml-auto text-primary flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5 (Cycle): Split selection */}
            {onboardingStep === "cycleSplit" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <p className="text-xs font-bold text-zinc-350 mb-2 uppercase tracking-wider text-center">Distribución del Ciclo (Split)</p>
                <div className="grid grid-cols-1 gap-2">
                  {CYCLE_SPLITS.map((split) => (
                    <button
                      key={split.id}
                      onClick={() => {
                        setSelectedMuscle(split.label);
                        completeOnboarding("cycle", selectedType!, selectedLevel!, selectedDuration!, split.label);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all duration-200 bg-zinc-900/30 border-zinc-800 text-zinc-355 hover:border-primary/30 hover:bg-primary/5 hover:text-white cursor-pointer"
                    >
                      <span className="text-lg leading-none">{split.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white">{split.label}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{split.desc}</p>
                      </div>
                      <ChevronRight size={14} className="ml-auto text-primary flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    );
  };

  const chatBody = (
    <div className={`flex flex-col ${embedded ? "flex-1 min-h-0 rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl" : "h-full"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/40 border-b border-zinc-800 flex-shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8.5 h-8.5 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Dumbbell className="text-primary" size={14} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-zinc-950" />
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] font-black uppercase tracking-wider text-white leading-none">Asistente de Rutinas</p>
            <p className="text-[9px] text-emerald-400 font-semibold mt-0.5">TrainoFit · Coach IA</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              fetchEquipment();
              setShowEquipmentPanel(!showEquipmentPanel);
            }}
            title="Equipamiento disponible hoy"
            className={`p-1.5 rounded transition-all flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider border cursor-pointer ${
              showEquipmentPanel 
                ? "bg-primary/15 border-primary/30 text-primary" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border-transparent"
            }`}
          >
            <Package size={11} />
            <span className="hidden sm:inline">Equipos</span>
          </button>
          <button
            onClick={handleReset}
            title="Nueva conversación"
            className="p-1.5 rounded text-zinc-500 hover:text-zinc-305 hover:bg-zinc-900 transition-all flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider border border-transparent cursor-pointer"
          >
            <RotateCcw size={11} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Quick Equipment Panel */}
      {showEquipmentPanel && (
        <div className="bg-zinc-950 border-b border-zinc-800 p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto scrollbar-thin flex-shrink-0">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <span className="text-[10px] font-black uppercase text-primary tracking-wider flex items-center gap-1">
              <Package size={10} /> Disponibilidad de Equipos
            </span>
            <span className="text-[9px] text-zinc-500">Haz clic para cambiar disponibilidad (se actualiza el Coach)</span>
          </div>
          {Object.entries(groupEquipmentByWorkout(equipmentList)).map(([key, group]) => (
            <div key={key} className="space-y-1">
              <p className="text-[9px] font-extrabold uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                <span>{group.emoji}</span>
                <span>{group.label}</span>
              </p>
              <div className="flex flex-wrap gap-1.5 pb-2">
                {group.items.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => toggleEquipmentAvailability(item.id, item.isAvailable)}
                    className={`px-2 py-1 rounded-md text-[9px] font-bold border transition-all duration-200 cursor-pointer ${
                      item.isAvailable
                        ? "bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/20"
                        : "bg-zinc-900 border-zinc-800/80 text-zinc-650 line-through hover:bg-zinc-905"
                    }`}
                  >
                    {item.name} {item.quantity > 1 ? `(x${item.quantity})` : ""}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {equipmentList.length === 0 && (
            <div className="text-center py-4 text-xs text-zinc-600">
              No hay equipamiento registrado. Configúralo en la pestaña de <span className="font-bold text-primary">Equipamiento</span>.
            </div>
          )}
        </div>
      )}

      {/* Content Area */}
      {onboardingStep !== "done" ? (
        renderOnboarding()
      ) : (
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {msg.role === "assistant" && (
                <div className="w-6.5 h-6.5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Bot size={12} className="text-primary" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-lg px-4 py-3 text-[12px] leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-100 rounded-tr-sm font-medium"
                  : "bg-zinc-900/60 text-zinc-300 rounded-tl-sm border border-zinc-800/80"
              }`}>
                {msg.role === "assistant" ? (
                  <>
                    <div
                      className="[&_strong]:text-amber-400 [&_strong]:font-bold [&_li]:flex [&_li]:items-start [&_li]:gap-1.5 [&_li]:mb-1 [&_em]:text-primary/90"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                    />
                    {msg.toolCall?.routines && (
                      (() => {
                        const grouped = groupProposedExercises(msg.toolCall.routines);
                        const sectionKeys = Object.keys(grouped);
                        const activeSecTab = activeTabs[i] || sectionKeys[0];
                        const currentExercises = grouped[activeSecTab] || [];

                        return (
                          <div className="mt-3.5 p-3 rounded-lg bg-zinc-950 border border-zinc-800/90 space-y-3 text-xs shadow-inner">
                            {/* Card Header */}
                            <div className="flex items-center justify-between gap-2 border-b border-zinc-900 pb-2">
                              <span className="font-black text-primary uppercase text-[9px] tracking-wider flex items-center gap-1">
                                <Calendar size={9} /> Rutina Propuesta
                              </span>
                              <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                                {msg.toolCall.routines[0]?.difficulty || "Intermedio"}
                              </span>
                            </div>

                            {/* Section Switcher Tabs (Cycle Selector) */}
                            {sectionKeys.length > 1 && (
                              <div className="flex gap-1 overflow-x-auto pb-1 mb-1 border-b border-zinc-900 scrollbar-none">
                                {sectionKeys.map((secName) => {
                                  const isActive = activeSecTab === secName;
                                  return (
                                    <button
                                      key={secName}
                                      onClick={() => setActiveTabs(prev => ({ ...prev, [i]: secName }))}
                                      className={`px-2.5 py-1 rounded text-[9px] font-extrabold uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer ${
                                        isActive
                                          ? "bg-primary/10 border-primary/20 text-primary"
                                          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border-transparent"
                                      }`}
                                    >
                                      {secName}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Exercises List (only current active tab) */}
                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                              {currentExercises.map((r: any, rIdx: number) => (
                                <div key={rIdx} className="bg-zinc-900/60 p-2.5 rounded-md border border-zinc-900">
                                  <div className="font-bold text-zinc-200 flex items-center gap-1.5 text-[11px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                    {r.exerciseName}
                                  </div>
                                  <div className="text-[9px] text-zinc-400 mt-1 flex gap-2 font-semibold flex-wrap">
                                    <span className="text-primary">{r.sets} series</span>
                                    <span>·</span>
                                    <span>{r.reps} reps</span>
                                    {r.intensityPct && (
                                      <>
                                        <span>·</span>
                                        <span className="text-orange-400">{r.intensityPct}% RM</span>
                                      </>
                                    )}
                                    {r.restSeconds && (
                                      <>
                                        <span>·</span>
                                        <span className="text-cyan-400">{r.restSeconds}s desc.</span>
                                      </>
                                    )}
                                  </div>
                                  {r.description && (
                                    <p className="text-[9px] text-zinc-500 mt-1.5 italic leading-relaxed">{r.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 flex flex-col gap-1.5 border-t border-zinc-900">
                              {msg.toolSaved ? (
                                <div className="text-center py-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 font-bold uppercase tracking-wider text-[9px]">
                                  ✅ Guardado en Base de Rutinas
                                </div>
                              ) : (
                                <Button
                                  onClick={() => handleSaveProposedRoutine(i, msg.toolCall)}
                                  disabled={savingId !== null || savingWorkoutId !== null}
                                  className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold uppercase tracking-wider text-[9px] h-8 rounded"
                                >
                                  {savingId === i ? "Guardando..." : "💾 Guardar en Base de Rutinas"}
                                </Button>
                              )}
                              {createdWorkoutLinks[i] ? (
                                <div className="space-y-1">
                                  <div className="text-center py-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 font-bold uppercase tracking-wider text-[9px]">
                                    ✅ Workout Creado con Éxito
                                  </div>
                                  <Button
                                    onClick={() => handleCopyLink(i)}
                                    className="w-full bg-primary text-zinc-950 hover:bg-primary/90 font-bold uppercase tracking-wider text-[9px] h-8 flex items-center justify-center gap-1.5 rounded"
                                  >
                                    <Clipboard size={10} className="text-zinc-950 fill-zinc-950" />
                                    {copiedLinks[i] ? "¡Copiado!" : "Copiar Enlace Alumno"}
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  onClick={() => handleSaveAsWorkout(i, msg.toolCall)}
                                  disabled={savingId !== null || savingWorkoutId !== null}
                                  className="w-full bg-primary text-zinc-950 hover:bg-primary/90 font-bold uppercase tracking-wider text-[9px] h-8 rounded"
                                >
                                  {savingWorkoutId === i ? "Creando..." : "⚡ Crear Workout Compartible"}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </>
                ) : msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 flex-row">
              <div className="w-6.5 h-6.5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={12} className="text-primary" />
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Form — only show after onboarding */}
      {onboardingStep === "done" && (
        <div className="px-4 py-3 border-t border-zinc-800 flex gap-2 flex-shrink-0 bg-zinc-950/80 backdrop-blur-md">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Pregunta sobre rutinas, series, técnica..."
            disabled={loading}
            id="ai-chat-input"
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            id="ai-chat-send-btn"
            className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-zinc-950 hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer"
          >
            <Send size={13} className="text-zinc-950 fill-zinc-950" />
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-1.5 bg-zinc-950 border-t border-zinc-900 flex-shrink-0">
        <p className="text-[9px] text-zinc-650 text-center">
          Powered by <span className="text-zinc-550">HF Qwen2.5 + Cloudflare AI</span> · Admin Only
        </p>
      </div>
    </div>
  );

  if (embedded) return chatBody;
  return null;
}
