// Routine generator: turns a coach's brief (purpose, level, duration, focus)
// into a complete, structured session. The model chooses from a shortlist of
// library exercises sent by the admin editor, so every pick comes back with
// its id and can be shown with photos and steps.

import { PURPOSES, SECTIONS, type PurposeId } from '../app/lib/routines';

// Tried in order on the Hugging Face router; the first usable answer wins.
const HF_MODELS = ['openai/gpt-oss-120b', 'meta-llama/Llama-3.3-70B-Instruct', 'Qwen/Qwen2.5-72B-Instruct'];
const CF_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

const SYSTEM =
  'Eres el head coach de TrainoFit, un gimnasio y box de CrossFit en Puente Alto, Chile. ' +
  'Programas sesiones de entrenamiento seguras, efectivas y listas para ejecutar. ' +
  'Respondes SOLO con un objeto JSON válido, sin texto antes ni después.';

type Candidate = { id: string; name: string; target: string; equipment: string; kind: string };

export type GeneratedRoutine = {
  name: string;
  summary: string;
  article: string;
  sections: {
    name: string;
    exercises: {
      libraryId: string | null;
      name: string;
      sets: number;
      reps: string;
      restSeconds: number;
      intensityPct: number | null;
      note: string;
    }[];
  }[];
};

const text = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);
const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

export function buildPrompt(body: any, inventory: string[]) {
  const purpose = PURPOSES.find((p) => p.id === body.purpose) ?? PURPOSES[0];
  const duration = clamp(body.durationMin, 10, 180, 60);
  const focus = Array.isArray(body.focus) && body.focus.length ? body.focus.map((f: unknown) => text(f, 30)).join(', ') : 'cuerpo completo';
  const candidates: Candidate[] = Array.isArray(body.candidates) ? body.candidates.slice(0, 200) : [];
  const total = Math.max(4, Math.round(duration / 5.5));

  const lines = [
    '## SESIÓN',
    `- Propósito: ${purpose.label} (${purpose.blurb})`,
    `- Nivel: ${text(body.level, 20) || 'Intermedio'}`,
    `- Duración total: ${duration} minutos`,
    `- Enfoque: ${focus}`,
    body.notes ? `- Indicaciones del coach (OBLIGATORIAS, incluye lesiones y restricciones): ${text(body.notes, 600)}` : '',
    '',
    '## EQUIPO DEL GIMNASIO',
    inventory.length
      ? `${inventory.join('; ')}.\nUsa solo ejercicios realizables con este equipo o con peso corporal.`
      : 'Sin inventario registrado: asume un gimnasio completo con barras, mancuernas, kettlebells, poleas y máquinas.',
    '',
    '## CANDIDATOS (id | nombre | músculo | equipo | tipo)',
    ...candidates.map((c) => `${text(c.id, 80)} | ${text(c.name, 80)} | ${text(c.target, 30)} | ${text(c.equipment, 30)} | ${text(c.kind, 20)}`),
    '',
    '## REGLAS',
    `1. Secciones, en este orden: ${SECTIONS[purpose.id as PurposeId].join(' → ')}. Omite una sección solo si no aplica.`,
    `2. Entre ${total - 1} y ${total + 2} ejercicios en total, para que la sesión dure ${duration} minutos contando descansos.`,
    '3. Elige los ejercicios de CANDIDATOS y copia su id exacto. Solo si un movimiento imprescindible no está en la lista (por ejemplo burpees, trote o remo en máquina) agrégalo con "id": null.',
    '4. "nombre": el ejercicio en español, como se dice en un gimnasio chileno ("Sentadilla trasera con barra"). Mantén en inglés los términos habituales (thruster, burpee, clean, snatch, hip thrust).',
    '5. Orden: calentamiento específico para lo que viene; después lo más técnico y multiarticular; accesorios al final. Equilibra empuje y tirón, no repitas ejercicios ni cargues el mismo músculo en ejercicios consecutivos salvo que el enfoque lo pida.',
    '6. Prescripción según el objetivo:',
    '   - Fuerza máxima: 4-6 series de 2-5 reps, 80-92 % RM, 150-240 s de descanso.',
    '   - Hipertrofia / musculación: 3-4 series de 8-12 reps, 65-80 % RM, 60-90 s.',
    '   - Potencia y pliometría: 3-5 series de 3-6 reps explosivas, 90-120 s, sin llegar a la fatiga.',
    '   - Metabólico / CrossFit: un solo bloque con "sets": 1 y el formato en "reps" ("AMRAP 12 min", "21-15-9", "EMOM 10 min", "5 rondas por tiempo"); cada movimiento del WOD lleva sus repeticiones en "reps".',
    '   - Calentamiento y movilidad: 1-2 series de 10-15 reps o 30-45 s, descanso 15-30 s, "pct": null.',
    '7. "pct" (porcentaje de 1RM) solo en ejercicios con barra o carga medible; en el resto null.',
    '8. Principiante: movimientos simples y estables, menos volumen, más descanso, nada de halterofilia compleja. Avanzado: más intensidad y movimientos técnicos.',
    '9. "nota": una frase con la clave técnica y otra con la seguridad o cómo escalarlo. Máximo 220 caracteres.',
    '10. "name": título concreto y con gancho, máximo 60 caracteres, sin la palabra "rutina". "summary": 1-2 frases dirigidas a quien la va a hacer, máximo 200 caracteres.',
    '11. "article": 2 o 3 párrafos cortos (objetivo de la sesión, cómo ejecutarla y escalarla, cómo progresar), separados por una línea en blanco. Texto plano; "## " solo para subtítulos.',
    '',
  ];

  if (body.current && body.instruction) {
    lines.push(
      '## RUTINA ACTUAL',
      JSON.stringify(body.current).slice(0, 6000),
      '',
      '## CAMBIO PEDIDO POR EL COACH',
      text(body.instruction, 600),
      'Devuelve la rutina completa ya corregida, cambiando solo lo necesario para cumplir el pedido.',
      ''
    );
  }

  lines.push(
    '## FORMATO DE RESPUESTA (JSON exacto)',
    '{"name":"","summary":"","sections":[{"name":"Calentamiento","exercises":[{"id":"id del candidato o null","nombre":"","sets":3,"reps":"10","rest":60,"pct":null,"nota":""}]}],"article":""}'
  );
  return lines.filter((line) => line !== '').join('\n');
}

/** Parses and sanitises a model answer; null when it is not a usable routine. */
export function normalizeRoutine(answer: string, candidateIds: Set<string>): GeneratedRoutine | null {
  let raw: any;
  try {
    raw = JSON.parse(answer.slice(answer.indexOf('{'), answer.lastIndexOf('}') + 1));
  } catch {
    return null;
  }
  if (!Array.isArray(raw?.sections)) return null;

  const sections = raw.sections
    .map((section: any) => ({
      name: text(section?.name, 60) || 'Principal',
      exercises: (Array.isArray(section?.exercises) ? section.exercises : [])
        .map((exercise: any) => ({
          libraryId: candidateIds.has(exercise?.id) ? (exercise.id as string) : null,
          name: text(exercise?.nombre ?? exercise?.name, 120),
          sets: clamp(exercise?.sets, 1, 12, 3),
          reps: text(exercise?.reps, 40) || '10',
          restSeconds: clamp(exercise?.rest, 0, 600, 60),
          intensityPct: exercise?.pct == null ? null : clamp(exercise.pct, 20, 100, 70),
          note: text(exercise?.nota ?? exercise?.note, 400),
        }))
        .filter((exercise: { name: string }) => exercise.name),
    }))
    .filter((section: { exercises: unknown[] }) => section.exercises.length > 0);

  if (sections.length === 0) return null;
  return {
    name: text(raw.name, 80),
    summary: text(raw.summary, 300),
    article: text(raw.article, 6000),
    sections,
  };
}

async function askHuggingFace(token: string, model: string, prompt: string) {
  const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: prompt },
      ],
      max_tokens: 6000,
      temperature: 0.6,
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`${model}: HTTP ${response.status} ${(await response.text()).slice(0, 200)}`);
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? '';
}

/**
 * Generates a routine. Returns the reason for each failed attempt when no
 * model produced a usable answer, so the admin can see what to fix.
 */
export async function generateRoutine(
  env: { HF_TOKEN?: string; HUGGINGFACE_TOKEN?: string; AI?: any },
  storedToken: string | undefined,
  inventory: string[],
  body: any
): Promise<{ routine: GeneratedRoutine; source: string } | { error: string }> {
  const prompt = buildPrompt(body, inventory);
  const ids = new Set<string>((Array.isArray(body.candidates) ? body.candidates : []).map((c: Candidate) => c.id));
  const failures: string[] = [];

  const token = env.HF_TOKEN || env.HUGGINGFACE_TOKEN || storedToken;
  if (!token) failures.push('Falta el token de Hugging Face (Configuración → HF_TOKEN)');
  for (const model of token ? HF_MODELS : []) {
    try {
      const routine = normalizeRoutine(await askHuggingFace(token!, model, prompt), ids);
      if (routine) return { routine, source: model };
      failures.push(`${model}: respuesta sin rutina válida`);
    } catch (error) {
      // A rejected token fails the same way on every model
      if (/HTTP 40[13]/.test((error as Error).message)) {
        failures.push('Hugging Face rechazó el token: revísalo en Configuración → HF_TOKEN');
        break;
      }
      failures.push((error as Error).message);
    }
  }

  if (env.AI) {
    try {
      // The binding has no timeout of its own and can hang when the service is unreachable
      const result = await Promise.race([
        env.AI.run(CF_MODEL, {
          messages: [
            { role: 'system', content: SYSTEM },
            { role: 'user', content: prompt },
          ],
          max_tokens: 4000,
          temperature: 0.6,
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('sin respuesta en 40 s')), 40000)),
      ]);
      const answer = typeof result?.response === 'string' ? result.response : JSON.stringify(result?.response ?? '');
      const routine = normalizeRoutine(answer, ids);
      if (routine) return { routine, source: CF_MODEL };
      failures.push('Workers AI: respuesta sin rutina válida');
    } catch (error) {
      failures.push(`Workers AI: ${(error as Error).message}`);
    }
  }

  console.error('Routine generation failed:', failures);
  return { error: failures.join(' · ') };
}
