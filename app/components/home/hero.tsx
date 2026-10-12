import { motion, useInView, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { useRef, useEffect, useState } from "react";
import { cn } from "~/lib/utils";

// One program per slide, each with its own footage. `focus` is the word that
// changes in the headline; `position` keeps the athlete in frame on narrow screens.
const SLIDES = [
  {
    id: "gym",
    tag: "TRAINO GYM",
    focus: "FUERZA",
    tagline:
      "Máquinas de última generación. Horario extendido. Tu ritmo, tus reglas.",
    position: "45% center",
  },
  {
    id: "box",
    tag: "TRAINO BOX",
    focus: "COMUNIDAD",
    tagline:
      "Coaching de élite, WODs diarios y una comunidad que te empuja al límite.",
    position: "28% center",
  },
  {
    id: "hybrid",
    tag: "TRAINO HYBRID",
    focus: "RENDIMIENTO",
    tagline:
      "Gym + CrossFit. El sistema definitivo para atletas sin restricciones.",
    position: "50% center",
  },
];

const SLIDE_MS = 8000;

export function Hero({
  settings,
  isOpen,
}: {
  settings: Record<string, string>;
  isOpen: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [slide, setSlide] = useState(0);
  // Footage for a program is only requested once that program has been shown.
  const [loaded, setLoaded] = useState([0]);
  const [holding, setHolding] = useState(false);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref);
  // Nothing plays or advances off-screen, while the visitor is on the
  // selector, or when they asked for reduced motion.
  const paused = holding || !inView || !!reduceMotion;

  // Admin-edited copy (settings) overrides the defaults above.
  const slides = SLIDES.map((s) => ({
    ...s,
    tag: settings[`hero_slide_${s.id}_tag`] || s.tag,
    focus: settings[`hero_slide_${s.id}_focus`] || s.focus,
    tagline: settings[`hero_slide_${s.id}_tagline`] || s.tagline,
  }));
  const current = slides[slide];

  const show = (index: number) => {
    setSlide(index);
    setLoaded((prev) => (prev.includes(index) ? prev : [...prev, index]));
  };

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => show((slide + 1) % SLIDES.length), SLIDE_MS);
    return () => clearTimeout(id);
  }, [paused, slide]);

  // Only the visible clip plays, and it restarts when its program comes up.
  useEffect(() => {
    videos.current.forEach((video, i) => {
      if (!video) return;
      if (i === slide && inView && !reduceMotion) {
        video.play().catch(() => {});
      } else {
        video.pause();
        if (i !== slide) video.currentTime = 0;
      }
    });
  }, [slide, inView, reduceMotion, loaded]);

  // The pre-opening announcement stops applying once the gym is open.
  const announcement = isOpen
    ? "Ya abrimos en Puente Alto"
    : (settings.hero_apertura_badge ?? "").replace(/^[—\s]+/, "");
  const offer = isOpen ? "Tu primera clase es gratis." : settings.hero_apertura_sub ?? "";

  return (
    <section
      ref={ref}
      aria-label="Programas de TrainoFit"
      className="relative isolate flex flex-col overflow-hidden bg-black text-white h-[calc(100dvh-5rem)] min-h-[640px]"
    >
      {/* ── Footage, one clip per program ── */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 bg-cover transition-opacity duration-700",
              i === slide ? "opacity-100" : "opacity-0"
            )}
            style={{
              backgroundImage: `url(/hero-${s.id}.jpg)`,
              backgroundPosition: s.position,
            }}
          >
            {loaded.includes(i) && (
              <video
                ref={(el) => {
                  videos.current[i] = el;
                }}
                muted
                loop
                playsInline
                preload="auto"
                poster={`/hero-${s.id}.jpg`}
                className="size-full object-cover"
                style={{ objectPosition: s.position }}
              >
                <source src={`/hero-${s.id}.mp4`} type="video/mp4" />
              </video>
            )}
          </div>
        ))}
        {/* Scrim: the athlete stays visible up top, the copy stays readable below */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
      </div>

      {/* ── Copy ── */}
      <div className="flex-1 flex flex-col justify-end w-full container mx-auto px-5 sm:px-6 pb-8 sm:pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {announcement && (
          <p className="text-sm sm:text-base font-semibold text-primary mb-3 sm:mb-4 [text-shadow:0_1px_10px_rgb(0_0_0/0.9)]">
            {announcement}
          </p>
        )}

        <h1 className="font-display uppercase leading-[0.88] text-white text-[4.25rem] xs:text-8xl lg:text-[clamp(7rem,11.5vw,11.5rem)] break-words">
          <span className="block sm:inline">TU </span>
          {/* Keyed so each program's word rises in when it takes over */}
          <span
            key={current.id}
            className="inline-block text-primary animate-in fade-in slide-in-from-bottom-3 duration-500"
          >
            {current.focus}
          </span>
          <span className="block">SIN LÍMITES.</span>
        </h1>

        <div className="mt-5 sm:mt-7 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <p className="text-base md:text-lg text-gray-200 max-w-xl leading-relaxed min-h-[4.5em] sm:min-h-[3.25em]">
            {current.tagline}{" "}
            {offer && <span className="text-primary font-semibold">{offer}</span>}
          </p>

          <div className="shrink-0">
            <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/contacto"
              id="hero-cta-primary"
              className="px-8 py-4 bg-primary text-dark font-black text-sm uppercase tracking-widest text-center hover:bg-primary-300 active:scale-[0.98] transition-[background-color,scale] duration-200"
            >
              {isOpen ? "Reservar mi clase gratis" : "Reservar mi cupón de apertura"}
            </Link>
            <Link
              to="/precios"
              id="hero-cta-secondary"
              className="px-8 py-4 border border-white/40 text-white font-bold text-sm uppercase tracking-widest text-center hover:bg-white/10 hover:border-white/70 transition-colors duration-200"
            >
              Ver planes
            </Link>
            </div>
            {isOpen && (
              <p className="mt-3 text-sm text-gray-300">
                Sin compromiso. Te confirmamos el horario por WhatsApp.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Program selector: doubles as the slide progress ── */}
      <div
        className="grid grid-cols-3 border-t border-white/15 bg-black/60 pr-20 sm:pr-0"
        onMouseEnter={() => setHolding(true)}
        onMouseLeave={() => setHolding(false)}
        onFocus={() => setHolding(true)}
        onBlur={() => setHolding(false)}
      >
        {slides.map((s, i) => {
          const active = i === slide;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => show(i)}
              aria-pressed={active}
              className={cn(
                "group relative text-left px-3 sm:px-10 py-4 sm:py-5 border-l border-white/10 first:border-l-0 cursor-pointer transition-colors duration-200 focus-visible:-outline-offset-2",
                active ? "text-white" : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              {/* Fills while this program is on screen */}
              <span className="absolute top-0 inset-x-0 h-[3px] -mt-px">
                {active && (
                  <motion.span
                    key={`${slide}-${paused}`}
                    className="block size-full bg-primary origin-left"
                    initial={{ scaleX: paused ? 1 : 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
                  />
                )}
              </span>
              <span className="block font-display text-lg sm:text-3xl leading-none whitespace-nowrap">
                {s.tag}
              </span>
              <span className="hidden sm:block text-sm mt-1.5 text-white/60 group-aria-pressed:text-primary">
                {s.focus.charAt(0) + s.focus.slice(1).toLowerCase()}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
