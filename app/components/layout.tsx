import { Link } from "react-router";
import { useState } from "react";
import { Menu, X, Instagram, MapPin, Phone, Mail } from "lucide-react";

// ── WhatsApp floating button ──────────────────────
function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/56932214427?text=Hola%20TrainoFit!%20Quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20los%20planes."
      target="_blank"
      rel="noopener noreferrer"
      id="whatsapp-float-btn"
      aria-label="Contáctanos por WhatsApp"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 overflow-hidden transition-all duration-500"
    >
      {/* Label (expands on hover) */}
      <span className="max-w-0 group-hover:max-w-[200px] overflow-hidden whitespace-nowrap text-sm font-bold text-white bg-zinc-900 px-0 group-hover:px-4 py-2 transition-all duration-500 border border-white/10 group-hover:border-green-500/30">
        Contáctanos
      </span>

      {/* Icon button */}
      <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_4px_30px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_4px_40px_rgba(37,211,102,0.6)] transition-all duration-300">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-7 h-7 text-white"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </div>
    </a>
  );
}

// ── Header ────────────────────────────────────────
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-dark text-light font-sans min-h-screen">
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-dark/95 backdrop-blur-md border-b border-white/10">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm"></div>
              <div className="relative bg-primary/10 p-2 rounded-full border-2 border-primary/30 group-hover:border-primary/60 transition-all">
                <img
                  src="/traino-svg.svg"
                  alt="Trainofit Logo"
                  className="h-10 w-10 brightness-0 invert opacity-90"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(77%) sepia(18%) saturate(1247%) hue-rotate(8deg) brightness(95%) contrast(88%)",
                  }}
                />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-bold">
              TRAIN<span className="text-primary">O</span>FIT
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/">Inicio</NavLink>
            <NavLink to="/clases">Clases</NavLink>
            <NavLink to="/horario">Horario</NavLink>
            <NavLink to="/precios">Precios</NavLink>
            <NavLink to="/instagram">Instagram</NavLink>
            <NavLink to="/contacto">Contacto</NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-light hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-white/10 mt-4">
            <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)}>
              Inicio
            </MobileNavLink>
            <MobileNavLink
              to="/clases"
              onClick={() => setMobileMenuOpen(false)}
            >
              Clases
            </MobileNavLink>
            <MobileNavLink
              to="/horario"
              onClick={() => setMobileMenuOpen(false)}
            >
              Horario
            </MobileNavLink>
            <MobileNavLink
              to="/precios"
              onClick={() => setMobileMenuOpen(false)}
            >
              Precios
            </MobileNavLink>
            <MobileNavLink
              to="/instagram"
              onClick={() => setMobileMenuOpen(false)}
            >
              Instagram
            </MobileNavLink>
            <MobileNavLink
              to="/contacto"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contacto
            </MobileNavLink>
          </div>
        )}
      </nav>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-light/80 hover:text-primary transition-all duration-300 ease-in-out font-medium relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
    </Link>
  );
}

function MobileNavLink({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block py-2 px-4 text-light/80 hover:text-primary hover:bg-white/5 rounded-lg transition-all duration-300 ease-in-out"
    >
      {children}
    </Link>
  );
}

// ── Footer ────────────────────────────────────────
function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-zinc-950">
      {/* Map embed */}
      <div className="w-full h-56 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
          <iframe
            title="TrainoFit Ubicación"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.1!2d-70.5792!3d-33.6107!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662d06f56c7d4a1%3A0x0!2sAvenida%203%20de%20Septiembre%20090%2C%20Puente%20Alto%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses-419!2scl!4v1716000000000!5m2!1ses-419!2scl"
            width="100%"
            height="100%"
            style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        {/* Overlay gradient on map edges */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(9,9,11,0.6)_100%)]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <h3
              className="text-3xl font-black text-primary tracking-wide"
              style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
            >
              TRAINOFIT
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              La potencia del Gym Tradicional y la intensidad del CrossFit en un
              solo lugar.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/trainofit/"
                target="_blank"
                rel="noopener noreferrer"
                id="footer-instagram-link"
                className="p-2.5 bg-white/5 border border-white/10 hover:bg-gradient-to-br hover:from-purple-600 hover:to-orange-400 hover:border-transparent transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://wa.me/56932214427"
                target="_blank"
                rel="noopener noreferrer"
                id="footer-whatsapp-link"
                className="p-2.5 bg-white/5 border border-white/10 hover:bg-[#25D366] hover:border-[#25D366] transition-all duration-300"
                aria-label="WhatsApp"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-[18px] h-[18px]"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-black text-sm tracking-[0.2em] uppercase text-white mb-5">
              Navegación
            </h4>
            <ul className="space-y-2.5">
              <FooterLink to="/clases">Clases</FooterLink>
              <FooterLink to="/horario">Horario</FooterLink>
              <FooterLink to="/precios">Precios</FooterLink>
              <FooterLink to="/instagram">Instagram</FooterLink>
              <FooterLink to="/contacto">Contacto</FooterLink>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-black text-sm tracking-[0.2em] uppercase text-white mb-5">
              Contacto
            </h4>
            <ul className="space-y-4 text-gray-500">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-sm">Avenida 3 de Septiembre 090, Puente Alto</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="flex-shrink-0 text-primary" />
                <a
                  href="https://wa.me/56932214427"
                  className="text-sm hover:text-primary transition-colors"
                >
                  +56 9 32214427 (WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="flex-shrink-0 text-primary" />
                <a
                  href="mailto:hola@trainofit.cl"
                  className="text-sm hover:text-primary transition-colors"
                >
                  trainocf@gmail.com
                </a>
              </li>
            </ul>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/56932214427?text=Hola%20TrainoFit!%20Quiero%20saber%20más."
              target="_blank"
              rel="noopener noreferrer"
              id="footer-whatsapp-cta"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-sm font-bold hover:bg-[#25D366]/20 transition-all duration-300"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Escríbenos ahora
            </a>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-600 text-xs">
          <p>&copy; 2025 TrainoFit.cl — Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="text-gray-600/30 hover:text-primary transition-colors duration-300 text-[11px]"
              title="Panel de Administración"
            >
              Admin
            </Link>
            <p>
              Hecho con ❤️ por{" "}
              <a
                href="https://www.github.com/mariocastro09"
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

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        className="text-gray-500 hover:text-primary text-sm transition-all duration-300 ease-in-out"
      >
        {children}
      </Link>
    </li>
  );
}
