import { motion } from "motion/react";
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

const EASE = [0.23, 1, 0.32, 1] as const;

// The section's argument, acted out once as it scrolls into view:
// the two halves come together, the plus lands between them, then the
// conclusion is drawn across.
const merge = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.12 } },
};
const fromSide = (direction: -1 | 1) => ({
  hidden: { opacity: 0, transform: `translateX(${direction * 18}%)` },
  shown: {
    opacity: 1,
    transform: "translateX(0%)",
    transition: { duration: 0.9, ease: EASE },
  },
});
const plus = {
  hidden: { opacity: 0, transform: "scale(0.6) rotate(-90deg)" },
  shown: {
    opacity: 1,
    transform: "scale(1) rotate(0deg)",
    transition: { duration: 0.6, ease: EASE, delay: 0.5 },
  },
};

export function HybridProblem() {
  return (
    <Section className="relative z-10 bg-zinc-950 border-t border-white/10 py-24 md:py-32 overflow-x-clip shadow-[0_-40px_80px_rgba(0,0,0,0.7)]">
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

        <motion.div
          variants={merge}
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.35 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch">
            {SIDES.map((side, i) => (
              <div key={side.name} className="contents">
                {i === 1 && (
                  <motion.div
                    variants={plus}
                    className="flex items-center justify-center py-4 md:py-0 md:px-6"
                    aria-hidden
                  >
                    <span className="size-12 rounded-full border border-primary/40 bg-zinc-950 flex items-center justify-center text-primary">
                      <Plus className="size-5" />
                    </span>
                  </motion.div>
                )}
                <motion.div
                  variants={fromSide(i === 0 ? -1 : 1)}
                  className="p-8 md:p-12 bg-zinc-900/60 border border-white/10 flex flex-col items-center text-center gap-6"
                >
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
                </motion.div>
              </div>
            ))}
          </div>

          <motion.p
            variants={{
              hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
              shown: {
                opacity: 1,
                clipPath: "inset(0 0% 0 0)",
                transition: { duration: 0.9, ease: EASE, delay: 0.7 },
              },
            }}
            className="mt-10 md:mt-12 p-6 bg-primary text-dark text-center text-base md:text-xl font-black uppercase tracking-wider"
          >
            TrainoFit: el sistema híbrido. Fuerza + Agilidad.
          </motion.p>
        </motion.div>
      </div>
    </Section>
  );
}
