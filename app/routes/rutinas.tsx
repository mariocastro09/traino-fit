import { Link } from "react-router";
import { ArrowRight, Clock, Dumbbell } from "lucide-react";
import { Layout } from "~/components/layout";
import { PageHero } from "~/components/page-hero";
import { Section } from "~/components/ui/section";
import type { Route } from "./+types/rutinas";
import { d1, getPublishedRoutines, orFallback } from "../../server/public-data";
import { LEVELS, PURPOSES, purposeLabel } from "~/lib/routines";
import { pageMeta } from "~/lib/site";
import { cn } from "~/lib/utils";

export function meta() {
  return pageMeta({
    title: "Rutinas — TrainoFit",
    description:
      "Rutinas de CrossFit, musculación, fuerza, atletismo y fútbol creadas por los coaches de TrainoFit. Léelas, compártelas y síguelas desde tu celular.",
    path: "/rutinas",
  });
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const tipo = url.searchParams.get("tipo") ?? "";
  const nivel = url.searchParams.get("nivel") ?? "";
  const all = await orFallback(() => getPublishedRoutines(d1(context)), []);

  return {
    tipo,
    nivel,
    // Only purposes that have something published are offered as filters
    purposes: PURPOSES.filter((p) => all.some((r) => r.category === p.id)).map((p) => p.id),
    total: all.length,
    routines: all
      .filter((r) => (!tipo || r.category === tipo) && (!nivel || r.difficulty === nivel))
      .map((r) => ({
        slug: r.slug,
        name: r.name,
        category: r.category,
        difficulty: r.difficulty,
        durationMin: r.durationMin,
        summary: r.summary || r.description,
        exercises: r.exercises.length,
      })),
  };
}

export default function Rutinas({ loaderData }: Route.ComponentProps) {
  const { routines, purposes, tipo, nivel, total } = loaderData;

  // Filters are plain links, so a filtered view can be shared or bookmarked.
  const href = (next: { tipo?: string; nivel?: string }) => {
    const params = new URLSearchParams();
    const merged = { tipo, nivel, ...next };
    if (merged.tipo) params.set("tipo", merged.tipo);
    if (merged.nivel) params.set("nivel", merged.nivel);
    const query = params.toString();
    return query ? `/rutinas?${query}` : "/rutinas";
  };

  const chip = (active: boolean) =>
    cn(
      "px-4 py-2 border text-xs font-bold uppercase tracking-wider transition-colors duration-200",
      active
        ? "bg-primary border-primary text-dark"
        : "border-white/15 text-gray-300 hover:border-white/50 hover:text-white"
    );

  return (
    <Layout>
      <PageHero
        media="hero-hybrid"
        eyebrow="Entrena con nosotros"
        title={<>Rutinas para <span className="text-primary">hacer hoy</span></>}
        subtitle="Entrenamientos creados por nuestros coaches. Elige tu objetivo, lee la rutina y síguela paso a paso desde tu celular."
      />

      <Section className="bg-zinc-950 text-white">
        {total === 0 ? (
          <div className="text-center py-16 border border-white/10 bg-zinc-900/40">
            <p className="text-lg font-bold text-white mb-2">Pronto publicaremos las primeras rutinas</p>
            <p className="text-sm text-gray-400 mb-6">Mientras tanto, ven a entrenar con un coach: tu primera clase es gratis.</p>
            <Link
              viewTransition
              to="/contacto"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-dark font-black text-xs uppercase tracking-widest hover:bg-primary-300 transition-colors duration-200"
            >
              Reservar mi clase gratis
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        ) : (
          <>
            <nav aria-label="Filtrar rutinas" className="space-y-3 mb-10">
              <div className="flex flex-wrap gap-2">
                <Link viewTransition to={href({ tipo: "" })} className={chip(!tipo)} preventScrollReset>
                  Todas
                </Link>
                {purposes.map((id) => (
                  <Link
                    viewTransition
                    key={id}
                    to={href({ tipo: id })}
                    className={chip(tipo === id)}
                    aria-current={tipo === id ? "true" : undefined}
                    preventScrollReset
                  >
                    {purposeLabel(id)}
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link viewTransition to={href({ nivel: "" })} className={chip(!nivel)} preventScrollReset>
                  Cualquier nivel
                </Link>
                {LEVELS.map((level) => (
                  <Link
                    viewTransition
                    key={level}
                    to={href({ nivel: level })}
                    className={chip(nivel === level)}
                    aria-current={nivel === level ? "true" : undefined}
                    preventScrollReset
                  >
                    {level}
                  </Link>
                ))}
              </div>
            </nav>

            {routines.length === 0 ? (
              <div className="text-center py-16 border border-white/10 bg-zinc-900/40">
                <p className="text-sm font-bold text-gray-300 mb-3">No hay rutinas con esos filtros todavía</p>
                <Link viewTransition to="/rutinas" className="text-xs text-primary font-black uppercase tracking-widest underline underline-offset-4">
                  Ver todas las rutinas
                </Link>
              </div>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routines.map((routine, i) => (
                  <li
                    key={routine.slug}
                    style={{ "--i": i % 3 } as React.CSSProperties}
                    className="reveal hover:-translate-y-1.5"
                  >
                    <Link
                      viewTransition
                      to={`/rutinas/${routine.slug}`}
                      className="group h-full flex flex-col p-7 bg-zinc-900/60 border border-white/10 hover:border-primary/60 transition-colors duration-200"
                    >
                      <p className="eyebrow mb-3">{purposeLabel(routine.category)}</p>
                      <h2 className="font-display text-4xl uppercase leading-none text-white mb-3">
                        {routine.name}
                      </h2>
                      {routine.summary && (
                        <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-6">{routine.summary}</p>
                      )}
                      <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-300 tabular-nums">
                        <span className="font-bold text-white">{routine.difficulty}</span>
                        {routine.durationMin && (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={13} className="text-primary" aria-hidden />
                            {routine.durationMin} min
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <Dumbbell size={13} className="text-primary" aria-hidden />
                          {routine.exercises} ejercicios
                        </span>
                        <ArrowRight size={16} className="ml-auto text-primary group-hover:translate-x-1 transition-transform duration-200" aria-hidden />
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Section>
    </Layout>
  );
}
