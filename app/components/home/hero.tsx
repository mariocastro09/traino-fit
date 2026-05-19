"use client";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { Link } from "react-router";
import { useRef, useEffect, useState } from "react";

const SLIDES = [
  {
    id: "gym",
    tag: "TRAINO GYM",
    focus: "FUERZA",
    tagline: "Máquinas de última generación. Horario extendido. Tu ritmo, tus reglas.",
    accent: "#d4a017",
    accentDim: "rgba(212,160,23,0.15)",
  },
  {
    id: "box",
    tag: "TRAINO BOX",
    focus: "COMUNIDAD",
    tagline: "Coaching de élite, WODs diarios y una comunidad que te empuja al límite.",
    accent: "#ff6b35",
    accentDim: "rgba(255,107,53,0.15)",
  },
  {
    id: "hybrid",
    tag: "TRAINO HYBRID",
    focus: "RENDIMIENTO",
    tagline: "Gym + CrossFit. El sistema definitivo para atletas sin restricciones.",
    accent: "#d4a017",
    accentDim: "rgba(212,160,23,0.15)",
  },
];

const INTERVAL_MS = 5000;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [slide, setSlide] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scaleVideo = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((s) => (s + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const current = SLIDES[slide];

  return (
    <section
      ref={ref}
      className="relative flex items-center justify-center overflow-hidden bg-gray-950"
      style={{ height: "calc(100dvh - 5rem)", minHeight: "600px" }}
    >
      {/* ── Video Background ── */}
      <motion.div className="absolute inset-0 z-0" style={{ scale: scaleVideo }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/deadlift-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/deadlift-web.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/72" />
        {/* Accent glow per slide — visible bottom-left spot */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id + "-glow"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
            style={{ background: current.accentDim }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.8)_100%)]" />
      </motion.div>

      {/* Fallback bg (also shown while poster itself loads) */}
      <div className="absolute inset-0 z-[-1] bg-gradient-to-br from-gray-950 via-zinc-900 to-gray-950" />

      {/* ── Slide progress bar (top) ── */}
      <div className="absolute top-0 left-0 right-0 z-30 flex h-[3px]">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSlide(i)}
            className="flex-1 relative overflow-hidden bg-white/10 cursor-pointer"
            aria-label={`Slide ${s.tag}`}
          >
            {i === slide && (
              <motion.div
                key={slide + "-bar"}
                className="absolute inset-y-0 left-0"
                style={{ background: current.accent }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
              />
            )}
            {i < slide && (
              <div className="absolute inset-0" style={{ background: current.accent, opacity: 0.5 }} />
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <motion.div
        style={{ y: yText, opacity: opacityText }}
        className="relative z-20 w-full max-w-4xl mx-auto px-6 sm:px-10 text-center py-8 sm:py-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4 sm:gap-5"
        >
          {/* ── Slide tag pill — clearly changes ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id + "-tag"}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 border backdrop-blur-md"
              style={{
                borderColor: current.accent + "50",
                background: current.accentDim,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{
                  background: current.accent,
                  boxShadow: `0 0 6px ${current.accent}`,
                }}
              />
              <span
                className="text-[11px] font-black tracking-[0.25em] uppercase"
                style={{ color: current.accent }}
              >
                {current.tag}
              </span>
              <span className="text-[11px] text-white/40 font-bold tracking-[0.15em] uppercase">
                — Apertura Agosto 2025
              </span>
            </motion.div>
          </AnimatePresence>

          {/* ── Main heading — focus word changes ── */}
          <h1
            className="font-black uppercase leading-[0.88] tracking-tight text-white text-5xl sm:text-6xl md:text-7xl xl:text-8xl"
            style={{
              fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
              textShadow: "0 2px 40px rgba(0,0,0,0.8)",
            }}
          >
            TU <br className="hidden xs:block sm:hidden" />
            {/* The changing focus word */}
            <AnimatePresence mode="wait">
              <motion.span
                key={current.id + "-focus"}
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="inline-block relative"
                style={{ color: current.accent }}
              >
                {current.focus}
                {/* Glow behind the word */}
                <span
                  className="absolute inset-0 blur-2xl -z-10 opacity-40"
                  style={{ background: current.accent }}
                />
              </motion.span>
            </AnimatePresence>
            .<br />
            SIN LÍMITES.
          </h1>

          {/* ── Tagline — changes with slide ── */}
          <AnimatePresence mode="wait">
            <motion.p
              key={current.id + "-tagline"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-xs sm:text-sm md:text-base text-gray-300 max-w-sm sm:max-w-lg font-light leading-relaxed"
            >
              {current.tagline}{" "}
              <span className="text-primary font-semibold">
                Nueva apertura en AGOSTO.
              </span>
            </motion.p>
          </AnimatePresence>

          {/* ── CTAs ── */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center justify-center pt-1">
            <Link
              to="/contacto"
              id="hero-cta-primary"
              className="group relative w-full sm:w-auto px-7 py-3.5 font-black text-xs uppercase tracking-widest overflow-hidden transition-all duration-300 hover:scale-105"
              style={{
                background: current.accent,
                color: "#0a0a0a",
                boxShadow: `0 0 40px -12px ${current.accent}`,
                transition: "background 0.6s, box-shadow 0.3s, transform 0.3s",
              }}
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              <span className="relative flex items-center justify-center gap-2">
                RESERVAR MI CUPO DE APERTURA
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>

            <Link
              to="/precios"
              id="hero-cta-secondary"
              className="group w-full sm:w-auto px-7 py-3.5 border-2 border-white/25 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
            >
              <span className="flex items-center justify-center gap-2">
                Ver Planes
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </span>
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-950 to-transparent z-10 pointer-events-none" />
    </section>
  );
}
