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
            className="inline-flex items-center gap-3 px-8 py-4 border border-primary text-primary font-black text-sm uppercase tracking-widest hover:bg-primary/10 transition-colors duration-200"
          >
            <Instagram size={20} aria-hidden />
            @trainofit
          </a>
          <Link viewTransition
            to="/instagram"
            className="inline-flex items-center gap-2 px-4 py-4 text-white font-bold text-sm uppercase tracking-widest underline underline-offset-8 decoration-white/40 hover:decoration-white transition-colors duration-200"
          >
            Ver galería
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </Section>
  );
}
