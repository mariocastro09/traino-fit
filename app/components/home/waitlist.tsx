import { Section } from "~/components/ui/section";
import { Link } from "react-router";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";

// Shown instead of the waitlist once the opening date has passed.
export function NowOpenSection() {
  const ref = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  // The clip is fetched when the section is about to appear and only plays while visible.
  const near = useInView(ref, { once: true, margin: "600px 0px" });
  const inView = useInView(ref);

  useEffect(() => {
    if (inView && !reduceMotion) video.current?.play().catch(() => {});
    else video.current?.pause();
  }, [inView, near, reduceMotion]);

  return (
    <Section
      ref={ref}
      className="relative isolate overflow-hidden bg-black border-t border-white/10 py-28 md:py-40"
    >
      <div className="absolute inset-0 -z-10" aria-hidden>
        {near && (
          <video
            ref={video}
            muted
            loop
            playsInline
            preload="auto"
            poster="/page-precios.jpg"
            className="size-full object-cover"
          >
            <source src="/page-precios.mp4" type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="max-w-4xl mx-auto text-center reveal">
        <p className="eyebrow mb-4">Ya abrimos</p>
        <h2 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase text-white leading-[0.9] mb-6">
          Tu primera clase es <span className="text-primary">gratis</span>
        </h2>
        <p className="text-gray-300 text-base md:text-lg max-w-xl mx-auto mb-10">
          Ven a conocer el gym y el box en Puente Alto. Elige un horario y un coach te recibe en tu primera sesión.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link viewTransition
            to="/contacto"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-dark font-black text-sm uppercase tracking-widest hover:bg-primary-300 transition-colors duration-200"
          >
            Reservar mi clase gratis
            <ArrowRight size={16} aria-hidden />
          </Link>
          <Link viewTransition
            to="/horario"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/30 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 hover:border-white/60 transition-colors duration-200"
          >
            Ver horarios
          </Link>
        </div>
        <p className="mt-5 text-sm text-gray-400">
          Sin compromiso. Te confirmamos el horario por WhatsApp.
        </p>
      </div>
    </Section>
  );
}

const UNITS = [
  { label: "Días", ms: 86_400_000, mod: Infinity },
  { label: "Horas", ms: 3_600_000, mod: 24 },
  { label: "Min", ms: 60_000, mod: 60 },
  { label: "Seg", ms: 1_000, mod: 60 },
];

// Milliseconds left until the opening date; null until the browser clock is read
// (the server's clock would not match), 0 once the date has passed or is invalid.
function useTimeLeft(targetDate: string) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, new Date(targetDate).getTime() - Date.now()) || 0);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return left;
}

export function WaitlistSection({ settings }: { settings: Record<string, string> }) {
  const left = useTimeLeft(settings.waitlist_countdown_target || "2026-08-01T00:00:00-04:00");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get("contacto") ?? "").trim();
    if (!value) return;
    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "waitlist", value }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
    } catch (err) {
      console.error(err);
      setError("No pudimos registrar tu contacto. Intenta de nuevo o escríbenos por WhatsApp.");
      setStatus("idle");
    }
  };

  const [titleFirst, ...titleRest] = (settings.waitlist_countdown_title || "APERTURA AGOSTO").split(" ");

  return (
    <Section className="bg-zinc-950 border-t border-white/10 py-24 md:py-28">
      <div className="max-w-4xl mx-auto text-center">
        {left !== 0 && <p className="eyebrow mb-4 reveal">Cuenta regresiva</p>}

        <h2 className="font-display text-5xl md:text-7xl uppercase text-white leading-none mb-4 reveal">
          {titleFirst} <span className="text-primary">{titleRest.join(" ")}</span>
        </h2>

        {/* Countdown — hidden once the opening date has passed */}
        {left !== 0 && (
          <>
            <p className="text-gray-400 mb-12">
              El countdown ha empezado. Asegura tu lugar antes que el resto.
            </p>
            <div className="flex justify-center gap-2 xs:gap-3 sm:gap-4 md:gap-6" role="timer">
              {UNITS.map((unit) => (
                <div key={unit.label} className="flex flex-col items-center gap-2">
                  <span className="size-16 sm:size-20 md:size-24 flex items-center justify-center bg-zinc-900 border border-white/10 font-display text-3xl sm:text-4xl md:text-5xl text-white tabular-nums">
                    {left === null
                      ? "--"
                      : String(Math.floor(left / unit.ms) % unit.mod).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Lead Magnet Card */}
        <div className="border border-primary/30 bg-primary/5 p-6 sm:p-10 mt-12 reveal">
          <p className="inline-block px-4 py-2 bg-primary text-dark font-black text-lg uppercase mb-6">
            {settings.waitlist_discount_text || "20% OFF TU PRIMER MES"}
          </p>

          <h3 className="text-2xl md:text-3xl font-black text-white uppercase mb-3">
            Únete a la Lista de Espera
          </h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Sé el primero en saber cuando abramos. Los de la lista consiguen un{" "}
            <span className="text-primary font-bold">descuento especial</span>{" "}
            — solo para los que se adelanten.
          </p>

          {status === "done" ? (
            <div role="status" className="py-6 px-8 bg-primary/10 border border-primary/30 inline-block">
              <p className="text-primary font-black text-xl uppercase tracking-wide flex items-center justify-center gap-2">
                <Check aria-hidden /> ¡Estás dentro de la lista!
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Te avisaremos antes de la apertura con tu código de descuento.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} id="waitlist-form" className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <label htmlFor="waitlist-input" className="sr-only">
                  Email o WhatsApp
                </label>
                <input
                  id="waitlist-input"
                  name="contacto"
                  type="text"
                  required
                  maxLength={120}
                  placeholder="Email o WhatsApp"
                  aria-invalid={!!error}
                  aria-describedby={error ? "waitlist-error" : undefined}
                  className="flex-1 min-w-0 px-5 py-4 bg-zinc-900 border border-white/15 text-white placeholder:text-gray-500 text-sm focus:border-primary transition-colors duration-200"
                />
                <button
                  type="submit"
                  id="waitlist-submit"
                  disabled={status === "sending"}
                  className="px-8 py-4 bg-primary text-dark font-black text-sm uppercase tracking-widest whitespace-nowrap hover:bg-primary-300 transition-colors duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {status === "sending" ? "Enviando…" : "Quiero mi descuento"}
                  <ArrowRight size={16} aria-hidden />
                </button>
              </div>
              <p id="waitlist-error" role="alert" className="text-red-400 text-sm mt-3 empty:hidden">
                {error}
              </p>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}
