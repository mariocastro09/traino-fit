import { Dumbbell, Target, Trophy, Users } from "lucide-react";
import { Section } from "~/components/ui/section";

export function Stats() {
  return (
    <Section className="bg-gradient-to-br from-primary/10 via-transparent to-accent/10 relative z-20 -mt-20 pt-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <StatCard number="500+" label="Miembros Activos" icon={Users} />
        <StatCard number="50+" label="Clases Semanales" icon={Dumbbell} />
        <StatCard number="10+" label="Coaches Certificados" icon={Trophy} />
        <StatCard number="100%" label="Resultados Garantizados" icon={Target} />
      </div>
    </Section>
  );
}

function StatCard({ number, label, icon: Icon }: { number: string; label: string; icon: React.ElementType }) {
  return (
    <div className="text-center group hover:-translate-y-1 transition-transform duration-300">
      <div className="mb-4 inline-flex p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
        <Icon className="text-primary" size={32} />
      </div>
      <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">{number}</div>
      <div className="text-gray-400 font-medium">{label}</div>
    </div>
  );
}
