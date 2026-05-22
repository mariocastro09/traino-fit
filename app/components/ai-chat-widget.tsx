import { useState, useEffect, useRef } from "react";
import { Bot, Send, Dumbbell, Zap, RotateCcw, Clipboard, ChevronRight, Package } from "lucide-react";
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
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="bg-white/10 px-1 py-0.5 rounded text-primary text-xs font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 mb-1"><span class="text-primary mt-0.5 flex-shrink-0">▸</span><span>$1</span></li>')
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, "<br/>");
}

// ── Onboarding Questions ────────────────────────────────
type OnboardingStep = "initial" | "type" | "level" | "duration" | "muscle" | "done";

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
  { id: "Avanzado", label: "Avanzado", emoji: "🔥", desc: "Competidor / Atleta" },
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
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

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
  const completeOnboarding = async (type: string, level: string, duration: string, muscle: string) => {
    setOnboardingStep("done");
    const prompt = `Soy coach y necesito crear una rutina de **${type}** enfocada en **${muscle}** de nivel **${level}** para una duración de **${duration} minutos**. Diseña una rutina usando solo el equipo disponible en nuestro gym. Por favor, proporciona únicamente un breve texto de resumen/overview y delega todos los detalles y estructura específica de la rutina al bloque JSON final, sin repetir la lista de ejercicios en tu respuesta de texto.`;
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
    setSelectedType(null);
    setSelectedLevel(null);
    setSelectedDuration(null);
    setSelectedMuscle(null);
    setCreatedWorkoutLinks({});
  };

  const handleSurpriseMe = () => {
    const randomType = WORKOUT_TYPES[Math.floor(Math.random() * WORKOUT_TYPES.length)];
    const randomLevel = LEVELS[Math.floor(Math.random() * LEVELS.length)];
    const randomDuration = DURATIONS[Math.floor(Math.random() * DURATIONS.length)];
    const randomMuscle = MUSCLE_GROUPS[Math.floor(Math.random() * MUSCLE_GROUPS.length)];

    setSelectedType(randomType.label);
    setSelectedLevel(randomLevel.id);
    setSelectedDuration(randomDuration.label);
    setSelectedMuscle(randomMuscle.label);

    setOnboardingStep("done");

    const introText = `🎲 **¡Sorpresa! He seleccionado de forma aleatoria la siguiente configuración para ti hoy:**\n\n` +
      `- **Tipo de Rutina:** ${randomType.emoji} ${randomType.label}\n` +
      `- **Nivel del Alumno:** ${randomLevel.emoji} ${randomLevel.label}\n` +
      `- **Duración:** ${randomDuration.emoji} ${randomDuration.label}\n` +
      `- **Enfoque muscular:** ${randomMuscle.emoji} ${randomMuscle.label}\n\n` +
      `Generando tu rutina personalizada con el equipamiento del gimnasio...`;

    setMessages([{ role: "assistant", content: introText }]);

    const prompt = `Soy coach y necesito crear una rutina de **${randomType.label}** enfocada en **${randomMuscle.label}** de nivel **${randomLevel.id}** para una duración de **${randomDuration.label}**. Diseña una rutina usando solo el equipo disponible en nuestro gym. Por favor, proporciona únicamente un breve texto de resumen/overview y delega todos los detalles y estructura específica de la rutina al bloque JSON final, sin repetir la lista de ejercicios en tu respuesta de texto.`;
    sendMessage(prompt);
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

  // ── Onboarding UI ──────────────────────────────────────
  const renderOnboarding = () => (
    <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col justify-center">
      {onboardingStep !== "done" && (
        <div className="space-y-5 max-w-md mx-auto w-full">
          {/* Step 0: Mode Selection */}
          {onboardingStep === "initial" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[9px] font-black text-primary">★</div>
                <p className="text-xs font-black uppercase tracking-wider text-white">¿Cómo quieres diseñar hoy?</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setOnboardingStep("type")}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl border bg-zinc-900/50 border-white/8 text-light/70 hover:border-primary/30 hover:bg-primary/5 hover:text-white transition-all duration-200 text-left cursor-pointer"
                >
                  <span className="text-2xl flex-shrink-0">📋</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Asistente Guiado (Manual)</p>
                    <p className="text-[10px] text-light/40 mt-1">Elige paso a paso el tipo de entrenamiento, duración y grupo muscular.</p>
                  </div>
                  <ChevronRight size={14} className="text-light/30 flex-shrink-0" />
                </button>

                <button
                  onClick={handleSurpriseMe}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl border bg-gradient-to-r from-primary/10 to-transparent border-primary/20 text-light/70 hover:border-primary/45 hover:bg-primary/10 hover:text-white transition-all duration-200 text-left relative overflow-hidden cursor-pointer"
                >
                  <span className="text-2xl flex-shrink-0">🎲</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Sorpréndeme (AI Magic)</p>
                    <p className="text-[10px] text-light/40 mt-1">El coach diseñará una rutina de forma aleatoria para ti.</p>
                  </div>
                  <ChevronRight size={14} className="text-primary flex-shrink-0 animate-pulse" />
                </button>
              </div>
            </div>
          )}

          {/* Step 1 */}
          {onboardingStep === "type" && (
            <div className="transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[9px] font-black text-primary">1</div>
                <p className="text-xs font-black uppercase tracking-wider text-white">¿Qué tipo de rutina buscas?</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {WORKOUT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.label);
                      setOnboardingStep("level");
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 bg-zinc-900/50 border-white/8 text-light/70 hover:border-primary/30 hover:bg-primary/5 hover:text-white cursor-pointer"
                  >
                    <span className="text-lg leading-none">{type.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold">{type.label}</p>
                      <p className="text-[10px] text-light/40">{type.desc}</p>
                    </div>
                    <ChevronRight size={14} className="ml-auto text-primary flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {onboardingStep === "level" && (
            <div className="transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[9px] font-black text-primary">2</div>
                <p className="text-xs font-black uppercase tracking-wider text-white">¿Nivel del alumno?</p>
              </div>
              <div className="flex flex-col gap-2">
                {LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => {
                      setSelectedLevel(level.id);
                      setOnboardingStep("duration");
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 bg-zinc-900/50 border-white/8 text-light/70 hover:border-primary/30 hover:bg-primary/5 hover:text-white cursor-pointer"
                  >
                    <span className="text-lg">{level.emoji}</span>
                    <div>
                      <p className="text-xs font-bold">{level.label}</p>
                      <p className="text-[10px] text-light/40">{level.desc}</p>
                    </div>
                    <ChevronRight size={14} className="ml-auto text-primary flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {onboardingStep === "duration" && (
            <div className="transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[9px] font-black text-primary">3</div>
                <p className="text-xs font-black uppercase tracking-wider text-white">¿Cuánto tiempo tienes?</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur.id}
                    onClick={() => {
                      setSelectedDuration(dur.label);
                      setOnboardingStep("muscle");
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border text-center transition-all duration-200 bg-zinc-900/50 border-white/8 text-light/70 hover:border-primary/30 hover:bg-primary/5 hover:text-white cursor-pointer"
                  >
                    <span className="text-base">{dur.emoji}</span>
                    <p className="text-xs font-black">{dur.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Muscle Group */}
          {onboardingStep === "muscle" && (
            <div className="transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[9px] font-black text-primary">4</div>
                <p className="text-xs font-black uppercase tracking-wider text-white">¿Qué grupo muscular quieres entrenar?</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {MUSCLE_GROUPS.map((muscle) => (
                  <button
                    key={muscle.id}
                    onClick={() => {
                      setSelectedMuscle(muscle.label);
                      completeOnboarding(selectedType!, selectedLevel!, selectedDuration!, muscle.label);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 bg-zinc-900/50 border-white/8 text-light/70 hover:border-primary/30 hover:bg-primary/5 hover:text-white cursor-pointer"
                  >
                    <span className="text-lg leading-none">{muscle.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold">{muscle.label}</p>
                      <p className="text-[10px] text-light/40">{muscle.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── Chat body ───────────────────────────────────────────
  const chatBody = (
    <div className={`flex flex-col ${embedded ? "flex-1 min-h-0 rounded-2xl border border-white/8 bg-zinc-950 overflow-hidden" : "h-full"}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-950 border-b border-white/8 flex-shrink-0">
        <div className="relative">
          <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Dumbbell className="text-primary" size={14} />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-zinc-950" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wider text-white leading-none">Asistente de Rutinas</p>
          <p className="text-[9px] text-emerald-400 font-medium mt-0.5">TrainoFit · Coach IA</p>
        </div>
        <button
          onClick={() => {
            fetchEquipment();
            setShowEquipmentPanel(!showEquipmentPanel);
          }}
          title="Equipamiento disponible hoy"
          className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider border cursor-pointer ${
            showEquipmentPanel 
              ? "bg-primary/25 border-primary/40 text-primary" 
              : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border-transparent"
          }`}
        >
          <Package size={11} />
          <span className="hidden sm:inline">Equipos</span>
        </button>
        <button
          onClick={handleReset}
          title="Nueva conversación"
          className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-all flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider cursor-pointer"
        >
          <RotateCcw size={11} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Quick Equipment Panel */}
      {showEquipmentPanel && (
        <div className="bg-zinc-900 border-b border-white/8 p-3 flex flex-col gap-2 max-h-[300px] overflow-y-auto scrollbar-thin flex-shrink-0">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-1">
            <span className="text-[10px] font-black uppercase text-primary tracking-wider flex items-center gap-1">
              <Package size={10} /> Disponibilidad de Equipos
            </span>
            <span className="text-[9px] text-light/40">Haz clic para cambiar disponibilidad (se actualiza el Coach)</span>
          </div>
          {Object.entries(groupEquipmentByWorkout(equipmentList)).map(([key, group]) => (
            <div key={key} className="space-y-1">
              <p className="text-[9px] font-extrabold uppercase text-light/50 tracking-wider flex items-center gap-1">
                <span>{group.emoji}</span>
                <span>{group.label}</span>
              </p>
              <div className="flex flex-wrap gap-1.5 pb-2">
                {group.items.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => toggleEquipmentAvailability(item.id, item.isAvailable)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all duration-200 cursor-pointer ${
                      item.isAvailable
                        ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/25"
                        : "bg-zinc-950/40 border-white/5 text-light/30 line-through hover:bg-zinc-900/60"
                    }`}
                  >
                    {item.name} {item.quantity > 1 ? `(x${item.quantity})` : ""}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {equipmentList.length === 0 && (
            <div className="text-center py-4 text-xs text-light/40">
              No hay equipamiento registrado. Configúralo en la pestaña de <span className="font-bold text-primary">Equipamiento</span>.
            </div>
          )}
        </div>
      )}

      {/* Content area */}
      {onboardingStep !== "done" ? (
        renderOnboarding()
      ) : (
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={11} className="text-primary" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-tr-sm font-medium"
                  : "bg-zinc-800/80 text-gray-200 rounded-tl-sm border border-white/5"
              }`}>
                {msg.role === "assistant" ? (
                  <>
                    <div
                      className="[&_strong]:text-white [&_strong]:font-bold [&_li]:flex [&_li]:items-start [&_li]:gap-1.5 [&_li]:mb-1 [&_em]:text-primary/90"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                    />
                    {msg.toolCall?.routines && (
                      <div className="mt-3 p-3 rounded-xl bg-zinc-950 border border-white/8 space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2 mb-2">
                          <span className="font-black text-primary uppercase text-[9px] tracking-wider">Rutina Propuesta</span>
                          <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/5 text-light/75 border border-white/10">
                            {msg.toolCall.routines[0]?.difficulty}
                          </span>
                        </div>
                        <div className="font-extrabold text-white text-xs mb-1">{msg.toolCall.routines[0]?.routineName}</div>
                        <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                          {msg.toolCall.routines.map((r: any, rIdx: number) => (
                            <div key={rIdx} className="bg-white/2 p-2 rounded-lg border border-white/5">
                              <div className="font-bold text-zinc-300 flex items-center gap-1.5 text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                {r.exerciseName}
                              </div>
                              <div className="text-[9px] text-light/60 mt-0.5 flex gap-2 font-semibold flex-wrap">
                                <span>{r.sets} series × {r.reps} reps</span>
                                {r.intensityPct && <><span>·</span><span>{r.intensityPct}% RM</span></>}
                                {r.restSeconds && <><span>·</span><span className="text-cyan-400">{r.restSeconds}s descanso</span></>}
                              </div>
                              {r.description && <p className="text-[9px] text-light/40 mt-1 italic leading-relaxed">{r.description}</p>}
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 flex flex-col gap-1.5">
                          {msg.toolSaved ? (
                            <div className="text-center py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider text-[9px]">
                              ✅ Guardado en Base de Rutinas
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleSaveProposedRoutine(i, msg.toolCall)}
                              disabled={savingId !== null || savingWorkoutId !== null}
                              className="w-full bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800 font-bold uppercase tracking-wider text-[9px] h-8"
                            >
                              {savingId === i ? "Guardando..." : "💾 Guardar en Base de Rutinas"}
                            </Button>
                          )}
                          {createdWorkoutLinks[i] ? (
                            <div className="space-y-1">
                              <div className="text-center py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider text-[9px]">
                                ✅ Workout Creado con Éxito
                              </div>
                              <Button
                                onClick={() => handleCopyLink(i)}
                                className="w-full bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-wider text-[9px] h-8 flex items-center justify-center gap-1.5"
                              >
                                <Clipboard size={10} />
                                {copiedLinks[i] ? "¡Copiado!" : "Copiar Enlace Alumno"}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleSaveAsWorkout(i, msg.toolCall)}
                              disabled={savingId !== null || savingWorkoutId !== null}
                              className="w-full bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-wider text-[9px] h-8"
                            >
                              {savingWorkoutId === i ? "Creando..." : "⚡ Crear Workout Compartible"}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 flex-row">
              <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={11} className="text-primary" />
              </div>
              <div className="bg-zinc-800/80 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input — only show after onboarding */}
      {onboardingStep === "done" && (
        <div className="px-3 py-2.5 border-t border-white/8 flex gap-2 flex-shrink-0 bg-zinc-950">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Pregunta sobre rutinas, series, técnica..."
            disabled={loading}
            id="ai-chat-input"
            className="flex-1 bg-zinc-900/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            id="ai-chat-send-btn"
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-1 bg-zinc-950 border-t border-white/5 flex-shrink-0">
        <p className="text-[9px] text-zinc-700 text-center">
          Powered by <span className="text-zinc-600">HF Qwen2.5 + Cloudflare AI</span> · Admin Only
        </p>
      </div>
    </div>
  );

  if (embedded) return chatBody;
  return null;
}
