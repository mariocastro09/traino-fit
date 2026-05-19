import { motion } from "motion/react";
import { Section } from "~/components/ui/section";
import { Dumbbell, Users, Plus, Sparkles, AlertTriangle } from "lucide-react";

export function HybridProblem() {
  return (
    <Section className="relative overflow-hidden bg-zinc-950 py-24 md:py-32">
      {/* Background glowing meshes */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-[350px] h-[350px] bg-orange-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top edge glowing accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-0">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 rounded-full text-[10px] font-black tracking-[0.25em] uppercase text-primary mb-6">
            <AlertTriangle size={12} className="text-primary" />
            El dilema común
          </span>

          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-black uppercase text-white leading-none mb-6"
            style={{ fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif" }}
          >
            ¿CANSADO DE <span className="text-primary">ELEGIR?</span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-light/70 max-w-2xl mx-auto leading-relaxed">
            "¿Cansado de elegir entre la libertad de las máquinas y la motivación de las clases grupales?{" "}
            <span className="text-white font-semibold">Ya no tienes que decidir.</span>"
          </p>
        </motion.div>

        {/* Split Visual Section */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-0 items-center">

          {/* Left — Gym */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative p-8 md:p-12 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-primary/25 transition-all duration-500 group overflow-hidden shadow-2xl hover:shadow-[0_0_40px_rgba(212,160,23,0.05)]"
          >
            {/* Inner hover glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center gap-6">
              {/* Icon Container */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:border-primary/45 transition-all duration-500">
                <Dumbbell size={28} className="stroke-[1.5]" />
              </div>

              <div>
                <h3
                  className="text-xl md:text-2xl font-black uppercase text-white mb-2 tracking-wide"
                  style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
                >
                  TRAINO GYM
                </h3>
                <p className="text-light/60 text-sm leading-relaxed max-w-xs">
                  Autonomía total, maquinaria de fuerza y espacio libre de entrenamiento.
                  <br />
                  <span className="text-white/80 font-bold block mt-2 text-xs uppercase tracking-wider">
                    Entrena bajo tus propias reglas
                  </span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Center — Connecting Plus */}
          <div className="flex md:flex-col items-center justify-center relative py-6 md:py-0 md:px-8 z-20">
            {/* Line connector */}
            <div className="hidden md:block w-px h-28 bg-gradient-to-b from-transparent via-white/10 to-transparent absolute" />
            <div className="md:hidden h-px w-16 bg-gradient-to-r from-transparent via-white/10 to-transparent absolute" />

            <div className="relative">
              <div className="w-12 h-12 rounded-full border border-primary/30 bg-zinc-950 flex items-center justify-center shadow-lg shadow-black/80">
                <Plus className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="absolute inset-0 animate-ping rounded-full border border-primary/20 opacity-30" />
            </div>
          </div>

          {/* Right — Box */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative p-8 md:p-12 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-orange-500/25 transition-all duration-500 group overflow-hidden shadow-2xl hover:shadow-[0_0_40px_rgba(249,115,22,0.05)]"
          >
            {/* Inner hover glow */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center gap-6">
              {/* Icon Container */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/15 to-orange-500/5 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 group-hover:border-orange-500/45 transition-all duration-500">
                <Users size={28} className="stroke-[1.5]" />
              </div>

              <div>
                <h3
                  className="text-xl md:text-2xl font-black uppercase text-white mb-2 tracking-wide"
                  style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
                >
                  TRAINO BOX
                </h3>
                <p className="text-light/60 text-sm leading-relaxed max-w-xs">
                  Clases dirigidas, comunidad motivadora y WODs guiados por coaches.
                  <br />
                  <span className="text-white/80 font-bold block mt-2 text-xs uppercase tracking-wider">
                    Superación grupal guiada
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Conclusion Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-14 md:mt-16 p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-zinc-950 to-primary/10 shadow-[0_0_30px_-10px_rgba(212,160,23,0.2)] text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <span className="relative z-10 text-base md:text-xl font-bold uppercase tracking-wider text-primary flex items-center justify-center gap-2 flex-wrap">

            <span>TRAINOFIT: El sistema híbrido. Fuerza + Agilidad.</span>

          </span>
        </motion.div>
      </div>
    </Section>
  );
}
