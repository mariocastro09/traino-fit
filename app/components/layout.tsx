import { Link, NavLink, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { Menu, X, Instagram, MapPin, Phone, Mail } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  ADDRESS,
  EMAIL,
  INSTAGRAM_URL,
  MAPS_EMBED,
  WHATSAPP_DISPLAY,
  whatsappLink,
} from "~/lib/site";

const NAV_LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/clases", label: "Clases" },
  { to: "/horario", label: "Horario" },
  { to: "/precios", label: "Precios" },
  { to: "/instagram", label: "Instagram" },
  { to: "/contacto", label: "Contacto" },
];

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("inline-flex items-center gap-3", className)}>
      <span className="shrink-0 bg-primary/10 p-2 rounded-full border-2 border-primary/30">
        <img
          src="/traino-svg.svg"
          alt=""
          width={36}
          height={36}
          className="size-9"
          style={{
            filter:
              "brightness(0) saturate(100%) invert(77%) sepia(18%) saturate(1247%) hue-rotate(8deg) brightness(95%) contrast(88%)",
          }}
        />
      </span>
      <span className="font-logo text-xl sm:text-2xl leading-none text-white max-[479px]:sr-only">
        TRAIN<span className="text-primary">O</span>FIT
      </span>
    </Link>
  );
}

// ── WhatsApp floating button ──────────────────────
function WhatsAppButton() {
  return (
    <a
      href={whatsappLink("Hola TrainoFit! Quisiera más información sobre los planes.")}
      target="_blank"
      rel="noopener noreferrer"
      id="whatsapp-float-btn"
      aria-label="Contáctanos por WhatsApp"
      className="fixed z-40 right-[max(1.5rem,env(safe-area-inset-right))] bottom-[max(1.5rem,env(safe-area-inset-bottom))] size-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}

// ── Layout ────────────────────────────────────────
export function Layout({
  children,
  hideFooter = false,
  hideHeader = false,
  hideWhatsApp = false,
}: {
  children: React.ReactNode;
  hideFooter?: boolean;
  hideHeader?: boolean;
  hideWhatsApp?: boolean;
}) {
  return (
    <div className="bg-dark text-light font-sans min-h-dvh flex flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-dark focus:font-bold"
      >
        Saltar al contenido
      </a>
      {!hideHeader && <Header />}
      <main id="contenido" className="flex-1 flex flex-col">
        {children}
      </main>
      {!hideFooter && <Footer />}
      {!hideWhatsApp && <WhatsAppButton />}
    </div>
  );
}

// ── Header ────────────────────────────────────────
function Header() {
  const { pathname } = useLocation();
  // Storing the path the menu was opened on closes it on any navigation.
  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
  const menuOpen = menuOpenAt === pathname;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem("admin_session"));
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-dark/95 backdrop-blur-md border-b border-white/10">
      <nav aria-label="Principal" className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo />

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "font-medium py-2 border-b-2 transition-colors duration-200",
                      isActive
                        ? "text-primary border-primary"
                        : "text-light/80 border-transparent hover:text-primary"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  className="px-3.5 py-1.5 bg-primary text-dark font-bold text-xs hover:bg-primary-300 transition-colors duration-200"
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>

          {/* The site's one primary action stays reachable on every page */}
          <div className="flex items-center gap-2">
            {pathname !== "/contacto" && (
              <Link
                to="/contacto"
                className="px-4 py-2.5 bg-primary text-dark font-black text-xs uppercase tracking-wider whitespace-nowrap hover:bg-primary-300 transition-colors duration-200"
              >
                Clase gratis
              </Link>
            )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpenAt(menuOpen ? null : pathname)}
            className="lg:hidden p-2 text-light hover:text-primary transition-colors duration-200"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
          >
            {menuOpen ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
          </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <ul id="menu-movil" className="lg:hidden pt-4 pb-2 border-t border-white/10 mt-4">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => setMenuOpenAt(null)}
                  className={({ isActive }) =>
                    cn(
                      "block py-3 px-4 border-l-2 transition-colors duration-200",
                      isActive
                        ? "text-primary border-primary bg-white/5"
                        : "text-light/80 border-transparent hover:text-primary hover:bg-white/5"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            {isAdmin && (
              <li className="px-4 py-2 mt-2">
                <Link
                  to="/admin"
                  className="block w-full text-center py-2 bg-primary text-dark font-bold text-sm hover:bg-primary-300 transition-colors duration-200"
                >
                  Panel Admin
                </Link>
              </li>
            )}
          </ul>
        )}
      </nav>
    </header>
  );
}

// ── Footer ────────────────────────────────────────
function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-zinc-950">
      {/* Map embed */}
      <div className="w-full h-56 bg-zinc-900 border-b border-white/5">
        <iframe
          title="Ubicación de TrainoFit en Google Maps"
          src={MAPS_EMBED}
          width="100%"
          height="100%"
          style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Logo />
            <p className="text-gray-400 text-sm leading-relaxed">
              La potencia del Gym Tradicional y la intensidad del CrossFit en un
              solo lugar.
            </p>
            <div className="flex gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                id="footer-instagram-link"
                className="p-2.5 bg-white/5 border border-white/10 hover:border-primary hover:text-primary transition-colors duration-200"
                aria-label="Instagram de TrainoFit"
              >
                <Instagram size={18} aria-hidden />
              </a>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                id="footer-whatsapp-link"
                className="p-2.5 bg-white/5 border border-white/10 hover:border-[#25D366] hover:text-[#25D366] transition-colors duration-200"
                aria-label="WhatsApp de TrainoFit"
              >
                <WhatsAppIcon className="size-[18px]" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="eyebrow text-white mb-5">Navegación</h2>
            <ul className="space-y-2.5">
              {NAV_LINKS.slice(1).map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-primary text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="eyebrow text-white mb-5">Contacto</h2>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                <span>{ADDRESS}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="shrink-0 text-primary" aria-hidden />
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tabular-nums hover:text-primary transition-colors duration-200"
                >
                  {WHATSAPP_DISPLAY} (WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="shrink-0 text-primary" aria-hidden />
                <a
                  href={`mailto:${EMAIL}`}
                  className="hover:text-primary transition-colors duration-200"
                >
                  {EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-xs">
          <p>&copy; {new Date().getFullYear()} TrainoFit.cl — Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="text-gray-600 hover:text-primary transition-colors duration-200"
            >
              Admin
            </Link>
            <p>
              Hecho con ❤️ por{" "}
              <a
                href="https://www.github.com/mariocastro09"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Mario Castro
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
