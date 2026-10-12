import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown, ArrowLeft, ArrowUp, Check, ChevronDown, ExternalLink, Link2, Loader2, Pencil,
  Plus, RefreshCw, Search, Sparkles, Trash2, X,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "~/components/ui/dialog";
import { confirmDialog } from "~/components/ui/confirm-dialog";
import { ExerciseDemo } from "~/components/exercise-demo";
import { WhatsAppIcon } from "~/components/layout";
import {
  AREAS, availableEquipment, describe, loadLibrary, localDraft, searchLibrary, shortlist,
  type DraftExercise, type LibraryExercise,
} from "~/lib/exercise-library";
import { LEVELS, PURPOSES, SECTIONS, purposeLabel, type PurposeId } from "~/lib/routines";
import { cn } from "~/lib/utils";

// ── Data ─────────────────────────────────────────────────

type Row = DraftExercise & { key: string };
type Section = { key: string; name: string; exercises: Row[] };
type Routine = {
  id?: number;
  name: string;
  description: string;
  difficulty: string;
  category: PurposeId;
  durationMin: number;
  summary: string;
  body: string;
  isPublished: boolean;
  sections: Section[];
};
type SavedWorkout = {
  id: number;
  name: string;
  description?: string | null;
  difficulty: string;
  magicToken: string;
  slug?: string | null;
  category?: string | null;
  durationMin?: number | null;
  summary?: string | null;
  body?: string | null;
  isPublished?: boolean;
  exercises: {
    id: number;
    routineName: string;
    exerciseName: string;
    description?: string | null;
    sets: number;
    reps: string;
    intensityPct?: number | null;
    restSeconds?: number | null;
    image?: string | null;
  }[];
};

let lastKey = 0;
const newKey = () => `k${++lastKey}`;

const request = (path: string, method = "GET", body?: unknown) =>
  fetch(path, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const isPurpose = (id: unknown): id is PurposeId => PURPOSES.some((p) => p.id === id);

function toRoutine(workout: SavedWorkout): Routine {
  const sections: Section[] = [];
  for (const exercise of [...workout.exercises].sort((a, b) => a.id - b.id)) {
    let section = sections.find((s) => s.name === exercise.routineName);
    if (!section) sections.push((section = { key: newKey(), name: exercise.routineName, exercises: [] }));
    section.exercises.push({
      key: newKey(),
      // Photo folders are library ids, so a saved row can still be swapped by muscle
      libraryId: exercise.image || undefined,
      name: exercise.exerciseName,
      image: exercise.image ?? "",
      sets: exercise.sets,
      reps: exercise.reps,
      restSeconds: exercise.restSeconds ?? 0,
      intensityPct: exercise.intensityPct ?? null,
      note: exercise.description ?? "",
    });
  }
  return {
    id: workout.id,
    name: workout.name,
    description: workout.description ?? "",
    difficulty: workout.difficulty,
    category: isPurpose(workout.category) ? workout.category : "funcional",
    durationMin: workout.durationMin ?? 60,
    summary: workout.summary ?? "",
    body: workout.body ?? "",
    isPublished: !!workout.isPublished,
    sections,
  };
}

const fromLibrary = (exercise: LibraryExercise): Row => ({
  key: newKey(),
  libraryId: exercise.id,
  name: exercise.name,
  image: exercise.img,
  sets: 3,
  reps: "10",
  restSeconds: 60,
  intensityPct: null,
  note: describe("", exercise.steps),
});

const countLabel = (n: number) => `${n} ${n === 1 ? "ejercicio" : "ejercicios"}`;
const studentLink = (workout: SavedWorkout) => `${window.location.origin}/workout/${workout.magicToken}`;

// ── Shared styles ────────────────────────────────────────

const field =
  "w-full bg-zinc-900 border border-white/15 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary focus:outline-none";
const label = "block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5";
const primaryButton =
  "inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-dark font-black text-xs uppercase tracking-widest hover:bg-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer";
const quietButton =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-white/15 text-zinc-200 font-bold text-xs uppercase tracking-wider hover:border-white/40 hover:text-white disabled:opacity-50 transition-colors duration-200 cursor-pointer";
const iconButton =
  "inline-flex items-center justify-center size-9 border border-white/10 text-zinc-400 hover:text-white hover:border-white/40 disabled:opacity-30 transition-colors duration-200 cursor-pointer";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "px-4 py-2.5 border text-sm font-bold transition-colors duration-200 cursor-pointer",
        active ? "bg-primary border-primary text-dark" : "border-white/15 text-zinc-300 hover:border-white/40 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

// ── Library dialog: add or replace an exercise ───────────

function LibraryDialog({
  library,
  gymEquipment,
  initialQuery,
  title,
  onPick,
  onClose,
}: {
  library: LibraryExercise[] | null;
  gymEquipment: string[] | null; // null = the gym has no inventory registered
  initialQuery: string;
  title: string;
  onPick: (exercise: LibraryExercise | string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [area, setArea] = useState("");
  const [onlyGym, setOnlyGym] = useState(!!gymEquipment);

  const results = useMemo(
    () =>
      library
        ? searchLibrary(library, query, { area: area || undefined, equipment: onlyGym && gymEquipment ? gymEquipment : undefined })
        : [],
    [library, query, area, onlyGym, gymEquipment]
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[90dvh] sm:rounded-none p-0 gap-0 grid-rows-[auto_1fr] overflow-hidden">
        <div className="p-5 border-b border-white/10 space-y-3">
          <DialogTitle className="font-display text-3xl uppercase tracking-normal text-white leading-none">{title}</DialogTitle>
          <DialogDescription className="sr-only">Busca en la biblioteca de ejercicios y elige uno.</DialogDescription>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" aria-hidden />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca en español o inglés: sentadilla, press banca, glúteos, kettlebell…"
              aria-label="Buscar ejercicio"
              className={cn(field, "pl-9")}
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {["", ...AREAS].map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={area === option}
                onClick={() => setArea(option)}
                className={cn(
                  "px-3 py-1.5 border text-xs font-bold cursor-pointer transition-colors duration-200",
                  area === option ? "bg-white text-dark border-white" : "border-white/15 text-zinc-300 hover:border-white/40"
                )}
              >
                {option || "Todo"}
              </button>
            ))}
            {gymEquipment && (
              <label className="ml-auto flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={onlyGym} onChange={(e) => setOnlyGym(e.target.checked)} className="accent-primary size-4" />
                Solo con el equipo del gym
              </label>
            )}
          </div>
        </div>

        <div className="overflow-y-auto p-5">
          {!library ? (
            <p className="text-sm text-zinc-400 flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Cargando biblioteca…</p>
          ) : (
            <>
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {results.slice(0, 36).map((exercise) => (
                  <li key={exercise.id}>
                    <button
                      type="button"
                      onClick={() => onPick(exercise)}
                      className="group w-full text-left border border-white/10 hover:border-primary transition-colors duration-200 cursor-pointer"
                    >
                      <ExerciseDemo image={exercise.img} name={exercise.name} still className="aspect-[4/3] w-full" />
                      <span className="block p-3">
                        <span className="block text-sm font-bold text-white leading-snug group-hover:text-primary">{exercise.name}</span>
                        <span className="block text-xs text-zinc-400 mt-1">{exercise.target} · {exercise.equipment}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-zinc-400">
                {results.length === 0
                  ? "Ningún ejercicio coincide."
                  : results.length > 36
                    ? `Mostrando 36 de ${results.length}. Escribe más para afinar.`
                    : `${results.length} ejercicios.`}
              </p>
              {query.trim() && (
                <button type="button" onClick={() => onPick(query.trim())} className={cn(quietButton, "mt-3")}>
                  <Plus size={14} aria-hidden /> Usar «{query.trim()}» como ejercicio propio
                </button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Step 1: the brief ────────────────────────────────────

type BriefState = { purpose: PurposeId | null; level: string; durationMin: number; focus: string[]; notes: string };

function BriefForm({
  busy,
  onGenerate,
  onBlank,
}: {
  busy: boolean;
  onGenerate: (brief: BriefState & { purpose: PurposeId }) => void;
  onBlank: (brief: BriefState & { purpose: PurposeId }) => void;
}) {
  const [brief, setBrief] = useState<BriefState>({ purpose: null, level: "Intermedio", durationMin: 45, focus: [], notes: "" });
  const set = (patch: Partial<BriefState>) => setBrief((prev) => ({ ...prev, ...patch }));
  const ready = brief.purpose !== null;

  return (
    <div className="max-w-3xl space-y-8">
      <fieldset>
        <legend className={label}>1. ¿Para qué es?</legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PURPOSES.map((purpose) => (
            <button
              key={purpose.id}
              type="button"
              aria-pressed={brief.purpose === purpose.id}
              onClick={() => set({ purpose: purpose.id })}
              className={cn(
                "p-3 text-left border transition-colors duration-200 cursor-pointer",
                brief.purpose === purpose.id ? "bg-primary border-primary text-dark" : "border-white/15 text-white hover:border-white/40"
              )}
            >
              <span className="block font-display text-2xl uppercase leading-none">{purpose.label}</span>
              <span className={cn("block text-xs mt-1.5 leading-snug", brief.purpose === purpose.id ? "text-dark/80" : "text-zinc-400")}>
                {purpose.blurb}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid sm:grid-cols-2 gap-8">
        <fieldset>
          <legend className={label}>2. Nivel</legend>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((level) => (
              <Chip key={level} active={brief.level === level} onClick={() => set({ level })}>{level}</Chip>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className={label}>3. Duración</legend>
          <div className="flex flex-wrap gap-2">
            {[20, 30, 45, 60, 90].map((minutes) => (
              <Chip key={minutes} active={brief.durationMin === minutes} onClick={() => set({ durationMin: minutes })}>{minutes} min</Chip>
            ))}
          </div>
        </fieldset>
      </div>

      <fieldset>
        <legend className={label}>4. Enfoque <span className="normal-case font-normal text-zinc-500">(opcional; sin marcar = cuerpo completo)</span></legend>
        <div className="flex flex-wrap gap-2">
          {AREAS.map((area) => (
            <Chip
              key={area}
              active={brief.focus.includes(area)}
              onClick={() => set({ focus: brief.focus.includes(area) ? brief.focus.filter((f) => f !== area) : [...brief.focus, area] })}
            >
              {area}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="brief-notes" className={label}>
          5. Algo más <span className="normal-case font-normal text-zinc-500">(opcional)</span>
        </label>
        <textarea
          id="brief-notes"
          rows={2}
          value={brief.notes}
          onChange={(e) => set({ notes: e.target.value })}
          placeholder="Ej.: alumna con molestia en la rodilla, sin saltos. O: preparación para una carrera de 10K."
          className={field}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button type="button" disabled={!ready || busy} onClick={() => onGenerate(brief as BriefState & { purpose: PurposeId })} className={primaryButton}>
          {busy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Sparkles size={16} aria-hidden />}
          {busy ? "Armando la rutina…" : "Generar rutina"}
        </button>
        <button type="button" disabled={!ready || busy} onClick={() => onBlank(brief as BriefState & { purpose: PurposeId })} className={quietButton}>
          Empezar en blanco
        </button>
        <p className="text-sm text-zinc-400 self-center" aria-live="polite">
          {!ready ? "Elige para qué es la rutina." : busy ? "Tarda unos segundos." : ""}
        </p>
      </div>
    </div>
  );
}

// ── Step 2: the editor ───────────────────────────────────

function ExerciseRow({
  row,
  first,
  last,
  onChange,
  onMove,
  onRemove,
  onSwap,
}: {
  row: Row;
  first: boolean;
  last: boolean;
  onChange: (patch: Partial<Row>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onSwap: () => void;
}) {
  const [open, setOpen] = useState(false);
  const small = cn(field, "px-2 py-2 text-center tabular-nums");

  return (
    <li className="border border-white/10 bg-zinc-900/40">
      <div className="flex items-start gap-3 p-3">
        <button type="button" onClick={() => setOpen(!open)} aria-label={`Ver demostración de ${row.name}`} className="shrink-0 cursor-pointer">
          <ExerciseDemo image={row.image} name={row.name} className="size-20 sm:size-24" />
        </button>

        <div className="flex-1 min-w-0 space-y-2">
          <input
            value={row.name}
            onChange={(e) => onChange({ name: e.target.value })}
            aria-label="Nombre del ejercicio"
            className="w-full bg-transparent border-b border-transparent hover:border-white/20 focus:border-primary focus:outline-none text-base font-bold text-white py-1"
          />
          <div className="flex flex-wrap items-end gap-2">
            <label className="w-16">
              <span className="block text-[11px] text-zinc-400 mb-1">Series</span>
              <input type="number" min={1} max={12} value={row.sets} onChange={(e) => onChange({ sets: Number(e.target.value) || 1 })} className={small} />
            </label>
            <label className="w-28">
              <span className="block text-[11px] text-zinc-400 mb-1">Reps / formato</span>
              <input value={row.reps} onChange={(e) => onChange({ reps: e.target.value })} className={small} />
            </label>
            <label className="w-20">
              <span className="block text-[11px] text-zinc-400 mb-1">Descanso s</span>
              <input type="number" min={0} step={5} value={row.restSeconds} onChange={(e) => onChange({ restSeconds: Number(e.target.value) || 0 })} className={small} />
            </label>
            <label className="w-16">
              <span className="block text-[11px] text-zinc-400 mb-1">% RM</span>
              <input
                type="number"
                min={0}
                max={100}
                value={row.intensityPct ?? ""}
                onChange={(e) => onChange({ intensityPct: e.target.value ? Number(e.target.value) : null })}
                className={small}
              />
            </label>

            <div className="flex gap-1.5 ml-auto">
              <button type="button" onClick={onSwap} className={cn(quietButton, "px-3 py-2")}>
                <RefreshCw size={13} aria-hidden /> Cambiar
              </button>
              <button type="button" onClick={() => onMove(-1)} disabled={first} aria-label="Subir" className={iconButton}><ArrowUp size={15} /></button>
              <button type="button" onClick={() => onMove(1)} disabled={last} aria-label="Bajar" className={iconButton}><ArrowDown size={15} /></button>
              <button type="button" onClick={onRemove} aria-label={`Quitar ${row.name}`} className={cn(iconButton, "hover:text-red-400 hover:border-red-400/50")}><Trash2 size={15} /></button>
            </div>
          </div>
          <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="inline-flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-primary cursor-pointer">
            <ChevronDown size={14} className={cn("transition-transform duration-200", open && "rotate-180")} aria-hidden />
            {open ? "Ocultar indicaciones" : row.note ? "Ver indicaciones" : "Añadir indicaciones"}
          </button>
        </div>
      </div>

      {open && (
        <div className="grid sm:grid-cols-[16rem_1fr] gap-4 p-3 pt-0">
          {row.image && <ExerciseDemo image={row.image} name={row.name} className="aspect-[4/3] w-full" />}
          <label className={row.image ? "" : "sm:col-span-2"}>
            <span className={label}>Indicaciones para el alumno</span>
            <textarea rows={6} value={row.note} onChange={(e) => onChange({ note: e.target.value })} placeholder="Clave técnica, cómo escalarlo, qué cuidar…" className={field} />
          </label>
        </div>
      )}
    </li>
  );
}

function Editor({
  initial,
  notice,
  library,
  gymEquipment,
  onRefine,
  onSaved,
  onBack,
}: {
  initial: Routine;
  notice: string;
  library: LibraryExercise[] | null;
  gymEquipment: string[] | null;
  onRefine: (routine: Routine, instruction: string) => Promise<Section[] | string>;
  onSaved: (workout: SavedWorkout) => void;
  onBack: () => void;
}) {
  const [routine, setRoutine] = useState(initial);
  const [dialog, setDialog] = useState<{ section: string; row?: string } | null>(null);
  const [instruction, setInstruction] = useState("");
  const [refining, setRefining] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(notice);

  const set = (patch: Partial<Routine>) => setRoutine((prev) => ({ ...prev, ...patch }));
  const setSection = (key: string, change: (section: Section) => Section) =>
    setRoutine((prev) => ({ ...prev, sections: prev.sections.map((s) => (s.key === key ? change(s) : s)) }));

  const total = routine.sections.reduce((sum, s) => sum + s.exercises.length, 0);
  const swapping = dialog?.row
    ? routine.sections.find((s) => s.key === dialog.section)?.exercises.find((r) => r.key === dialog.row)
    : undefined;
  const swappingTarget = swapping?.libraryId ? library?.find((e) => e.id === swapping.libraryId)?.target ?? "" : "";

  const pick = (choice: LibraryExercise | string) => {
    if (!dialog) return;
    const picked: Row =
      typeof choice === "string"
        ? { key: newKey(), name: choice, image: "", sets: 3, reps: "10", restSeconds: 60, intensityPct: null, note: "" }
        : fromLibrary(choice);
    setSection(dialog.section, (section) => ({
      ...section,
      exercises: dialog.row
        ? // Replacing keeps the prescription and swaps the movement
          section.exercises.map((row) =>
            row.key === dialog.row ? { ...picked, sets: row.sets, reps: row.reps, restSeconds: row.restSeconds, intensityPct: row.intensityPct } : row
          )
        : [...section.exercises, picked],
    }));
    setDialog(null);
  };

  const refine = async () => {
    setRefining(true);
    setError("");
    const result = await onRefine(routine, instruction);
    setRefining(false);
    if (typeof result === "string") return setError(result);
    set({ sections: result });
    setMessage(`Cambio aplicado: «${instruction}». Revisa la rutina antes de guardar.`);
    setInstruction("");
  };

  const save = async () => {
    if (!routine.name.trim()) return setError("Ponle un nombre a la rutina.");
    if (total === 0) return setError("Añade al menos un ejercicio.");
    if (routine.sections.some((s) => s.exercises.some((r) => !r.name.trim() || !r.reps.trim()))) {
      return setError("Hay un ejercicio sin nombre o sin repeticiones.");
    }
    setSaving(true);
    setError("");
    try {
      const res = await request(routine.id ? `/api/admin/workouts/${routine.id}` : "/api/admin/workouts", routine.id ? "PUT" : "POST", {
        name: routine.name.trim(),
        description: routine.description,
        difficulty: routine.difficulty,
        category: routine.category,
        durationMin: routine.durationMin,
        summary: routine.summary,
        body: routine.body,
        isPublished: routine.isPublished,
        exercises: routine.sections.flatMap((section) =>
          section.exercises.map((row) => ({
            routineName: section.name.trim() || "Principal",
            exerciseName: row.name.trim(),
            description: row.note,
            sets: row.sets,
            reps: row.reps,
            intensityPct: row.intensityPct,
            restSeconds: row.restSeconds,
            image: row.image,
          }))
        ),
      });
      if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error || `Error ${res.status}`);
      onSaved((await res.json()) as SavedWorkout);
    } catch (err) {
      setError(`No se pudo guardar: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-28">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-primary cursor-pointer">
        <ArrowLeft size={14} aria-hidden /> Todas las rutinas
      </button>

      {message && <p className="p-3 border-l-2 border-primary bg-primary/5 text-sm text-zinc-200">{message}</p>}

      <div className="space-y-4">
        <input
          value={routine.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Nombre de la rutina"
          aria-label="Nombre de la rutina"
          className="w-full bg-transparent border-b border-white/15 focus:border-primary focus:outline-none font-display text-4xl sm:text-5xl uppercase text-white leading-none py-2 placeholder:text-zinc-600"
        />
        <div className="grid grid-cols-3 gap-3 max-w-xl">
          <label>
            <span className={label}>Propósito</span>
            <select value={routine.category} onChange={(e) => set({ category: e.target.value as PurposeId })} className={field}>
              {PURPOSES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </label>
          <label>
            <span className={label}>Nivel</span>
            <select value={routine.difficulty} onChange={(e) => set({ difficulty: e.target.value })} className={field}>
              {LEVELS.map((level) => <option key={level}>{level}</option>)}
            </select>
          </label>
          <label>
            <span className={label}>Minutos</span>
            <input type="number" min={5} max={180} step={5} value={routine.durationMin} onChange={(e) => set({ durationMin: Number(e.target.value) || 0 })} className={field} />
          </label>
        </div>
      </div>

      {/* Ask the AI for a change in plain words */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (instruction.trim() && !refining) refine();
        }}
        className="flex flex-col sm:flex-row gap-2 p-3 border border-primary/30 bg-primary/5"
      >
        <label htmlFor="refine" className="sr-only">Pídele un cambio a la IA</label>
        <input
          id="refine"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Pídele un cambio a la IA: «sin saltos», «más glúteo», «hazla de 30 minutos»…"
          className={cn(field, "flex-1")}
        />
        <button type="submit" disabled={!instruction.trim() || refining || total === 0} className={primaryButton}>
          {refining ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Sparkles size={15} aria-hidden />}
          {refining ? "Ajustando…" : "Ajustar"}
        </button>
      </form>

      {routine.sections.map((section, sectionIndex) => (
        <section key={section.key} className="space-y-2">
          <div className="flex items-center gap-2 border-b border-primary/40 pb-1">
            <input
              value={section.name}
              onChange={(e) => setSection(section.key, (s) => ({ ...s, name: e.target.value }))}
              aria-label={`Nombre de la sección ${sectionIndex + 1}`}
              className="flex-1 bg-transparent focus:outline-none text-sm font-black uppercase tracking-widest text-primary py-1.5"
            />
            <span className="text-xs text-zinc-500 tabular-nums">{countLabel(section.exercises.length)}</span>
            <button
              type="button"
              aria-label={`Eliminar la sección ${section.name}`}
              onClick={() => set({ sections: routine.sections.filter((s) => s.key !== section.key) })}
              className="text-zinc-500 hover:text-red-400 cursor-pointer p-1"
            >
              <X size={15} />
            </button>
          </div>
          <ul className="space-y-2">
            {section.exercises.map((row, index) => (
              <ExerciseRow
                key={row.key}
                row={row}
                first={index === 0}
                last={index === section.exercises.length - 1}
                onChange={(patch) =>
                  setSection(section.key, (s) => ({ ...s, exercises: s.exercises.map((r) => (r.key === row.key ? { ...r, ...patch } : r)) }))
                }
                onMove={(direction) =>
                  setSection(section.key, (s) => {
                    const exercises = [...s.exercises];
                    [exercises[index], exercises[index + direction]] = [exercises[index + direction], exercises[index]];
                    return { ...s, exercises };
                  })
                }
                onRemove={() => setSection(section.key, (s) => ({ ...s, exercises: s.exercises.filter((r) => r.key !== row.key) }))}
                onSwap={() => setDialog({ section: section.key, row: row.key })}
              />
            ))}
          </ul>
          <button type="button" onClick={() => setDialog({ section: section.key })} className={quietButton}>
            <Plus size={14} aria-hidden /> Añadir ejercicio
          </button>
        </section>
      ))}

      <button
        type="button"
        onClick={() => {
          const names = SECTIONS[routine.category];
          const name = names.find((n) => !routine.sections.some((s) => s.name === n)) ?? `Bloque ${routine.sections.length + 1}`;
          set({ sections: [...routine.sections, { key: newKey(), name, exercises: [] }] });
        }}
        className={quietButton}
      >
        <Plus size={14} aria-hidden /> Añadir sección
      </button>

      {/* Publishing */}
      <div className="border border-white/10 p-4 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={routine.isPublished} onChange={(e) => set({ isPublished: e.target.checked })} className="accent-primary size-5 mt-0.5" />
          <span>
            <span className="block text-sm font-bold text-white">Publicar en trainofit.cl/rutinas</span>
            <span className="block text-sm text-zinc-400">
              Sin marcar, la rutina es privada: solo la ve quien reciba el enlace.
            </span>
          </span>
        </label>
        {routine.isPublished && (
          <>
            <label className="block">
              <span className={label}>Resumen (aparece en la tarjeta y bajo el título)</span>
              <input value={routine.summary} maxLength={300} onChange={(e) => set({ summary: e.target.value })} className={field} />
            </label>
            <label className="block">
              <span className={label}>Artículo (opcional; línea en blanco = párrafo nuevo, «## » = subtítulo)</span>
              <textarea rows={7} value={routine.body} onChange={(e) => set({ body: e.target.value })} className={field} />
            </label>
          </>
        )}
      </div>

      {/* Save bar */}
      <div className="fixed bottom-0 inset-x-0 lg:left-64 z-30 border-t border-white/10 bg-zinc-950/95 backdrop-blur px-4 sm:px-8 py-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className={primaryButton}>
          {saving ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Check size={15} aria-hidden />}
          {routine.isPublished ? "Guardar y publicar" : "Guardar rutina"}
        </button>
        <p className="text-sm tabular-nums" aria-live="polite">
          {error ? <span className="text-red-400">{error}</span> : <span className="text-zinc-400">{countLabel(total)} · {routine.durationMin} min</span>}
        </p>
      </div>

      {dialog && (
        <LibraryDialog
          library={library}
          gymEquipment={gymEquipment}
          initialQuery={swappingTarget}
          title={swapping ? `Cambiar «${swapping.name}»` : "Añadir ejercicio"}
          onPick={pick}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}

// ── Step 3: share ────────────────────────────────────────

function ShareDialog({ workout, onClose }: { workout: SavedWorkout; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const link = studentLink(workout);
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:rounded-none max-w-md">
        <DialogTitle className="font-display text-4xl uppercase tracking-normal text-white leading-none">Rutina guardada</DialogTitle>
        <DialogDescription className="text-sm text-zinc-300">
          Envíale el enlace a tu alumno: lo abre en el celular, ve cada ejercicio con fotos, marca las series y el descanso se cuenta solo.
        </DialogDescription>
        <p className="p-3 bg-zinc-900 border border-white/10 text-xs text-zinc-300 break-all select-all">{link}</p>
        <div className="grid gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${workout.name} — tu rutina de TrainoFit: ${link}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={primaryButton}
          >
            <WhatsAppIcon className="size-4" /> Enviar por WhatsApp
          </a>
          <button
            type="button"
            className={quietButton}
            onClick={async () => {
              await navigator.clipboard.writeText(link).catch(() => {});
              setCopied(true);
            }}
          >
            {copied ? <Check size={14} aria-hidden /> : <Link2 size={14} aria-hidden />}
            <span aria-live="polite">{copied ? "Enlace copiado" : "Copiar enlace"}</span>
          </button>
          <a href={link} target="_blank" rel="noopener noreferrer" className={quietButton}>
            <ExternalLink size={14} aria-hidden /> Ver como alumno
          </a>
          {workout.isPublished && workout.slug && (
            <a href={`/rutinas/${workout.slug}`} target="_blank" rel="noopener noreferrer" className={quietButton}>
              <ExternalLink size={14} aria-hidden /> Ver artículo publicado
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── The screen ───────────────────────────────────────────

export function RoutineStudio() {
  const [workouts, setWorkouts] = useState<SavedWorkout[] | null>(null);
  const [library, setLibrary] = useState<LibraryExercise[] | null>(null);
  const [inventory, setInventory] = useState<string[]>([]);
  const [view, setView] = useState<{ step: "list" } | { step: "brief" } | { step: "edit"; routine: Routine; notice: string }>({ step: "list" });
  const [busy, setBusy] = useState(false);
  const [shared, setShared] = useState<SavedWorkout | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [filter, setFilter] = useState("");

  const loadWorkouts = () =>
    request("/api/admin/workouts")
      .then((res) => (res.ok ? (res.json() as Promise<SavedWorkout[]>) : []))
      .then(setWorkouts)
      .catch(() => setWorkouts([]));

  useEffect(() => {
    loadWorkouts();
    loadLibrary().then(setLibrary).catch(() => {});
    request("/api/admin/equipment")
      .then((res) => (res.ok ? (res.json() as Promise<{ name: string; isAvailable: boolean }[]>) : []))
      .then((items) => setInventory(items.filter((item) => item.isAvailable).map((item) => item.name)))
      .catch(() => {});
  }, []);

  const equipment = useMemo(() => availableEquipment(inventory), [inventory]);
  const gymEquipment = inventory.length ? equipment : null;

  // Asks the generator and turns its answer into editor sections, with photos and steps from the library.
  const generate = async (
    brief: { purpose: PurposeId; level: string; durationMin: number; focus: string[]; notes: string },
    current?: Routine,
    instruction?: string
  ) => {
    const lib = library ?? (await loadLibrary());
    const candidates = shortlist(lib, brief, equipment);
    // Exercises already in the routine stay valid picks when refining
    const inUse = current
      ? current.sections.flatMap((s) => s.exercises).flatMap((row) => lib.find((e) => e.id === row.libraryId) ?? [])
      : [];
    const offered = [...new Set([...inUse, ...candidates])];
    const res = await request("/api/admin/routines/generate", "POST", {
      ...brief,
      candidates: offered.map(({ id, name, target, equipment, kind }) => ({ id, name, target, equipment, kind })),
      current: current?.sections.map((s) => ({
        name: s.name,
        exercises: s.exercises.map((r) => ({ id: r.libraryId ?? null, nombre: r.name, sets: r.sets, reps: r.reps, rest: r.restSeconds, pct: r.intensityPct })),
      })),
      instruction,
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      routine?: { name: string; summary: string; article: string; sections: { name: string; exercises: (DraftExercise & { libraryId: string | null })[] }[] };
    };
    if (!res.ok || !data.routine) return { candidates, error: data.error || `Error ${res.status}` };

    const sections: Section[] = data.routine.sections.map((section) => ({
      key: newKey(),
      name: section.name,
      exercises: section.exercises.map((exercise) => {
        const entry = lib.find((e) => e.id === exercise.libraryId);
        return {
          ...exercise,
          key: newKey(),
          libraryId: entry?.id,
          image: entry?.img ?? "",
          note: describe(exercise.note, entry?.steps ?? []),
        };
      }),
    }));
    return { candidates, routine: data.routine, sections };
  };

  const start = async (brief: { purpose: PurposeId; level: string; durationMin: number; focus: string[]; notes: string }, useAI: boolean) => {
    const base: Routine = {
      name: "",
      description: "",
      difficulty: brief.level,
      category: brief.purpose,
      durationMin: brief.durationMin,
      summary: "",
      body: "",
      isPublished: false,
      sections: SECTIONS[brief.purpose].slice(0, 3).map((name) => ({ key: newKey(), name, exercises: [] })),
    };
    if (!useAI) return setView({ step: "edit", routine: base, notice: "" });

    setBusy(true);
    try {
      const result = await generate(brief);
      if (result.sections) {
        setView({
          step: "edit",
          routine: { ...base, name: result.routine.name, summary: result.routine.summary, body: result.routine.article, sections: result.sections },
          notice: "Rutina generada. Revísala, cambia lo que quieras y guárdala.",
        });
      } else {
        // The AI is unavailable: start from the best-ranked library exercises instead
        const sections = localDraft(result.candidates, brief).map((section) => ({
          key: newKey(),
          name: section.name,
          exercises: section.exercises.map((exercise) => ({
            ...exercise,
            key: newKey(),
            note: describe("", (library ?? []).find((e) => e.id === exercise.libraryId)?.steps ?? []),
          })),
        }));
        setView({
          step: "edit",
          routine: { ...base, name: `${purposeLabel(brief.purpose)} ${brief.durationMin} min`, sections },
          notice: `La IA no respondió, así que armamos una base con la biblioteca. Detalle: ${result.error}`,
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const refine = async (routine: Routine, instruction: string) => {
    const result = await generate(
      { purpose: routine.category, level: routine.difficulty, durationMin: routine.durationMin, focus: [], notes: "" },
      routine,
      instruction
    ).catch((err: Error) => ({ sections: undefined, error: err.message }));
    return result.sections ?? `La IA no pudo aplicar el cambio: ${result.error}`;
  };

  const remove = async (workout: SavedWorkout) => {
    if (!(await confirmDialog(`¿Eliminar «${workout.name}»? El enlace que compartiste dejará de funcionar.`))) return;
    await request(`/api/admin/workouts/${workout.id}`, "DELETE");
    loadWorkouts();
  };

  if (view.step === "brief") {
    return (
      <div className="space-y-6">
        <button type="button" onClick={() => setView({ step: "list" })} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-primary cursor-pointer">
          <ArrowLeft size={14} aria-hidden /> Todas las rutinas
        </button>
        <h1 className="font-display text-5xl uppercase text-white leading-none">Nueva rutina</h1>
        <BriefForm busy={busy} onGenerate={(brief) => start(brief, true)} onBlank={(brief) => start(brief, false)} />
      </div>
    );
  }

  if (view.step === "edit") {
    return (
      <Editor
        initial={view.routine}
        notice={view.notice}
        library={library}
        gymEquipment={gymEquipment}
        onRefine={refine}
        onBack={() => setView({ step: "list" })}
        onSaved={(workout) => {
          setShared(workout);
          setView({ step: "list" });
          loadWorkouts();
        }}
      />
    );
  }

  const purposesInUse = PURPOSES.filter((p) => workouts?.some((w) => w.category === p.id));
  const visible = (workouts ?? []).filter((w) => !filter || w.category === filter);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl uppercase text-white leading-none">Rutinas</h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-xl">
            Elige el objetivo, la IA arma la sesión con fotos de cada ejercicio, y la envías por WhatsApp.
          </p>
        </div>
        <button type="button" onClick={() => setView({ step: "brief" })} className={primaryButton}>
          <Plus size={16} aria-hidden /> Nueva rutina
        </button>
      </div>

      {purposesInUse.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {[{ id: "", label: "Todas" }, ...purposesInUse].map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={filter === p.id}
              onClick={() => setFilter(p.id)}
              className={cn(
                "px-3 py-1.5 border text-xs font-bold cursor-pointer transition-colors duration-200",
                filter === p.id ? "bg-white text-dark border-white" : "border-white/15 text-zinc-300 hover:border-white/40"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {workouts === null ? (
        <p className="text-sm text-zinc-400 flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Cargando rutinas…</p>
      ) : workouts.length === 0 ? (
        <div className="border border-dashed border-white/15 p-10 text-center">
          <p className="font-display text-3xl uppercase text-white">Todavía no hay rutinas</p>
          <p className="text-sm text-zinc-400 mt-2 mb-6">La primera toma menos de un minuto.</p>
          <button type="button" onClick={() => setView({ step: "brief" })} className={primaryButton}>
            <Sparkles size={16} aria-hidden /> Crear la primera
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {visible.map((workout) => (
            <li key={workout.id} className="py-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex-1 min-w-[14rem]">
                <p className="text-lg font-bold text-white leading-snug">{workout.name}</p>
                <p className="text-sm text-zinc-400 mt-0.5">
                  {[
                    workout.category ? purposeLabel(workout.category) : null,
                    workout.difficulty,
                    workout.durationMin ? `${workout.durationMin} min` : null,
                    countLabel(workout.exercises.length),
                  ].filter(Boolean).join(" · ")}
                  {workout.isPublished && (
                    <span className="ml-2 px-2 py-0.5 bg-primary text-dark text-[11px] font-black uppercase tracking-wider">Publicada</span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${workout.name} — tu rutina de TrainoFit: ${studentLink(workout)}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(quietButton, "px-3")}
                >
                  <WhatsAppIcon className="size-4" /> Enviar
                </a>
                <button
                  type="button"
                  className={cn(quietButton, "px-3")}
                  onClick={async () => {
                    await navigator.clipboard.writeText(studentLink(workout)).catch(() => {});
                    setCopiedId(workout.id);
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                >
                  {copiedId === workout.id ? <Check size={14} aria-hidden /> : <Link2 size={14} aria-hidden />}
                  <span aria-live="polite">{copiedId === workout.id ? "Copiado" : "Copiar enlace"}</span>
                </button>
                <button type="button" onClick={() => setView({ step: "edit", routine: toRoutine(workout), notice: "" })} className={cn(quietButton, "px-3")}>
                  <Pencil size={14} aria-hidden /> Editar
                </button>
                <button type="button" onClick={() => remove(workout)} aria-label={`Eliminar ${workout.name}`} className={cn(iconButton, "size-[2.6rem] hover:text-red-400 hover:border-red-400/50")}>
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {shared && <ShareDialog workout={shared} onClose={() => setShared(null)} />}
    </div>
  );
}
