import { Section } from "~/components/ui/section";
import { Dumbbell, Users, Plus } from "lucide-react";

const SIDES = [
  {
    name: "TRAINO GYM",
    icon: Dumbbell,
    text: "Autonomía total, maquinaria de fuerza y espacio libre de entrenamiento.",
    hook: "Entrena bajo tus propias reglas",
  },
  {
    name: "TRAINO BOX",
    icon: Users,
    text: "Clases dirigidas, comunidad motivadora y WODs guiados por coaches.",
    hook: "Superación grupal guiada",
  },
];

export function HybridProblem() {
  return (
    <Section className="bg-zinc-950 border-t border-white/10 py-24 md:py-32">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 md:mb-20 reveal">
          <p className="eyebrow mb-4">El dilema común</p>
          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl uppercase text-white leading-none mb-6">
            ¿Cansado de <span className="text-primary">elegir?</span>
          </h2>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            ¿La libertad de las máquinas o la motivación de las clases grupales?{" "}
            <span className="text-white font-semibold">Ya no tienes que decidir.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch">
          {SIDES.map((side, i) => (
            <div key={side.name} className="contents">
              {i === 1 && (
                <div className="flex items-center justify-center py-4 md:py-0 md:px-6" aria-hidden>
                  <span className="size-12 rounded-full border border-primary/40 bg-zinc-950 flex items-center justify-center text-primary">
                    <Plus className="size-5" />
                  </span>
                </div>
              )}
              <div className="p-8 md:p-12 bg-zinc-900/60 border border-white/10 flex flex-col items-center text-center gap-6 reveal">
                <span className="size-16 border border-primary/30 bg-primary/10 flex items-center justify-center text-primary">
                  <side.icon size={28} strokeWidth={1.5} aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-3xl md:text-4xl uppercase text-white mb-2">
                    {side.name}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-xs">{side.text}</p>
                  <p className="text-white font-bold mt-3 text-xs uppercase tracking-wider">
                    {side.hook}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 md:mt-12 p-6 border border-primary/30 bg-primary/5 text-center text-base md:text-xl font-bold uppercase tracking-wider text-primary">
          TrainoFit: el sistema híbrido. Fuerza + Agilidad.
        </p>
      </div>
    </Section>
  );
}
