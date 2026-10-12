import { useState, useEffect } from "react";
import { Layout } from "~/components/layout";
import { Section } from "~/components/ui/section";
import { Link } from "react-router";
import { Dumbbell, Users, Clock, Flame, TrendingUp, Heart, ArrowRight } from "lucide-react";
import type { Route } from "./+types/clases";
import { d1, getActiveClassTypes, orFallback } from "../../server/public-data";
import { pageMeta } from "~/lib/site";
import { cn } from "~/lib/utils";

export function meta() {
  return pageMeta({
    title: "Clases — TrainoFit",
    description:
      "Descubre nuestras clases de CrossFit diseñadas para todos los niveles. WODs variados, entrenamiento funcional y coaches certificados.",
    path: "/clases",
  });
}

const defaultClasses = [
  {
    name: "CrossFit Fundamentals",
    description: "Aprende los movimientos básicos con seguridad y técnica impecable. Perfecto para principiantes que quieren empezar con el pie derecho."
  },
  {
    name: "CrossFit WOD",
    description: "El entrenamiento del día completo. Combinación de cardio, fuerza y movimientos gimnásticos para un estímulo funcional integral."
  },
  {
    name: "CrossFit Competition",
    description: "Para atletas avanzados que buscan llevar su rendimiento al siguiente nivel. Enfoque en volumen, cargas pesadas y estrategia de competencia."
  },
  {
    name: "Olympic Lifting",
    description: "Técnica de levantamiento olímpico. Snatch, Clean & Jerk con énfasis en la velocidad, movilidad y forma perfecta."
  },
  {
    name: "CrossFit Kids & Teens",
    description: "Programas adaptados para jóvenes atletas. Diversión, fitness funcional y desarrollo de habilidades motoras en un ambiente seguro."
  },
  {
    name: "Open Gym",
    description: "Entrena a tu propio ritmo con acceso completo a todo el equipamiento del box. Coaches de piso disponibles para asesoría."
  }
];

export async function loader({ context }: Route.LoaderArgs) {
  const classTypes = await orFallback(() => getActiveClassTypes(d1(context)), []);
  return {
    classes: (classTypes.length > 0 ? classTypes : defaultClasses).map((c) => ({
      name: c.name,
      description: c.description || "",
    })),
  };
}

const getMetaByName = (name: string) => {
  const norm = name.toLowerCase();
  if (norm.includes("wod")) {
    return { duration: "60 min", intensity: "Media-Alta", intensityLevel: 3, icon: Flame, featured: true };
  }
  if (norm.includes("fundamentals") || norm.includes("fundamentos")) {
    return { duration: "60 min", intensity: "Baja-Media", intensityLevel: 2, icon: Heart, featured: false };
  }
  if (norm.includes("compet") || norm.includes("avanzado")) {
    return { duration: "90 min", intensity: "Alta", intensityLevel: 4, icon: TrendingUp, featured: false };
  }
  if (norm.includes("kids") || norm.includes("teens") || norm.includes("niño")) {
    return { duration: "45 min", intensity: "Media", intensityLevel: 2, icon: Users, featured: false };
  }
  if (norm.includes("open") || norm.includes("libre")) {
    return { duration: "Flexible", intensity: "Variable", intensityLevel: 1, icon: Clock, featured: false };
  }
  return { duration: "60 min", intensity: "Media", intensityLevel: 2, icon: Dumbbell, featured: false };
};

const EXPECTATIONS = [
  {
    title: "Warm-up (10 min)",
    description: "Movilidad articular y activación cardiovascular para preparar tu cuerpo de manera segura.",
  },
  {
    title: "Skill / Strength (20 min)",
    description: "Trabajo enfocado en el desarrollo de la fuerza o refinamiento de habilidades gimnásticas y de halterofilia.",
  },
  {
    title: "WOD (20-30 min)",
    description: "El 'Workout of the Day': la fase de alta intensidad donde aplicas lo aprendido bajo fatiga y superas tus límites.",
  },
];

export default function Clases({ loaderData }: Route.ComponentProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem("admin_session"));
  }, []);

  return (
    <Layout>
      <Section className="bg-zinc-950 text-white">
        {/* Admin Banner */}
        {isAdmin && (
          <div className="mb-12 p-5 border border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="text-sm font-black tracking-wider uppercase text-white mb-1">
                Sesión de administrador activa
              </p>
              <p className="text-xs text-gray-400">
                Puedes administrar las clases directamente desde el panel de administración.
              </p>
            </div>
            <Link
              to="/admin?tab=classTypes"
              className="px-5 py-2.5 bg-primary text-dark text-xs font-black tracking-widest uppercase hover:bg-primary-300 transition-colors duration-200 whitespace-nowrap"
            >
              Administrar clases
            </Link>
          </div>
        )}

        {/* Heading */}
        <div className="text-center mb-16">
          <p className="eyebrow mb-4">Programas</p>
          <h1 className="font-display text-6xl md:text-8xl uppercase leading-none mb-4">
            Nuestras <span className="text-primary">Clases</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Programas diseñados para transformar tu cuerpo y mente. Desde acondicionamiento básico hasta rendimiento de competencia.
          </p>
        </div>

        {/* Classes Grid */}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-24">
          {loaderData.classes.map((item) => (
            <ClassCard key={item.name} title={item.name} description={item.description} isAdmin={isAdmin} />
          ))}
        </ul>

        {/* What to Expect */}
        <div className="border border-white/10 bg-zinc-900/40 p-8 md:p-16 mb-24 reveal">
          <h2 className="font-display text-5xl md:text-6xl uppercase mb-12 text-center leading-none">
            ¿Qué esperar en una <span className="text-primary">clase</span>?
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {EXPECTATIONS.map((step, i) => (
              <li key={step.title} className="text-center">
                <span className="size-14 rounded-full bg-primary/10 border-2 border-primary/40 text-primary font-black tabular-nums flex items-center justify-center text-xl mx-auto mb-6" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wider">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* CTA Section */}
        <div className="border border-primary/30 bg-primary/5 p-10 md:p-16 text-center reveal">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-5xl md:text-7xl uppercase leading-none mb-4">
              Tu primera clase es <span className="text-primary">gratis</span>
            </h2>
            <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed">
              Prueba cualquiera de nuestros programas guiados por coaches certificados. Experimenta la energía de la comunidad Trainofit sin compromiso.
            </p>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-dark hover:bg-primary-300 font-black text-sm uppercase tracking-widest transition-colors duration-200"
            >
              Reservar mi clase gratis
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </Section>
    </Layout>
  );
}

function ClassCard({
  title,
  description,
  isAdmin,
}: {
  title: string;
  description: string;
  isAdmin: boolean;
}) {
  const { duration, intensity, intensityLevel, icon: Icon, featured } = getMetaByName(title);

  return (
    <li
      className={cn(
        "bg-zinc-900/60 border flex flex-col justify-between reveal",
        featured ? "border-primary/50" : "border-white/10"
      )}
    >
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <span className="p-3.5 bg-primary/10 border border-primary/30 text-primary">
            <Icon size={24} aria-hidden />
          </span>
          {featured && (
            <span className="bg-primary text-dark px-3 py-1 font-black text-[10px] tracking-widest uppercase">
              Más Popular
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-6">{description}</p>

        <dl className="space-y-3.5 pt-4 border-t border-white/10 text-xs">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-primary" aria-hidden />
            <dt className="font-semibold uppercase tracking-wider text-gray-300">Duración:</dt>
            <dd className="text-gray-400">{duration}</dd>
          </div>
          <div className="flex items-center gap-3">
            <Flame size={16} className="text-primary" aria-hidden />
            <dt className="font-semibold uppercase tracking-wider text-gray-300">Intensidad:</dt>
            <dd className="flex items-center gap-3 text-gray-400">
              <span className="flex gap-1.5" aria-hidden>
                {[1, 2, 3, 4].map((level) => (
                  <span
                    key={level}
                    className={cn("h-1.5 w-6", level <= intensityLevel ? "bg-primary" : "bg-white/10")}
                  />
                ))}
              </span>
              {intensity}
            </dd>
          </div>
        </dl>
      </div>

      <div className="p-8 pt-0 flex flex-col gap-2.5">
        <Link
          to="/horario"
          aria-label={`Ver horarios de ${title}`}
          className="text-center py-3.5 bg-white/5 border border-white/15 text-white font-bold text-xs tracking-wider uppercase hover:bg-white hover:text-dark transition-colors duration-200"
        >
          Ver Horarios
        </Link>
        {isAdmin && (
          <Link
            to="/admin?tab=classTypes"
            className="text-center py-2.5 border border-primary/30 text-primary bg-primary/5 font-bold text-[10px] tracking-wider uppercase hover:bg-primary hover:text-dark transition-colors duration-200"
          >
            Editar Clase
          </Link>
        )}
      </div>
    </li>
  );
}
