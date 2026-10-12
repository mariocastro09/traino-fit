// Business facts and page metadata, defined once for every public route.

export const SITE_URL = "https://trainofit.cl";
export const SITE_NAME = "TrainoFit";

export const WHATSAPP_NUMBER = "56932214427";
export const WHATSAPP_DISPLAY = "+56 9 3221 4427";
export const EMAIL = "trainocf@gmail.com";
export const INSTAGRAM_URL = "https://www.instagram.com/trainofit/";
export const ADDRESS = "Av. 3 de Septiembre 090, Puente Alto";
export const MAPS_LINK = "https://maps.app.goo.gl/K6BJHLZiWNJXXvfdA";
export const MAPS_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.1!2d-70.5792!3d-33.6107!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662d06f56c7d4a1%3A0x0!2sAvenida%203%20de%20Septiembre%20090%2C%20Puente%20Alto%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses-419!2scl!4v1716000000000!5m2!1ses-419!2scl";

export function whatsappLink(text = "Hola TrainoFit! Quisiera más información.") {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function pageMeta({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}) {
  const url = SITE_URL + path;
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    ...(noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "es_CL" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: `${SITE_URL}/hero-gym.jpg` },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}
