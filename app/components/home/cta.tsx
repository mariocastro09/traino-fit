import { Link } from "react-router";
import { Section } from "~/components/ui/section";
import { Button } from "~/components/ui/button";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <Section className="relative overflow-hidden py-24">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark to-secondary/5 z-0" />
      
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">
            Tu Mejor Versión <span className="text-primary">Empieza Aquí</span>
          </h2>
          
          <p className="text-lg md:text-xl text-light/70 mb-10 leading-relaxed max-w-2xl mx-auto">
            Únete a una comunidad que te impulsa a superar tus límites. 
            Agenda tu clase de prueba y vive la experiencia Trainofit sin compromiso.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-8 py-6 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 group"
            >
              <Link to="/contacto">
                Comenzar Ahora
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="ghost" 
              size="lg"
              className="text-lg px-8 py-6 rounded-full text-light/70 hover:text-white hover:bg-white/5"
            >
              <Link to="/horario">
                Ver Horarios
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
