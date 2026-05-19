import { Layout } from "~/components/layout";
import { Section } from "~/components/ui/section";
import { useState } from "react";
import { MapPin, Phone, Mail, Instagram, Clock, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const WHATSAPP_NUMBER = "56932214427";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola%20TrainoFit!%20Quisiera%20m%C3%A1s%20informaci%C3%B3n.`;
const MAPS_LINK = "https://maps.app.goo.gl/K6BJHLZiWNJXXvfdA";
const MAPS_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.1!2d-70.5792!3d-33.6107!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662d06f56c7d4a1%3A0x0!2sAvenida%203%20de%20Septiembre%20090%2C%20Puente%20Alto%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses-419!2scl!4v1716000000000!5m2!1ses-419!2scl";

export function meta() {
  return [
    { title: "Contacto — TrainoFit | Agenda tu Clase de Prueba" },
    {
      name: "description",
      content:
        "Contáctanos, visítanos o agenda tu primera clase gratis en TrainoFit Puente Alto.",
    },
  ];
}

export default function Contacto() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      type: "contact",
      name: formData.get("nombre"),
      phone: formData.get("telefono"),
      interestClass: formData.get("clase"),
      message: formData.get("mensaje"),
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormSubmitted(true);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        alert(data.error || "Hubo un error al enviar tu solicitud. Por favor escribe directamente por WhatsApp.");
      }
    } catch (err) {
      console.error(err);
      alert("Hubo un error de red. Por favor escribe directamente por WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Section className="relative overflow-hidden pt-12 md:pt-20 pb-24 bg-gray-950 text-white">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-16 md:mb-24 text-left border-b border-white/10 pb-10">
            <span className="text-xs font-black tracking-[0.25em] text-primary uppercase block mb-3">
              Contacto & Dirección
            </span>
            <h1
              className="text-5xl sm:text-7xl font-black uppercase tracking-tight leading-none mb-4"
              style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
            >
              HABLEMOS DE TU <span className="text-primary">CAMBIO</span>.
            </h1>
            <p className="text-sm md:text-base text-gray-400 max-w-xl font-light">
              Visita nuestras instalaciones en Puente Alto o envíanos un mensaje para agendar tu primera clase gratis.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left Column - Minimal Info List */}
            <div className="lg:col-span-5 space-y-10">
              {/* Ubicación */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-primary">
                  <MapPin size={18} />
                  <span className="text-xs font-bold tracking-[0.15em] uppercase">Ubicación</span>
                </div>
                <div className="pl-7">
                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block text-sm text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    <p className="font-semibold">Av. 3 de Septiembre 090</p>
                    <p className="text-gray-500 text-xs mt-0.5 group-hover:text-primary transition-colors">
                      Puente Alto, RM &bull; Abrir en Google Maps &rarr;
                    </p>
                  </a>
                </div>
              </div>

              {/* Horarios */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-primary">
                  <Clock size={18} />
                  <span className="text-xs font-bold tracking-[0.15em] uppercase">Horarios de Clases</span>
                </div>
                <div className="pl-7 space-y-4 text-xs text-gray-300">
                  {/* Lun, Mier, Vier */}
                  <div className="space-y-2">
                    <p className="font-extrabold text-white uppercase tracking-wider text-[10px] text-primary/95">
                      Lunes, Miércoles y Viernes
                    </p>
                    <div className="space-y-1 pl-2.5 border-l border-white/10 font-mono text-[11px] text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/45" />
                        <span>11:00 a 12:00 hrs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/45" />
                        <span>12:00 a 13:00 hrs</span>
                      </div>
                      <div className="pt-2 pb-0.5 text-[9px] text-gray-600 uppercase tracking-widest font-sans font-black">
                        Bloques Tarde / Noche
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/45" />
                        <span>17:30 a 18:30 hrs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/45" />
                        <span>18:30 a 19:30 hrs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/45" />
                        <span>19:30 a 20:30 hrs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/45" />
                        <span>20:30 a 21:30 hrs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/45" />
                        <span>21:30 a 22:30 hrs</span>
                      </div>
                    </div>
                  </div>

                  {/* Mar, Jue */}
                  <div className="space-y-2">
                    <p className="font-extrabold text-white uppercase tracking-wider text-[10px] text-primary/95">
                      Martes y Jueves
                    </p>
                    <div className="space-y-1 pl-2.5 border-l border-white/10 font-mono text-[11px] text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/45" />
                        <span>17:30 a 18:30 hrs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/45" />
                        <span>18:30 a 19:30 hrs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/45" />
                        <span>19:30 a 20:30 hrs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/45" />
                        <span>20:30 a 21:30 hrs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teléfono & Email */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-primary">
                  <Phone size={18} />
                  <span className="text-xs font-bold tracking-[0.15em] uppercase">Contacto Directo</span>
                </div>
                <div className="pl-7 space-y-2 text-sm text-gray-300">
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:text-primary transition-colors font-mono"
                  >
                    +56 9 3221 4427 <span className="text-xs text-emerald-500 font-sans ml-2">(WhatsApp)</span>
                  </a>
                  <a
                    href="mailto:trainocf@gmail.com"
                    className="block hover:text-primary transition-colors font-mono"
                  >
                    trainocf@gmail.com
                  </a>
                </div>
              </div>

              {/* Instagram */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-primary">
                  <Instagram size={18} />
                  <span className="text-xs font-bold tracking-[0.15em] uppercase">Comunidad</span>
                </div>
                <div className="pl-7">
                  <a
                    href="https://www.instagram.com/trainofit/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    <span>@trainofit</span>
                    <span className="text-xs text-gray-500">&rarr;</span>
                  </a>
                </div>
              </div>

              {/* Clean minimal Map frame */}
              <div className="relative rounded-lg overflow-hidden border border-white/10 group mt-4">
                <iframe
                  title="TrainoFit Map"
                  src={MAPS_EMBED}
                  width="100%"
                  height="180"
                  style={{ border: 0, display: "block", filter: "invert(90%) hue-rotate(180deg) grayscale(100%) opacity(70%)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Right Column - Premium Clean Form */}
            <div className="lg:col-span-7">
              <div className="relative bg-zinc-900/40 border border-white/5 rounded-2xl p-8 sm:p-10 backdrop-blur-md">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                
                <AnimatePresence mode="wait">
                  {!formSubmitted ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <h3
                        className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-2"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        RESERVAR PRIMERA CLASE GRATIS
                      </h3>
                      <p className="text-xs text-gray-400 mb-8 font-light">
                        Déjanos tus datos. Te contactaremos por WhatsApp dentro de 15 minutos para agendar.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                            Nombre Completo
                          </label>
                          <input
                            type="text"
                            name="nombre"
                            required
                            placeholder="Ej. Juan Pérez"
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors font-light"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                              WhatsApp / Teléfono
                            </label>
                            <input
                              type="tel"
                              name="telefono"
                              required
                              placeholder="Ej. +56912345678"
                              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors font-mono font-light"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                              Clase de Interés
                            </label>
                            <select
                              name="clase"
                              required
                              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors font-light"
                            >
                              <option value="hybrid" className="bg-zinc-900">Traino Hybrid (Recomendado)</option>
                              <option value="box" className="bg-zinc-900">Traino Box (CrossFit)</option>
                              <option value="gym" className="bg-zinc-900">Traino Gym (Tradicional)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                            Mensaje (Opcional)
                          </label>
                          <textarea
                            name="mensaje"
                            rows={3}
                            placeholder="Cuéntanos sobre tu nivel o si tienes lesiones..."
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors font-light"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full relative flex items-center justify-center gap-2 py-4 bg-primary text-white font-black text-xs tracking-widest uppercase hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(212,160,23,0.3)] transition-all duration-300 disabled:opacity-50"
                        >
                          {loading ? (
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              RESERVAR MI CLASE DE PRUEBA
                              <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="text-center py-12 flex flex-col items-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary flex items-center justify-center text-primary mb-6 animate-bounce">
                        <Check size={28} />
                      </div>
                      <h3
                        className="text-3xl font-black uppercase tracking-tight text-white mb-3"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        ¡SOLICITUD RECIBIDA!
                      </h3>
                      <p className="text-sm text-gray-300 max-w-sm mb-8 font-light leading-relaxed">
                        Excelente decisión. Nos pondremos en contacto contigo por WhatsApp a la brevedad para coordinar tu horario de prueba.
                      </p>
                      <a
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-primary hover:text-white uppercase border-b border-primary hover:border-white pb-1 transition-all"
                      >
                        Escríbenos directamente por WhatsApp &rarr;
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
}