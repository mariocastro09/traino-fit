import { useState, useEffect } from "react";
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
// DATA (FALLBACK DEFAULTS)
// ──────────────────────────────────────────────

const defaultBoxPlans = [
  {
    id: 1,
    name: "STARTER",
    moduleName: "TRAINO BOX",
    hook: "Crea el Hábito",
    price: "$29.990",
    description: "2 Clases / semana + Coaching",
    features: "2 clases por semana,Coaching certificado incluido,Escalable a tu nivel,Comunidad TrainoBox",
    featured: false,
    cta: "Empieza aquí",
  },
  {
    id: 2,
    name: "PROGRESS",
    moduleName: "TRAINO BOX",
    hook: "El Punto Dulce",
    price: "$39.990",
    description: "3 Clases / semana + Seguimiento",
    features: "3 clases por semana,Coaching certificado incluido,Seguimiento de rendimiento,Acceso a comunidad activa",
    featured: true,
    cta: "Sube de nivel",
  },
  {
    id: 3,
    name: "RX",
    moduleName: "TRAINO BOX",
    hook: "Maestría Total",
    price: "$54.990",
    description: "Clases Ilimitadas + Open Box",
    features: "Clases ilimitadas,Coaching certificado incluido,Open Box Access — incluido,Rendimiento sin restricciones",
    featured: false,
    cta: "Rendimiento Total",
  },
];

const defaultGymPlans = [
  {
    id: 4,
    name: "FLEX",
    moduleName: "TRAINO GYM",
    hook: "Ahorro Inteligente",
    price: "$29.990",
    description: "Lun–Vie 08:00–16:00",
    features: "Acceso completo Off-Peak,Lunes a Viernes, mañanas,Equipamiento de alta gama,Ideal para horario flexible",
    featured: false,
    cta: "Empieza aquí",
  },
  {
    id: 5,
    name: "LIBRE",
    moduleName: "TRAINO GYM",
    hook: "Sin Límites",
    price: "$39.990",
    description: "Acceso Total — Todos los horarios",
    features: "Acceso completo todos los días,Fines de semana incluidos,Equipamiento premium,Entrena bajo tus propias reglas",
    featured: true,
    cta: "Sube de nivel",
  },
];

const defaultHybridPlans = [
  {
    id: 6,
    name: "ATHLETE",
    moduleName: "TRAINO HYBRID",
    hook: "La Máquina Definitiva",
    price: "$69.990",
    description: "Gym ilimitado + CrossFit ilimitado + Open Box",
    features: "Gym Ilimitado — todos los horarios,CrossFit Ilimitado — clases diarias,Open Box Access — sin cita previa,Coaching certificado en cada sesión,Equipamiento de alta gama,Sin restricciones de horario,La combinación definitiva: Fuerza + Agilidad",
    featured: true,
    cta: "QUIERO SER ATHLETE",
  }
];

// ──────────────────────────────────────────────
// COMPONENTS
// ──────────────────────────────────────────────

function PlanCard({
  plan,
  accentColor,
  groupLabel,
}: {
  plan: any;
  accentColor: string;
  groupLabel: string;
}) {
  const featuresList = typeof plan.features === "string"
    ? plan.features.split(",").filter(Boolean)
    : (Array.isArray(plan.features) ? plan.features : []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      id={`plan-${plan.id}`}
      className={`relative flex flex-col border transition-all duration-500 group overflow-hidden rounded-2xl ${
        plan.featured
          ? "border-primary/50 bg-gradient-to-b from-primary/8 to-zinc-950 shadow-[0_0_40px_-15px_rgba(212,160,23,0.3)]"
          : "border-white/8 bg-zinc-900/60 hover:border-white/15"
      }`}
    >
      {plan.featured && (
        <div className="bg-primary py-2 text-center">
          <span className="text-xs font-black tracking-[0.3em] uppercase text-white">
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
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-6">
          {plan.hook}
        </p>

        {/* Price */}
        <div className="mb-6">
          <span className="text-4xl font-black text-white">{plan.price}</span>
          <span className="text-gray-500 text-xs ml-2">/mes</span>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-6">{plan.description}</p>

        {/* Features */}
        <ul className="space-y-3 mb-8 flex-1">
          {featuresList.map((feature: string, idx: number) => (
            <li key={idx} className="flex items-start gap-3">
              <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <span className="text-gray-300 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          to="/contacto"
          className={`w-full py-3 text-center font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 ${
            plan.featured
              ? "bg-primary text-white hover:scale-105"
              : "bg-zinc-800 text-white hover:bg-zinc-700"
          }`}
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
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPlans(data);
        } else {
          setPlans([...defaultBoxPlans, ...defaultGymPlans, ...defaultHybridPlans]);
        }
      })
      .catch((err) => {
        console.error("Error loading plans, using default:", err);
        setPlans([...defaultBoxPlans, ...defaultGymPlans, ...defaultHybridPlans]);
      })
      .finally(() => setLoading(false));

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setSettings(data as Record<string, string>);
        }
      })
      .catch((err) => console.error("Error loading settings:", err));
  }, []);

  const boxPlans = plans.filter((p: any) => p.moduleName === "TRAINO BOX");
  const gymPlans = plans.filter((p: any) => p.moduleName === "TRAINO GYM");
  const hybridPlans = plans.filter((p: any) => p.moduleName === "TRAINO HYBRID");
  
  const athletePlan = hybridPlans[0] || defaultHybridPlans[0];
  const athleteFeatures = typeof athletePlan.features === "string"
    ? athletePlan.features.split(",").filter(Boolean)
    : (Array.isArray(athletePlan.features) ? athletePlan.features : []);

  const unlimitedGymPlan = gymPlans.find((p: any) => p.name === "LIBRE") || gymPlans[gymPlans.length - 1] || defaultGymPlans[1];
  const unlimitedBoxPlan = boxPlans.find((p: any) => p.name === "RX") || boxPlans[boxPlans.length - 1] || defaultBoxPlans[2];

  const getPriceNumber = (priceStr: string) => {
    return parseInt(priceStr.replace(/[^0-9]/g, ""), 10) || 0;
  };

  const gymPriceVal = unlimitedGymPlan?.price || "$39.990";
  const boxPriceVal = unlimitedBoxPlan?.price || "$54.990";
  const athletePriceVal = athletePlan?.price || "$69.990";

  const gymPriceNum = getPriceNumber(gymPriceVal);
  const boxPriceNum = getPriceNumber(boxPriceVal);
  const athletePriceNum = getPriceNumber(athletePriceVal);

  const combinedPrice = gymPriceNum + boxPriceNum;
  const savings = combinedPrice - athletePriceNum;

  const formatCLP = (val: number) => {
    return "$" + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const renderTitle = (titleText: string) => {
    const parts = titleText.split(/\[(.*?)\]/);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <span key={i} className="text-primary">{part}</span>;
      }
      return part;
    });
  };

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
              {settings.pricing_hero_badge || "Arquitectura de Precios"}
            </span>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-black uppercase text-white mb-4 leading-none"
              style={{ fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif", textShadow: "0 2px 40px rgba(0,0,0,0.8)" }}
            >
              {renderTitle(settings.pricing_hero_title || "EL PLAN [PERFECTO] PARA TI")}
            </h1>
            <p className="text-sm md:text-lg text-gray-300 max-w-xl mx-auto">
              {settings.pricing_hero_subtitle || "Sin cargos ocultos. Sin contratos largos. Solo resultados."}
            </p>
          </motion.div>
        </div>
      </div>

      <Section className="bg-zinc-950 py-10 md:py-20 px-4 md:px-0">
        {/* ─── MODULE 1: TRAINO BOX ─── */}
        <div className="mb-20">
          <SectionHeader
            tag={settings.pricing_module_box_tag || "Módulo 1"}
            title={settings.pricing_module_box_title || "TRAINO BOX — La Comunidad"}
            subtitle={settings.pricing_module_box_subtitle || "Coaching, comunidad y WODs de alto rendimiento. Para quienes buscan superarse en equipo."}
            color="#ff6b35"
          />
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-96 bg-zinc-900/50 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {boxPlans.map((plan: any) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  accentColor="#ff6b35"
                  groupLabel={settings.pricing_module_box_title ? settings.pricing_module_box_title.split(" — ")[0] : "TRAINO BOX"}
                />
              ))}
            </div>
          )}
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
            tag={settings.pricing_module_gym_tag || "Módulo 2"}
            title={settings.pricing_module_gym_title || "TRAINO GYM — La Libertad"}
            subtitle={settings.pricing_module_gym_subtitle || "Autonomía total, fuerza bruta y equipamiento de última generación. Entrena bajo tus propias reglas."}
            color="#d4a017"
          />
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              {[1, 2].map((n) => (
                <div key={n} className="h-96 bg-zinc-900/50 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              {gymPlans.map((plan: any) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  accentColor="#d4a017"
                  groupLabel={settings.pricing_module_gym_title ? settings.pricing_module_gym_title.split(" — ")[0] : "TRAINO GYM"}
                />
              ))}
            </div>
          )}
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
            tag={settings.pricing_module_hybrid_tag || "Módulo 3"}
            title={settings.pricing_module_hybrid_title || "TRAINO HYBRID — La Élite"}
            subtitle={settings.pricing_module_hybrid_subtitle || "Lo mejor de ambos mundos. El plan más rentable para el atleta serio."}
            color="#d4a017"
          />

          {loading ? (
            <div className="h-[400px] bg-zinc-900/50 animate-pulse border border-primary/20" />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              id="plan-athlete"
              className="relative border-2 border-primary bg-gradient-to-br from-primary/10 via-zinc-950 to-zinc-900 overflow-hidden rounded-2xl md:rounded-3xl shadow-[0_0_80px_-20px_rgba(212,160,23,0.5)]"
            >
              {/* Top accent bar */}
              <div className="bg-gradient-to-r from-primary via-primary-300 to-primary py-3 text-center px-4">
                <span className="text-xs md:text-sm font-black tracking-[0.2em] md:tracking-[0.4em] uppercase text-dark">
                  ⭐ THE RECOMMENDED CHOICE — RENDIMIENTO TOTAL ⭐
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left — Info */}
                <div className="p-8 md:p-14 border-b lg:border-b-0 lg:border-r border-white/5">
                  <span className="text-xs font-black tracking-[0.3em] uppercase text-primary mb-4 block">
                    {(settings.pricing_module_hybrid_title ? settings.pricing_module_hybrid_title.split(" — ")[0] : "TRAINO HYBRID") + " — " + (settings.pricing_module_hybrid_tag || "Módulo 3")}
                  </span>
                  <h3
                    className="text-5xl md:text-7xl font-black uppercase text-white leading-none mb-2"
                    style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
                  >
                    {athletePlan.name}
                  </h3>
                  <p className="text-primary font-bold uppercase tracking-wider text-sm mb-8">
                    {athletePlan.hook}
                  </p>

                  <div className="mb-8">
                    <span className="text-6xl font-black text-white">
                      {athletePlan.price}
                    </span>
                    <span className="text-gray-400 text-base ml-3">/mes</span>
                  </div>

                  <p className="text-gray-300 text-lg leading-relaxed mb-8">
                    {athletePlan.description}.{" "}
                    <span className="text-white font-semibold">
                      Sin restricciones. Sin excusas. Solo resultados.
                    </span>
                  </p>

                  <div className="flex">
                    <Link
                      to="/contacto"
                      id="plan-athlete-cta"
                      className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 bg-primary text-white hover:bg-white hover:text-dark font-black text-sm uppercase tracking-widest rounded-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shadow-[0_0_40px_-10px_rgba(212,160,23,0.6)]"
                    >
                      {athletePlan.cta}
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
                </div>

                {/* Right — Features */}
                <div className="p-10 lg:p-14">
                  <h4 className="text-xs font-black tracking-[0.3em] uppercase text-primary mb-8">
                    TODO INCLUIDO
                  </h4>
                  <ul className="space-y-5">
                    {athleteFeatures.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-5 h-5 rounded-none bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={11} className="text-primary" />
                        </div>
                        <span className="text-gray-200 text-base">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Psychology / Smart Savings Card */}
                  <div className="mt-10 p-6 bg-primary/5 border border-primary/20 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-base">💡</span>
                      <span className="text-[11px] font-black uppercase tracking-wider text-primary">
                        Análisis de Ahorro Inteligente
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Paso 1: Módulo Gym ({unlimitedGymPlan?.name || "Libre"})</span>
                        <span className="font-mono text-white">{gymPriceVal}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 border-b border-white/5 pb-2">
                        <span>Paso 2: Módulo Box ({unlimitedBoxPlan?.name || "RX"})</span>
                        <span className="font-mono text-white">{boxPriceVal}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Total Comprando por separado:</span>
                        <span className="font-mono line-through text-red-400">{formatCLP(combinedPrice)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-white bg-primary/10 p-2.5 rounded-lg border border-primary/20">
                        <span className="flex items-center gap-1">
                          ⚡ Plan {athletePlan.name} (Todo Incluido):
                        </span>
                        <span className="font-mono text-primary">{athletePriceVal}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed font-light">
                      En vez de pagar matrículas y mensualidades dobles, el plan{" "}
                      <span className="text-white font-bold">{athletePlan.name}</span> unifica
                      todo en una sola membresía inteligente.{" "}
                      <span className="text-emerald-400 font-bold">
                        ¡Ahorras {formatCLP(savings)} mensuales!
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Corner glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
            </motion.div>
          )}
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