import { ArrowRight, Instagram } from "lucide-react";
import { Link } from "react-router";
import { Section } from "~/components/ui/section";

export function InstagramPreview() {
  return (
    <Section>
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
          Síguenos en <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]">Instagram</span>
        </h2>
        <p className="text-xl text-gray-400">
          Únete a nuestra comunidad y comparte tu viaje fitness
        </p>
      </div>

      <div className="max-w-3xl mx-auto text-center">
        <div className="p-8 space-y-8 rounded-2xl bg-secondary/5 border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex justify-center">
            <a
              href="https://www.instagram.com/trainofit/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white font-bold rounded-lg text-lg group hover:shadow-lg hover:shadow-red-500/20 transition-all"
            >
              <Instagram size={24} />
              <span>@trainofit</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          <p className="text-gray-300 text-lg">
            Mira nuestros WODs diarios, transformaciones de miembros, y eventos especiales
          </p>
          <Link 
            to="/instagram" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary-400 font-medium transition-colors"
          >
            Ver Galería Completa
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </Section>
  );
}
