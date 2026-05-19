"use client";
import { motion, AnimatePresence } from "motion/react";
import { Section } from "~/components/ui/section";
import { useEffect, useState, useRef } from "react";

// ── Countdown Logic ──────────────────────────────────
function getTimeRemaining(targetDateStr: string) {
  const now = new Date();
  const target = new Date(targetDateStr);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0 || isNaN(diff)) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2">
      <div className="relative w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 overflow-hidden bg-zinc-900 border border-white/10 rounded-lg flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute font-black text-xl xs:text-2xl sm:text-3xl md:text-4xl text-white tracking-tight"
            style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
        {/* Divider line */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-black/40" />
      </div>
      <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-gray-500">
        {label}
      </span>
    </div>
  );
}

export function WaitlistSection() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [formValue, setFormValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === "object") {
          setSettings(data as Record<string, string>);
        }
      })
      .catch(err => console.error("Error loading settings:", err));
  }, []);

  const targetDateStr = settings.waitlist_countdown_target || "2026-08-01T00:00:00-04:00";

  useEffect(() => {
    setTime(getTimeRemaining(targetDateStr));
    const interval = setInterval(() => {
      setTime(getTimeRemaining(targetDateStr));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValue.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "waitlist",
          value: formValue.trim(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        alert(data.error || "Hubo un error al unirse a la lista. Por favor, intenta de nuevo.");
      }
    } catch (err) {
      console.error(err);
      alert("Hubo un error de red. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const title = settings.waitlist_countdown_title || "APERTURA AGOSTO";
  const spaceIndex = title.indexOf(" ");
  const titlePart1 = spaceIndex !== -1 ? title.substring(0, spaceIndex) : title;
  const titlePart2 = spaceIndex !== -1 ? title.substring(spaceIndex + 1) : "";

  return (
    <Section className="relative overflow-hidden bg-zinc-950 py-28">
      {/* Top edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1.5 border border-primary/30 bg-primary/10 text-xs font-bold tracking-[0.3em] uppercase text-primary mb-8">
            🚀 Cuenta Regresiva
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black uppercase text-white leading-none mb-4"
          style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
        >
          {titlePart1} {titlePart2 && <span className="text-primary">{titlePart2}</span>}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 mb-12"
        >
          El countdown ha empezado. Asegura tu lugar antes que el resto.
        </motion.p>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center items-start gap-2 xs:gap-3 sm:gap-4 md:gap-6 mb-16"
        >
          <CountdownUnit value={time.days} label="Días" />
          <div className="text-xl xs:text-2xl sm:text-3xl font-black text-primary mt-3 xs:mt-4 sm:mt-6 md:mt-8 select-none">:</div>
          <CountdownUnit value={time.hours} label="Horas" />
          <div className="text-xl xs:text-2xl sm:text-3xl font-black text-primary mt-3 xs:mt-4 sm:mt-6 md:mt-8 select-none">:</div>
          <CountdownUnit value={time.minutes} label="Min" />
          <div className="text-xl xs:text-2xl sm:text-3xl font-black text-primary mt-3 xs:mt-4 sm:mt-6 md:mt-8 select-none">:</div>
          <CountdownUnit value={time.seconds} label="Seg" />
        </motion.div>

        {/* Lead Magnet Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="border border-primary/20 bg-primary/5 p-10 relative overflow-hidden"
        >
          {/* Corner decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Discount badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-black text-lg uppercase mb-6">
              {settings.waitlist_discount_text || "20% OFF TU PRIMER MES"}
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white uppercase mb-3">
              Únete a la Lista de Espera
            </h3>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Sé el primero en saber cuando abramos. Los de la lista consiguen un{" "}
              <span className="text-primary font-bold">
                descuento especial
              </span>{" "}
              — solo para los que se adelanten.
            </p>

            {!submitted ? (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
                id="waitlist-form"
              >
                <input
                  ref={inputRef}
                  id="waitlist-input"
                  type="text"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="Email o WhatsApp"
                  required
                  className="flex-1 px-5 py-4 bg-zinc-900 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary/60 transition-colors"
                />
                <button
                  type="submit"
                  id="waitlist-submit"
                  disabled={submitting}
                  className="px-8 py-4 bg-primary text-white font-black text-sm uppercase tracking-widest hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:scale-100 whitespace-nowrap shadow-[0_0_30px_-8px_rgba(212,160,23,0.5)]"
                >
                  {submitting ? "ENVIANDO..." : "QUIERO MI DESCUENTO →"}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 px-8 bg-primary/10 border border-primary/30 inline-block"
              >
                <p className="text-primary font-black text-xl uppercase tracking-wide">
                  ✓ ¡Estás dentro de la lista!
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Te avisaremos antes de la apertura con tu código de descuento.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
