import { Layout } from "~/components/layout";
import { Section } from "~/components/ui/section";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "~/components/ui/dialog";
import { Link } from "react-router";
import { Clock, User, Users, Zap, X, ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import type { Route } from "./+types/horario";
import { d1, getActiveSchedule, orFallback } from "../../server/public-data";
import { pageMeta } from "~/lib/site";
import { cn } from "~/lib/utils";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const LEVELS = {
  low: { label: "Principiantes", dot: "bg-success", border: "border-l-success" },
  medium: { label: "Intermedio", dot: "bg-amber-500", border: "border-l-amber-500" },
  high: { label: "Avanzado / RX", dot: "bg-red-500", border: "border-l-red-500" },
};

const TIME_FILTERS = [
  { value: null, label: "Todo el día" },
  { value: "AM", label: "Mañana" },
  { value: "PM", label: "Tarde" },
] as const;

export function meta() {
  return pageMeta({
    title: "Horarios — TrainoFit",
    description:
      "Consulta nuestro horario semanal de clases de CrossFit. Encuentra el horario perfecto para ti.",
    path: "/horario",
  });
}

export async function loader({ context }: Route.LoaderArgs) {
  const rows = await orFallback(() => getActiveSchedule(d1(context)), []);
  return {
    classes: rows.map((row) => {
      const level = row.level?.toLowerCase() ?? "";
      return {
        day: row.dayOfWeek,
        time: row.time,
        name: row.className,
        type: (level.includes("avanzado") ? "high" : level.includes("principiante") ? "low" : "medium") as keyof typeof LEVELS,
        level: row.level,
        coach: row.coach,
        capacity: row.maxCapacity,
      };
    }),
  };
}

type ClassItem = Route.ComponentProps["loaderData"]["classes"][number];

export default function Horario({ loaderData }: Route.ComponentProps) {
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [filterType, setFilterType] = useState("");
  const [filterTime, setFilterTime] = useState<"AM" | "PM" | null>(null);
  // Today is read from the visitor's clock, so it is only known after hydration.
  const [today, setToday] = useState<string | null>(null);
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const activeDay = pickedDay ?? today ?? DAYS[0];

  useEffect(() => {
    setToday(DAYS[(new Date().getDay() + 6) % 7]);
  }, []);

  const classNames = [...new Set(loaderData.classes.map((c) => c.name))].sort();
  const classes = loaderData.classes
    .filter((c) => !filterType || c.name === filterType)
    .filter((c) => !filterTime || (parseInt(c.time) < 12 ? "AM" : "PM") === filterTime)
    .sort((a, b) => a.time.localeCompare(b.time));
  const timeSlots = [...new Set(classes.map((c) => c.time))];
  const activeDayClasses = classes.filter((c) => c.day === activeDay);
  const hasFilters = !!filterType || !!filterTime;
  const clearFilters = () => {
    setFilterType("");
    setFilterTime(null);
  };

  return (
    <Layout>
      <Section className="bg-zinc-950 text-white">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="eyebrow mb-4">Semana tipo</p>
          <h1 className="font-display text-6xl md:text-8xl uppercase leading-none mb-4">
            Horario de <span className="text-primary">Clases</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Encuentra el momento perfecto para tu entrenamiento. Todas las clases están guiadas por coaches certificados.
          </p>
        </div>

        {loaderData.classes.length === 0 ? (
          <div className="text-center py-16 border border-white/10 bg-zinc-900/40">
            <p className="text-lg font-bold text-white mb-2">Estamos preparando el horario</p>
            <p className="text-sm text-gray-400 mb-6">Escríbenos y te contamos los bloques disponibles.</p>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-dark font-black text-xs uppercase tracking-widest hover:bg-primary-300 transition-colors duration-200"
            >
              Consultar horarios
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-stretch sm:items-center gap-4 mb-8 p-4 sm:p-6 bg-zinc-900/40 border border-white/10">
              <div className="flex bg-white/5 border border-white/10 p-1" role="group" aria-label="Filtrar por horario">
                {TIME_FILTERS.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setFilterTime(option.value)}
                    aria-pressed={filterTime === option.value}
                    className={cn(
                      "flex-1 px-3 sm:px-4 py-2 text-xs font-black uppercase tracking-wider whitespace-nowrap transition-colors duration-200",
                      filterTime === option.value ? "bg-primary text-dark" : "text-gray-400 hover:text-white"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="relative sm:min-w-[220px]">
                <select
                  aria-label="Filtrar por clase"
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 pr-10 text-xs font-black uppercase tracking-wider text-white focus:border-primary appearance-none cursor-pointer"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="" className="bg-zinc-950">Todas las clases</option>
                  {classNames.map((name) => (
                    <option key={name} value={name} className="bg-zinc-950">{name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" aria-hidden />
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary hover:text-primary-300 transition-colors duration-200"
                >
                  <X size={12} aria-hidden />
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Legend */}
            <ul className="flex flex-wrap justify-center gap-3 mb-10">
              {Object.values(LEVELS).map((level) => (
                <li key={level.label} className="flex items-center gap-2.5 px-4 py-2 bg-white/5 border border-white/10">
                  <span className={cn("size-2 rounded-full", level.dot)} aria-hidden />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300">{level.label}</span>
                </li>
              ))}
            </ul>

            {classes.length === 0 ? (
              <div className="text-center py-16 border border-white/10 bg-zinc-900/40">
                <p className="text-sm font-bold text-gray-300 mb-3">
                  No se encontraron clases para los filtros aplicados
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-primary font-black uppercase tracking-widest underline underline-offset-4"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <>
                {/* Desktop — weekly table */}
                <div className="hidden lg:block overflow-x-auto border border-white/10 bg-zinc-900/20">
                  <table className="w-full min-w-[1000px] table-fixed border-collapse">
                    <thead>
                      <tr>
                        <th scope="col" className="w-20 h-12 bg-zinc-900/60 border-b border-white/10">
                          <Clock className="text-primary mx-auto" size={16} aria-hidden />
                          <span className="sr-only">Hora</span>
                        </th>
                        {DAYS.map((day) => (
                          <th
                            key={day}
                            scope="col"
                            className={cn(
                              "h-12 border-b text-xs font-black uppercase tracking-widest",
                              day === today
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-white/10 bg-zinc-900/60 text-gray-300"
                            )}
                          >
                            {day}
                            {day === today && <span className="block text-[10px] text-primary/80">Hoy</span>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((time) => (
                        <tr key={time}>
                          <th scope="row" className="text-xs font-black tabular-nums text-gray-400 border-r border-b border-white/5">
                            {time}
                          </th>
                          {DAYS.map((day) => {
                            const cls = classes.find((c) => c.day === day && c.time === time);
                            return (
                              <td
                                key={day}
                                className={cn("h-24 p-1.5 border-b border-white/5", day === today && "bg-primary/[0.03]")}
                              >
                                {cls && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedClass(cls)}
                                    className={cn(
                                      "size-full p-3 border-l-4 bg-white/5 hover:bg-white/10 text-left flex flex-col justify-between transition-colors duration-200",
                                      LEVELS[cls.type].border
                                    )}
                                  >
                                    <span>
                                      <span className="block font-black text-[11px] tracking-wider uppercase text-white truncate">
                                        {cls.name}
                                      </span>
                                      {cls.level && (
                                        <span className="block text-[10px] font-bold tracking-wider uppercase text-gray-400 mt-1 truncate">
                                          {cls.level}
                                        </span>
                                      )}
                                    </span>
                                    {cls.coach && (
                                      <span className="block text-[10px] text-gray-400 truncate">{cls.coach}</span>
                                    )}
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile — one day at a time */}
                <div className="lg:hidden">
                  <div className="mb-6 flex overflow-x-auto border border-white/10 bg-zinc-900/40 p-1 scrollbar-none" role="group" aria-label="Día de la semana">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setPickedDay(day)}
                        aria-pressed={day === activeDay}
                        aria-label={day}
                        className={cn(
                          "flex-1 min-w-[52px] py-3 text-center text-xs uppercase tracking-wider transition-colors duration-200",
                          day === activeDay ? "bg-primary text-dark font-black" : "text-gray-400 font-bold hover:text-white"
                        )}
                      >
                        {day.substring(0, 3)}
                        {day === today && <span className="block text-[10px] font-black">Hoy</span>}
                      </button>
                    ))}
                  </div>

                  {activeDayClasses.length === 0 ? (
                    <p className="text-center py-16 border border-white/10 bg-zinc-900/40 text-sm font-bold text-gray-400">
                      No hay clases programadas para {activeDay.toLowerCase()}
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {activeDayClasses.map((cls) => (
                        <li key={cls.time + cls.name}>
                          <button
                            type="button"
                            onClick={() => setSelectedClass(cls)}
                            className={cn(
                              "w-full flex items-center justify-between gap-4 p-5 border border-white/10 border-l-4 bg-zinc-900/40 hover:bg-zinc-900 text-left transition-colors duration-200",
                              LEVELS[cls.type].border
                            )}
                          >
                            <span className="flex items-center gap-4 min-w-0">
                              <span className="tabular-nums text-sm font-bold text-primary">{cls.time}</span>
                              <span className="min-w-0">
                                <span className="block font-black text-sm uppercase tracking-wider text-white truncate">
                                  {cls.name}
                                </span>
                                {cls.level && (
                                  <span className="block text-xs font-bold text-gray-400 mt-0.5 uppercase tracking-wider">
                                    {cls.level}
                                  </span>
                                )}
                              </span>
                            </span>
                            <ChevronRight size={16} className="text-gray-400 shrink-0" aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Open Gym */}
        <div className="mt-16 border border-primary/30 bg-primary/5 p-8 text-center max-w-4xl mx-auto reveal">
          <Zap className="text-primary mx-auto mb-4" size={36} aria-hidden />
          <h2 className="font-display text-5xl uppercase mb-3 text-white">Open Gym</h2>
          <p className="text-gray-300 text-sm max-w-2xl mx-auto mb-5 leading-relaxed">
            Entrenamiento libre disponible todos los días de 08:00 a 21:00. Usa todo el equipamiento de primer nivel a tu propio ritmo.
            Los coaches de piso están siempre presentes para consultas de seguridad.
          </p>
          <p className="inline-block bg-primary text-dark px-4 py-1.5 text-xs font-black tracking-widest uppercase">
            Sin reserva previa requerida para miembros
          </p>
        </div>
      </Section>

      {/* Class details */}
      <Dialog open={!!selectedClass} onOpenChange={(open) => !open && setSelectedClass(null)}>
        {selectedClass && (
          <DialogContent className="max-w-md w-[calc(100%-2rem)] p-8 border-white/10 border-t-4 border-t-primary sm:rounded-none">
            <div className="text-center mb-4">
              <DialogDescription className="inline-block px-3.5 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-black tracking-widest uppercase tabular-nums mb-4">
                {selectedClass.day} • {selectedClass.time}
              </DialogDescription>
              <DialogTitle className="font-display font-normal text-5xl uppercase text-white">
                {selectedClass.name}
              </DialogTitle>
            </div>

            <dl className="space-y-3">
              {[
                { icon: Zap, label: "Nivel de Intensidad", value: selectedClass.level },
                { icon: User, label: "Coach", value: selectedClass.coach },
                { icon: Users, label: "Capacidad Máxima", value: selectedClass.capacity && `${selectedClass.capacity} personas` },
              ].map(
                (row) =>
                  row.value && (
                    <div key={row.label} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10">
                      <span className="p-2.5 bg-primary/10 text-primary">
                        <row.icon size={18} aria-hidden />
                      </span>
                      <div>
                        <dt className="text-xs font-bold tracking-wider uppercase text-gray-400">{row.label}</dt>
                        <dd className="text-sm font-bold text-white uppercase tracking-wide">{row.value}</dd>
                      </div>
                    </div>
                  )
              )}
            </dl>

            <Link
              to={`/contacto?clase=${encodeURIComponent(selectedClass.name)}&dia=${encodeURIComponent(selectedClass.day)}&hora=${encodeURIComponent(selectedClass.time)}`}
              className="mt-4 py-4 bg-primary text-dark hover:bg-primary-300 font-black text-xs tracking-widest uppercase transition-colors duration-200 flex items-center justify-center gap-2"
            >
              Reservar esta Clase
              <ArrowRight size={14} aria-hidden />
            </Link>
          </DialogContent>
        )}
      </Dialog>
    </Layout>
  );
}
