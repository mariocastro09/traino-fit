import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { MotionConfig } from "motion/react";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico", sizes: "any" },
  { rel: "apple-touch-icon", href: "/trainofit.png" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300..900&display=swap",
  },
  // Slab serif of the original logo, subset to the wordmark's letters
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Alfa+Slab+One&text=TRAINOFIT&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Lets CSS hide scroll-reveal content only when JS can show it again */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#09090b" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Outlet />
    </MotionConfig>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const stack =
    import.meta.env.DEV && error instanceof Error ? error.stack : undefined;

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 px-6 text-center bg-zinc-950">
      <p className="eyebrow">{notFound ? "Error 404" : "Error"}</p>
      <h1 className="font-display text-6xl md:text-8xl uppercase leading-none text-white">
        {notFound ? "Página no encontrada" : "Algo salió mal"}
      </h1>
      <p className="text-gray-400 max-w-md">
        {notFound
          ? "La página que buscas no existe o cambió de dirección."
          : "Tuvimos un problema al cargar esta página. Intenta de nuevo en unos minutos."}
      </p>
      <Link viewTransition
        to="/"
        className="px-8 py-4 bg-primary text-dark font-black text-sm uppercase tracking-widest hover:bg-primary-300 transition-colors duration-200"
      >
        Volver al inicio
      </Link>
      {stack && (
        <pre className="w-full max-w-3xl p-4 overflow-x-auto text-left text-xs text-gray-500">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
