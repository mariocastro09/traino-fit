// Purposes a routine can be classified under, used by the admin editor, the
// routine generator and the public /rutinas pages. Shared by client and server.

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

// Blocks a session is organised in, by purpose. The generator follows them
// and the editor offers them when adding a section.
export const SECTIONS: Record<PurposeId, string[]> = {
  crossfit: ["Calentamiento", "Fuerza / Skill", "WOD", "Vuelta a la calma"],
  musculacion: ["Calentamiento", "Principal", "Accesorios", "Finalizador"],
  fuerza: ["Calentamiento", "Básicos", "Accesorios", "Vuelta a la calma"],
  atletismo: ["Calentamiento", "Técnica y potencia", "Fuerza", "Vuelta a la calma"],
  futbol: ["Calentamiento", "Potencia y agilidad", "Fuerza", "Prevención y core"],
  funcional: ["Calentamiento", "Circuito", "Finalizador"],
  movilidad: ["Activación", "Movilidad", "Estiramiento final"],
};

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}
