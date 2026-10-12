import { Section } from "~/components/ui/section";
import { Link } from "react-router";
import { ArrowRight, Check, Trophy, Users, Zap } from "lucide-react";
import { cn } from "~/lib/utils";

const PILLARS = [
  {
    id: "box",
    tag: "COMUNIDAD",
    name: "TRAINO BOX",
    icon: Users,
    hook: "Crea el hábito y recupera tu energía",
    description:
      "Coaching de élite, comunidad que empuja y WODs diarios que desafían. Para quienes se superan en equipo.",
    features:
      "Coaching certificado en cada clase,WODs programados y escalables,Seguimiento de rendimiento,Comunidad de alto nivel",
    cta: "Explorar Box",
    ctaLink: "/clases",
    highlighted: false,
  },
  {
    id: "gym",
    tag: "LIBERTAD",
    name: "TRAINO GYM",
    icon: Zap,
    hook: "Entrena bajo tus propias reglas",
    description:
      "Máquinas de última generación y horario extendido. Para quienes dominan su propio ritmo y no necesitan permiso.",
    features:
      "Acceso horario extendido,Equipamiento de alta gama,Open Gym ilimitado,Plan FLEX off-peak disponible",
    cta: "Ver Gym",
    ctaLink: "/precios",
    highlighted: false,
  },
  {
    id: "full",
    tag: "ÉLITE",
    name: "TRAINO FULL",
    icon: Trophy,
    hook: "El Sistema Híbrido: Fuerza + Agilidad",
    description:
      "La combinación definitiva. Fuerza bruta y acondicionamiento atlético sin restricciones. Para quienes quieren todo.",
    features:
      "Acceso ilimitado Gym + Box,Open Box incluido,Sin restricciones de horario,La opción más recomendada",
    cta: "Ser un ATHLETE",
    ctaLink: "/precios",
    highlighted: true,
  },
];

export function ThreePillars({ settings }: { settings: Record<string, string> }) {
  return (
    <Section className="bg-zinc-950 border-t border-white/10 py-24 md:py-28">
      <div className="text-center mb-16 md:mb-20 reveal">
        <p className="eyebrow mb-4">La Solución</p>
        <h2 className="font-display text-5xl md:text-7xl uppercase text-white leading-none">
          Tres pilares. <span className="text-primary">Un sistema.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {PILLARS.map((pillar, index) => {
          // Admin-edited copy (settings) overrides the defaults above.
          const text = (field: "hook" | "description" | "features") =>
            settings[`three_pillars_${pillar.id}_${field}`] || pillar[field];

          return (
            <article
              key={pillar.id}
              id={`pillar-traino-${pillar.id}`}
              style={{ "--i": index } as React.CSSProperties}
              className={cn(
                "flex flex-col border reveal hover:-translate-y-1.5",
                pillar.highlighted
                  ? "border-primary bg-primary/5"
                  : "border-white/10 bg-zinc-900/60 hover:border-primary/50"
              )}
            >
              {pillar.highlighted && (
                <p className="bg-primary text-dark text-center py-2 text-xs font-black tracking-[0.2em] uppercase">
                  Más recomendado
                </p>
              )}

              <div className="flex flex-col flex-1 p-8">
                <p className="eyebrow mb-4">{pillar.tag}</p>

                <span className="size-16 flex items-center justify-center border border-primary/30 bg-primary/10 text-primary mb-6">
                  <pillar.icon size={32} strokeWidth={1.5} aria-hidden />
                </span>

                <h3 className="font-display text-4xl uppercase text-white mb-2">
                  {pillar.name}
                </h3>
                <p className="text-sm font-bold uppercase tracking-wider text-primary mb-4">
                  {text("hook")}
                </p>
                <p className="text-gray-400 leading-relaxed text-sm mb-8">
                  {text("description")}
                </p>

                <ul className="space-y-3 flex-1 mb-8">
                  {text("features")
                    .split(",")
                    .map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check size={16} className="text-primary mt-0.5 shrink-0" aria-hidden />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                </ul>

                <Link viewTransition
                  to={pillar.ctaLink}
                  id={`pillar-traino-${pillar.id}-cta`}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 px-6 font-black text-sm uppercase tracking-widest transition-colors duration-200",
                    pillar.highlighted
                      ? "bg-primary text-dark hover:bg-primary-300"
                      : "border border-primary/40 text-primary hover:bg-primary/10 hover:border-primary"
                  )}
                >
                  {pillar.cta}
                  <ArrowRight size={16} aria-hidden />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
