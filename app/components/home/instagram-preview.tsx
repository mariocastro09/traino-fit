import { ArrowRight, Instagram } from "lucide-react";
import { Link } from "react-router";
import { Section } from "~/components/ui/section";
import { INSTAGRAM_URL } from "~/lib/site";

export function InstagramPreview() {
  return (
    <Section className="bg-zinc-950 border-t border-white/10">
      <div className="max-w-3xl mx-auto text-center reveal">
        <p className="eyebrow mb-4">Comunidad</p>
        <h2 className="font-display text-5xl md:text-6xl uppercase text-white leading-none mb-4">
          Síguenos en <span className="text-primary">Instagram</span>
        </h2>
        <p className="text-lg text-gray-400 mb-10">
          WODs diarios, transformaciones de miembros y eventos especiales.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-dark font-black text-sm uppercase tracking-widest hover:bg-primary-300 transition-colors duration-200"
          >
            <Instagram size={20} aria-hidden />
            @trainofit
          </a>
          <Link
            to="/instagram"
            className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 hover:border-white/60 transition-colors duration-200"
          >
            Ver galería
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </Section>
  );
}
