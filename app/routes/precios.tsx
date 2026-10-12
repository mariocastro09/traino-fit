import { Layout } from "~/components/layout";
import { Section } from "~/components/ui/section";
import { Link } from "react-router";
import { ArrowRight, Check } from "lucide-react";
import type { Route } from "./+types/precios";
import { d1, getActivePlans, getPublicSettings, orFallback } from "../../server/public-data";
import { pageMeta, whatsappLink } from "~/lib/site";
import { cn } from "~/lib/utils";

export function meta() {
  return pageMeta({
    title: "Precios — TrainoFit",
    description:
      "Elige tu plan: TrainoBox, TrainoGym o el sistema híbrido ATHLETE. Precios transparentes, sin cargos ocultos.",
    path: "/precios",
  });
}

// ──────────────────────────────────────────────
// DATA (FALLBACK DEFAULTS)
// ──────────────────────────────────────────────

type Plan = {
  id: number;
  name: string;
  moduleName: string;
  hook: string | null;
  price: string;
  description: string | null;
  features: string;
  featured: boolean | null;
  cta: string;
};

const defaultPlans: Plan[] = [
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
  },
];

export async function loader({ context }: Route.LoaderArgs) {
  const [plans, settings] = await Promise.all([
    orFallback<Plan[]>(() => getActivePlans(d1(context)), []),
    orFallback(() => getPublicSettings(d1(context)), {}),
  ]);
  return { plans: plans.length > 0 ? plans : defaultPlans, settings };
}

const splitFeatures = (features: string) => features.split(",").filter(Boolean);
const priceNumber = (price: string) => parseInt(price.replace(/[^0-9]/g, ""), 10) || 0;
const formatCLP = (value: number) => "$" + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// ──────────────────────────────────────────────
// COMPONENTS
// ──────────────────────────────────────────────

function PlanCard({ plan, groupLabel, index }: { plan: Plan; groupLabel: string; index: number }) {
  return (
    <li
      id={`plan-${plan.id}`}
      style={{ "--i": index } as React.CSSProperties}
      className={cn(
        "flex flex-col border reveal hover:-translate-y-1.5",
        plan.featured ? "border-primary bg-primary/5" : "border-white/10 bg-zinc-900/60"
      )}
    >
      {plan.featured && (
        <p className="bg-primary text-dark py-2 text-center text-xs font-black tracking-[0.2em] uppercase">
          Recomendado
        </p>
      )}

      <div className="p-8 flex flex-col flex-1">
        <p className="eyebrow mb-3">{groupLabel}</p>

        <h3 className="font-display text-5xl uppercase text-white leading-none mb-1">
          {plan.name}
        </h3>
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-6">{plan.hook}</p>

        <p className="mb-6">
          <span className="text-4xl font-black text-white tabular-nums">{plan.price}</span>
          <span className="text-gray-400 text-xs ml-2">/mes</span>
        </p>

        <p className="text-gray-300 text-sm mb-6">{plan.description}</p>

        <ul className="space-y-3 mb-8 flex-1">
          {splitFeatures(plan.features).map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check size={16} className="text-primary mt-0.5 shrink-0" aria-hidden />
              <span className="text-gray-300 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <Link viewTransition
          to={`/contacto?plan=${encodeURIComponent(plan.name)}`}
          aria-label={`${plan.cta}: plan ${plan.name}`}
          className={cn(
            "flex items-center justify-center gap-2 py-3 font-black text-xs uppercase tracking-widest transition-colors duration-200",
            plan.featured
              ? "bg-primary text-dark hover:bg-primary-300"
              : "border border-white/20 text-white hover:bg-white hover:text-dark"
          )}
        >
          {plan.cta}
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </li>
  );
}

function ModuleHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle: string }) {
  return (
    <div className="mb-10 reveal">
      <p className="eyebrow mb-3">{tag}</p>
      <h2 className="font-display text-4xl md:text-5xl uppercase text-white leading-none mb-3">
        {title}
      </h2>
      <p className="text-gray-400 text-sm max-w-lg">{subtitle}</p>
    </div>
  );
}

// ──────────────────────────────────────────────
// PAGE
// ──────────────────────────────────────────────

export default function Precios({ loaderData }: Route.ComponentProps) {
  const { plans, settings } = loaderData;

  const boxPlans = plans.filter((p) => p.moduleName === "TRAINO BOX");
  const gymPlans = plans.filter((p) => p.moduleName === "TRAINO GYM");
  const athletePlan = plans.find((p) => p.moduleName === "TRAINO HYBRID");

  // Savings of the hybrid plan versus buying both unlimited plans separately
  const unlimitedGym = gymPlans.find((p) => p.name === "LIBRE") || gymPlans.at(-1);
  const unlimitedBox = boxPlans.find((p) => p.name === "RX") || boxPlans.at(-1);
  const combinedPrice =
    unlimitedGym && unlimitedBox
      ? priceNumber(unlimitedGym.price) + priceNumber(unlimitedBox.price)
      : 0;
  const savings = athletePlan ? combinedPrice - priceNumber(athletePlan.price) : 0;

  const moduleTitle = (id: "box" | "gym" | "hybrid", fallback: string) =>
    settings[`pricing_module_${id}_title`] || fallback;
  const groupLabel = (title: string) => title.split(" — ")[0];

  // "[word]" in the admin-edited title marks the highlighted part
  const heroTitle = (settings.pricing_hero_title || "EL PLAN [PERFECTO] PARA TI")
    .split(/\[(.*?)\]/)
    .map((part, i) =>
      i % 2 === 1 ? <span key={i} className="text-primary">{part}</span> : part
    );

  const boxTitle = moduleTitle("box", "TRAINO BOX — La Comunidad");
  const gymTitle = moduleTitle("gym", "TRAINO GYM — La Libertad");
  const hybridTitle = moduleTitle("hybrid", "TRAINO HYBRID — La Élite");

  return (
    <Layout>
      {/* Page Header — Video Background */}
      <div className="relative isolate overflow-hidden h-[60dvh] min-h-[420px]">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/magnesio-poster.jpg"
          aria-hidden
          className="absolute inset-0 -z-10 size-full object-cover"
        >
          <source src="/magnesio-web.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-black/75" />

        <div className="h-full flex flex-col items-center justify-center text-center px-6">
          <p className="eyebrow mb-6">{settings.pricing_hero_badge || "Arquitectura de Precios"}</p>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl uppercase text-white mb-4 leading-none">
            {heroTitle}
          </h1>
          <p className="text-base md:text-lg text-gray-200 max-w-xl mx-auto">
            {settings.pricing_hero_subtitle || "Sin cargos ocultos. Sin contratos largos. Solo resultados."}
          </p>
        </div>
      </div>

      <Section className="bg-zinc-950">
        {/* ─── MODULE 1: TRAINO BOX ─── */}
        <div className="pb-16 mb-16 border-b border-white/10">
          <ModuleHeader
            tag={settings.pricing_module_box_tag || "Módulo 1"}
            title={boxTitle}
            subtitle={settings.pricing_module_box_subtitle || "Coaching, comunidad y WODs de alto rendimiento. Para quienes buscan superarse en equipo."}
          />
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boxPlans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} index={i} groupLabel={groupLabel(boxTitle)} />
            ))}
          </ul>
        </div>

        {/* ─── MODULE 2: TRAINO GYM ─── */}
        <div className="pb-16 mb-16 border-b border-white/10">
          <ModuleHeader
            tag={settings.pricing_module_gym_tag || "Módulo 2"}
            title={gymTitle}
            subtitle={settings.pricing_module_gym_subtitle || "Autonomía total, fuerza bruta y equipamiento de última generación. Entrena bajo tus propias reglas."}
          />
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            {gymPlans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} index={i} groupLabel={groupLabel(gymTitle)} />
            ))}
          </ul>
        </div>

        {/* ─── MODULE 3: ATHLETE — THE BIG CARD ─── */}
        {athletePlan && (
          <div>
            <ModuleHeader
              tag={settings.pricing_module_hybrid_tag || "Módulo 3"}
              title={hybridTitle}
              subtitle={settings.pricing_module_hybrid_subtitle || "Lo mejor de ambos mundos. El plan más rentable para el atleta serio."}
            />

            <div id="plan-athlete" className="border-2 border-primary bg-primary/5 reveal">
              <p className="bg-primary text-dark py-3 px-4 text-center text-xs md:text-sm font-black tracking-[0.2em] uppercase">
                La opción recomendada — Rendimiento total
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left — Info */}
                <div className="p-8 md:p-14 border-b lg:border-b-0 lg:border-r border-white/10">
                  <p className="eyebrow mb-4">{groupLabel(hybridTitle)}</p>
                  <h3 className="font-display text-7xl md:text-9xl uppercase text-white leading-none mb-2">
                    {athletePlan.name}
                  </h3>
                  <p className="text-primary font-bold uppercase tracking-wider text-sm mb-8">
                    {athletePlan.hook}
                  </p>

                  <p className="mb-8">
                    <span className="text-6xl font-black text-white tabular-nums">{athletePlan.price}</span>
                    <span className="text-gray-400 text-base ml-3">/mes</span>
                  </p>

                  <p className="text-gray-300 text-lg leading-relaxed mb-8">
                    {athletePlan.description}.{" "}
                    <span className="text-white font-semibold">
                      Sin restricciones. Sin excusas. Solo resultados.
                    </span>
                  </p>

                  <Link viewTransition
                    to={`/contacto?plan=${encodeURIComponent(athletePlan.name)}`}
                    id="plan-athlete-cta"
                    className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 bg-primary text-dark hover:bg-primary-300 font-black text-sm uppercase tracking-widest transition-colors duration-200"
                  >
                    {athletePlan.cta}
                    <ArrowRight size={18} aria-hidden />
                  </Link>
                </div>

                {/* Right — Features */}
                <div className="p-8 md:p-14">
                  <h4 className="eyebrow mb-8">Todo incluido</h4>
                  <ul className="space-y-5">
                    {splitFeatures(athletePlan.features).map((feature) => (
                      <li key={feature} className="flex items-start gap-4">
                        <Check size={18} className="text-primary shrink-0 mt-0.5" aria-hidden />
                        <span className="text-gray-200 text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Savings breakdown */}
                  {unlimitedGym && unlimitedBox && savings > 0 && (
                    <div className="mt-10 p-6 border border-primary/30 bg-zinc-950">
                      <p className="eyebrow mb-4">Cuánto ahorras</p>
                      <dl className="space-y-3 mb-4 text-sm text-gray-400 tabular-nums">
                        <div className="flex justify-between gap-4">
                          <dt>Gym {unlimitedGym.name}</dt>
                          <dd className="text-white">{unlimitedGym.price}</dd>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                          <dt>Box {unlimitedBox.name}</dt>
                          <dd className="text-white">{unlimitedBox.price}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt>Por separado</dt>
                          <dd className="line-through">{formatCLP(combinedPrice)}</dd>
                        </div>
                        <div className="flex justify-between gap-4 font-bold text-white">
                          <dt>Plan {athletePlan.name}</dt>
                          <dd className="text-primary">{athletePlan.price}</dd>
                        </div>
                      </dl>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Una sola membresía en vez de dos:{" "}
                        <span className="text-primary font-bold">
                          ahorras {formatCLP(savings)} al mes.
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Note */}
        <p className="mt-16 text-center text-gray-400 text-sm">
          ¿Tienes preguntas sobre nuestros planes?{" "}
          <a
            href={whatsappLink("Hola TrainoFit! Necesito ayuda para elegir un plan.")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4 hover:text-primary-300"
          >
            Escríbenos por WhatsApp
          </a>{" "}
          y te ayudamos a elegir.
        </p>
      </Section>
    </Layout>
  );
}
