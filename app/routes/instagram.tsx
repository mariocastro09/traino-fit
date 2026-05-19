import { Layout } from "~/components/layout";
import { Section } from "~/components/ui/section";
import type { Route } from "./+types/instagram";
import { Instagram, ExternalLink, Heart, MessageCircle, Star, Sparkles, Trophy, Users } from "lucide-react";
import { motion } from "motion/react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Instagram - Trainofit | Síguenos en Redes Sociales" },
    {
      name: "description",
      content: "Síguenos en Instagram @trainofit para ver WODs del día, transformaciones y entrenamientos de la comunidad en Puente Alto.",
    },
  ];
}

const POSTS = [
  {
    id: 1,
    category: "WOD del Día",
    title: "Sinergia en equipo",
    description: "La energía de hoy en Traino Box. ¡Rendimiento sin excusas!",
    likes: 184,
    comments: 18,
    icon: <Users className="w-6 h-6 text-primary" />,
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    id: 2,
    category: "Fuerza Híbrida",
    title: "Nueva Zona de Powerlifting",
    description: "Equipamiento de última generación listo para tus PRs.",
    likes: 245,
    comments: 32,
    icon: <Trophy className="w-6 h-6 text-orange-500" />,
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    id: 3,
    category: "Comunidad",
    title: "Comunidad Imparable",
    description: "Apoyo mutuo, motivación constante y el mejor ambiente.",
    likes: 312,
    comments: 42,
    icon: <Sparkles className="w-6 h-6 text-purple-500" />,
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: 4,
    category: "Tips de Coach",
    title: "Optimiza tu Snatch",
    description: "3 consejos clave de nuestros coaches para mejorar tu técnica.",
    likes: 156,
    comments: 9,
    icon: <Star className="w-6 h-6 text-yellow-500" />,
    gradient: "from-yellow-500/20 to-amber-500/20",
  },
  {
    id: 5,
    category: "Agilidad",
    title: "Desafío de Cardio Híbrido",
    description: "Preparando a nuestros atletas para cualquier reto físico.",
    likes: 198,
    comments: 14,
    icon: <Sparkles className="w-6 h-6 text-red-500" />,
    gradient: "from-red-500/20 to-purple-500/20",
  },
  {
    id: 6,
    category: "Transformación",
    title: "Mentalidad de Acero",
    description: "No es solo físico, es la disciplina construida día a día.",
    likes: 289,
    comments: 27,
    icon: <Trophy className="w-6 h-6 text-primary" />,
    gradient: "from-primary/20 to-orange-500/20",
  },
];

export default function InstagramPage() {
  return (
    <Layout>
      <Section className="relative overflow-hidden bg-zinc-950 py-20 md:py-28">
        {/* Background glowing gradients */}
        <div className="absolute top-12 left-1/4 -translate-x-1/2 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-12 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24 relative z-10 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-purple-600/20 via-pink-600/20 to-orange-500/20 border border-pink-500/30 mb-6 shadow-[0_0_20px_rgba(219,39,119,0.15)] animate-pulse">
            <Instagram className="text-pink-500" size={36} />
          </div>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-black uppercase text-white tracking-tight leading-none mb-6"
            style={{ fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif" }}
          >
            SÍGUENOS EN <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500">INSTAGRAM</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-light/70 leading-relaxed mb-8">
            Únete a nuestra comunidad y comparte tu progreso. Mira WODs diarios,
            consejos técnicos, momentos destacados y el ambiente real de Puente Alto.
          </p>

          <a
            href="https://www.instagram.com/trainofit/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-black text-xs uppercase tracking-widest hover:opacity-95 transition-all duration-300 shadow-lg shadow-pink-600/20 active:scale-[0.98]"
          >
            <Instagram size={18} />
            Seguir @trainofit
            <ExternalLink size={14} className="opacity-80" />
          </a>
        </div>

        {/* Highlight Section: Smartphone feed preview + details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto px-4 mb-20 relative z-10">

          {/* Left Column: Premium Social Information */}
          <div className="space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-primary/20 bg-primary/5 rounded-full text-[10px] font-black tracking-[0.25em] uppercase text-primary">
              Comunidad Activa
            </span>
            <h2
              className="text-3xl md:text-4xl font-black uppercase text-white leading-tight"
              style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
            >
              CONECTA CON LA <br />
              COMUNIDAD DE ATLETAS
            </h2>
            <p className="text-light/70 text-sm md:text-base leading-relaxed">
              En Instagram compartimos el día a día de nuestros miembros. Desde el esfuerzo en cada repetición hasta la camaradería después de un WOD demandante.
            </p>
            <ul className="space-y-3.5 text-sm text-light/80">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-black">✓</div>
                <span>WODs diarios y consejos técnicos</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-black">✓</div>
                <span>Eventos y dinámicas exclusivas para miembros</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-black">✓</div>
                <span>Desafíos de acondicionamiento físico</span>
              </li>
            </ul>
          </div>

          {/* Right Column: Simulated Smartphone Mockup */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-[360px] bg-zinc-950 rounded-[45px] border-8 border-zinc-800 p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* Camera Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-800 rounded-full z-20" />

              {/* Screen Content */}
              <div className="bg-zinc-900 rounded-[35px] p-3 text-white text-left font-sans select-none relative z-10 overflow-hidden">
                {/* Instgram Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3 mt-1.5 px-1">
                  <span className="font-extrabold text-sm tracking-tight text-white/90">trainofit</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-black tracking-wider uppercase">
                    Verificado
                  </div>
                </div>

                {/* Profile Grid Info */}
                <div className="flex items-center gap-3 mb-3 px-1">
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[2px] flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-zinc-900 p-1 flex items-center justify-center">
                      <img
                        src="/traino-svg.svg"
                        alt="Trainofit Profile"
                        className="w-9 h-9 brightness-0 invert opacity-95"
                        style={{
                          filter:
                            "brightness(0) saturate(100%) invert(77%) sepia(18%) saturate(1247%) hue-rotate(8deg) brightness(95%) contrast(88%)",
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex justify-around text-center">
                    <div>
                      <div className="font-extrabold text-xs">184</div>
                      <div className="text-[8px] text-zinc-400 uppercase tracking-tight">Posts</div>
                    </div>
                    <div>
                      <div className="font-extrabold text-xs">4.8K</div>
                      <div className="text-[8px] text-zinc-400 uppercase tracking-tight">Atletas</div>
                    </div>
                    <div>
                      <div className="font-extrabold text-xs">152</div>
                      <div className="text-[8px] text-zinc-400 uppercase tracking-tight">Seguidos</div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-0.5 mb-3 px-1 text-[11px]">
                  <div className="font-bold text-white">TRAINOFIT | Fuerza + Agilidad</div>
                  <div className="text-zinc-300">🏋️‍♂️ Primer Centro Híbrido de Puente Alto.</div>
                  <div className="text-zinc-300">⚡ Gym Tradicional + Clases Box.</div>
                  <div className="text-primary font-bold">#TrainoHybrid #RendimientoSinLimites</div>
                </div>

                {/* Highlights circles */}
                <div className="flex gap-2.5 overflow-x-auto pb-2 mb-3 border-b border-white/5 scrollbar-none px-1">
                  {[
                    { name: "WODs", emoji: "🔥" },
                    { name: "Comunidad", emoji: "👥" },
                    { name: "PRs", emoji: "💪" },
                    { name: "Box", emoji: "⚡" },
                  ].map((st, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="w-10 h-10 rounded-full border border-white/10 bg-zinc-800/80 flex items-center justify-center text-sm shadow-inner">
                        {st.emoji}
                      </div>
                      <span className="text-[8px] text-zinc-400 font-medium">{st.name}</span>
                    </div>
                  ))}
                </div>

                {/* Post Grid (6 posts simulated) */}
                <div className="grid grid-cols-3 gap-0.5">
                  {[
                    { tag: "🔥 WOD", img: "🏋️‍♂️" },
                    { tag: "💪 PR", img: "🏋️‍♀️" },
                    { tag: "👥 Team", img: "🤝" },
                    { tag: "🏃‍♂️ Box", img: "⚡" },
                    { tag: "⚡ Hybrid", img: "💪" },
                    { tag: "🏆 Atletas", img: "🎖️" },
                  ].map((p, idx) => (
                    <div key={idx} className="aspect-square bg-zinc-800/50 relative group overflow-hidden cursor-pointer flex items-center justify-center">
                      <span className="text-xl">{p.img}</span>
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-[8px] font-black text-white uppercase tracking-wider">
                        {p.tag}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Mockup Grid (Simulated Posts) - Commented out to avoid displaying simulated/fake info */}
        {/*
        <div className="max-w-5xl mx-auto px-4 mb-16 relative z-10">
          <div className="text-center mb-10">
            <h3
              className="text-2xl md:text-3xl font-black uppercase text-white tracking-wide mb-3"
              style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
            >
              Publicaciones Recientes
            </h3>
            <p className="text-light/60 text-sm max-w-md mx-auto">
              Explora algunos de nuestros contenidos, dinámicas y momentos diarios compartidos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSTS.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: post.id * 0.05 }}
                className="relative rounded-2xl bg-zinc-900/40 border border-white/5 p-6 hover:border-pink-500/30 transition-all duration-300 flex flex-col justify-between group overflow-hidden shadow-xl"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${post.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-widest uppercase text-pink-500">
                      {post.category}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      {post.icon}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">{post.title}</h4>
                    <p className="text-light/60 text-xs leading-relaxed">{post.description}</p>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                  <div className="flex items-center gap-4 text-xs text-light/50">
                    <span className="flex items-center gap-1.5 group-hover:text-pink-500 transition-colors">
                      <Heart size={14} className="fill-current" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1.5 group-hover:text-primary transition-colors">
                      <MessageCircle size={14} />
                      {post.comments}
                    </span>
                  </div>
                  <span className="text-[10px] text-primary font-bold group-hover:underline flex items-center gap-1">
                    Ver Post <ExternalLink size={10} />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        */}

        {/* Bottom CTA Block */}
        <div className="text-center mt-12 relative z-10 px-4">
          <p className="text-light/60 text-sm mb-6 max-w-md mx-auto">
            ¿Quieres ser parte de nuestro feed oficial? Etiquétanos en tus fotos y videos usando <span className="text-primary font-semibold">#Trainofit</span>
          </p>
          <a
            href="https://www.instagram.com/trainofit/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-zinc-900 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all duration-300 active:scale-[0.98]"
          >
            <Instagram size={16} />
            Visitar Perfil @trainofit
          </a>
        </div>
      </Section>
    </Layout>
  );
}
