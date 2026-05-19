import { motion } from "motion/react";
import { Section } from "~/components/ui/section";

export function HybridProblem() {
  return (
    <Section className="relative overflow-hidden bg-gray-950 py-28">
      {/* Top edge accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 border border-white/10 text-xs font-bold tracking-[0.3em] uppercase text-primary mb-6">
            El Problema
          </span>
          <h2
            className="text-4xl md:text-6xl font-black uppercase text-white leading-tight mb-6"
            style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
          >
            ¿Cansado de{" "}
            <span className="text-primary">Elegir?</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            "¿Cansado de elegir entre la libertad de las máquinas y la
            motivación de las clases?{" "}
            <span className="text-white font-semibold">
              Ya no tienes que decidir.
            </span>
            "
          </p>
        </motion.div>

        {/* Split Screen Visual */}
        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0 items-stretch">
          {/* Left — Gym */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative p-10 md:p-14 bg-zinc-900 border border-white/5 group overflow-hidden"
          >
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative z-10 flex flex-col items-center text-center gap-6">
              {/* Icon */}
              <div className="w-20 h-20 bg-primary/10 border border-primary/30 rounded-none flex items-center justify-center group-hover:border-primary/60 transition-colors duration-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-10 h-10 text-primary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
              </div>

              {/* Dumbbell illustration */}
              <div className="relative">
                <svg
                  viewBox="0 0 200 60"
                  className="w-48 h-16 text-primary/60"
                  fill="currentColor"
                >
                  <rect x="0" y="20" width="30" height="20" rx="4" />
                  <rect x="35" y="10" width="16" height="40" rx="3" />
                  <rect x="55" y="25" width="90" height="10" rx="4" />
                  <rect x="149" y="10" width="16" height="40" rx="3" />
                  <rect x="170" y="20" width="30" height="20" rx="4" />
                </svg>
              </div>

              <div>
                <h3
                  className="text-2xl font-black uppercase text-white mb-2 tracking-wide"
                  style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
                >
                  TRAINO GYM
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Máquinas de última generación.
                  <br />
                  <span className="text-white font-medium">
                    Entrena bajo tus propias reglas.
                  </span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Center — Plus & Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col items-center justify-center gap-4 px-6 py-8 md:py-0 relative z-10"
          >
            {/* Vertical connector lines */}
            <div className="hidden md:block w-px h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

            <div className="relative">
              <div className="w-16 h-16 rounded-none border-2 border-primary bg-primary/10 flex items-center justify-center shadow-[0_0_40px_rgba(212,160,23,0.3)]">
                <span
                  className="text-3xl font-black text-primary"
                  style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
                >
                  +
                </span>
              </div>
              <div className="absolute inset-0 animate-ping rounded-none border border-primary/30 opacity-40" />
            </div>

            <div className="hidden md:block w-px h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          </motion.div>

          {/* Right — Box */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative p-10 md:p-14 bg-zinc-900 border border-white/5 group overflow-hidden"
          >
            {/* Ambient glow */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative z-10 flex flex-col items-center text-center gap-6">
              {/* Icon */}
              <div className="w-20 h-20 bg-accent/10 border border-accent/30 rounded-none flex items-center justify-center group-hover:border-accent/60 transition-colors duration-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-10 h-10 text-accent"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>

              {/* Kettlebell illustration */}
              <div className="relative">
                <svg
                  viewBox="0 0 80 80"
                  className="w-16 h-16 text-accent/60"
                  fill="currentColor"
                >
                  <circle cx="40" cy="25" r="18" />
                  <rect x="32" y="38" width="16" height="6" rx="2" />
                  <rect x="26" y="44" width="28" height="26" rx="6" />
                  <circle cx="40" cy="28" r="6" fill="rgba(0,0,0,0.3)" />
                </svg>
              </div>

              <div>
                <h3
                  className="text-2xl font-black uppercase text-white mb-2 tracking-wide"
                  style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
                >
                  TRAINO BOX
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Coaching, comunidad y WODs.
                  <br />
                  <span className="text-white font-medium">
                    Crea el hábito y recupera tu energía.
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Result row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-0 p-8 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 text-center"
        >
          <span className="text-lg md:text-2xl font-black uppercase tracking-wider text-primary">
            = TRAINOFIT: EL SISTEMA HÍBRIDO. FUERZA + AGILIDAD.
          </span>
        </motion.div>
      </div>
    </Section>
  );
}
