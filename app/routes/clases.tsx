import { useState, useEffect } from "react";
import { Layout } from "~/components/layout";
import { Section } from "~/components/ui/section";
import { Badge } from "~/components/ui/badge";
import { Link } from "react-router";
import { Dumbbell, Users, Clock, Flame, TrendingUp, Heart, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export function meta() {
  return [
    { title: "Nuestras Clases - Trainofit | Programas de Entrenamiento CrossFit" },
    { name: "description", content: "Descubre nuestras clases de CrossFit diseñadas para todos los niveles. WODs variados, entrenamiento funcional y coaches certificados." },
  ];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function Clases() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdmin(!!localStorage.getItem("admin_session"));
    }
  }, []);

  return (
    <Layout>
      <div className="relative bg-gray-950 text-white overflow-hidden py-16">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

        <Section className="section-sm relative z-10">
          {/* Admin Banner */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 p-5 border border-primary/30 bg-primary/5 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 rounded-none text-center sm:text-left"
            >
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <p className="text-sm font-black tracking-wider uppercase text-white">Sesión de administrador activa</p>
                </div>
                <p className="text-xs text-gray-400">Puedes administrar las clases directamente desde el panel de administración.</p>
              </div>
              <Link
                to="/admin?tab=classTypes"
                className="px-5 py-2.5 bg-primary text-dark rounded-none text-xs font-black tracking-widest uppercase hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-primary/15 whitespace-nowrap"
              >
                Ir a Administrador de Clases
              </Link>
            </motion.div>
          )}

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1
              className="text-6xl md:text-8xl font-black tracking-wider uppercase mb-4"
              style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
            >
              Nuestras <span className="text-gradient drop-shadow-[0_0_20px_rgba(212,160,23,0.2)]">Clases</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed px-4">
              Programas diseñados para transformar tu cuerpo y mente. Desde acondicionamiento básico hasta rendimiento de competencia.
            </p>
          </motion.div>

          {/* Classes Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 px-4"
          >
            <ClassCard
              title="CrossFit Fundamentals"
              description="Aprende los movimientos básicos con seguridad y técnica impecable. Perfecto para principiantes que quieren empezar con el pie derecho."
              duration="60 min"
              intensity="Baja-Media"
              intensityLevel={2}
              icon={Heart}
              isAdmin={isAdmin}
            />
            <ClassCard
              title="CrossFit WOD"
              description="El entrenamiento del día completo. Combinación de cardio, fuerza y movimientos gimnásticos para un estímulo funcional integral."
              duration="60 min"
              intensity="Media-Alta"
              intensityLevel={3}
              icon={Flame}
              featured
              isAdmin={isAdmin}
            />
            <ClassCard
              title="CrossFit Competition"
              description="Para atletas avanzados que buscan llevar su rendimiento al siguiente nivel. Enfoque en volumen, cargas pesadas y estrategia de competencia."
              duration="90 min"
              intensity="Alta"
              intensityLevel={4}
              icon={TrendingUp}
              isAdmin={isAdmin}
            />
            <ClassCard
              title="Olympic Lifting"
              description="Técnica de levantamiento olímpico. Snatch, Clean & Jerk con énfasis en la velocidad, movilidad y forma perfecta."
              duration="60 min"
              intensity="Media"
              intensityLevel={2}
              icon={Dumbbell}
              isAdmin={isAdmin}
            />
            <ClassCard
              title="CrossFit Kids & Teens"
              description="Programas adaptados para jóvenes atletas. Diversión, fitness funcional y desarrollo de habilidades motoras en un ambiente seguro."
              duration="45 min"
              intensity="Media"
              intensityLevel={2}
              icon={Users}
              isAdmin={isAdmin}
            />
            <ClassCard
              title="Open Gym"
              description="Entrena a tu propio ritmo con acceso completo a todo el equipamiento del box. Coaches de piso disponibles para asesoría."
              duration="Flexible"
              intensity="Variable"
              intensityLevel={1}
              icon={Clock}
              isAdmin={isAdmin}
            />
          </motion.div>

          {/* What to Expect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="border border-white/5 bg-zinc-900/20 backdrop-blur-md p-10 md:p-16 mb-24 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />
            <h2
              className="text-4xl md:text-5xl font-black tracking-wider uppercase mb-12 text-center"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              ¿Qué esperar en una <span className="text-primary">clase</span>?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              {/* Horizontal line for desktop flow */}
              <div className="absolute top-1/2 left-8 right-8 h-px bg-white/5 -translate-y-1/2 hidden md:block z-0" />

              <ExpectationItem
                number="01"
                title="Warm-up (10 min)"
                description="Movilidad articular y activación cardiovascular para preparar tu cuerpo de manera segura."
              />
              <ExpectationItem
                number="02"
                title="Skill / Strength (20 min)"
                description="Trabajo enfocado en el desarrollo de la fuerza o refinamiento de habilidades gimnásticas y de halterofilia."
              />
              <ExpectationItem
                number="03"
                title="WOD (20-30 min)"
                description="El 'Workout of the Day': la fase de alta intensidad donde aplicas lo aprendido bajo fatiga y superas tus límites."
              />
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative border border-white/10 bg-gradient-to-br from-zinc-900 via-gray-950 to-zinc-900 p-12 md:p-16 text-center overflow-hidden"
          >
            {/* Background blobs */}
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-accent/5 blur-[80px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2
                className="text-4xl md:text-6xl font-black uppercase tracking-wider mb-4"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Tu primera clase es <span className="text-gradient drop-shadow-[0_0_15px_rgba(212,160,23,0.3)]">GRATIS</span>
              </h2>
              <p className="text-gray-400 text-base md:text-lg mb-8 font-light leading-relaxed">
                Prueba cualquiera de nuestros programas guiados por coaches certificados. Experimenta la energía de la comunidad Trainofit sin compromiso.
              </p>
              <Link
                to="/contacto"
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white hover:bg-primary-600 font-black text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-[0_0_30px_-5px_rgba(212,160,23,0.4)]"
              >
                Reservar Clase Gratuita
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </Section>
      </div>
    </Layout>
  );
}

function ClassCard({
  title,
  description,
  duration,
  intensity,
  intensityLevel,
  icon: Icon,
  featured = false,
  isAdmin = false,
}: {
  title: string;
  description: string;
  duration: string;
  intensity: string;
  intensityLevel: number;
  icon: React.ElementType;
  featured?: boolean;
  isAdmin?: boolean;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={`bg-zinc-900/40 backdrop-blur-md border border-white/5 hover:border-primary/30 transition-all duration-500 rounded-none relative overflow-hidden flex flex-col justify-between group h-full ${featured ? "shadow-[0_0_30px_-10px_rgba(212,160,23,0.15)] border-primary/20" : ""
        }`}
    >
      {/* Top golden border on hover */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

      {/* Card Body */}
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3.5 bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-all duration-300">
            <Icon className="text-primary" size={24} />
          </div>
          {featured && (
            <Badge className="bg-accent text-dark border-transparent rounded-none px-3 py-1 font-black text-[10px] tracking-widest uppercase animate-pulse flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,107,53,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-dark" />
              Más Popular
            </Badge>
          )}
        </div>

        <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-6 font-light">{description}</p>

        <div className="space-y-3.5 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3 text-gray-300">
            <Clock size={16} className="text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider">Duración:</span>
            <span className="text-xs text-gray-400 font-light">{duration}</span>
          </div>
          <div className="flex items-center gap-3">
            <Flame size={16} className="text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">Intensidad:</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 w-6 transition-all duration-500 ${level <= intensityLevel
                      ? "bg-primary shadow-[0_0_6px_rgba(212,160,23,0.4)]"
                      : "bg-white/10"
                    }`}
                />
              ))}
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">({intensity})</span>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-8 pt-0 flex flex-col gap-2.5">
        <Link
          to="/horario"
          className="w-full text-center py-3.5 bg-white/5 border border-white/10 text-white font-bold text-xs tracking-wider uppercase rounded-none hover:bg-white hover:text-dark transition-all duration-300"
        >
          Ver Horarios
        </Link>
        {isAdmin && (
          <Link
            to="/admin?tab=classTypes"
            className="w-full text-center py-2.5 border border-primary/20 text-primary bg-primary/5 font-bold text-[10px] tracking-wider uppercase rounded-none hover:bg-primary hover:text-dark transition-all duration-300"
          >
            Editar Clase
          </Link>
        )}
      </div>
    </motion.div>
  );
}

function ExpectationItem({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative text-center group z-10">
      <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/30 text-primary font-black flex items-center justify-center text-xl mx-auto mb-6 group-hover:scale-115 group-hover:border-primary group-hover:shadow-[0_0_15px_rgba(212,160,23,0.4)] transition-all duration-500">
        {number}
      </div>
      <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wider">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed font-light px-4">{description}</p>
    </div>
  );
}