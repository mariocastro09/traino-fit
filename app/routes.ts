import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("clases", "routes/clases.tsx"),
  route("horario", "routes/horario.tsx"),
  route("precios", "routes/precios.tsx"),
  route("contacto", "routes/contacto.tsx"),
  route("instagram", "routes/instagram.tsx"),
  route("admin", "routes/admin.tsx"),
  route("workout/:token", "routes/workout-detail.tsx"),
] satisfies RouteConfig;
