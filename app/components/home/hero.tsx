import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { Link } from "react-router";
import { useRef, useEffect, useState } from "react";
import { ArrowRight, ArrowDown } from "lucide-react";
import { cn } from "~/lib/utils";

const GOLD = "#d4a017";
const ORANGE = "#ff6b35";

const SLIDES = [
  {
    id: "gym",
    tag: "TRAINO GYM",
    focus: "FUERZA",
    tagline:
      "Máquinas de última generación. Horario extendido. Tu ritmo, tus reglas.",
    accent: GOLD,
  },
  {
    id: "box",
    tag: "TRAINO BOX",
    focus: "COMUNIDAD",
    tagline:
      "Coaching de élite, WODs diarios y una comunidad que te empuja al límite.",
    accent: ORANGE,
  },
  {
    id: "hybrid",
    tag: "TRAINO HYBRID",
    focus: "RENDIMIENTO",
    tagline:
      "Gym + CrossFit. El sistema definitivo para atletas sin restricciones.",
    accent: GOLD,
  },
];

const MARQUEE_WORDS = [
  "FUERZA",
  "COMUNIDAD",
  "RENDIMIENTO",
  "HYBRID TRAINING",
  "WODs DIARIOS",
  "HORARIO EXTENDIDO",
  "COACHES CERTIFICADOS",
];

const INTERVAL_MS = 5500;

export function Hero({
  settings,
  isOpen,
}: {
  settings: Record<string, string>;
  isOpen: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [slide, setSlide] = useState(0);
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref);
  // Nothing loops while the visitor is interacting or the hero is off-screen.
  const paused = hovered || !inView || !!reduceMotion;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Admin-edited copy (settings) overrides the defaults above.
  const slides = SLIDES.map((s) => ({
    ...s,
    tag: settings[`hero_slide_${s.id}_tag`] || s.tag,
    focus: settings[`hero_slide_${s.id}_focus`] || s.focus,
    tagline: settings[`hero_slide_${s.id}_tagline`] || s.tagline,
  }));
  const current = slides[slide];
  const go = (step: number) =>
    setSlide((s) => (s + step + slides.length) % slides.length);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => setSlide((s) => (s + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearTimeout(id);
  }, [paused, slide]);

  // The pre-opening announcement copy stops applying once the gym is open.
  const aperturaBadge = isOpen ? "— Ya abrimos" : settings.hero_apertura_badge ?? "";
  const aperturaSub = isOpen ? "Tu primera clase es gratis." : settings.hero_apertura_sub ?? "";

  return (
    <section
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        else if (e.key === "ArrowLeft") go(-1);
      }}
      aria-roledescription="carrusel"
      aria-label="Presentación de TrainoFit"
      className="relative isolate flex items-stretch overflow-hidden bg-zinc-950 text-white h-[calc(100dvh-5rem)] min-h-[640px]"
    >
      {/* ── Video Background ── */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/deadlift-poster.jpg"
          className="absolute inset-0 size-full object-cover"
        >
          <source src="/deadlift-web.mp4" type="video/mp4" />
        </video>
        {/* Scrim keeps the copy readable over any video frame */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-transparent" />
      </div>

      {/* ── Left vertical brand rail (desktop) ── */}
      <div
        className="hidden lg:flex absolute left-0 inset-y-0 w-12 z-20 flex-col items-center justify-between py-6 border-r border-white/10 bg-black/20"
        aria-hidden
      >
        <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/60 [writing-mode:vertical-rl] rotate-180">
          EST · 2026 · PUENTE ALTO
        </span>
        <span className="w-px flex-1 my-4 bg-white/15" />
        <span
          className="text-[10px] font-black tracking-[0.4em] uppercase [writing-mode:vertical-rl] rotate-180 transition-colors duration-500"
          style={{ color: current.accent }}
        >
          TRAINOFIT
        </span>
      </div>

      {/* ── Slide progress + selector ── */}
      <div className="absolute top-0 inset-x-0 z-30 flex">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSlide(i)}
            aria-label={`Ver ${s.tag}`}
            aria-current={i === slide}
            className="flex-1 pb-4 cursor-pointer"
          >
            <span className="block relative h-[3px] overflow-hidden bg-white/10">
              {i < slide && (
                <span
                  className="absolute inset-0 opacity-50"
                  style={{ background: current.accent }}
                />
              )}
              {i === slide && (
                <motion.span
                  key={`${slide}-${paused}`}
                  className="absolute inset-0 origin-left"
                  style={{ background: current.accent }}
                  initial={{ scaleX: paused ? 1 : 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
                />
              )}
            </span>
          </button>
        ))}
      </div>

      {/* ── Right slide indicators (desktop, mirrors the selector above) ── */}
      <div
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 flex-col gap-5"
        aria-hidden
      >
        {slides.map((s, i) => {
          const active = i === slide;
          return (
            <button
              key={s.id}
              type="button"
              tabIndex={-1}
              onClick={() => setSlide(i)}
              className="group flex items-center justify-end gap-3 cursor-pointer"
            >
              <span
                className={cn(
                  "text-[11px] font-mono tabular-nums tracking-widest transition-opacity duration-200",
                  active ? "opacity-100" : "opacity-40 group-hover:opacity-80"
                )}
                style={{ color: active ? current.accent : "white" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "block h-px w-14 origin-right transition-transform duration-300",
                  !active && "scale-x-[0.43]"
                )}
                style={{
                  background: active ? current.accent : "rgba(255,255,255,0.4)",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* ── Content (asymmetric, anchored bottom-left) ── */}
      <motion.div
        style={reduceMotion ? undefined : { y: yText, opacity: opacityText }}
        className="relative z-10 w-full max-w-[1400px] mx-auto px-5 sm:px-10 lg:pl-24 lg:pr-32 flex flex-col justify-end pb-20 lg:pb-24 pt-16 sm:pt-28"
      >
        <div className="flex flex-col items-start gap-4 sm:gap-7 max-w-3xl">
          {/* ── Slide tag ── */}
          <p
            className="inline-flex flex-wrap items-center gap-2 sm:gap-3 pl-3 py-1.5 border-l-2 transition-colors duration-500"
            style={{ borderColor: current.accent }}
          >
            <span
              className="text-[11px] sm:text-xs font-black tracking-[0.18em] sm:tracking-[0.28em] uppercase transition-colors duration-500"
              style={{ color: current.accent }}
            >
              {current.tag}
            </span>
            {aperturaBadge && (
              <span className="text-[11px] sm:text-xs text-white/60 font-bold tracking-[0.12em] sm:tracking-[0.18em] uppercase">
                {aperturaBadge}
              </span>
            )}
          </p>

          {/* ── Main heading ── */}
          <h1 className="font-display uppercase leading-[0.86] text-white text-7xl xs:text-8xl md:text-9xl xl:text-[9.5rem] break-words">
            <span className="block">TU</span>
            <span className="relative inline-block">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={current.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="inline-block relative"
                  style={{ color: current.accent }}
                >
                  {current.focus}
                  {/* Outline ghost layer */}
                  <span
                    aria-hidden
                    className="hidden sm:block absolute inset-0 pointer-events-none select-none text-transparent translate-x-1.5 translate-y-1.5 opacity-35"
                    style={{ WebkitTextStroke: `1.5px ${current.accent}` }}
                  >
                    {current.focus}
                  </span>
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="block">SIN LÍMITES.</span>
          </h1>

          {/* ── Tagline ── */}
          <p className="text-sm sm:text-base md:text-lg text-gray-200 max-w-xl leading-relaxed min-h-[4.5em] sm:min-h-[3.5em]">
            {current.tagline}{" "}
            {aperturaSub && (
              <span className="text-primary font-semibold block sm:inline mt-1.5 sm:mt-0">
                {aperturaSub}
              </span>
            )}
          </p>

          {/* ── CTAs ── */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              to="/contacto"
              id="hero-cta-primary"
              className="group w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 bg-primary text-dark font-black text-sm uppercase tracking-widest leading-tight hover:bg-primary-300 active:scale-[0.98] transition-[background-color,scale] duration-200 flex items-center justify-center gap-2"
            >
              {isOpen ? "RESERVAR MI CLASE GRATIS" : "RESERVAR MI CUPÓN DE APERTURA"}
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-200" aria-hidden />
            </Link>

            <Link
              to="/precios"
              id="hero-cta-secondary"
              className="group w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 border border-white/30 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 hover:border-white/60 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              Ver Planes
              <ArrowRight className="size-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-[opacity,translate] duration-200" aria-hidden />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Bottom marquee ticker ── */}
      <div
        className="absolute bottom-0 inset-x-0 z-20 border-t border-white/10 bg-black/70 overflow-hidden"
        aria-hidden
      >
        <div
          className={cn(
            "flex w-max whitespace-nowrap py-2 animate-marquee",
            paused && "[animation-play-state:paused]"
          )}
        >
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-8 px-4">
              {MARQUEE_WORDS.map((word) => (
                <span key={word} className="flex items-center gap-8">
                  <span className="text-[11px] sm:text-xs font-black tracking-[0.3em] uppercase text-white/55">
                    {word}
                  </span>
                  <span className="size-1 rounded-full bg-primary" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Scroll cue (above marquee) ── */}
      <div
        className="hidden sm:flex absolute bottom-14 right-6 lg:right-24 z-20 items-center gap-2 text-[10px] font-black tracking-[0.3em] uppercase text-white/50"
        aria-hidden
      >
        <span>SCROLL</span>
        <ArrowDown className="size-3" />
      </div>
    </section>
  );
}
