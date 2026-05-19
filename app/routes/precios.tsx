import { Layout } from "~/components/layout";
import { Section } from "~/components/ui/section";
import { Link } from "react-router";
import { Check } from "lucide-react";
import { motion } from "motion/react";

export function meta() {
  return [
    { title: "Precios - TrainoFit | Membresías Gym + CrossFit" },
    {
      name: "description",
      content:
        "Elige tu plan: TrainoBox, TrainoGym o el sistema híbrido ATHLETE. Precios transparentes, sin cargos ocultos.",
    },
  ];
}

// ──────────────────────────────────────────────
// DATA
// ──────────────────────────────────────────────

const boxPlans = [
  {
    id: "box-starter",
    name: "STARTER",
    hook: "Crea el Hábito",
    price: "$29.990",
    description: "2 Clases / semana + Coaching",
    features: [
      "2 clases por semana",
      "Coaching certificado incluido",
      "Escalable a tu nivel",
      "Comunidad TrainoBox",
    ],
    cta: "Empieza aquí",
  },
  {
    id: "box-progress",
    name: "PROGRESS",
    hook: "El Punto Dulce",
    price: "$39.990",
    description: "3 Clases / semana + Seguimiento",
    features: [
      "3 clases por semana",
      "Coaching certificado incluido",
      "Seguimiento de rendimiento",
      "Acceso a comunidad activa",
    ],
    featured: true,
    cta: "Sube de nivel",
  },
  {
    id: "box-rx",
    name: "RX",
    hook: "Maestría Total",
    price: "$54.990",
    description: "Clases Ilimitadas + Open Box",
    features: [
      "Clases ilimitadas",
      "Coaching certificado incluido",
      "Open Box Access — incluido",
      "Rendimiento sin restricciones",
    ],
    cta: "Rendimiento Total",
  },
];

const gymPlans = [
  {
    id: "gym-flex",
    name: "FLEX",
    hook: "Ahorro Inteligente",
    price: "$29.990",
    description: "Lun–Vie 08:00–16:00",
    features: [
      "Acceso completo Off-Peak",
      "Lunes a Viernes, mañanas",
      "Equipamiento de alta gama",
      "Ideal para horario flexible",
    ],
    cta: "Empieza aquí",
  },
  {
    id: "gym-libre",
    name: "LIBRE",
    hook: "Sin Límites",
    price: "$39.990",
    description: "Acceso Total — Todos los horarios",
    features: [
      "Acceso completo todos los días",
      "Fines de semana incluidos",
      "Equipamiento premium",
      "Entrena bajo tus propias reglas",
    ],
    featured: true,
    cta: "Sube de nivel",
  },
];

// ──────────────────────────────────────────────
// COMPONENTS
// ──────────────────────────────────────────────

function PlanCard({
  plan,
  accentColor,
  groupLabel,
}: {
  plan: (typeof boxPlans)[0];
  accentColor: string;
  groupLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      id={`plan-${plan.id}`}
      className={`relative flex flex-col border transition-all duration-500 group overflow-hidden ${
        plan.featured
          ? "border-primary/50 bg-gradient-to-b from-primary/8 to-zinc-950 shadow-[0_0_40px_-15px_rgba(212,160,23,0.3)]"
          : "border-white/8 bg-zinc-900/60 hover:border-white/15"
      }`}
    >
      {plan.featured && (
        <div className="bg-primary py-2 text-center">
          <span className="text-xs font-black tracking-[0.3em] uppercase text-dark">
            RECOMENDADO
          </span>
        </div>
      )}

      <div className="p-8 flex flex-col flex-1">
        {/* Tag */}
        <span
          className="text-xs font-black tracking-[0.3em] uppercase mb-3"
          style={{ color: accentColor }}
        >
          {groupLabel}
        </span>

        {/* Name & Hook */}
        <h3
          className="text-3xl font-black uppercase text-white leading-none mb-1"
          style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
        >
          {plan.name}
        </h3>
        <p
          className="text-xs font-bold uppercase tracking-wider mb-5"
          style={{ color: accentColor }}
        >
          {plan.hook}
        </p>

        {/* Price */}
        <div className="mb-5">
          <span className="text-4xl font-black text-white">{plan.price}</span>
          <span className="text-gray-500 text-sm ml-2">/mes</span>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-6 border-b border-white/5 pb-6">
          {plan.description}
        </p>

        {/* Features */}
        <ul className="space-y-3 flex-1 mb-8">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check
                size={14}
                className="mt-0.5 flex-shrink-0"
                style={{ color: accentColor }}
              />
              <span className="text-gray-300 text-sm">{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          to="/contacto"
          id={`plan-${plan.id}-cta`}
          className="block w-full text-center py-3 px-6 font-black text-sm uppercase tracking-widest transition-all duration-300 hover:scale-105"
          style={
            plan.featured
              ? {
                  background: accentColor,
                  color: "#0a0a0a",
                  boxShadow: `0 0 25px -8px ${accentColor}`,
                }
              : {
                  border: `1.5px solid ${accentColor}40`,
                  color: accentColor,
                }
          }
        >
          {plan.cta} →
        </Link>
      </div>

      {/* Hover glow */}
      <div
        className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
        style={{ background: accentColor }}
      />
    </motion.div>
  );
}

function SectionHeader({
  tag,
  title,
  subtitle,
  color,
}: {
  tag: string;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="mb-10">
      <span
        className="inline-block text-xs font-black tracking-[0.3em] uppercase mb-3 px-3 py-1.5 border"
        style={{ color, borderColor: color + "30", background: color + "10" }}
      >
        {tag}
      </span>
      <h2
        className="text-3xl md:text-4xl font-black uppercase text-white leading-tight mb-2"
        style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
      >
        {title}
      </h2>
      <p className="text-gray-400 text-sm max-w-lg">{subtitle}</p>
    </div>
  );
}

// ──────────────────────────────────────────────
// PAGE
// ──────────────────────────────────────────────

export default function Precios() {
  return (
    <Layout>
      {/* Page Header — Video Background */}
      <div className="relative overflow-hidden" style={{ height: "calc(60dvh)", minHeight: "420px" }}>
        {/* Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/magnesio-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/magnesio-web.mp4" type="video/mp4" />
        </video>
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.8)_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 border border-primary/30 bg-primary/10 text-xs font-bold tracking-[0.3em] uppercase text-primary mb-6">
              Arquitectura de Precios
            </span>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-black uppercase text-white mb-4 leading-none"
              style={{ fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif", textShadow: "0 2px 40px rgba(0,0,0,0.8)" }}
            >
              EL PLAN{" "}
              <span className="text-primary">PERFECTO</span>
              <br />
              PARA TI
            </h1>
            <p className="text-sm md:text-lg text-gray-300 max-w-xl mx-auto">
              Sin cargos ocultos. Sin contratos largos. Solo resultados.
            </p>
          </motion.div>
        </div>
      </div>

      <Section className="bg-zinc-950 py-20">
        {/* ─── MODULE 1: TRAINO BOX ─── */}
        <div className="mb-20">
          <SectionHeader
            tag="Módulo 1"
            title="TRAINO BOX — La Comunidad"
            subtitle="Coaching, comunidad y WODs de alto rendimiento. Para quienes buscan superarse en equipo."
            color="#ff6b35"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boxPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                accentColor="#ff6b35"
                groupLabel="TRAINO BOX"
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-16">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-zinc-950 px-6 text-xs font-black tracking-[0.4em] uppercase text-white/20">
              ——
            </span>
          </div>
        </div>

        {/* ─── MODULE 2: TRAINO GYM ─── */}
        <div className="mb-20">
          <SectionHeader
            tag="Módulo 2"
            title="TRAINO GYM — La Libertad"
            subtitle="Autonomía total, fuerza bruta y equipamiento de última generación. Entrena bajo tus propias reglas."
            color="#d4a017"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            {gymPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                accentColor="#d4a017"
                groupLabel="TRAINO GYM"
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-16">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-zinc-950 px-6 text-xs font-black tracking-[0.4em] uppercase text-white/20">
              ——
            </span>
          </div>
        </div>

        {/* ─── MODULE 3: ATHLETE — THE BIG CARD ─── */}
        <div>
          <SectionHeader
            tag="Módulo 3"
            title="TRAINO HYBRID — La Élite"
            subtitle="Lo mejor de ambos mundos. El plan más rentable para el atleta serio."
            color="#d4a017"
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            id="plan-athlete"
            className="relative border-2 border-primary bg-gradient-to-br from-primary/10 via-zinc-950 to-zinc-900 overflow-hidden shadow-[0_0_80px_-20px_rgba(212,160,23,0.5)]"
          >
            {/* Top accent bar */}
            <div className="bg-gradient-to-r from-primary via-primary-300 to-primary py-3 text-center">
              <span className="text-sm font-black tracking-[0.4em] uppercase text-dark">
                ⭐ THE RECOMMENDED CHOICE — RENDIMIENTO TOTAL ⭐
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left — Info */}
              <div className="p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-white/5">
                <span className="text-xs font-black tracking-[0.3em] uppercase text-primary mb-4 block">
                  TRAINO HYBRID — MÓDULO 3
                </span>
                <h3
                  className="text-6xl md:text-7xl font-black uppercase text-white leading-none mb-2"
                  style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
                >
                  ATHLETE
                </h3>
                <p className="text-primary font-bold uppercase tracking-wider text-sm mb-8">
                  La Máquina Definitiva
                </p>

                <div className="mb-8">
                  <span className="text-6xl font-black text-white">
                    $69.990
                  </span>
                  <span className="text-gray-400 text-base ml-3">/mes</span>
                </div>

                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                  Gym ilimitado + CrossFit ilimitado + Open Box.{" "}
                  <span className="text-white font-semibold">
                    Sin restricciones. Sin excusas. Solo resultados.
                  </span>
                </p>

                <Link
                  to="/contacto"
                  id="plan-athlete-cta"
                  className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-dark font-black text-sm uppercase tracking-widest hover:scale-105 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(212,160,23,0.6)]"
                >
                  QUIERO SER ATHLETE
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>

              {/* Right — Features */}
              <div className="p-10 lg:p-14">
                <h4 className="text-xs font-black tracking-[0.3em] uppercase text-primary mb-8">
                  TODO INCLUIDO
                </h4>
                <ul className="space-y-5">
                  {[
                    "Gym Ilimitado — todos los horarios",
                    "CrossFit Ilimitado — clases diarias",
                    "Open Box Access — sin cita previa",
                    "Coaching certificado en cada sesión",
                    "Equipamiento de alta gama",
                    "Sin restricciones de horario",
                    "La combinación definitiva: Fuerza + Agilidad",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-none bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={11} className="text-primary" />
                      </div>
                      <span className="text-gray-200 text-base">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Psychology note */}
                <div className="mt-10 p-4 bg-primary/5 border border-primary/20">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    💡{" "}
                    <span className="text-primary font-semibold">
                      ¿Por qué ATHLETE?
                    </span>{" "}
                    En vez de pagar Gym ($39.990) + Box ($54.990) por separado,
                    el plan ATHLETE te da todo por{" "}
                    <span className="text-white font-bold">$69.990</span>. La
                    matemática habla sola.
                  </p>
                </div>
              </div>
            </div>

            {/* Corner glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          </motion.div>
        </div>

        {/* FAQ Note */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>
            ¿Tienes preguntas sobre nuestros planes?{" "}
            <Link to="/contacto" className="text-primary hover:underline">
              Contáctanos por WhatsApp
            </Link>{" "}
            y te ayudamos a elegir.
          </p>
        </div>
      </Section>
    </Layout>
  );
}