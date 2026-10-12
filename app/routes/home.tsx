import { Layout } from "~/components/layout";
import type { Route } from "./+types/home";
import { Hero } from "~/components/home/hero";
import { HybridProblem } from "~/components/home/hybrid-problem";
import { ThreePillars } from "~/components/home/three-pillars";
import { WaitlistSection } from "~/components/home/waitlist";
import { InstagramPreview } from "~/components/home/instagram-preview";
import { d1, getPublicSettings, orFallback } from "../../server/public-data";
import {
  INSTAGRAM_URL,
  MAPS_LINK,
  SITE_NAME,
  SITE_URL,
  WHATSAPP_NUMBER,
  pageMeta,
} from "~/lib/site";

export async function loader({ context }: Route.LoaderArgs) {
  return { settings: await orFallback(() => getPublicSettings(d1(context)), {}) };
}

export function meta({}: Route.MetaArgs) {
  return [
    ...pageMeta({
      title: "TrainoFit — Gym + CrossFit en Puente Alto",
      description:
        "La potencia del Gym Tradicional y la intensidad del CrossFit en un solo lugar. Reserva tu cupo de apertura con un 20% de descuento.",
      path: "/",
    }),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "ExerciseGym",
        name: SITE_NAME,
        url: SITE_URL,
        image: `${SITE_URL}/deadlift-poster.jpg`,
        telephone: `+${WHATSAPP_NUMBER}`,
        hasMap: MAPS_LINK,
        sameAs: [INSTAGRAM_URL],
        address: {
          "@type": "PostalAddress",
          streetAddress: "Av. 3 de Septiembre 090",
          addressLocality: "Puente Alto",
          addressRegion: "Región Metropolitana",
          addressCountry: "CL",
        },
      },
    },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { settings } = loaderData;

  return (
    <Layout>
      {/* Section 1: Hero — The Hook */}
      <Hero settings={settings} />

      {/* Section 2: The Hybrid Problem — The Agitation */}
      <HybridProblem />

      {/* Section 3: Three Pillars — The Solution */}
      <ThreePillars settings={settings} />

      {/* Section 4: Waitlist + Countdown — The Urgency */}
      <WaitlistSection settings={settings} />

      {/* Section 5: Instagram preview */}
      <InstagramPreview />

      {/* Footer is handled by Layout (includes maps + WhatsApp) */}
    </Layout>
  );
}
