import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router";
import { Layout } from "~/components/layout";
import {
  Play, Pause, RotateCcw, Dumbbell, Flame, Check,
  Share2, ArrowLeft, Timer, CheckCircle2, Volume2, VolumeX,
  ChevronDown, ChevronUp, Coffee, Zap
} from "lucide-react";
import { Button } from "~/components/ui/button";

interface WorkoutExercise {
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

interface Workout {
  id: number;
  name: string;
  description?: string;
  difficulty: string;
  magicToken: string;
  exercises: WorkoutExercise[];
}

export function meta() {
  return [
    { title: "Tu Entrenamiento - TrainoFit" },
    { name: "description", content: "Visualiza y realiza tu rutina de entrenamiento de TrainoFit." },
  ];
}

// ── Audio beep using Web Audio API ──────────────────────
function useBeep(soundEnabled: boolean) {
  const playBeep = useCallback((freq = 600, duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch { /* ignore if AudioContext blocked */ }
  }, [soundEnabled]);
  return playBeep;
}

// ── Rest Timer Modal ─────────────────────────────────────
function RestTimerModal({
  seconds,
  onDone,
  onSkip,
  playBeep,
}: {
  seconds: number;
  onDone: () => void;
  onSkip: () => void;
  playBeep: (f: number, d: number) => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          playBeep(880, 0.2);
          setTimeout(onDone, 400);
          return 0;
        }
        if (prev <= 4) playBeep(440, 0.05);
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [seconds]);

  const pct = Math.round((remaining / seconds) * 100);
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md px-6">
      <div className="w-full max-w-xs text-center space-y-6 p-8 rounded-3xl border border-white/10 bg-zinc-900/80 shadow-2xl">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Coffee size={16} />
          <p className="text-[10px] font-black uppercase tracking-widest">Tiempo de Descanso</p>
        </div>

        {/* Circular countdown */}
        <div className="relative w-36 h-36 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="#d4a017"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white font-mono">{remaining}</span>
            <span className="text-[9px] text-light/40 uppercase tracking-widest font-bold">seg</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-light/60 font-medium">Recupera y prepárate para la siguiente serie</p>
          <button
            onClick={onSkip}
            className="w-full py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-light/70 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Zap size={12} className="text-primary" />
            Saltar Descanso
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkoutDetail() {
  const { token } = useParams<{ token: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Main timer (total workout duration)
  const [time, setTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound
  const [soundEnabled, setSoundEnabled] = useState(true);
  const playBeep = useBeep(soundEnabled);

  // Completed sets: "exerciseId_setIndex" -> boolean
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});

  // Rest timer state
  const [restTimer, setRestTimer] = useState<{ exerciseId: number; restSeconds: number } | null>(null);

  // Share
  const [copiedLink, setCopiedLink] = useState(false);

  // Expanded exercise cards (mobile accordion)
  const [expandedExercises, setExpandedExercises] = useState<Record<number, boolean>>({});

  // Active tab for multi-day cycle workouts
  const [activeDayTab, setActiveDayTab] = useState<string | null>(null);

  useEffect(() => {
    if (token) fetchWorkout();
  }, [token]);

  // Main workout timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTime((p) => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  // Auto-start timer on first set completion
  const fetchWorkout = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workout/shared/${token}`);
      if (res.ok) {
        const data = await res.json() as Workout;
        setWorkout(data);
        // Auto-expand first exercise
        if (data.exercises.length > 0) {
          setExpandedExercises({ [data.exercises[0].id]: true });
        }
        
        // Detect and initialize active day for cycle workouts
        const routineNames = Array.from(new Set(data.exercises.map(e => e.routineName)));
        const firstDay = routineNames.find(name => name.toLowerCase().startsWith("d\u00eda") || name.toLowerCase().startsWith("dia"));
        if (firstDay) {
          setActiveDayTab(firstDay);
        } else if (routineNames.length > 0) {
          setActiveDayTab(routineNames[0]);
        }
      } else {
        setError("El entrenamiento no existe o el enlace mágico ha expirado.");
      }
    } catch {
      setError("Error de conexión al cargar el entrenamiento.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [hrs > 0 ? String(hrs).padStart(2, "0") : null, String(mins).padStart(2, "0"), String(secs).padStart(2, "0")]
      .filter(Boolean).join(":");
  };

  const handleToggleSet = (exercise: WorkoutExercise, setIndex: number) => {
    const key = `${exercise.id}_${setIndex}`;
    const next = !completedSets[key];
    if (next) {
      playBeep(880, 0.12);
      // Auto-start main timer on first set done
      if (!timerRunning && Object.values(completedSets).every((v) => !v)) {
        setTimerRunning(true);
      }
      // Show rest timer if configured and not the last set
      const allSetsForEx = Array.from({ length: exercise.sets }, (_, i) => `${exercise.id}_${i}`);
      const completedCount = allSetsForEx.filter((k) => completedSets[k]).length + 1;
      if (completedCount < exercise.sets && exercise.restSeconds && exercise.restSeconds > 0) {
        setRestTimer({ exerciseId: exercise.id, restSeconds: exercise.restSeconds });
      }
    } else {
      playBeep(440, 0.08);
    }
    setCompletedSets((prev) => ({ ...prev, [key]: next }));
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch { /* ignore */ }
  };

  const getDifficultyStyles = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "principiante": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "intermedio":   return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "avanzado":     return "bg-red-500/10 text-red-400 border-red-500/20";
      default:             return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  // ── Loading ──────────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Dumbbell className="text-primary animate-pulse" size={24} />
            </div>
            <p className="text-light/50 text-xs tracking-widest uppercase font-bold">Cargando entrenamiento...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !workout) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
          <div className="max-w-sm w-full text-center space-y-6 p-8 rounded-3xl border border-white/5 bg-zinc-900/20">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
              <Flame size={28} className="animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black uppercase text-white">¡Enlace No Disponible!</h2>
              <p className="text-sm text-light/60 leading-relaxed">{error || "El entrenamiento no se encuentra o es privado."}</p>
            </div>
            <Link to="/"><Button className="w-full bg-primary text-white font-bold">Ir al Inicio</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Group by section
  const routinesMap: Record<string, WorkoutExercise[]> = {};
  workout.exercises.forEach((ex) => {
    if (!routinesMap[ex.routineName]) routinesMap[ex.routineName] = [];
    routinesMap[ex.routineName].push(ex);
  });

  const routineNames = Object.keys(routinesMap);
  const isMultiDayCycle = routineNames.some(name => name.toLowerCase().startsWith("d\u00eda") || name.toLowerCase().startsWith("dia"));

  // Progress
  let totalSets = 0, completedSetsCount = 0;
  workout.exercises.forEach((ex) => {
    // If it's a multi-day cycle, only count sets of the active day
    if (isMultiDayCycle && ex.routineName !== activeDayTab) return;
    totalSets += ex.sets;
    for (let s = 0; s < ex.sets; s++) {
      if (completedSets[`${ex.id}_${s}`]) completedSetsCount++;
    }
  });
  const progressPercent = totalSets > 0 ? Math.round((completedSetsCount / totalSets) * 100) : 0;
  const isWorkoutDone = progressPercent === 100 && totalSets > 0;

  return (
    <Layout>
      {/* Rest timer overlay */}
      {restTimer && (
        <RestTimerModal
          key={`${restTimer.exerciseId}-${restTimer.restSeconds}`}
          seconds={restTimer.restSeconds}
          playBeep={playBeep}
          onDone={() => setRestTimer(null)}
          onSkip={() => setRestTimer(null)}
        />
      )}

      <div className="min-h-screen bg-zinc-950 pb-28 relative overflow-x-hidden">
        {/* Ambient glows */}
        <div className="fixed top-0 left-0 w-full h-72 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-72 h-72 bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 pb-8 space-y-5">

          {/* Top nav */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-light/40 hover:text-white transition-colors">
              <ArrowLeft size={14} />
              <span>Inicio</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl border border-white/5 bg-zinc-900/60 transition-all ${soundEnabled ? "text-primary" : "text-light/30"}`}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/5 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-black uppercase tracking-wider text-light transition-all"
              >
                <Share2 size={13} />
                <span>{copiedLink ? "¡Copiado!" : "Compartir"}</span>
              </button>
            </div>
          </div>

          {/* Workout header card */}
          <div className="p-5 sm:p-7 rounded-3xl border border-white/8 bg-zinc-950/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-orange-500 to-transparent" />
            <div className="absolute top-4 right-4 w-28 h-28 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${getDifficultyStyles(workout.difficulty)}`}>
                {workout.difficulty}
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-light/60">
                ✨ Enlace Alumno
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight mb-2">
              {workout.name}
            </h1>
            {workout.description && (
              <p className="text-sm text-light/50 leading-relaxed">{workout.description}</p>
            )}

            {/* Progress bar */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-light/50 uppercase tracking-wider">
                <span>{isWorkoutDone ? "🏆 ¡Entrenamiento Completado!" : "Progreso"}</span>
                <span className={progressPercent === 100 ? "text-emerald-400" : "text-primary"}>
                  {completedSetsCount} / {totalSets} series · {progressPercent}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isWorkoutDone ? "bg-emerald-400" : "bg-gradient-to-r from-primary to-orange-500"}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Main Chronometer */}
          <div className="p-4 rounded-2xl border border-white/8 bg-zinc-950/60 backdrop-blur-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary ${timerRunning ? "animate-pulse" : ""}`}>
                <Timer size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-light/40">Cronómetro</p>
                <p className="text-2xl font-black text-white font-mono tracking-wider">{formatTime(time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!timerRunning ? (
                <Button onClick={() => { setTimerRunning(true); playBeep(900, 0.08); }}
                  className="bg-primary hover:bg-primary/90 text-white font-bold h-9 text-xs px-4">
                  <Play size={12} className="mr-1.5" /> Iniciar
                </Button>
              ) : (
                <Button onClick={() => { setTimerRunning(false); playBeep(500, 0.08); }}
                  variant="outline"
                  className="border-white/10 hover:bg-zinc-900 text-white font-bold h-9 text-xs px-4">
                  <Pause size={12} className="mr-1.5" /> Pausar
                </Button>
              )}
              <Button onClick={() => { setTime(0); setTimerRunning(false); playBeep(350, 0.15); }}
                variant="ghost" className="p-2 h-9 text-light/40 hover:text-white" title="Reiniciar">
                <RotateCcw size={14} />
              </Button>
            </div>
          </div>

          {/* Cycle Day Selection Tabs (Only visible for multi-day cycles) */}
          {isMultiDayCycle && (
            <div className="flex gap-1.5 pb-1 overflow-x-auto scrollbar-none border-b border-white/5">
              {routineNames.map((name) => {
                const isActive = activeDayTab === name;
                return (
                  <button
                    key={name}
                    onClick={() => setActiveDayTab(name)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/10"
                        : "bg-zinc-900/60 border-white/5 text-light/50 hover:text-white"
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Exercises by section */}
          <div className="space-y-6">
            {Object.entries(routinesMap)
              .filter(([routineName]) => !isMultiDayCycle || routineName === activeDayTab)
              .map(([routineName, exercises], rIdx) => (
                <div key={routineName} className="space-y-3">
                {/* Section label */}
                <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-black">
                    {rIdx + 1}
                  </div>
                  <h3 className="text-xs font-black uppercase text-white tracking-widest">{routineName}</h3>
                  <span className="text-[9px] text-light/30 font-bold">{exercises.length} ejercicio(s)</span>
                </div>

                {/* Exercise cards */}
                {exercises.map((ex) => {
                  let exCompleted = 0;
                  for (let s = 0; s < ex.sets; s++) {
                    if (completedSets[`${ex.id}_${s}`]) exCompleted++;
                  }
                  const isFullyDone = exCompleted === ex.sets;
                  const isExpanded = !!expandedExercises[ex.id];

                  return (
                    <div
                      key={ex.id}
                      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isFullyDone
                          ? "bg-emerald-950/20 border-emerald-500/20"
                          : "bg-zinc-950/60 border-white/6 hover:border-white/10"
                      }`}
                    >
                      {/* Card header — always visible */}
                      <button
                        className="w-full p-4 flex items-center justify-between gap-3 text-left"
                        onClick={() => setExpandedExercises((prev) => ({ ...prev, [ex.id]: !prev[ex.id] }))}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all ${
                            isFullyDone
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                              : "bg-zinc-800 border-white/5 text-primary"
                          }`}>
                            {isFullyDone ? <CheckCircle2 size={16} /> : <Dumbbell size={14} />}
                          </div>
                          <div className="min-w-0">
                            <h4 className={`text-sm font-bold leading-tight ${isFullyDone ? "text-emerald-400 line-through decoration-emerald-500/50" : "text-white"}`}>
                              {ex.exerciseName}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] font-semibold text-light/50 mt-0.5 flex-wrap">
                              <span className="text-primary font-bold">{ex.sets} series</span>
                              <span>·</span>
                              <span>{ex.reps} reps</span>
                              {ex.intensityPct && <><span>·</span><span className="text-orange-400">{ex.intensityPct}% RM</span></>}
                              {ex.restSeconds && <><span>·</span><span className="text-cyan-400 flex items-center gap-0.5"><Coffee size={9} /> {ex.restSeconds}s</span></>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${getDifficultyStyles(ex.difficulty)}`}>
                            {exCompleted}/{ex.sets}
                          </span>
                          {isExpanded ? <ChevronUp size={14} className="text-light/30" /> : <ChevronDown size={14} className="text-light/30" />}
                        </div>
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="px-4 pb-5 space-y-4 border-t border-white/5">
                          {ex.description && (
                            <p className="text-xs text-light/40 leading-relaxed italic pt-3 px-1 bg-white/2 rounded-xl p-3 border border-white/5">
                              {ex.description}
                            </p>
                          )}

                          {/* Rest timer hint */}
                          {ex.restSeconds && ex.restSeconds > 0 && (
                            <div className="flex items-center gap-2 text-[10px] text-cyan-400/70 font-bold">
                              <Coffee size={11} />
                              <span>Descanso de {ex.restSeconds}s entre series (se activará automáticamente)</span>
                            </div>
                          )}

                          {/* Set buttons */}
                          <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-wider text-light/40">
                              Marca cada serie completada:
                            </p>
                            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(ex.sets, 4)}, 1fr)` }}>
                              {Array.from({ length: ex.sets }).map((_, sIdx) => {
                                const setKey = `${ex.id}_${sIdx}`;
                                const isChecked = !!completedSets[setKey];
                                return (
                                  <button
                                    key={sIdx}
                                    onClick={() => handleToggleSet(ex, sIdx)}
                                    className={`py-3 rounded-xl text-xs font-bold border transition-all duration-300 flex flex-col items-center gap-1 active:scale-95 ${
                                      isChecked
                                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                                        : "bg-zinc-900 border-white/8 text-light/60 hover:text-white hover:border-white/20 hover:bg-zinc-800"
                                    }`}
                                  >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                      isChecked ? "border-white bg-white/20" : "border-white/20"
                                    }`}>
                                      {isChecked && <Check size={10} className="stroke-[3]" />}
                                    </div>
                                    <span>Serie {sIdx + 1}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Motivation footer */}
          <div className={`p-6 rounded-3xl border text-center space-y-2 transition-all duration-500 ${
            isWorkoutDone
              ? "border-emerald-500/30 bg-emerald-950/20"
              : "border-dashed border-white/10 bg-zinc-900/10"
          }`}>
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center mx-auto ${
              isWorkoutDone ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-primary/10 border-primary/20 text-primary"
            }`}>
              {isWorkoutDone ? <CheckCircle2 size={18} /> : <Flame size={18} />}
            </div>
            <p className="text-sm font-black uppercase tracking-wider text-white">
              {isWorkoutDone ? "🏆 ¡MISIÓN CUMPLIDA, ATLETA!" : "¡A DARLE CON TODO!"}
            </p>
            <p className="text-xs text-light/50 max-w-xs mx-auto leading-relaxed">
              {isWorkoutDone
                ? "Completaste cada serie. ¡Eso es dedicación de campeón! Descansa bien y vuelve mañana más fuerte."
                : "Controla el peso, cuida la técnica y respeta los descansos. ¡TrainoFit te acompaña en cada repetición!"}
            </p>
          </div>

        </div>
      </div>
    </Layout>
  );
}
