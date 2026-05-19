import { Layout } from "~/components/layout";
import { Section } from "~/components/ui/section";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Link } from "react-router";
import { Dumbbell, Users, Clock, Flame, TrendingUp, Heart } from "lucide-react";

export function meta() {
  return [
    { title: "Nuestras Clases - Trainofit | Programas de Entrenamiento CrossFit" },
    { name: "description", content: "Descubre nuestras clases de CrossFit diseñadas para todos los niveles. WODs variados, entrenamiento funcional y coaches certificados." },
  ];
}

export default function Clases() {
  return (
    <Layout>
      <Section className="section-sm">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Nuestras <span className="text-gradient">Clases</span>
          </h1>
          <p className="text-xl text-light/70 max-w-2xl mx-auto">
            Programas diseñados para transformar tu cuerpo y mente. Desde principiantes hasta atletas avanzados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <ClassCard
            title="CrossFit Fundamentals"
            description="Aprende los movimientos básicos con seguridad. Perfecto para principiantes que quieren empezar con el pie derecho."
            duration="60 min"
            intensity="Baja-Media"
            intensityLevel={2}
            icon={Heart}
          />
          <ClassCard
            title="CrossFit WOD"
            description="El entrenamiento del día completo. Combinación de cardio, fuerza y movimientos funcionales."
            duration="60 min"
            intensity="Media-Alta"
            intensityLevel={3}
            icon={Flame}
            featured
          />
          <ClassCard
            title="CrossFit Competition"
            description="Para atletas avanzados que buscan llevar su rendimiento al siguiente nivel. Enfoque en competencia."
            duration="90 min"
            intensity="Alta"
            intensityLevel={4}
            icon={TrendingUp}
          />
          <ClassCard
            title="Olympic Lifting"
            description="Técnica de levantamiento olímpico. Snatch, Clean & Jerk con énfasis en forma perfecta."
            duration="60 min"
            intensity="Media"
            intensityLevel={2}
            icon={Dumbbell}
          />
          <ClassCard
            title="CrossFit Kids & Teens"
            description="Programas adaptados para jóvenes atletas. Diversión, fitness y desarrollo de habilidades."
            duration="45 min"
            intensity="Media"
            intensityLevel={2}
            icon={Users}
          />
          <ClassCard
            title="Open Gym"
            description="Entrena a tu ritmo con acceso completo al equipamiento. Coaches disponibles para consultas."
            duration="Flexible"
            intensity="Variable"
            intensityLevel={1}
            icon={Clock}
          />
        </div>

        {/* What to Expect */}
        <div className="bg-secondary/30 rounded-2xl p-8 md:p-12 mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            ¿Qué Esperar en una Clase?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ExpectationItem
              number="1"
              title="Warm-up (10 min)"
              description="Movilidad y activación muscular para preparar tu cuerpo"
            />
            <ExpectationItem
              number="2"
              title="Skill/Strength (20 min)"
              description="Trabajo técnico o fuerza enfocado en movimientos específicos"
            />
            <ExpectationItem
              number="3"
              title="WOD (20-30 min)"
              description="El entrenamiento del día: donde das todo y alcanzas tu máximo"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-primary via-primary-600 to-primary-700 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">
            Tu Primera Clase es GRATIS
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Prueba cualquiera de nuestras clases sin compromiso. Descubre por qué somos diferentes.
          </p>
          <Link to="/contacto" className="btn bg-white text-primary hover:bg-light/90 text-lg">
            Reservar Clase Gratuita
          </Link>
        </div>
      </Section>
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
}: {
  title: string;
  description: string;
  duration: string;
  intensity: string;
  intensityLevel: number;
  icon: React.ElementType;
  featured?: boolean;
}) {
  return (
    <Card className={`animate-fade-in-up ${featured ? "border-primary" : ""}`}>
      <CardHeader>
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Icon className="text-primary" size={28} />
          </div>
          {featured && <Badge variant="accent">Más Popular</Badge>}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">{description}</CardDescription>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-light/70">
            <Clock size={16} className="text-primary" />
            <span>Duración: {duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-primary" />
            <span className="text-light/70">Intensidad: </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-2 w-2 rounded-full ${
                    level <= intensityLevel ? "bg-primary" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
            <span className="text-light/70 text-xs">({intensity})</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link to="/horario" className="btn btn-outline w-full">
          Ver Horarios
        </Link>
      </CardFooter>
    </Card>
  );
}

function ExpectationItem({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-primary text-dark font-bold flex items-center justify-center text-xl mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-light/70">{description}</p>
    </div>
  );
}