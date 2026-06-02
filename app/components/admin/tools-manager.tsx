import { useState, useMemo, useEffect } from "react";
import {
  Calculator, Dumbbell, Activity, Gauge, Info, Flame, Target, Zap,
} from "lucide-react";

// ─── 1RM Estimation Formulas (scientifically validated) ──────────────────────
// w = weight lifted, r = reps performed (to failure)
const RM_FORMULAS: { id: string; name: string; fn: (w: number, r: number) => number; note: string }[] = [
  { id: "epley", name: "Epley", fn: (w, r) => w * (1 + r / 30), note: "Estándar más usado. Ideal 1-10 reps." },
  { id: "brzycki", name: "Brzycki", fn: (w, r) => w * 36 / (37 - r), note: "Muy preciso en rangos bajos (≤10 reps)." },
  { id: "lombardi", name: "Lombardi", fn: (w, r) => w * Math.pow(r, 0.1), note: "Conservador. Útil en reps altas." },
  { id: "oconner", name: "O'Conner", fn: (w, r) => w * (1 + r / 40), note: "Estimación moderada y segura." },
  { id: "lander", name: "Lander", fn: (w, r) => (100 * w) / (101.3 - 2.67123 * r), note: "Buena correlación general." },
  { id: "wathan", name: "Wathan", fn: (w, r) => (100 * w) / (48.8 + 53.8 * Math.exp(-0.075 * r)), note: "Excelente para reps moderadas-altas." },
];

// Percentage zones with training purpose (NSCA reference)
const LOAD_ZONES = [
  { pct: 100, reps: "1", goal: "Fuerza Máxima / Test", color: "text-red-400" },
  { pct: 95, reps: "2", goal: "Fuerza Máxima", color: "text-red-400" },
  { pct: 90, reps: "3-4", goal: "Fuerza", color: "text-orange-400" },
  { pct: 85, reps: "5-6", goal: "Fuerza", color: "text-orange-400" },
  { pct: 80, reps: "7-8", goal: "Fuerza / Hipertrofia", color: "text-amber-400" },
  { pct: 75, reps: "9-10", goal: "Hipertrofia", color: "text-amber-400" },
  { pct: 70, reps: "11-12", goal: "Hipertrofia", color: "text-yellow-400" },
  { pct: 65, reps: "13-15", goal: "Hipertrofia / Resistencia", color: "text-lime-400" },
  { pct: 60, reps: "16-20", goal: "Resistencia Muscular", color: "text-emerald-400" },
  { pct: 50, reps: "20+", goal: "Resistencia / Técnica", color: "text-cyan-400" },
];

// RPE (Rate of Perceived Exertion) → %1RM mapping (Reps In Reserve based)
const RPE_TABLE: { rpe: number; rir: number; pct: number }[] = [
  { rpe: 10, rir: 0, pct: 100 },
  { rpe: 9.5, rir: 0.5, pct: 97.5 },
  { rpe: 9, rir: 1, pct: 95.5 },
  { rpe: 8.5, rir: 1.5, pct: 93.5 },
  { rpe: 8, rir: 2, pct: 91 },
  { rpe: 7.5, rir: 2.5, pct: 88.5 },
  { rpe: 7, rir: 3, pct: 86 },
  { rpe: 6, rir: 4, pct: 83 },
];

// Standard barbell + plate setup (kg)
const BARBELL_KG = 20;
// Full catalog of common kg plates. The gym toggles which it actually owns.
const PLATE_CATALOG = [25, 20, 15, 10, 5, 2.5, 1.25, 1, 0.5];
const DEFAULT_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
const PLATES_STORAGE_KEY = "trainofit_gym_plates";
const BAR_PRESETS = [20, 15, 10];

// IWF-inspired colors so plates read like the real thing for students
const PLATE_META: Record<number, { bg: string; text: string }> = {
  25: { bg: "bg-red-600", text: "text-white" },
  20: { bg: "bg-blue-600", text: "text-white" },
  15: { bg: "bg-yellow-400", text: "text-zinc-900" },
  10: { bg: "bg-green-600", text: "text-white" },
  5: { bg: "bg-zinc-100", text: "text-zinc-900" },
  2.5: { bg: "bg-zinc-800", text: "text-white" },
  1.25: { bg: "bg-zinc-500", text: "text-white" },
  1: { bg: "bg-zinc-600", text: "text-white" },
  0.5: { bg: "bg-zinc-700", text: "text-white" },
};
const plateMeta = (w: number) => PLATE_META[w] ?? { bg: "bg-primary", text: "text-zinc-950" };

const USE_CASES = [
  {
    id: "fuerza",
    label: "Fuerza Máxima",
    icon: "🏋️",
    pct: [85, 95],
    detail: "3-5 series × 1-5 reps · descanso 3-5 min",
    considerations: [
      "Trabaja al 85-95% del 1RM con descansos completos (3-5 min) para máxima recuperación neural.",
      "Prioriza la técnica perfecta: la fatiga compromete la seguridad en cargas altas.",
      "Ideal para atletas con base técnica sólida. No recomendado para principiantes absolutos.",
      "Usa observador (spotter) o seguros del rack en sentadilla y press de banca.",
    ],
  },
  {
    id: "hipertrofia",
    label: "Hipertrofia",
    icon: "💪",
    pct: [65, 80],
    detail: "3-4 series × 8-12 reps · descanso 60-90s",
    considerations: [
      "El rango 65-80% del 1RM con 8-12 reps maximiza la tensión mecánica y el estrés metabólico.",
      "Lleva las series cerca del fallo (RIR 1-3) para óptimo estímulo de crecimiento.",
      "Controla la fase excéntrica (2-3 segundos) para aumentar el tiempo bajo tensión.",
      "El volumen semanal (10-20 series por grupo muscular) es el principal motor de hipertrofia.",
    ],
  },
  {
    id: "resistencia",
    label: "Resistencia Muscular",
    icon: "🔥",
    pct: [50, 65],
    detail: "2-3 series × 15-25 reps · descanso 30-45s",
    considerations: [
      "Cargas ligeras (50-65% 1RM) con reps altas y descansos cortos mejoran la capacidad de trabajo.",
      "Ideal para fases de adaptación anatómica, principiantes y trabajo de acondicionamiento.",
      "Mantén una cadencia constante; el objetivo es tolerar fatiga, no levantar pesado.",
      "Excelente complemento para deportistas de resistencia (running, ciclismo, CrossFit).",
    ],
  },
  {
    id: "potencia",
    label: "Potencia / Explosividad",
    icon: "⚡",
    pct: [30, 60],
    detail: "3-6 series × 1-5 reps explosivas · descanso 2-3 min",
    considerations: [
      "Para potencia, mueve cargas del 30-60% del 1RM con MÁXIMA velocidad concéntrica.",
      "Movimientos olímpicos (cargada, arrancada) y balísticos (saltos, lanzamientos).",
      "La calidad del movimiento es clave: detén la serie si la velocidad cae notablemente.",
      "Descansos largos (2-3 min) para mantener la potencia en cada repetición.",
    ],
  },
];

function round(n: number, step = 0.5) {
  return Math.round(n / step) * step;
}

// Compute plates per side for a target weight, restricted to the gym's available plates.
// Greedy (optimal for canonical kg sets) and reports the closest achievable load.
function computePlates(target: number, bar: number, available: number[]) {
  const perSide = (target - bar) / 2;
  if (perSide < 0) {
    return { valid: false, perSide: 0, plates: [] as { w: number; count: number }[], leftover: 0, achievable: bar, exact: false };
  }
  const sorted = [...available].sort((a, b) => b - a);
  let remaining = perSide;
  const plates: { w: number; count: number }[] = [];
  for (const p of sorted) {
    const count = Math.floor((remaining + 1e-9) / p);
    if (count > 0) {
      plates.push({ w: p, count });
      remaining = round(remaining - count * p, 0.01);
    }
  }
  const loadedPerSide = round(perSide - remaining, 0.01);
  const achievable = round(bar + 2 * loadedPerSide, 0.01);
  const smallest = sorted.length ? sorted[sorted.length - 1] : 0;
  // Closest load just above the target, if a plate exists to bump it
  const nextAchievable = smallest ? round(achievable + 2 * smallest, 0.01) : achievable;
  return { valid: true, perSide, plates, leftover: remaining, loadedPerSide, achievable, nextAchievable, exact: remaining <= 0.01 };
}

type ToolTab = "rm" | "plates" | "rpe";

export function ToolsManager() {
  const [tab, setTab] = useState<ToolTab>("rm");

  // RM Calculator state
  const [weight, setWeight] = useState<string>("100");
  const [reps, setReps] = useState<string>("5");
  const [activeUseCase, setActiveUseCase] = useState<string>("hipertrofia");

  // Plate calc state
  const [targetWeight, setTargetWeight] = useState<string>("100");
  const [barWeight, setBarWeight] = useState<string>("20");
  // Gym's available plates (persisted so each gym keeps its real inventory)
  const [availablePlates, setAvailablePlates] = useState<number[]>(DEFAULT_PLATES);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PLATES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) setAvailablePlates(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  const togglePlate = (w: number) => {
    setAvailablePlates((prev) => {
      const next = prev.includes(w) ? prev.filter((p) => p !== w) : [...prev, w].sort((a, b) => b - a);
      try { localStorage.setItem(PLATES_STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  // RPE state
  const [rpeWeight, setRpeWeight] = useState<string>("80");
  const [rpeReps, setRpeReps] = useState<string>("5");
  const [rpeValue, setRpeValue] = useState<number>(8);

  const w = parseFloat(weight) || 0;
  const r = parseInt(reps) || 0;

  // Compute 1RM across formulas
  const rmResults = useMemo(() => {
    if (w <= 0 || r <= 0 || r > 30) return null;
    const values = RM_FORMULAS.map((f) => ({ ...f, value: f.fn(w, r) }));
    const avg = values.reduce((s, v) => s + v.value, 0) / values.length;
    return { values, avg, min: Math.min(...values.map(v => v.value)), max: Math.max(...values.map(v => v.value)) };
  }, [w, r]);

  const oneRM = rmResults ? round(rmResults.avg, 0.5) : 0;

  const plateResult = useMemo(() => {
    const t = parseFloat(targetWeight) || 0;
    const b = parseFloat(barWeight) || 20;
    return computePlates(t, b, availablePlates);
  }, [targetWeight, barWeight, availablePlates]);

  // RPE-based 1RM estimation
  const rpeResult = useMemo(() => {
    const rw = parseFloat(rpeWeight) || 0;
    const rr = parseInt(rpeReps) || 0;
    if (rw <= 0 || rr <= 0) return null;
    // Find %1RM: base on reps at RPE 10, then adjust by RPE row
    // Simplified: use RPE table pct for the given rpe at this rep count via Epley-like
    const row = RPE_TABLE.find((x) => x.rpe === rpeValue) || RPE_TABLE[4];
    // Adjust pct for reps using Epley inverse at given RPE
    const effectiveReps = rr + row.rir; // total reps possible
    const est1rm = rw * (1 + effectiveReps / 30);
    return { est1rm: round(est1rm, 0.5), pct: row.pct, rir: row.rir, effectiveReps };
  }, [rpeWeight, rpeReps, rpeValue]);

  const currentUseCase = USE_CASES.find((u) => u.id === activeUseCase)!;

  return (
    <div className="flex flex-col rounded-2xl border border-white/8 bg-zinc-950/80 overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-white/8">
        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
          <Calculator size={16} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-white">Herramientas de Coaching</p>
          <p className="text-[10px] text-light/50 font-medium">Calculadoras precisas para programar entrenamientos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-zinc-950/40">
        {([
          { id: "rm" as ToolTab, label: "Calculadora RM", icon: <Target size={11} /> },
          { id: "plates" as ToolTab, label: "Cargar Barra", icon: <Dumbbell size={11} /> },
          { id: "rpe" as ToolTab, label: "RPE / RIR", icon: <Gauge size={11} /> },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-extrabold uppercase tracking-wider transition-all ${
              tab === t.id ? "text-primary border-b-2 border-primary bg-primary/5" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-5">
        {/* ── RM CALCULATOR ── */}
        {tab === "rm" && (
          <div className="grid md:grid-cols-2 gap-5">
            {/* Left: Inputs + Result */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Peso levantado (kg)</label>
                  <input
                    type="number" min="1" step="0.5" value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full p-3 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-lg font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Reps (al fallo)</label>
                  <input
                    type="number" min="1" max="30" value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="w-full p-3 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-lg font-bold text-white"
                  />
                </div>
              </div>

              {r > 12 && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Info size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-amber-300/90 leading-relaxed">Con más de 12 reps la estimación pierde precisión. Para un 1RM fiable, usa series de 1-10 reps.</p>
                </div>
              )}

              {rmResults ? (
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 text-center">
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary/80">1RM Estimado (promedio)</p>
                  <p className="text-4xl font-black text-white mt-1">{oneRM} <span className="text-lg text-primary">kg</span></p>
                  <p className="text-[10px] text-light/50 mt-1">Rango: {round(rmResults.min)} – {round(rmResults.max)} kg</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 text-center text-xs text-zinc-500">
                  Ingresa peso y reps válidos (1-30) para calcular.
                </div>
              )}

              {/* Per-formula breakdown */}
              {rmResults && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-light/50">Por fórmula científica</p>
                  {rmResults.values.map((v) => (
                    <div key={v.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-zinc-900/40 border border-white/5">
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-white">{v.name}</span>
                        <p className="text-[9px] text-zinc-500 leading-tight">{v.note}</p>
                      </div>
                      <span className="text-sm font-black text-primary flex-shrink-0">{round(v.value)} kg</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Load table + use-case considerations */}
            <div className="space-y-4">
              {rmResults && (
                <div className="rounded-xl bg-zinc-900/40 border border-white/5 overflow-hidden">
                  <div className="px-3 py-2 border-b border-white/5 bg-zinc-900/60">
                    <p className="text-[10px] font-black uppercase tracking-wider text-light/70">Tabla de Cargas (% del 1RM)</p>
                  </div>
                  <div className="divide-y divide-white/5 max-h-[260px] overflow-y-auto scrollbar-thin">
                    {LOAD_ZONES.map((z) => (
                      <div key={z.pct} className="flex items-center justify-between px-3 py-1.5 hover:bg-white/2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black w-9 ${z.color}`}>{z.pct}%</span>
                          <span className="text-[10px] text-zinc-500">{z.reps} reps</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-zinc-600 hidden sm:inline">{z.goal}</span>
                          <span className="text-sm font-bold text-white w-16 text-right">{round(oneRM * z.pct / 100)} kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Use-case selector */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-light/50">Consideraciones por objetivo</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {USE_CASES.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setActiveUseCase(u.id)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-left transition-all text-[10px] font-bold ${
                        activeUseCase === u.id ? "bg-primary/10 border-primary/30 text-primary" : "bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-primary/20"
                      }`}
                    >
                      <span>{u.icon}</span> {u.label}
                    </button>
                  ))}
                </div>
                <div className="p-3 rounded-lg bg-zinc-900/40 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{currentUseCase.icon} {currentUseCase.label}</span>
                    {rmResults && (
                      <span className="text-[10px] font-bold text-primary">
                        {round(oneRM * currentUseCase.pct[0] / 100)}–{round(oneRM * currentUseCase.pct[1] / 100)} kg
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 font-semibold">{currentUseCase.detail}</p>
                  <ul className="space-y-1">
                    {currentUseCase.considerations.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[10px] text-zinc-500 leading-relaxed">
                        <span className="text-primary mt-0.5 flex-shrink-0">•</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PLATE LOADING ── */}
        {tab === "plates" && (
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Peso objetivo (kg)</label>
                  <input type="number" min="0" step="0.5" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)}
                    className="w-full p-3 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-lg font-bold text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Peso de la barra (kg)</label>
                  <input type="number" min="0" step="0.5" value={barWeight} onChange={(e) => setBarWeight(e.target.value)}
                    className="w-full p-3 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-lg font-bold text-white" />
                  <div className="flex gap-1.5 mt-1.5">
                    {BAR_PRESETS.map((b) => (
                      <button key={b} onClick={() => setBarWeight(String(b))}
                        className={`flex-1 py-1 rounded-md text-[10px] font-bold border transition-all ${
                          parseFloat(barWeight) === b ? "bg-primary/15 border-primary/40 text-primary" : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-primary/20"
                        }`}>{b} kg</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gym plate inventory */}
              <div className="p-3 rounded-xl bg-zinc-900/40 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-wider text-light/70">Discos disponibles en el gym</p>
                  <span className="text-[9px] text-zinc-500">Toca para activar / desactivar</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PLATE_CATALOG.map((p) => {
                    const on = availablePlates.includes(p);
                    const m = plateMeta(p);
                    return (
                      <button key={p} onClick={() => togglePlate(p)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black border transition-all ${
                          on ? `${m.bg} ${m.text} border-transparent shadow` : "bg-zinc-900/60 text-zinc-600 border-zinc-800 line-through"
                        }`}>{p} kg</button>
                    );
                  })}
                </div>
                {availablePlates.length === 0 && (
                  <p className="text-[10px] text-amber-400">Selecciona al menos un disco disponible.</p>
                )}
              </div>

              {plateResult.valid ? (
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary/80 text-center">Discos por lado</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {plateResult.plates.length === 0 ? (
                      <p className="text-xs text-zinc-400">Solo la barra (sin discos).</p>
                    ) : (
                      plateResult.plates.map((p, i) => {
                        const m = plateMeta(p.w);
                        return (
                          <div key={i} className="flex flex-col items-center">
                            <div className={`px-3 py-2 rounded-lg font-black text-sm ${m.bg} ${m.text} border border-white/10`}>{p.w} kg</div>
                            <span className="text-[10px] text-primary font-bold mt-1">× {p.count}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <p className="text-center text-[10px] text-light/50 mt-3">
                    {round(plateResult.loadedPerSide ?? plateResult.perSide, 0.01)} kg por lado · <span className="text-white font-bold">{round(plateResult.achievable, 0.01)} kg total</span>
                  </p>
                  {!plateResult.exact && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
                      <p className="text-[10px] text-amber-300/90 leading-relaxed">
                        No se puede armar <strong className="text-amber-200">{parseFloat(targetWeight)} kg</strong> exacto con tus discos. Lo más cercano es <strong className="text-amber-200">{round(plateResult.achievable, 0.01)} kg</strong>.
                      </p>
                      <div className="flex gap-1.5 justify-center">
                        <button onClick={() => setTargetWeight(String(round(plateResult.achievable, 0.01)))}
                          className="px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-200 text-[10px] font-bold hover:bg-amber-500/30 transition-all">
                          Usar {round(plateResult.achievable, 0.01)} kg
                        </button>
                        {plateResult.nextAchievable && plateResult.nextAchievable > plateResult.achievable && (
                          <button onClick={() => setTargetWeight(String(round(plateResult.nextAchievable, 0.01)))}
                            className="px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold hover:border-primary/30 transition-all">
                            Subir a {round(plateResult.nextAchievable, 0.01)} kg
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 text-center text-xs text-zinc-500">
                  El peso objetivo debe ser mayor o igual que el peso de la barra.
                </div>
              )}
            </div>

            {/* Right: visual + step-by-step instructions */}
            <div className="flex flex-col gap-4">
              {plateResult.valid && (
                <>
                  <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-zinc-900/40 border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-light/50">Vista de la barra</p>
                    <div className="flex items-center justify-center w-full">
                      <div className="flex items-center flex-row-reverse">
                        {plateResult.plates.flatMap((p, gi) =>
                          Array.from({ length: p.count }).map((_, ci) => {
                            const m = plateMeta(p.w);
                            return (
                              <div key={`l-${gi}-${ci}`} className={`rounded-sm ${m.bg} border border-white/20 mx-px`}
                                style={{ width: 10, height: 28 + p.w * 1.7 }} title={`${p.w} kg`} />
                            );
                          })
                        )}
                      </div>
                      <div className="h-2 bg-zinc-400 rounded-full" style={{ width: 60 }} />
                      <div className="flex items-center">
                        {plateResult.plates.flatMap((p, gi) =>
                          Array.from({ length: p.count }).map((_, ci) => {
                            const m = plateMeta(p.w);
                            return (
                              <div key={`r-${gi}-${ci}`} className={`rounded-sm ${m.bg} border border-white/20 mx-px`}
                                style={{ width: 10, height: 28 + p.w * 1.7 }} title={`${p.w} kg`} />
                            );
                          })
                        )}
                      </div>
                    </div>
                    <p className="text-[9px] text-zinc-600">Colores según estándar IWF · altura proporcional al peso</p>
                  </div>

                  {/* Student-friendly steps */}
                  <div className="rounded-xl bg-zinc-900/40 border border-white/5 overflow-hidden">
                    <div className="px-3 py-2 border-b border-white/5 bg-zinc-900/60">
                      <p className="text-[10px] font-black uppercase tracking-wider text-light/70">Cómo cargar la barra</p>
                    </div>
                    <ol className="p-3 space-y-1.5">
                      <li className="flex items-start gap-2 text-[11px] text-zinc-300">
                        <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                        Empieza con la barra de <strong className="text-white">{parseFloat(barWeight) || 20} kg</strong> en el rack.
                      </li>
                      {plateResult.plates.length === 0 ? (
                        <li className="flex items-start gap-2 text-[11px] text-zinc-300">
                          <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                          No agregues discos: la barra sola ya alcanza el peso.
                        </li>
                      ) : (
                        plateResult.plates.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-300">
                            <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 2}</span>
                            Pon <strong className="text-white">{p.count} disco{p.count > 1 ? "s" : ""} de {p.w} kg</strong> en <strong className="text-white">cada</strong> lado{i === 0 ? " (los más pesados primero, pegados a la barra)" : ""}.
                          </li>
                        ))
                      )}
                      <li className="flex items-start gap-2 text-[11px] text-zinc-300">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                        Asegura con los <strong className="text-white">seguros</strong> y verifica: <strong className="text-white">{round(plateResult.achievable, 0.01)} kg</strong> en total.
                      </li>
                    </ol>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── RPE / RIR ── */}
        {tab === "rpe" && (
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Peso usado (kg)</label>
                  <input type="number" min="1" step="0.5" value={rpeWeight} onChange={(e) => setRpeWeight(e.target.value)}
                    className="w-full p-3 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-lg font-bold text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">Reps realizadas</label>
                  <input type="number" min="1" max="20" value={rpeReps} onChange={(e) => setRpeReps(e.target.value)}
                    className="w-full p-3 rounded-lg bg-zinc-900 border border-white/10 focus:border-primary outline-none text-lg font-bold text-white" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/60 mb-1.5">RPE percibido (esfuerzo)</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {RPE_TABLE.map((row) => (
                    <button key={row.rpe} onClick={() => setRpeValue(row.rpe)}
                      className={`py-2 rounded-lg border text-center transition-all ${
                        rpeValue === row.rpe ? "bg-primary/10 border-primary/30 text-primary" : "bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-primary/20"
                      }`}>
                      <span className="text-sm font-black block">{row.rpe}</span>
                      <span className="text-[8px] text-zinc-500">{row.rir} RIR</span>
                    </button>
                  ))}
                </div>
              </div>

              {rpeResult && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 text-center">
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary/80">1RM Estimado (ajustado por RPE)</p>
                  <p className="text-4xl font-black text-white mt-1">{rpeResult.est1rm} <span className="text-lg text-primary">kg</span></p>
                  <p className="text-[10px] text-light/50 mt-1">{rpeResult.effectiveReps} reps máximas posibles · {rpeResult.rir} en reserva</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Info size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-blue-300/90 leading-relaxed">
                  <strong className="text-blue-200">RPE</strong> (Rate of Perceived Exertion) mide cuánto esfuerzo costó la serie. <strong className="text-blue-200">RIR</strong> (Reps In Reserve) = reps que te sobraron antes del fallo. RPE 10 = fallo total (0 RIR).
                </p>
              </div>
              <div className="rounded-xl bg-zinc-900/40 border border-white/5 overflow-hidden">
                <div className="px-3 py-2 border-b border-white/5 bg-zinc-900/60">
                  <p className="text-[10px] font-black uppercase tracking-wider text-light/70">Escala RPE → Intensidad</p>
                </div>
                <div className="divide-y divide-white/5">
                  {RPE_TABLE.map((row) => (
                    <div key={row.rpe} className={`flex items-center justify-between px-3 py-1.5 ${rpeValue === row.rpe ? "bg-primary/5" : ""}`}>
                      <span className="text-xs font-black text-white w-10">RPE {row.rpe}</span>
                      <span className="text-[10px] text-zinc-500">{row.rir} reps en reserva</span>
                      <span className="text-sm font-bold text-primary">~{row.pct}% 1RM</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Flame size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-amber-300/90 leading-relaxed">
                  <strong className="text-amber-200">Uso práctico:</strong> programa por RPE en lugar de % fijo para autoregular según el día. RPE 7-8 para volumen/hipertrofia, RPE 9-10 reservado para picos de fuerza.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
