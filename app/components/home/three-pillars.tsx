import { motion } from "motion/react";
import { Section } from "~/components/ui/section";
import { Link } from "react-router";
import { useState, useEffect } from "react";

export function ThreePillars() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === "object") {
          setSettings(data as Record<string, string>);
        }
      })
      .catch(err => console.error("Error loading settings:", err));
  }, []);

  const pillars = [
    {
      id: "traino-box",
      tag: "COMUNIDAD",
      name: "TRAINO BOX",
      hook: settings.three_pillars_box_hook || "Crea el hábito y recupera tu energía",
      description:
        settings.three_pillars_box_description ||
        "Coaching de élite, comunidad que empuja y WODs diarios que desafían. Para quienes se superan en equipo.",
      features: (
        settings.three_pillars_box_features ||
        "Coaching certificado en cada clase,WODs programados y escalables,Seguimiento de rendimiento,Comunidad de alto nivel"
      ).split(","),
      color: "#ff6b35",
      colorClass: "accent",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-10 h-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
          />
        </svg>
      ),
      cta: "Explorar Box",
      ctaLink: "/clases",
    },
    {
      id: "traino-gym",
      tag: "LIBERTAD",
      name: "TRAINO GYM",
      hook: settings.three_pillars_gym_hook || "Entrena bajo tus propias reglas",
      description:
        settings.three_pillars_gym_description ||
        "Máquinas de última generación y horario extendido. Para quienes dominan su propio ritmo y no necesitan permiso.",
      features: (
        settings.three_pillars_gym_features ||
        "Acceso horario extendido,Equipamiento de alta gama,Open Gym ilimitado,Plan FLEX off-peak disponible"
      ).split(","),
      color: "#d4a017",
      colorClass: "primary",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-10 h-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
          />
        </svg>
      ),
      cta: "Ver Gym",
      ctaLink: "/precios",
    },
    {
      id: "traino-full",
      tag: "ÉLITE",
      name: "TRAINO FULL",
      hook: settings.three_pillars_full_hook || "El Sistema Híbrido: Fuerza + Agilidad",
      description:
        settings.three_pillars_full_description ||
        "La combinación definitiva. Fuerza bruta y acondicionamiento atlético sin restricciones. Para quienes quieren todo.",
      features: (
        settings.three_pillars_full_features ||
        "Acceso ilimitado Gym + Box,Open Box incluido,Sin restricciones de horario,La opción más recomendada"
      ).split(","),
      color: "#d4a017",
      colorClass: "primary",
      highlighted: true,
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-10 h-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
          />
        </svg>
      ),
      cta: "Ser un ATHLETE",
      ctaLink: "/precios",
    },
  ];

  return (
    <Section className="relative overflow-hidden bg-zinc-950 py-28">
      {/* Top edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 border border-white/10 text-xs font-bold tracking-[0.3em] uppercase text-primary mb-6">
            La Solución
          </span>
          <h2
            className="text-4xl md:text-6xl font-black uppercase text-white leading-tight"
            style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
          >
            TRES PILARES. <span className="text-primary">UN SISTEMA.</span>
          </h2>
        </motion.div>

        {/* Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              id={`pillar-${pillar.id}`}
            >
              <div
                className={`relative h-full flex flex-col overflow-hidden border transition-all duration-500 group ${pillar.highlighted
                    ? "border-primary/50 bg-gradient-to-b from-primary/10 to-zinc-950 shadow-[0_0_60px_-20px_rgba(212,160,23,0.4)]"
                    : "border-white/8 bg-zinc-900/60 hover:border-white/20"
                  }`}
              >
                {/* Highlighted badge */}
                {pillar.highlighted && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-center py-2">
                    <span className="text-xs font-black tracking-[0.3em] uppercase text-dark">
                      ⭐ MÁS RECOMENDADO ⭐
                    </span>
                  </div>
                )}

                {/* Card Body */}
                <div className={`flex flex-col flex-1 p-8 ${pillar.highlighted ? "pt-14" : ""}`}>
                  {/* Tag */}
                  <span
                    className="inline-block text-xs font-black tracking-[0.3em] uppercase mb-4"
                    style={{ color: pillar.color }}
                  >
                    {pillar.tag}
                  </span>

                  {/* Icon */}
                  <div
                    className="w-16 h-16 flex items-center justify-center border mb-6 transition-all duration-500 group-hover:scale-110"
                    style={{
                      borderColor: pillar.color + "40",
                      background: pillar.color + "12",
                      color: pillar.color,
                    }}
                  >
                    {pillar.icon}
                  </div>

                  {/* Name */}
                  <h3
                    className="text-3xl font-black uppercase text-white mb-2 tracking-tight"
                    style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
                  >
                    {pillar.name}
                  </h3>

                  {/* Hook */}
                  <p
                    className="text-sm font-bold uppercase tracking-wider mb-4"
                    style={{ color: pillar.color }}
                  >
                    {pillar.hook}
                  </p>

                  {/* Description */}
                  <p className="text-gray-400 leading-relaxed text-sm mb-8">
                    {pillar.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 flex-1 mb-8">
                    {pillar.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span
                          className="text-xs mt-0.5 font-black flex-shrink-0"
                          style={{ color: pillar.color }}
                        >
                          ▸
                        </span>
                        <span className="text-gray-300 text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    to={pillar.ctaLink}
                    id={`pillar-${pillar.id}-cta`}
                    className="block w-full text-center py-3 px-6 font-black text-sm uppercase tracking-widest transition-all duration-300 hover:scale-105"
                    style={
                      pillar.highlighted
                        ? {
                          background: pillar.color,
                          color: "#ffffffff",
                          boxShadow: `0 0 30px -8px ${pillar.color}`,
                        }
                        : {
                          border: `2px solid ${pillar.color}40`,
                          color: pillar.color,
                        }
                    }
                    onMouseEnter={(e) => {
                      if (!pillar.highlighted) {
                        (e.target as HTMLElement).style.background = pillar.color + "20";
                        (e.target as HTMLElement).style.borderColor = pillar.color;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!pillar.highlighted) {
                        (e.target as HTMLElement).style.background = "transparent";
                        (e.target as HTMLElement).style.borderColor = pillar.color + "40";
                      }
                    }}
                  >
                    {pillar.cta} →
                  </Link>
                </div>

                {/* Hover Glow */}
                <div
                  className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
                  style={{ background: pillar.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
