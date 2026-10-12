// The exercise library (public/data/ejercicios.json, built by
// scripts/build-exercise-library.py): search, demonstration photos, and the
// shortlist of candidates the routine generator chooses from.

import type { PurposeId } from "./routines";

export type LibraryExercise = {
  id: string;
  name: string;
  es: string; // Spanish search keywords
  category: string; // body area
  equipment: string;
  target: string;
  level: string;
  kind: "fuerza" | "movilidad" | "pliometria" | "halterofilia" | "cardio";
  compound: boolean;
  img: string; // photo folder, empty when there are no photos
  steps: string[]; // Spanish, may be empty
};

export const AREAS = ["Piernas", "Pecho", "Espalda", "Hombros", "Brazos", "Core", "Cardio"] as const;

// ponytail: photos are hotlinked from jsDelivr, pinned to one commit of the
// public-domain free-exercise-db. Copy them to R2 if that CDN ever becomes a problem.
const PHOTOS =
  "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises";

/** Start (0) or end (1) position photo of an exercise. */
export const photoUrl = (img: string, frame: 0 | 1) => `${PHOTOS}/${img}/${frame}.jpg`;

let cache: Promise<LibraryExercise[]> | undefined;
export function loadLibrary() {
  cache ??= fetch("/data/ejercicios.json").then((res) => {
    if (!res.ok) throw new Error("No se pudo cargar la biblioteca");
    return res.json() as Promise<LibraryExercise[]>;
  });
  cache.catch(() => (cache = undefined));
  return cache;
}

/** Lowercase without accents, so "extensión" matches "extension". */
export const fold = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Every word of the query must appear in the name, Spanish keywords, muscle or equipment. */
export function searchLibrary(
  library: LibraryExercise[],
  query: string,
  filter: { area?: string; equipment?: string[] } = {}
) {
  const words = fold(query).split(/\s+/).filter(Boolean);
  return library
    .filter((exercise) => {
      if (filter.area && exercise.category !== filter.area) return false;
      if (filter.equipment && !filter.equipment.includes(exercise.equipment)) return false;
      const haystack = fold(`${exercise.name} ${exercise.es} ${exercise.target} ${exercise.equipment}`);
      return words.every((word) => haystack.includes(word));
    })
    // Exercises with a photo demonstration first
    .sort((a, b) => Number(!!b.img) - Number(!!a.img));
}

// Which library equipment types the gym's inventory (free-text names) covers.
const EQUIPMENT_HINTS: Record<string, RegExp> = {
  Barra: /barra|disco|rack|olimpic/,
  Mancuernas: /mancuerna/,
  Kettlebell: /kettlebell|pesa rusa/,
  Polea: /polea|cable|cruce/,
  Máquina: /maquina|hack|prensa|extension|curl femoral|smith|multipower|remo|bici|trotadora|eliptic/,
  "Banda elástica": /banda|elastic|liga/,
  "Balón medicinal": /balon|wall ball|slam/,
  Fitball: /fitball|pelota/,
  "Foam roller": /roller|rodillo/,
};

/** Library equipment types available in the gym. No inventory means no restriction. */
export function availableEquipment(inventory: string[]) {
  const all = ["Peso corporal", "Otro", ...Object.keys(EQUIPMENT_HINTS)];
  if (inventory.length === 0) return all;
  const names = fold(inventory.join(" | "));
  return all.filter((type) => !EQUIPMENT_HINTS[type] || EQUIPMENT_HINTS[type].test(names));
}

// How well each kind of exercise fits a purpose (0 = leave out).
const FIT: Record<PurposeId, Record<LibraryExercise["kind"], number>> = {
  crossfit: { halterofilia: 4, pliometria: 3, cardio: 3, fuerza: 2, movilidad: 1 },
  musculacion: { fuerza: 4, movilidad: 1, cardio: 0, pliometria: 0, halterofilia: 0 },
  fuerza: { fuerza: 4, halterofilia: 2, movilidad: 1, pliometria: 0, cardio: 0 },
  atletismo: { pliometria: 4, cardio: 3, fuerza: 2, movilidad: 2, halterofilia: 1 },
  futbol: { pliometria: 4, fuerza: 2, cardio: 3, movilidad: 2, halterofilia: 0 },
  funcional: { fuerza: 2, pliometria: 3, cardio: 3, movilidad: 2, halterofilia: 0 },
  movilidad: { movilidad: 4, fuerza: 0, cardio: 0, pliometria: 0, halterofilia: 0 },
};

export type Brief = {
  purpose: PurposeId;
  level: string;
  durationMin: number;
  focus: string[]; // body areas; empty = whole body
};

/**
 * The candidates offered to the generator: exercises that fit the purpose,
 * the level, the chosen body areas and the gym's equipment, best first, with a
 * cap per muscle so the list stays varied.
 */
export function shortlist(library: LibraryExercise[], brief: Brief, equipment: string[], limit = 140) {
  const fit = FIT[brief.purpose];
  const beginner = brief.level === "Principiante";
  const scored = library
    .flatMap((exercise) => {
      if (!fit[exercise.kind] || !equipment.includes(exercise.equipment)) return [];
      if (beginner && (exercise.level === "Avanzado" || exercise.kind === "halterofilia")) return [];
      const inFocus = brief.focus.length === 0 || brief.focus.includes(exercise.category);
      // Warm-up and core work are always useful, whatever the focus
      if (!inFocus && exercise.kind !== "movilidad" && exercise.category !== "Core") return [];
      let score = inFocus ? fit[exercise.kind] * 2 : 2;
      if (exercise.img) score += 3;
      if (exercise.compound) score += 1;
      if (exercise.steps.length) score += 0.5;
      if (exercise.equipment === "Otro") score -= 2;
      if (brief.purpose === "fuerza" && exercise.equipment === "Barra") score += 2;
      return [{ exercise, score, extra: !inFocus }];
    })
    // Ties go to the shorter name, which is usually the basic version of a lift
    .sort((a, b) => b.score - a.score || a.exercise.name.length - b.exercise.name.length);

  // Caps keep the list varied: by muscle, by equipment within a muscle, and for out-of-focus extras
  const counts = new Map<string, number>();
  const take = (key: string, max: number) => {
    const count = counts.get(key) ?? 0;
    if (count >= max) return false;
    counts.set(key, count + 1);
    return true;
  };
  // Warm-up material is ranked low for most purposes, so a few places are reserved for it
  const warmUp = brief.purpose === "movilidad" ? [] : scored.filter((entry) => entry.exercise.kind === "movilidad").slice(0, 16);
  const picked: LibraryExercise[] = warmUp.map((entry) => entry.exercise);
  for (const { exercise, extra } of scored) {
    if (picked.includes(exercise)) continue;
    const muscle = `${exercise.kind}/${exercise.target}`;
    if ((counts.get(muscle) ?? 0) >= 9 || (counts.get(`${muscle}/${exercise.equipment}`) ?? 0) >= 3) continue;
    if (extra && !take("extra", 30)) continue;
    take(muscle, 9);
    take(`${muscle}/${exercise.equipment}`, 3);
    picked.push(exercise);
    if (picked.length === limit) break;
  }
  return picked;
}

export type DraftExercise = {
  libraryId?: string;
  name: string;
  image: string;
  sets: number;
  reps: string;
  restSeconds: number;
  intensityPct?: number | null;
  note: string;
};
export type DraftSection = { name: string; exercises: DraftExercise[] };

/** Spanish steps as numbered lines, after the coach's cue. */
export const describe = (note: string, steps: string[]) =>
  [note.trim(), ...steps.map((step, i) => `${i + 1}. ${step}`)].filter(Boolean).join("\n");

const PRESCRIPTION: Record<PurposeId, [sets: number, reps: string, rest: number]> = {
  crossfit: [4, "10", 60],
  musculacion: [4, "10-12", 75],
  fuerza: [5, "5", 150],
  atletismo: [4, "8", 90],
  futbol: [3, "10", 60],
  funcional: [3, "12", 45],
  movilidad: [2, "30 s", 15],
};

/**
 * A routine built without the AI, used when it is unavailable: warm-up from
 * mobility work, a main block sized to the duration, and a core finisher.
 * ponytail: takes the best-ranked candidates; the AI is what programs properly.
 */
export function localDraft(candidates: LibraryExercise[], brief: Brief): DraftSection[] {
  const [sets, reps, rest] = PRESCRIPTION[brief.purpose];
  const row = (exercise: LibraryExercise, s = sets, r = reps, t = rest): DraftExercise => ({
    libraryId: exercise.id,
    name: exercise.name,
    image: exercise.img,
    sets: s,
    reps: r,
    restSeconds: t,
    note: "",
  });
  const mobility = candidates.filter((e) => e.kind === "movilidad");
  const core = candidates.filter((e) => e.kind !== "movilidad" && e.category === "Core");
  const work = candidates.filter((e) => e.kind !== "movilidad" && e.category !== "Core");
  // One exercise per muscle first, so the main block is not five variations of one lift
  const seen = new Set<string>();
  const varied = [...work.filter((e) => !seen.has(e.target) && seen.add(e.target)), ...work];
  const mainCount = Math.max(3, Math.round(brief.durationMin / 9));

  if (brief.purpose === "movilidad") {
    return [{ name: "Movilidad", exercises: mobility.slice(0, mainCount + 3).map((e) => row(e)) }];
  }
  return [
    { name: "Calentamiento", exercises: mobility.slice(0, 2).map((e) => row(e, 2, "30 s", 15)) },
    { name: "Principal", exercises: [...new Set(varied)].slice(0, mainCount).map((e) => row(e)) },
    { name: "Finalizador", exercises: core.slice(0, 2).map((e) => row(e, 3, "15", 30)) },
  ].filter((section) => section.exercises.length > 0);
}
