// Routine generator: turns a coach's brief (purpose, level, duration, focus)
// into a complete, structured session. The model chooses from a shortlist of
// library exercises sent by the admin editor, so every pick comes back with
// its id and can be shown with photos and steps.

import { PURPOSES, SECTIONS, type PurposeId } from '../app/lib/routines';

// Chat-completions providers, tried in order; within one, the first usable answer wins.
// Gemini comes first: its free tier is generous and it follows the JSON format reliably.
const PROVIDERS = [
  {
    key: 'gemini',
    label: 'Gemini',
    setting: 'GEMINI_API_KEY',
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    models: ['gemini-flash-latest', 'gemini-2.5-flash'],
    // Low reasoning effort keeps the answer from being cut short by thinking tokens
    extra: { response_format: { type: 'json_object' }, reasoning_effort: 'low', max_tokens: 12000 },
  },
  {
    key: 'hf',
    label: 'Hugging Face',
    setting: 'HF_TOKEN',
    url: 'https://router.huggingface.co/v1/chat/completions',
    models: ['openai/gpt-oss-120b', 'meta-llama/Llama-3.3-70B-Instruct'],
    extra: { max_tokens: 6000 },
  },
] as const;

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
    raw = JSON.parse(
      answer
        .slice(answer.indexOf('{'), answer.lastIndexOf('}') + 1)
        // Models often put real line breaks inside strings (the article), which JSON forbids
        .replace(/"(?:[^"\\]|\\.)*"/g, (str) => str.replace(/\r?\n/g, '\\n').replace(/\t/g, ' '))
    );
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

type Provider = (typeof PROVIDERS)[number];

async function ask(provider: Provider, token: string, model: string, prompt: string) {
  const response = await fetch(provider.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      ...provider.extra,
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${(await response.text()).replace(/\s+/g, ' ').slice(0, 200)}`);
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? '';
}

// How an unusable answer ended, so a cut-off or off-format reply can be told apart
const tail = (answer: string) => `respuesta sin rutina válida (termina en "${answer.trim().slice(-60)}")`;

/**
 * Generates a routine. Returns the reason for each failed attempt when no
 * model produced a usable answer, so the admin can see what to fix.
 * `keys` are the API keys saved in Configuración; env vars win over them.
 */
export async function generateRoutine(
  env: { GEMINI_API_KEY?: string; HF_TOKEN?: string; HUGGINGFACE_TOKEN?: string },
  keys: { gemini?: string; hf?: string },
  inventory: string[],
  body: any
): Promise<{ routine: GeneratedRoutine; source: string } | { error: string }> {
  const prompt = buildPrompt(body, inventory);
  const ids = new Set<string>((Array.isArray(body.candidates) ? body.candidates : []).map((c: Candidate) => c.id));
  const failures: string[] = [];

  for (const provider of PROVIDERS) {
    const token =
      provider.key === 'gemini' ? env.GEMINI_API_KEY || keys.gemini : env.HF_TOKEN || env.HUGGINGFACE_TOKEN || keys.hf;
    if (!token) continue;
    for (const model of provider.models) {
      try {
        const answer = await ask(provider, token, model, prompt);
        const routine = normalizeRoutine(answer, ids);
        if (routine) return { routine, source: model };
        failures.push(`${model}: ${tail(answer)}`);
      } catch (error) {
        const message = (error as Error).message;
        // A rejected key or an exhausted quota fails the same way on every model
        if (/HTTP 40[13]|API key not valid|API_KEY_INVALID/.test(message)) {
          failures.push(`${provider.label} rechazó la clave: revísala en Configuración → IA de rutinas`);
          break;
        }
        if (/HTTP 402/.test(message)) {
          failures.push(`${provider.label}: la cuenta no tiene créditos gratuitos disponibles`);
          break;
        }
        failures.push(`${model}: ${message}`);
      }
    }
  }
  if (!env.GEMINI_API_KEY && !keys.gemini) failures.push('Falta la clave de Gemini (Configuración → IA de rutinas)');

  console.error('Routine generation failed:', failures);
  return { error: failures.join(' · ') };
}
