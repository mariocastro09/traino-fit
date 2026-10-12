// Purposes a routine can be classified under, and a starter catalog of
// exercises for each, used by the admin editor's quick-add and by the
// public /rutinas pages. Shared by client and server.

export const PURPOSES = [
  { id: "crossfit", label: "CrossFit", blurb: "WODs, metcons y trabajo de alta intensidad" },
  { id: "musculacion", label: "Musculación", blurb: "Hipertrofia y volumen por grupo muscular" },
  { id: "fuerza", label: "Fuerza", blurb: "Básicos pesados y progresión de cargas" },
  { id: "atletismo", label: "Atletismo", blurb: "Velocidad, resistencia y técnica de carrera" },
  { id: "futbol", label: "Fútbol", blurb: "Potencia, cambios de dirección y prevención" },
  { id: "funcional", label: "Funcional", blurb: "Acondicionamiento general con peso corporal" },
  { id: "movilidad", label: "Movilidad", blurb: "Rango de movimiento, core y recuperación" },
] as const;

export type PurposeId = (typeof PURPOSES)[number]["id"];

export const LEVELS = ["Principiante", "Intermedio", "Avanzado"] as const;

export const purposeLabel = (id: string | null | undefined) =>
  PURPOSES.find((p) => p.id === id)?.label ?? "General";

export type CatalogExercise = {
  section: string;
  name: string;
  sets: number;
  reps: string;
  rest: number;
  note?: string;
};

const ex = (
  section: string,
  name: string,
  sets: number,
  reps: string,
  rest: number,
  note?: string
): CatalogExercise => ({ section, name, sets, reps, rest, note });

// Sensible starting prescriptions; the coach edits them after adding.
export const EXERCISE_CATALOG: Record<PurposeId, CatalogExercise[]> = {
  crossfit: [
    ex("Calentamiento", "Remo o Air Bike", 1, "5 min", 0, "Ritmo suave, subir pulsaciones"),
    ex("Calentamiento", "Movilidad de hombros y cadera", 2, "10", 30),
    ex("Fuerza", "Back Squat", 5, "5", 120, "Carga progresiva"),
    ex("Fuerza", "Clean & Jerk", 5, "3", 120, "Técnica antes que carga"),
    ex("Fuerza", "Snatch", 5, "2", 120),
    ex("WOD", "Thrusters", 3, "15", 60),
    ex("WOD", "Pull-ups", 3, "12", 60, "Escalar con banda si es necesario"),
    ex("WOD", "Burpees", 3, "15", 60),
    ex("WOD", "Box Jumps", 3, "12", 60),
    ex("WOD", "Kettlebell Swings", 3, "20", 60),
    ex("WOD", "Wall Balls", 3, "20", 60),
    ex("WOD", "Double Unders", 3, "40", 45, "O 80 saltos simples"),
    ex("WOD", "Toes to Bar", 3, "10", 60),
  ],
  musculacion: [
    ex("Calentamiento", "Cardio suave", 1, "5 min", 0),
    ex("Pecho", "Press de banca", 4, "8-10", 90),
    ex("Pecho", "Press inclinado con mancuernas", 3, "10-12", 75),
    ex("Espalda", "Remo con barra", 4, "8-10", 90),
    ex("Espalda", "Jalón al pecho", 3, "10-12", 75),
    ex("Piernas", "Sentadilla", 4, "8-10", 120),
    ex("Piernas", "Prensa de piernas", 3, "12", 90),
    ex("Piernas", "Peso muerto rumano", 3, "10", 90),
    ex("Hombros", "Press militar", 4, "8-10", 90),
    ex("Hombros", "Elevaciones laterales", 3, "12-15", 60),
    ex("Brazos", "Curl de bíceps", 3, "12", 60),
    ex("Brazos", "Extensión de tríceps en polea", 3, "12", 60),
    ex("Core", "Plancha", 3, "45 s", 45),
  ],
  fuerza: [
    ex("Calentamiento", "Movilidad general y series de aproximación", 2, "8", 60),
    ex("Principal", "Sentadilla", 5, "5", 180, "80-85% del máximo"),
    ex("Principal", "Press de banca", 5, "5", 180),
    ex("Principal", "Peso muerto", 3, "5", 180, "Espalda neutra en todo el recorrido"),
    ex("Principal", "Press militar", 5, "5", 150),
    ex("Accesorios", "Dominadas lastradas", 4, "6", 120),
    ex("Accesorios", "Hip Thrust", 4, "8", 90),
    ex("Accesorios", "Remo con barra", 4, "8", 90),
    ex("Accesorios", "Farmer Carry", 4, "30 m", 90),
    ex("Core", "Rueda abdominal", 3, "10", 60),
  ],
  atletismo: [
    ex("Calentamiento", "Trote suave", 1, "8 min", 0),
    ex("Calentamiento", "Técnica de carrera (skipping, talones)", 3, "20 m", 30),
    ex("Velocidad", "Sprints", 6, "30 m", 120, "Recuperación completa"),
    ex("Velocidad", "Salidas desde parado", 5, "10 m", 90),
    ex("Resistencia", "Series de 400 m", 6, "400 m", 90, "Ritmo constante en todas"),
    ex("Resistencia", "Fartlek", 1, "15 min", 0, "1 min fuerte, 1 min suave"),
    ex("Potencia", "Saltos al cajón", 4, "6", 90),
    ex("Potencia", "Multisaltos", 4, "10", 90),
    ex("Fuerza", "Zancadas caminando", 3, "12 por pierna", 75),
    ex("Fuerza", "Elevación de talones", 3, "15", 45),
    ex("Vuelta a la calma", "Estiramientos de cadera e isquios", 2, "30 s", 15),
  ],
  futbol: [
    ex("Calentamiento", "Trote con cambios de ritmo", 1, "6 min", 0),
    ex("Calentamiento", "Movilidad dinámica de cadera y tobillo", 2, "10", 30),
    ex("Agilidad", "Escalera de coordinación", 4, "2 pasadas", 45),
    ex("Agilidad", "Cambios de dirección (conos en T)", 5, "1", 60, "Máxima velocidad, buena frenada"),
    ex("Velocidad", "Sprints de 20 m", 6, "20 m", 75),
    ex("Potencia", "Saltos unilaterales", 3, "8 por pierna", 60),
    ex("Potencia", "Sentadilla con salto", 4, "8", 75),
    ex("Fuerza", "Sentadilla búlgara", 3, "10 por pierna", 75),
    ex("Fuerza", "Peso muerto a una pierna", 3, "10 por pierna", 75),
    ex("Prevención", "Curl nórdico", 3, "6", 90, "Bajada controlada, protege isquiotibiales"),
    ex("Prevención", "Aductores Copenhagen", 3, "20 s por lado", 45),
    ex("Core", "Plancha lateral", 3, "30 s por lado", 30),
  ],
  funcional: [
    ex("Calentamiento", "Jumping Jacks", 2, "30", 30),
    ex("Circuito", "Sentadillas al aire", 4, "20", 45),
    ex("Circuito", "Flexiones de brazos", 4, "12", 45, "Apoyar rodillas para escalar"),
    ex("Circuito", "Zancadas alternadas", 4, "16", 45),
    ex("Circuito", "Remo invertido o con banda", 4, "12", 45),
    ex("Circuito", "Mountain Climbers", 4, "30", 45),
    ex("Circuito", "Burpees", 4, "10", 60),
    ex("Circuito", "Battle Ropes", 4, "30 s", 45),
    ex("Core", "Plancha", 3, "40 s", 30),
    ex("Core", "Elevaciones de piernas", 3, "12", 30),
  ],
  movilidad: [
    ex("Movilidad", "Gato-camello", 2, "10", 15),
    ex("Movilidad", "World's Greatest Stretch", 2, "5 por lado", 15),
    ex("Movilidad", "Rotaciones torácicas", 2, "10 por lado", 15),
    ex("Movilidad", "Sentadilla profunda sostenida", 3, "30 s", 20),
    ex("Movilidad", "90/90 de cadera", 2, "8 por lado", 15),
    ex("Movilidad", "Dislocaciones de hombro con banda", 2, "12", 15),
    ex("Core", "Dead Bug", 3, "10 por lado", 30),
    ex("Core", "Bird Dog", 3, "10 por lado", 30),
    ex("Estiramiento", "Isquiotibiales", 2, "40 s por lado", 10),
    ex("Estiramiento", "Flexores de cadera", 2, "40 s por lado", 10),
  ],
};

// URL-safe version of a routine name: "Fuerza de Squat + Metcon" → "fuerza-de-squat-metcon"
export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}
