import { Dumbbell, Heart, TrendingUp, Users, Zap, Trophy } from "lucide-react";
import { Section } from "~/components/ui/section";
import { motion } from "motion/react";

const features = [
  {
    icon: Dumbbell,
    title: "Entrenamiento Funcional",
    description: "Ejercicios variados y escalables para todos los niveles. Desde principiantes hasta atletas avanzados.",
  },
  {
    icon: Heart,
    title: "Comunidad Motivadora",
    description: "Entrena junto a personas apasionadas que te impulsan a superar tus límites cada día.",
  },
  {
    icon: TrendingUp,
    title: "Resultados Medibles",
    description: "Seguimiento de tu progreso con métricas claras. Ve cómo mejoras semana a semana.",
  },
  {
    icon: Zap,
    title: "Clases Dinámicas",
    description: "WODs programados por coaches certificados. Nunca te aburrirás con nuestra variedad.",
  },
  {
    icon: Users,
    title: "Coaches Expertos",
    description: "Equipo certificado y comprometido con tu seguridad y progreso personal.",
  },
  {
    icon: Trophy,
    title: "Instalaciones Premium",
    description: "Equipamiento de primera calidad en un espacio diseñado para el alto rendimiento.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function Features() {
  return (
    <Section className="relative overflow-hidden py-24">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight"
          >
            ¿Por qué elegir <span className="text-primary">Trainofit</span>?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-light/70 max-w-2xl mx-auto font-light"
          >
            No somos solo un gimnasio, somos una comunidad comprometida con tu transformación
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <motion.div variants={itemVariants}>
      <div className="h-full p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all duration-300 group cursor-default relative overflow-hidden">
        
        {/* Hover Glow Effect */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <div className="mb-6 inline-flex p-4 rounded-xl bg-dark/50 border border-white/10 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 shadow-lg">
            <Icon className="text-primary group-hover:text-white transition-colors duration-300" size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          
          <p className="text-light/60 leading-relaxed group-hover:text-light/80 transition-colors duration-300">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
