import { Layout, WhatsAppIcon } from "~/components/layout";
import { Section } from "~/components/ui/section";
import { PageHero } from "~/components/page-hero";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { MapPin, Phone, Instagram, Clock, ArrowRight, Check, Calendar, Dumbbell, Users, Zap } from "lucide-react";
import {
  EMAIL,
  INSTAGRAM_URL,
  MAPS_EMBED,
  MAPS_LINK,
  WHATSAPP_DISPLAY,
  pageMeta,
  whatsappLink,
} from "~/lib/site";
import { cn } from "~/lib/utils";

export function meta() {
  return pageMeta({
    title: "Contacto — TrainoFit",
    description:
      "Contáctanos, visítanos o agenda tu primera clase gratis en TrainoFit Puente Alto.",
    path: "/contacto",
  });
}

const CLASS_OPTIONS = [
  { id: "hybrid", name: "Traino Hybrid", desc: "Funcional & Fuerza", icon: Zap },
  { id: "box", name: "Traino Box", desc: "CrossFit y Gimnasia", icon: Users },
  { id: "gym", name: "Traino Gym", desc: "Musculación Guiada", icon: Dumbbell },
];

const CLASS_HOURS = [
  {
    days: "Lunes, Miércoles y Viernes",
    blocks: ["11:00 a 12:00", "12:00 a 13:00", "17:30 a 18:30", "18:30 a 19:30", "19:30 a 20:30", "20:30 a 21:30", "21:30 a 22:30"],
  },
  {
    days: "Martes y Jueves",
    blocks: ["17:30 a 18:30", "18:30 a 19:30", "19:30 a 20:30", "20:30 a 21:30"],
  },
];

const inputClass =
  "w-full bg-black/30 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary transition-colors duration-200";
const labelClass = "block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5";

export default function Contacto() {
  const [searchParams] = useSearchParams();
  const initialClase = searchParams.get("clase") || "hybrid";
  const dia = searchParams.get("dia") || "";
  const hora = searchParams.get("hora") || "";
  // Set when the visitor arrives from a plan on the pricing page
  const plan = searchParams.get("plan") || "";

  // A class picked on the schedule page arrives by name and becomes an extra option.
  const options = CLASS_OPTIONS.some((o) => o.id === initialClase)
    ? CLASS_OPTIONS
    : [{ id: initialClase, name: initialClase, desc: "Horario Elegido", icon: Calendar }, ...CLASS_OPTIONS];

  const [activeTab, setActiveTab] = useState<"form" | "whatsapp">("form");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [clase, setClase] = useState(initialClase);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const claseLabel = options.find((o) => o.id === clase)?.name ?? clase;
  const slot = dia && hora ? ` el día ${dia} a las ${hora}` : "";
  // Until the visitor types, the message follows the selected class and slot.
  const planNote = plan ? ` Me interesa el plan ${plan}.` : "";
  const mensajeValue =
    mensaje ??
    (slot
      ? `Hola, me interesa agendar una clase de prueba de ${claseLabel}${slot}.`
      : planNote.trim());
  const waText = `Hola TrainoFit! Me interesa agendar mi clase de prueba gratis de ${claseLabel}${
    slot ? ` para${slot}` : ""
  }.${planNote}`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          name: formData.get("nombre"),
          phone: formData.get("telefono"),
          interestClass: clase,
          message: formData.get("mensaje"),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
    } catch (err) {
      console.error(err);
      setError("No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos directamente por WhatsApp.");
      setStatus("idle");
    }
  };

  return (
    <Layout>
      <PageHero
        media="page-contacto"
        eyebrow="Contacto y dirección"
        title={<>Hablemos de tu <span className="text-primary">cambio</span>.</>}
        subtitle={
          plan
            ? `Elegiste el plan ${plan}. Déjanos tus datos y te contactamos para activarlo; tu primera clase es gratis.`
            : "Visita nuestras instalaciones en Puente Alto o envíanos un mensaje para agendar tu primera clase gratis."
        }
      />

      <Section className="bg-zinc-950 text-white">
        <div className="max-w-6xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left Column - Info */}
            <div className="lg:col-span-5 space-y-10">
              <InfoBlock icon={MapPin} title="Ubicación">
                <a
                  href={MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block text-sm text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <span className="block font-semibold">Av. 3 de Septiembre 090</span>
                  <span className="block text-gray-400 text-xs mt-0.5 group-hover:text-primary transition-colors duration-200">
                    Puente Alto, RM &bull; Abrir en Google Maps &rarr;
                  </span>
                </a>
              </InfoBlock>

              <InfoBlock icon={Clock} title="Horarios de Clases">
                <div className="space-y-5">
                  {CLASS_HOURS.map((group) => (
                    <div key={group.days}>
                      <h3 className="font-bold text-primary uppercase tracking-wider text-xs mb-2">
                        {group.days}
                      </h3>
                      <ul className="pl-3 border-l border-white/10 text-sm text-gray-400 tabular-nums grid grid-cols-2 gap-x-4 gap-y-1">
                        {group.blocks.map((block) => (
                          <li key={block}>{block}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </InfoBlock>

              <InfoBlock icon={Phone} title="Contacto Directo">
                <div className="space-y-2 text-sm text-gray-300">
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block tabular-nums hover:text-primary transition-colors duration-200"
                  >
                    {WHATSAPP_DISPLAY} <span className="text-xs text-emerald-400 ml-2">(WhatsApp)</span>
                  </a>
                  <a href={`mailto:${EMAIL}`} className="block hover:text-primary transition-colors duration-200">
                    {EMAIL}
                  </a>
                </div>
              </InfoBlock>

              <InfoBlock icon={Instagram} title="Comunidad">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-primary transition-colors duration-200"
                >
                  @trainofit &rarr;
                </a>
              </InfoBlock>

              <iframe
                title="Ubicación de TrainoFit en Google Maps"
                src={MAPS_EMBED}
                width="100%"
                height="180"
                className="block border border-white/10"
                style={{ filter: "invert(90%) hue-rotate(180deg) grayscale(100%) opacity(70%)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-7 order-first lg:order-last">
              <div className="bg-zinc-900/60 border border-white/10 border-t-2 border-t-primary p-6 sm:p-10 reveal">
                {status === "done" ? (
                  <div role="status" className="text-center py-12 flex flex-col items-center">
                    <span className="size-16 rounded-full bg-primary/10 border border-primary flex items-center justify-center text-primary mb-6">
                      <Check size={28} aria-hidden />
                    </span>
                    <h2 className="font-display text-5xl uppercase text-white mb-3">
                      ¡Solicitud recibida!
                    </h2>
                    <p className="text-sm text-gray-300 max-w-sm mb-8 leading-relaxed">
                      Excelente decisión. Nos pondremos en contacto contigo por WhatsApp a la brevedad para coordinar tu horario de prueba.
                    </p>
                    <a
                      href={whatsappLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold tracking-widest text-primary hover:text-primary-300 uppercase underline underline-offset-8 transition-colors duration-200"
                    >
                      Escríbenos directamente por WhatsApp &rarr;
                    </a>
                  </div>
                ) : (
                  <>
                    {/* Channel switcher */}
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/30 border border-white/10 mb-8">
                      {(["form", "whatsapp"] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          aria-pressed={activeTab === tab}
                          className={cn(
                            "py-2.5 text-xs font-black uppercase tracking-wider transition-colors duration-200",
                            activeTab === tab ? "bg-primary text-dark" : "text-gray-400 hover:text-white"
                          )}
                        >
                          {tab === "form" ? "Formulario Web" : "WhatsApp Express"}
                        </button>
                      ))}
                    </div>

                    {/* Class picker — shared by both channels */}
                    <fieldset className="mb-6">
                      <legend className={labelClass}>Elige tu Clase de Interés</legend>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {options.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setClase(item.id)}
                            aria-pressed={clase === item.id}
                            className={cn(
                              "flex flex-col items-start gap-1 p-3.5 border text-left transition-colors duration-200",
                              clase === item.id
                                ? "bg-primary/10 border-primary text-white"
                                : "bg-black/20 border-white/15 text-gray-400 hover:border-white/40 hover:text-white"
                            )}
                          >
                            <item.icon size={20} className="text-primary mb-1" aria-hidden />
                            <span className="text-xs font-black uppercase tracking-wider">{item.name}</span>
                            <span className="text-xs text-gray-400">{item.desc}</span>
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    {activeTab === "form" ? (
                      <>
                        <h2 className="font-display text-4xl uppercase text-primary mb-2">
                          Reserva tu primera clase gratis
                        </h2>
                        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                          Completa el formulario. Un coach se comunicará contigo por WhatsApp para agendar tu bloque de entrenamiento.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div>
                            <label htmlFor="contacto-nombre" className={labelClass}>
                              Nombre Completo
                            </label>
                            <input
                              id="contacto-nombre"
                              type="text"
                              name="nombre"
                              required
                              maxLength={100}
                              autoComplete="name"
                              placeholder="Ej. Juan Pérez"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label htmlFor="contacto-telefono" className={labelClass}>
                              WhatsApp / Teléfono
                            </label>
                            <input
                              id="contacto-telefono"
                              type="tel"
                              name="telefono"
                              required
                              maxLength={30}
                              autoComplete="tel"
                              placeholder="Ej. +56912345678"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label htmlFor="contacto-mensaje" className={labelClass}>
                              Mensaje (Opcional)
                            </label>
                            <textarea
                              id="contacto-mensaje"
                              name="mensaje"
                              rows={3}
                              maxLength={1000}
                              value={mensajeValue}
                              onChange={(e) => setMensaje(e.target.value)}
                              placeholder="Cuéntanos sobre tu nivel o si tienes lesiones..."
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <button
                              type="submit"
                              disabled={status === "sending"}
                              aria-describedby={error ? "contacto-error" : undefined}
                              className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-dark font-black text-xs tracking-widest uppercase hover:bg-primary-300 transition-colors duration-200 disabled:opacity-60"
                            >
                              {status === "sending" ? "Enviando…" : "Reservar mi clase gratis"}
                              <ArrowRight size={14} aria-hidden />
                            </button>
                            <p id="contacto-error" role="alert" className="text-red-400 text-sm mt-3 empty:hidden">
                              {error}
                            </p>
                          </div>
                        </form>
                      </>
                    ) : (
                      <>
                        <h2 className="font-display text-4xl uppercase text-white mb-2">
                          Reserva express vía WhatsApp
                        </h2>
                        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                          ¿Prefieres no llenar el formulario? Abre un chat directo con nosotros. Tu mensaje de reserva ya está escrito: solo presiona "Enviar".
                        </p>

                        <figure className="bg-black/30 border border-white/10 p-4 mb-6">
                          <figcaption className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                            Vista previa del mensaje
                          </figcaption>
                          <blockquote className="text-sm text-emerald-400 leading-relaxed">
                            {waText}
                          </blockquote>
                        </figure>

                        <a
                          href={whatsappLink(waText)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs tracking-widest uppercase transition-colors duration-200"
                        >
                          <WhatsAppIcon className="size-4" />
                          Enviar WhatsApp ahora
                        </a>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
}

function InfoBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="reveal">
      <h2 className="flex items-center gap-2.5 text-primary text-xs font-bold tracking-widest uppercase mb-3">
        <Icon size={18} aria-hidden />
        {title}
      </h2>
      <div className="pl-7">{children}</div>
    </section>
  );
}
