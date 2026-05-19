import { Layout } from "~/components/layout";
import { Section } from "~/components/ui/section";
import type { Route } from "./+types/instagram";
import { Instagram, ExternalLink } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Instagram - Trainofit | Síguenos en Redes Sociales" },
    {
      name: "description",
      content: "Síguenos en Instagram @trainofit para ver WODs diarios, transformaciones de miembros y eventos. Únete a nuestra comunidad fitness.",
    },
  ];
}

export default function InstagramPage() {
  return (
    <Layout>
      <Section>
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-6">
            <Instagram className="text-primary" size={64} />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Síguenos en <span className="text-gradient">Instagram</span>
          </h1>
          <p className="text-xl text-light/70 max-w-2xl mx-auto mb-8">
            Únete a nuestra comunidad en Instagram y comparte tu viaje fitness. Ve entrenamientos diarios, transformaciones inspiradoras y eventos especiales.
          </p>
          <a
            href="https://www.instagram.com/trainofit/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent inline-flex items-center gap-2 text-lg"
          >
            <Instagram size={24} />
            Seguir @trainofit
            <ExternalLink size={18} />
          </a>
        </div>

        {/* Instagram Embed Widget */}
        <div className="max-w-4xl mx-auto">
          <div className="card p-8">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold">Galería de Instagram</h2>
              <p className="text-light/70">
                Mira nuestro feed de Instagram directamente aquí, o visita nuestro perfil para ver más contenido y unirte a la conversación.
              </p>
              
              {/* Instagram Embed Script Container */}
              <div className="instagram-embed-container">
                <blockquote
                  className="instagram-media"
                  data-instgrm-permalink="https://www.instagram.com/trainofit/"
                  data-instgrm-version="14"
                  style={{
                    background: "#FFF",
                    border: 0,
                    borderRadius: "3px",
                    boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
                    margin: "1px auto",
                    maxWidth: "540px",
                    minWidth: "326px",
                    padding: 0,
                    width: "99.375%"
                  }}
                >
                  <div style={{ padding: "16px" }}>
                    <a
                      href="https://www.instagram.com/trainofit/"
                      style={{
                        background: "#FFFFFF",
                        lineHeight: 0,
                        padding: "0 0",
                        textAlign: "center",
                        textDecoration: "none",
                        width: "100%"
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <div style={{
                          backgroundColor: "#F4F4F4",
                          borderRadius: "50%",
                          flexGrow: 0,
                          height: "40px",
                          marginRight: "14px",
                          width: "40px"
                        }}></div>
                        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center" }}>
                          <div style={{
                            backgroundColor: "#F4F4F4",
                            borderRadius: "4px",
                            flexGrow: 0,
                            height: "14px",
                            marginBottom: "6px",
                            width: "100px"
                          }}></div>
                          <div style={{
                            backgroundColor: "#F4F4F4",
                            borderRadius: "4px",
                            flexGrow: 0,
                            height: "14px",
                            width: "60px"
                          }}></div>
                        </div>
                      </div>
                      <div style={{ padding: "19% 0" }}></div>
                      <div style={{
                        display: "block",
                        height: "50px",
                        margin: "0 auto 12px",
                        width: "50px"
                      }}>
                      </div>
                      <div style={{ paddingTop: "8px" }}>
                        <div style={{
                          color: "#3897f0",
                          fontFamily: "Arial,sans-serif",
                          fontSize: "14px",
                          fontStyle: "normal",
                          fontWeight: 550,
                          lineHeight: "18px"
                        }}>
                          Ver esta publicación en Instagram
                        </div>
                      </div>
                    </a>
                  </div>
                </blockquote>
                
                {/* Instagram Embed Script will be loaded */}
                <script async src="//www.instagram.com/embed.js"></script>
              </div>

              <div className="pt-8 border-t border-white/10">
                <p className="text-light/60 text-sm">
                  ¿No ves el feed? <a href="https://www.instagram.com/trainofit/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Visita nuestro perfil directamente</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instagram Grid Placeholder */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-square card hover:scale-105 transition-transform">
              <div className="h-full w-full bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                <Instagram className="text-primary/50" size={48} />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-light/70 mb-6">
            ¿Quieres aparecer en nuestro feed? ¡Etiquétanos en tus posts! #Trainofit
          </p>
          <a
            href="https://www.instagram.com/trainofit/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Instagram size={20} />
            Síguenos Ahora
          </a>
        </div>
      </Section>
    </Layout>
  );
}
