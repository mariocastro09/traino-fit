import { Layout } from "~/components/layout";
import type { Route } from "./+types/home";
import { Hero } from "~/components/home/hero";
import { HybridProblem } from "~/components/home/hybrid-problem";
import { ThreePillars } from "~/components/home/three-pillars";
import { WaitlistSection } from "~/components/home/waitlist";
import { InstagramPreview } from "~/components/home/instagram-preview";

export function meta({}: Route.MetaArgs) {
  return [
    {
      title:
        "TrainoFit — Tu Entrenamiento Sin Límites | Gym + CrossFit | Apertura Agosto 2025",
    },
    {
      name: "description",
      content:
        "La potencia del Gym Tradicional y la intensidad del CrossFit en un solo lugar. Reserva tu cupo de apertura con un 20% de descuento. Nueva apertura en Agosto 2025.",
    },
    {
      name: "keywords",
      content:
        "crossfit, gym, trainofit, box, athlete, entrenamiento, apertura agosto, chile",
    },
    // Open Graph
    { property: "og:title", content: "TrainoFit — Tu Entrenamiento Sin Límites" },
    {
      property: "og:description",
      content:
        "Gym + CrossFit híbrido. Reserva tu cupo de apertura en Agosto 2025 y obtén 20% off.",
    },
    { property: "og:type", content: "website" },
    { property: "og:image", content: "/trainofit.jpg" },
  ];
}

export default function Home() {
  return (
    <Layout>
      {/* Section 1: Hero — The Hook */}
      <Hero />

      {/* Section 2: The Hybrid Problem — The Agitation */}
      <HybridProblem />

      {/* Section 3: Three Pillars — The Solution */}
      <ThreePillars />

      {/* Section 4: Pricing — moved to /precios but teased here */}
      {/* Section 5: Waitlist + Countdown — The Urgency */}
      <WaitlistSection />

      {/* Section 6: Instagram preview */}
      <InstagramPreview />

      {/* Footer is handled by Layout (includes maps + WhatsApp) */}
    </Layout>
  );
}
