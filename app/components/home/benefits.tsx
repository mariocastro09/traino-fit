import { ArrowRight, Dumbbell } from "lucide-react";
import { Link } from "react-router";
import { Section } from "~/components/ui/section";

export function Benefits() {
  return (
    <Section className="bg-secondary/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        <div className="space-y-6 lg:space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Ejercicio, Vida Sana y <span className="text-primary">Salud</span>
          </h2>
          <p className="text-base md:text-lg text-gray-300 leading-relaxed">
            En Trainofit creemos que el fitness es más que levantar pesas. Es un estilo de vida
            completo que abarca:
          </p>
          <ul className="space-y-3">
            <BenefitItem text="Mejora tu fuerza, resistencia y movilidad" />
            <BenefitItem text="Aumenta tu confianza y bienestar mental" />
            <BenefitItem text="Forma parte de una comunidad que te apoya" />
            <BenefitItem text="Desarrolla hábitos saludables para toda la vida" />
          </ul>
          <Link 
            to="/clases" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-dark font-bold rounded-lg hover:bg-primary-600 transition-colors text-sm md:text-base"
          >
            Comienza Tu Transformación
            <ArrowRight size={18} />
          </Link>
        </div>
        <div className="relative mt-8 lg:mt-0">
          <div className="glass rounded-2xl p-6 md:p-8 space-y-6 border border-white/10 bg-white/5 backdrop-blur-md">
            <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
              <Dumbbell size={80} className="text-primary relative z-10 drop-shadow-[0_0_15px_rgba(var(--color-primary),0.5)] group-hover:scale-110 transition-transform duration-500 md:w-32 md:h-32" />
            </div>
            <p className="text-center text-gray-300 italic text-base md:text-lg font-light">
              "El CrossFit cambió mi vida. No solo mi físico, sino mi mentalidad completa."
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 group">
      <div className="mt-1 p-1 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
        <div className="w-2 h-2 rounded-full bg-primary" />
      </div>
      <span className="text-lg text-gray-300 group-hover:text-white transition-colors">{text}</span>
    </li>
  );
}
