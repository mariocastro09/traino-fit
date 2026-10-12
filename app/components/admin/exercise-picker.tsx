import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { EXERCISE_CATALOG, purposeLabel, type PurposeId } from "~/lib/routines";
import { cn } from "~/lib/utils";

// One exercise row as the workout editor stores it
export type PickedExercise = {
  routineName: string;
  exerciseName: string;
  description?: string;
  sets: number;
  reps: string;
  restSeconds?: number;
};

type LibraryExercise = {
  id: string;
  name: string;
  category: string;
  equipment: string;
  target: string;
  steps: string[];
};

const RESULT_LIMIT = 40;

// Two quick ways to add exercises to a workout: a short list suggested for the
// routine's purpose, and the full searchable library (public/data/ejercicios.json).
export function ExercisePicker({
  purpose,
  defaultSection,
  onAdd,
}: {
  purpose: PurposeId | "";
  defaultSection: string;
  onAdd: (exercise: PickedExercise) => void;
}) {
  const [tab, setTab] = useState<"suggested" | "library">("suggested");
  const [library, setLibrary] = useState<LibraryExercise[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [equipment, setEquipment] = useState("");

  // The library is ~100 KB compressed, so it is only fetched when first opened.
  useEffect(() => {
    if (tab !== "library" || library) return;
    fetch("/data/ejercicios.json")
      .then((res) => res.json() as Promise<LibraryExercise[]>)
      .then(setLibrary)
      .catch(() => setFailed(true));
  }, [tab, library]);

  const options = (field: "category" | "equipment") =>
    [...new Set((library ?? []).map((item) => item[field]))].sort();

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (library ?? []).filter((item) => {
    if (category && item.category !== category) return false;
    if (equipment && item.equipment !== equipment) return false;
    const haystack = `${item.name} ${item.target} ${item.category} ${item.equipment}`.toLowerCase();
    return words.every((word) => haystack.includes(word));
  });

  const selectClass =
    "bg-zinc-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-primary";

  return (
    <div className="p-3 bg-zinc-900/50 rounded-xl border border-white/5 space-y-3">
      <div className="flex gap-1" role="group" aria-label="Origen de los ejercicios">
        {(
          [
            ["suggested", purpose ? `Sugeridos: ${purposeLabel(purpose)}` : "Sugeridos"],
            ["library", "Biblioteca (1.324 ejercicios)"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors duration-200",
              tab === id ? "bg-primary text-dark" : "text-light/60 hover:text-white"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "suggested" &&
        (purpose ? (
          <div className="flex flex-wrap gap-1.5">
            {EXERCISE_CATALOG[purpose].map((item) => (
              <button
                key={item.section + item.name}
                type="button"
                title={`${item.section} · ${item.sets}×${item.reps}`}
                onClick={() =>
                  onAdd({
                    routineName: item.section,
                    exerciseName: item.name,
                    description: item.note,
                    sets: item.sets,
                    reps: item.reps,
                    restSeconds: item.rest || undefined,
                  })
                }
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-xs text-white hover:border-primary hover:text-primary transition-colors duration-200"
              >
                <Plus size={11} aria-hidden />
                {item.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-light/50">
            Elige un propósito arriba para ver ejercicios sugeridos, o busca en la biblioteca.
          </p>
        ))}

      {tab === "library" && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <label className="relative flex-1 min-w-[180px]">
              <span className="sr-only">Buscar ejercicio</span>
              <Search className="absolute left-2.5 top-2 text-zinc-500" size={12} aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar: squat, bíceps, kettlebell…"
                className="w-full bg-zinc-950 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-primary"
              />
            </label>
            <select aria-label="Zona del cuerpo" value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
              <option value="">Todo el cuerpo</option>
              {options("category").map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <select aria-label="Equipamiento" value={equipment} onChange={(e) => setEquipment(e.target.value)} className={selectClass}>
              <option value="">Cualquier equipo</option>
              {options("equipment").map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>

          {failed ? (
            <p role="alert" className="text-xs text-red-400">
              No se pudo cargar la biblioteca. Revisa tu conexión y vuelve a abrir esta pestaña.
            </p>
          ) : !library ? (
            <p className="text-xs text-light/50">Cargando biblioteca…</p>
          ) : (
            <>
              <p className="text-[10px] text-light/40">
                {matches.length} resultado(s)
                {matches.length > RESULT_LIMIT && ` · mostrando ${RESULT_LIMIT}, afina la búsqueda para ver otros`}
              </p>
              <ul className="max-h-52 overflow-y-auto bg-zinc-950 border border-white/5 rounded-lg divide-y divide-white/5">
                {matches.slice(0, RESULT_LIMIT).map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-2.5 py-1.5">
                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-white truncate">{item.name}</span>
                      <span className="block text-[10px] text-light/50 truncate">
                        {item.target} · {item.equipment}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onAdd({
                          routineName: defaultSection,
                          exerciseName: item.name,
                          description: item.steps.join(" "),
                          sets: 3,
                          reps: "10",
                          restSeconds: 60,
                        })
                      }
                      className="shrink-0 px-2 py-1 rounded bg-primary text-dark font-bold text-[10px]"
                    >
                      Añadir
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
