import { Layout } from "~/components/layout";
import { Section } from "~/components/ui/section";
import { PageHero } from "~/components/page-hero";
import { Instagram, ExternalLink, Check, Dumbbell, Flame, Trophy, Users, Zap, Timer } from "lucide-react";
import { INSTAGRAM_URL, pageMeta } from "~/lib/site";

export function meta() {
  return pageMeta({
    title: "Instagram — TrainoFit",
    description:
      "Síguenos en Instagram @trainofit para ver WODs del día, transformaciones y entrenamientos de la comunidad en Puente Alto.",
    path: "/instagram",
  });
}

const TOPICS = [
  { label: "WODs", icon: Flame },
  { label: "PRs", icon: Trophy },
  { label: "Equipo", icon: Users },
  { label: "Box", icon: Timer },
  { label: "Hybrid", icon: Zap },
  { label: "Gym", icon: Dumbbell },
];

const HIGHLIGHTS = [
  "WODs diarios y consejos técnicos",
  "Eventos y dinámicas exclusivas para miembros",
  "Desafíos de acondicionamiento físico",
];

export default function InstagramPage() {
  return (
    <Layout>
      <PageHero
        media="hero-box"
        position="28% center"
        eyebrow="@trainofit"
        title={<>Síguenos en <span className="text-primary">Instagram</span></>}
        subtitle="Únete a nuestra comunidad y comparte tu progreso. Mira WODs diarios, consejos técnicos, momentos destacados y el ambiente real de Puente Alto."
      >
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary text-dark font-black text-xs uppercase tracking-widest hover:bg-primary-300 transition-colors duration-200"
        >
          <Instagram size={18} aria-hidden />
          Seguir @trainofit
          <ExternalLink size={14} aria-hidden />
        </a>
      </PageHero>

      <Section className="bg-zinc-950 text-white">

        {/* Community + profile preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto mb-20">
          <div className="space-y-6 reveal">
            <p className="eyebrow">Comunidad Activa</p>
            <h2 className="font-display text-5xl md:text-6xl uppercase leading-none">
              Conecta con la comunidad de atletas
            </h2>
            <p className="text-gray-300 text-base leading-relaxed">
              En Instagram compartimos el día a día de nuestros miembros. Desde el esfuerzo en cada repetición hasta la camaradería después de un WOD demandante.
            </p>
            <ul className="space-y-3.5 text-sm text-gray-200">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check size={16} className="text-primary shrink-0" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Decorative profile card — illustrative, no live Instagram data */}
          <div className="flex justify-center reveal" aria-hidden>
            <div className="w-full max-w-[360px] bg-zinc-900 border border-white/10 p-5">
              <div className="flex items-center gap-4 pb-4 mb-4 border-b border-white/10">
                <span className="size-14 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                  <img
                    src="/traino-svg.svg"
                    alt=""
                    width={36}
                    height={36}
                    className="size-9"
                    style={{
                      filter:
                        "brightness(0) saturate(100%) invert(77%) sepia(18%) saturate(1247%) hue-rotate(8deg) brightness(95%) contrast(88%)",
                    }}
                  />
                </span>
                <div className="text-sm">
                  <p className="font-bold text-white">trainofit</p>
                  <p className="text-gray-400">Gym Tradicional + Clases Box</p>
                  <p className="text-primary font-bold">#TrainoHybrid</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {TOPICS.map((topic) => (
                  <div
                    key={topic.label}
                    className="aspect-square bg-zinc-800 flex flex-col items-center justify-center gap-2 text-primary"
                  >
                    <topic.icon size={24} strokeWidth={1.5} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                      {topic.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            ¿Quieres ser parte de nuestro feed oficial? Etiquétanos en tus fotos y videos usando{" "}
            <span className="text-primary font-semibold">#Trainofit</span>
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-4 border border-white/30 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:border-white/60 transition-colors duration-200"
          >
            <Instagram size={16} aria-hidden />
            Visitar Perfil @trainofit
          </a>
        </div>
      </Section>
    </Layout>
  );
}
