import { useState } from "react";
import { Link, data } from "react-router";
import { ArrowLeft, ArrowRight, Check, Clock, Dumbbell, Link2, Smartphone, Timer } from "lucide-react";
import { Layout, WhatsAppIcon } from "~/components/layout";
import { PageHero } from "~/components/page-hero";
import { Section } from "~/components/ui/section";
import { ExerciseDemo } from "~/components/exercise-demo";
import type { Route } from "./+types/rutina";
import { d1, getPublishedRoutine } from "../../server/public-data";
import { purposeLabel } from "~/lib/routines";
import { SITE_URL, pageMeta } from "~/lib/site";

// Footage that fits each purpose; anything else gets the battle ropes
const MEDIA: Record<string, string> = {
  crossfit: "hero-box",
  musculacion: "hero-gym",
  fuerza: "hero-gym",
  atletismo: "page-clases",
  futbol: "page-clases",
  movilidad: "page-contacto",
};

export async function loader({ context, params }: Route.LoaderArgs) {
  const routine = await getPublishedRoutine(d1(context), params.slug);
  if (!routine) throw data(null, { status: 404 });

  // Exercises keep the order they were written in, grouped by section
  const sections: { name: string; exercises: typeof routine.exercises }[] = [];
  for (const exercise of routine.exercises) {
    const section = sections.find((s) => s.name === exercise.routineName);
    if (section) section.exercises.push(exercise);
    else sections.push({ name: exercise.routineName, exercises: [exercise] });
  }

  return {
    slug: routine.slug!,
    name: routine.name,
    category: routine.category,
    difficulty: routine.difficulty,
    durationMin: routine.durationMin,
    summary: routine.summary || routine.description || "",
    notes: routine.summary ? routine.description : "",
    body: routine.body || "",
    token: routine.magicToken,
    totalExercises: routine.exercises.length,
    totalSets: routine.exercises.reduce((sum, e) => sum + e.sets, 0),
    sections,
  };
}

export function meta({ data: routine }: Route.MetaArgs) {
  if (!routine) return [{ title: "Rutina no encontrada — TrainoFit" }];
  return pageMeta({
    title: `${routine.name} — Rutina de ${purposeLabel(routine.category)} | TrainoFit`,
    description:
      routine.summary ||
      `Rutina de ${purposeLabel(routine.category)} nivel ${routine.difficulty.toLowerCase()} con ${routine.totalExercises} ejercicios.`,
    path: `/rutinas/${routine.slug}`,
  });
}

// Article text: blank lines split paragraphs, "## " starts a subheading.
function ArticleBody({ text }: { text: string }) {
  return (
    <div className="space-y-5 text-gray-200 text-lg leading-relaxed">
      {text.split(/\n\s*\n/).map((block, i) =>
        block.trim().startsWith("## ") ? (
          <h2 key={i} className="font-display text-4xl uppercase text-white leading-none pt-4">
            {block.trim().slice(3)}
          </h2>
        ) : (
          <p key={i} className="whitespace-pre-line">{block.trim()}</p>
        )
      )}
    </div>
  );
}

function ShareButtons({ name, url }: { name: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const buttonClass =
    "inline-flex items-center justify-center gap-2 px-5 py-3.5 border border-white/25 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:border-white/60 transition-colors duration-200";

  return (
    <>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${name} — rutina de TrainoFit: ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
      >
        <WhatsAppIcon className="size-4" />
        Compartir
      </a>
      <button
        type="button"
        className={buttonClass}
        onClick={async () => {
          await navigator.clipboard.writeText(url).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check size={15} aria-hidden /> : <Link2 size={15} aria-hidden />}
        <span aria-live="polite">{copied ? "Enlace copiado" : "Copiar enlace"}</span>
      </button>
    </>
  );
}

export default function Rutina({ loaderData: routine }: Route.ComponentProps) {
  const url = `${SITE_URL}/rutinas/${routine.slug}`;
  const followLink = `/workout/${routine.token}`;

  return (
    <Layout>
      <PageHero
        media={MEDIA[routine.category ?? ""] ?? "hero-hybrid"}
        eyebrow={`Rutina de ${purposeLabel(routine.category)}`}
        title={routine.name}
        subtitle={routine.summary}
        compact
      >
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
          <Link
            to={followLink}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-dark font-black text-xs uppercase tracking-widest hover:bg-primary-300 transition-colors duration-200"
          >
            <Smartphone size={16} aria-hidden />
            Empezar esta rutina
          </Link>
          <ShareButtons name={routine.name} url={url} />
        </div>
      </PageHero>

      <Section className="bg-zinc-950 text-white">
        <div className="max-w-3xl mx-auto">
          <Link
            viewTransition
            to="/rutinas"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-primary transition-colors duration-200 mb-8"
          >
            <ArrowLeft size={14} aria-hidden />
            Todas las rutinas
          </Link>

          {/* At a glance */}
          <dl className="grid grid-cols-2 sm:grid-cols-4 border border-white/10 divide-x divide-y sm:divide-y-0 divide-white/10 mb-12 tabular-nums">
            {[
              { label: "Nivel", value: routine.difficulty },
              { label: "Duración", value: routine.durationMin ? `${routine.durationMin} min` : "A tu ritmo" },
              { label: "Ejercicios", value: routine.totalExercises },
              { label: "Series", value: routine.totalSets },
            ].map((fact) => (
              <div key={fact.label} className="p-5">
                <dt className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{fact.label}</dt>
                <dd className="font-display text-3xl text-white leading-none">{fact.value}</dd>
              </div>
            ))}
          </dl>

          {routine.body && (
            <div className="mb-14">
              <ArticleBody text={routine.body} />
            </div>
          )}

          {routine.notes && (
            <p className="mb-12 p-5 border-l-2 border-primary bg-primary/5 text-gray-200 leading-relaxed">
              <span className="block eyebrow mb-2">Indicaciones del coach</span>
              {routine.notes}
            </p>
          )}

          {/* The routine itself */}
          <h2 className="font-display text-5xl uppercase text-white leading-none mb-8">La rutina</h2>
          <div className="space-y-10">
            {routine.sections.map((section) => (
              <section key={section.name} className="reveal">
                <h3 className="eyebrow pb-3 mb-1 border-b border-primary/40">{section.name}</h3>
                <ol className="divide-y divide-white/10">
                  {section.exercises.map((exercise, i) => (
                    <li key={exercise.id} className="py-5 grid grid-cols-[2rem_1fr] gap-x-3">
                      <span className="font-display text-2xl text-primary leading-none tabular-nums pt-0.5" aria-hidden>
                        {i + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                          <h4 className="text-lg font-bold text-white">{exercise.exerciseName}</h4>
                          <p className="flex flex-wrap items-center gap-x-4 text-sm text-gray-300 tabular-nums">
                            <span className="inline-flex items-center gap-1.5 font-bold text-white">
                              <Dumbbell size={14} className="text-primary" aria-hidden />
                              {exercise.sets} × {exercise.reps}
                            </span>
                            {exercise.intensityPct ? <span>{exercise.intensityPct}% RM</span> : null}
                            {exercise.restSeconds ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Timer size={14} className="text-primary" aria-hidden />
                                {exercise.restSeconds} s de descanso
                              </span>
                            ) : null}
                          </p>
                        </div>
                        {(exercise.image || exercise.description) && (
                          <div className="mt-3 flex flex-col sm:flex-row gap-4">
                            {exercise.image && (
                              <ExerciseDemo image={exercise.image} name={exercise.exerciseName} className="aspect-[4/3] w-full sm:w-56 shrink-0" />
                            )}
                            {exercise.description && (
                              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{exercise.description}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>

          {/* Follow along + next step */}
          <div className="mt-14 p-8 border border-primary/40 bg-primary/5 reveal">
            <h2 className="font-display text-4xl uppercase text-white leading-none mb-3">
              Hazla desde tu celular
            </h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              El modo entrenamiento te muestra un ejercicio a la vez: marcas cada serie, cuenta tus descansos y lleva el tiempo total.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={followLink}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-primary text-dark font-black text-xs uppercase tracking-widest hover:bg-primary-300 transition-colors duration-200"
              >
                <Clock size={16} aria-hidden />
                Empezar esta rutina
              </Link>
              <Link
                viewTransition
                to="/contacto"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-white/30 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 hover:border-white/60 transition-colors duration-200"
              >
                Hacerla con un coach: clase gratis
                <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
