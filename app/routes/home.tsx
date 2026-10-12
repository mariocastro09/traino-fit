import { Layout } from "~/components/layout";
import type { Route } from "./+types/home";
import { Hero } from "~/components/home/hero";
import { HybridProblem } from "~/components/home/hybrid-problem";
import { ThreePillars } from "~/components/home/three-pillars";
import { NowOpenSection, WaitlistSection } from "~/components/home/waitlist";
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
  const settings = await orFallback(() => getPublicSettings(d1(context)), {});
  // The opening date set in the admin panel switches the page from
  // pre-opening (countdown + waitlist) to open (book a free class).
  const opening = new Date(settings.waitlist_countdown_target || "").getTime();
  return { settings, isOpen: !(opening > Date.now()) };
}

export function meta({}: Route.MetaArgs) {
  return [
    ...pageMeta({
      title: "TrainoFit — Gym + CrossFit en Puente Alto",
      description:
        "La potencia del Gym Tradicional y la intensidad del CrossFit en un solo lugar. Ya abrimos en Puente Alto: agenda tu primera clase gratis.",
      path: "/",
    }),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "ExerciseGym",
        name: SITE_NAME,
        url: SITE_URL,
        image: `${SITE_URL}/hero-gym.jpg`,
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
  const { settings, isOpen } = loaderData;

  return (
    <Layout>
      {/* Section 1: Hero — The Hook */}
      <Hero settings={settings} isOpen={isOpen} />

      {/* Section 2: The Hybrid Problem — The Agitation */}
      <HybridProblem />

      {/* Section 3: Three Pillars — The Solution */}
      <ThreePillars settings={settings} />

      {/* Section 4: Countdown + waitlist before opening, free-class invite after */}
      {isOpen ? <NowOpenSection /> : <WaitlistSection settings={settings} />}

      {/* Section 5: Instagram preview */}
      <InstagramPreview />

      {/* Footer is handled by Layout (includes maps + WhatsApp) */}
    </Layout>
  );
}
