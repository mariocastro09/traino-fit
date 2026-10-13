// Self-check for the routine generator's pure logic.
// Run: npx vite-node scripts/check-routine-generator.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { availableEquipment, localDraft, searchLibrary, shortlist, type LibraryExercise } from "../app/lib/exercise-library";
import { buildPrompt, normalizeRoutine } from "../server/routine-generator";

const library: LibraryExercise[] = JSON.parse(readFileSync("public/data/ejercicios.json", "utf8"));

// Search is in Spanish, accent-insensitive, photos first
const squats = searchLibrary(library, "sentadílla barra");
assert.ok(squats.length > 10 && squats[0].img, "Spanish search finds squats, photos first");
assert.ok(squats.every((e) => /squat/i.test(e.name)));

// Equipment: an inventory limits the types, no inventory allows everything
const gym = availableEquipment(["Barra 20 kg", "Mancuernas", "Hack Squat"]);
assert.ok(gym.includes("Barra") && gym.includes("Peso corporal") && !gym.includes("Kettlebell"));
assert.ok(availableEquipment([]).includes("Kettlebell"));

// Shortlist respects equipment, level and focus
const brief = { purpose: "fuerza" as const, level: "Principiante", durationMin: 45, focus: ["Piernas"] };
const candidates = shortlist(library, brief, gym);
assert.ok(candidates.length >= 30 && candidates.length <= 140, `shortlist size ${candidates.length}`);
assert.ok(candidates.every((e) => gym.includes(e.equipment) && e.level !== "Avanzado"));
assert.ok(candidates.every((e) => e.category === "Piernas" || e.category === "Core" || e.kind === "movilidad"));
for (const purpose of ["crossfit", "musculacion", "atletismo", "futbol", "funcional", "movilidad"] as const) {
  const list = shortlist(library, { ...brief, purpose, focus: [] }, availableEquipment([]));
  assert.ok(list.length >= 30, `${purpose}: ${list.length} candidates`);
  assert.ok(localDraft(list, { ...brief, purpose }).flatMap((s) => s.exercises).length >= 4, `${purpose}: local draft`);
}

// Model answers: prose around the JSON is tolerated, unknown ids are dropped, numbers are clamped
const ids = new Set(candidates.map((e) => e.id));
const answer = `Aquí va:\n\`\`\`json\n${JSON.stringify({
  name: "Piernas de acero",
  summary: "Fuerza de tren inferior.",
  article: "Párrafo.",
  sections: [
    { name: "Básicos", exercises: [
      { id: candidates[0].id, nombre: "Sentadilla", sets: 99, reps: 5, rest: "120", pct: 80, nota: "Pecho arriba." },
      { id: "inventado", nombre: "Burpees", sets: 3, reps: "10", rest: 30, pct: null, nota: "" },
      { id: null, nombre: "", sets: 3, reps: "10" },
    ] },
    { name: "Vacía", exercises: [] },
  ],
})}\n\`\`\``;
const routine = normalizeRoutine(answer, ids)!;
assert.equal(routine.sections.length, 1);
assert.deepEqual(routine.sections[0].exercises.map((e) => [e.libraryId, e.sets, e.reps, e.restSeconds]), [
  [candidates[0].id, 12, "5", 120],
  [null, 3, "10", 30],
]);
// Real line breaks inside a string (models write the article that way) are repaired
const multiline = normalizeRoutine('{"article":"Uno.\n\nDos \\"bien\\".",\n"sections":[{"name":"A","exercises":[{"nombre":"Burpees"}]}]}', ids)!;
assert.equal(multiline.article, 'Uno.\n\nDos "bien".');
assert.equal(normalizeRoutine("no puedo ayudarte", ids), null);
assert.equal(normalizeRoutine('{"sections":[]}', ids), null);

// The prompt carries the brief, the inventory and the coach's restrictions
const prompt = buildPrompt({ ...brief, notes: "sin saltos", candidates: candidates.slice(0, 3) }, ["Barra 20 kg (x12)"]);
assert.ok(prompt.includes("Fuerza") && prompt.includes("sin saltos") && prompt.includes("Barra 20 kg") && prompt.includes(candidates[0].id));

console.log("ok");
