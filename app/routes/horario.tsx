import { Layout } from "~/components/layout";
import { Section } from "~/components/ui/section";
import { Badge } from "~/components/ui/badge";
import { Link } from "react-router";
import { Clock, Calendar, User, Users, Info, Zap, X, Filter, ChevronRight, ArrowRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

const daysOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function meta() {
  return [
    { title: "Horarios - Trainofit | Clases de CrossFit" },
    { name: "description", content: "Consulta nuestro horario semanal de clases de CrossFit. Encuentra el horario perfecto para ti." },
  ];
}

interface ClassDetail {
  time: string;
  name: string;
  type: string;
  level?: string;
  coach?: string;
  capacity?: number;
}

export default function Horario() {
  const [schedule, setSchedule] = useState<{ day: string; classes: ClassDetail[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassDetail & { day: string } | null>(null);
  const [highlightedDay, setHighlightedDay] = useState<string | null>(null);
  
  // Filter states
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterTime, setFilterTime] = useState<'AM' | 'PM' | null>(null);
  
  // Mobile active tab (defaults to 'Lunes', will update to current day)
  const [activeTab, setActiveTab] = useState<string>('Lunes');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const API_URL = '';
        const response = await fetch(`${API_URL}/api/schedule`);
        if (response.ok) {
          const data = await response.json() as { 
            dayOfWeek: string; 
            time: string; 
            className: string; 
            level?: string;
            coach?: string;
            maxCapacity?: number;
          }[];
          
          const processedSchedule = daysOrder.map(day => {
            const dayClasses = data
              .filter(item => item.dayOfWeek === day)
              .sort((a, b) => a.time.localeCompare(b.time))
              .map(item => {
                let type = 'medium';
                if (item.level?.toLowerCase().includes('principiante')) type = 'low';
                if (item.level?.toLowerCase().includes('avanzado')) type = 'high';
                
                return {
                  time: item.time,
                  name: item.className,
                  type,
                  level: item.level,
                  coach: item.coach,
                  capacity: item.maxCapacity,
                };
              });
              
            return {
              day,
              classes: dayClasses
            };
          });
          
          setSchedule(processedSchedule);
        }
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Get current day highlight
  useEffect(() => {
    const daysMap: { [key: number]: string } = {
      1: 'Lunes',
      2: 'Martes',
      3: 'Miércoles',
      4: 'Jueves',
      5: 'Viernes',
      6: 'Sábado',
      0: 'Domingo',
    };
    const today = new Date().getDay();
    const todayStr = daysMap[today] || 'Lunes';
    setHighlightedDay(todayStr);
    setActiveTab(todayStr);
  }, []);

  // Get unique class types for filter
  const classTypes = useMemo(() => {
    const types = new Set<string>();
    schedule.forEach(day => {
      day.classes.forEach(cls => types.add(cls.name));
    });
    return Array.from(types).sort();
  }, [schedule]);

  // Filter logic
  const filteredSchedule = useMemo(() => {
    return schedule.map(day => ({
      ...day,
      classes: day.classes.filter(cls => {
        // Filter by Type
        if (filterType && cls.name !== filterType) return false;
        
        // Filter by Time
        if (filterTime) {
          const hour = parseInt(cls.time.split(':')[0]);
          if (filterTime === 'AM' && hour >= 12) return false;
          if (filterTime === 'PM' && hour < 12) return false;
        }
        
        return true;
      })
    }));
  }, [schedule, filterType, filterTime]);

  // Get all unique time slots from filtered schedule
  const allTimeSlots = useMemo(() => {
    const slots = new Set<string>();
    filteredSchedule.forEach(day => {
      day.classes.forEach(cls => slots.add(cls.time));
    });
    return Array.from(slots).sort();
  }, [filteredSchedule]);

  if (loading) {
    return (
      <Layout>
        <Section className="min-h-[60vh] flex items-center justify-center bg-gray-950">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Cargando Horarios...</p>
          </motion.div>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative bg-gray-950 text-white overflow-hidden py-16">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/10 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

        <Section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 border border-primary/20 text-primary">
                <Calendar size={36} className="animate-pulse" />
              </div>
            </div>
            <h1 
              className="text-5xl md:text-7xl font-black tracking-wider uppercase mb-4"
              style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
            >
              Horario de <span className="text-gradient drop-shadow-[0_0_15px_rgba(212,160,23,0.2)]">Clases</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
              Encuentra el momento perfecto para tu entrenamiento. Todas las clases están guiadas por coaches certificados.
            </p>
          </motion.div>

          {/* Controls Panel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col lg:flex-row flex-wrap justify-between items-center gap-6 mb-12 p-6 bg-zinc-900/30 backdrop-blur-md border border-white/5 rounded-none"
          >
            <div className="flex items-center gap-3 text-gray-400">
              <Filter size={16} className="text-primary" />
              <span className="text-xs font-black uppercase tracking-wider">Centro de Control</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              {/* Time Sliding Selector */}
              <div className="flex bg-white/5 border border-white/10 p-1 rounded-none w-full sm:w-auto">
                <button
                  onClick={() => setFilterTime(null)}
                  className={`flex-1 sm:flex-initial px-5 py-2 text-center text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                    filterTime === null 
                      ? "bg-primary text-dark" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Todo el día
                </button>
                <button
                  onClick={() => setFilterTime('AM')}
                  className={`flex-1 sm:flex-initial px-5 py-2 text-center text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                    filterTime === 'AM' 
                      ? "bg-primary text-dark" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Mañana (AM)
                </button>
                <button
                  onClick={() => setFilterTime('PM')}
                  className={`flex-1 sm:flex-initial px-5 py-2 text-center text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                    filterTime === 'PM' 
                      ? "bg-primary text-dark" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Tarde (PM)
                </button>
              </div>

              {/* Class Type Selector */}
              <div className="relative w-full sm:w-auto min-w-[200px]">
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white focus:border-primary outline-none appearance-none cursor-pointer pr-10"
                  value={filterType || ''}
                  onChange={(e) => setFilterType(e.target.value || null)}
                >
                  <option value="" className="bg-zinc-950 text-white">Todas las clases</option>
                  {classTypes.map(type => (
                    <option key={type} value={type} className="bg-zinc-950 text-white">{type}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>

              {/* Clear Button */}
              {(filterType || filterTime) && (
                <button 
                  onClick={() => { setFilterType(null); setFilterTime(null); }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary hover:text-primary-600 transition-colors whitespace-nowrap"
                >
                  <X size={12} />
                  Limpiar Filtros
                </button>
              )}
            </div>
          </motion.div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-10"
          >
            <LegendItem color="bg-success" label="Principiantes" />
            <LegendItem color="bg-amber-500" label="Intermedio" />
            <LegendItem color="bg-red-500" label="Avanzado / RX" />
          </motion.div>

          {/* Desktop Schedule - Weekly Planner Grid */}
          <div className="hidden lg:block overflow-x-auto mb-16 border border-white/5 bg-zinc-900/10 backdrop-blur-md">
            <div className="min-w-[1000px] p-6 relative">
              {allTimeSlots.length > 0 ? (
                <div className="grid grid-cols-8 gap-3.5 relative z-10">
                  {/* Current Day Column Highlight Box */}
                  {highlightedDay && daysOrder.includes(highlightedDay) && (
                    <div 
                      className="bg-primary/[0.02] border-x border-primary/10 pointer-events-none absolute"
                      style={{
                        gridColumn: daysOrder.indexOf(highlightedDay) + 2,
                        gridRow: '1 / -1',
                        zIndex: 0,
                      }}
                    />
                  )}

                  {/* Header row */}
                  <div className="h-12 border-b border-white/10 flex items-center justify-center bg-zinc-900/40">
                    <Clock className="text-primary" size={16} />
                  </div>
                  {filteredSchedule.map((day) => {
                    const isToday = highlightedDay === day.day;
                    return (
                      <div
                        key={day.day}
                        className={`h-12 border-b flex flex-col items-center justify-center text-center transition-colors relative ${
                          isToday 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-white/10 bg-zinc-900/40 text-gray-300'
                        }`}
                      >
                        <span className="text-xs font-black uppercase tracking-widest">{day.day}</span>
                        {isToday && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary/70 mt-0.5">Hoy</span>
                        )}
                      </div>
                    );
                  })}

                  {/* Time rows */}
                  {allTimeSlots.map((time) => (
                    <div key={time} className="contents">
                      <div className="text-xs font-black font-mono text-gray-400 text-right py-4 border-r border-white/5 pr-4 flex items-center justify-end h-full">
                        {time}
                      </div>
                      {filteredSchedule.map((day) => {
                        const classAtTime = day.classes.find((c) => c.time === time);
                        return (
                          <div 
                            key={`${day.day}-${time}`} 
                            className={`py-2 border-b border-white/5 min-h-[95px] flex items-center transition-colors duration-300 ${
                              highlightedDay === day.day ? "bg-primary/[0.01]" : ""
                            }`}
                          >
                            {classAtTime ? (
                              <InteractiveClassBadge 
                                classData={classAtTime} 
                                day={day.day}
                                onClick={() => setSelectedClass({ ...classAtTime, day: day.day })}
                              />
                            ) : (
                              <div className="h-full w-full"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500 relative z-10">
                  <p className="text-sm uppercase tracking-widest font-bold">No se encontraron clases para los filtros aplicados</p>
                  <button 
                    onClick={() => { setFilterType(null); setFilterTime(null); }}
                    className="mt-3 text-xs text-primary font-black uppercase tracking-widest hover:underline"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Schedule - Day Tab Switcher & List View */}
          <div className="lg:hidden">
            {/* Day Selector Tabs */}
            <div className="mb-6 overflow-x-auto flex border border-white/10 bg-zinc-900/40 backdrop-blur-md p-1 scrollbar-none">
              {daysOrder.map((day) => {
                const isToday = highlightedDay === day;
                const isActive = activeTab === day;
                
                return (
                  <button
                    key={day}
                    onClick={() => setActiveTab(day)}
                    className={`flex-1 min-w-[70px] py-3 text-center relative transition-all duration-300 outline-none ${
                      isActive 
                        ? "text-dark font-black" 
                        : "text-gray-400 font-bold hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeDayTab"
                        className="absolute inset-0 bg-primary z-0"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <span className="text-[10px] uppercase tracking-widest">{day.substring(0, 3)}</span>
                      {isToday && (
                        <span className={`text-[8px] tracking-wider uppercase ${isActive ? "text-dark/80" : "text-primary"} font-black mt-0.5`}>
                          Hoy
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Day Class List */}
            <div className="px-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {(() => {
                    const dayData = filteredSchedule.find(d => d.day === activeTab);
                    if (!dayData || dayData.classes.length === 0) {
                      return (
                        <div className="text-center py-16 border border-white/5 bg-zinc-900/20 backdrop-blur-md">
                          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">No hay clases programadas</p>
                          <p className="text-[11px] text-gray-600 mt-1 font-light">Prueba cambiando los filtros de horario o tipo.</p>
                        </div>
                      );
                    }

                    return dayData.classes.map((cls, idx) => {
                      const levelBorders = {
                        low: "border-l-success",
                        medium: "border-l-amber-500",
                        high: "border-l-red-500",
                      };
                      
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => setSelectedClass({ ...cls, day: activeTab })}
                          className={`flex items-center justify-between p-5 border-y border-r border-white/5 border-l-4 bg-zinc-900/10 hover:bg-zinc-900/20 cursor-pointer transition-all duration-300 group ${
                            levelBorders[cls.type as keyof typeof levelBorders] || "border-l-primary"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 min-w-[65px]">
                              <Clock size={13} className="text-primary" />
                              <span className="font-mono text-xs font-bold text-white">{cls.time}</span>
                            </div>
                            <div>
                              <div className="font-black text-xs uppercase tracking-wider text-white group-hover:text-primary transition-colors">
                                {cls.name}
                              </div>
                              {cls.level && (
                                <div className="text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                                  {cls.level}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-500 group-hover:text-primary transition-colors">
                            {cls.coach && (
                              <span className="text-[10px] text-gray-400 font-light hidden sm:inline">{cls.coach}</span>
                            )}
                            <Info size={14} />
                          </div>
                        </motion.div>
                      );
                    });
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 border border-white/5 bg-gradient-to-br from-zinc-900/20 to-primary/5 p-8 text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-4">
              <Zap className="text-primary" size={36} />
            </div>
            <h3 
              className="text-3xl font-black uppercase tracking-wider mb-3 text-white"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Open Gym
            </h3>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mb-5 leading-relaxed font-light">
              Entrenamiento libre disponible todos los días de 08:00 a 21:00. Usa todo el equipamiento de primer nivel a tu propio ritmo.
              Los coaches de piso están siempre presentes para consultas de seguridad.
            </p>
            <Badge className="bg-accent text-dark border-transparent rounded-none px-4 py-1.5 text-xs font-black tracking-widest uppercase">
              Sin reserva previa requerida para miembros
            </Badge>
          </motion.div>
        </Section>
      </div>

      {/* Class Details Modal */}
      <AnimatePresence>
        {selectedClass && (
          <ClassDetailsModal
            classData={selectedClass}
            onClose={() => setSelectedClass(null)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2 bg-white/5 border border-white/5 rounded-none">
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`}></span>
      </span>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
    </div>
  );
}

function InteractiveClassBadge({ 
  classData, 
  day,
  onClick 
}: { 
  classData: ClassDetail; 
  day: string;
  onClick: () => void;
}) {
  const borders = {
    low: "border-l-success",
    medium: "border-l-amber-500",
    high: "border-l-red-500",
  };
  const bgColors = {
    low: "hover:bg-success/10 bg-success/5 border-success/10",
    medium: "hover:bg-amber-500/10 bg-amber-500/5 border-amber-500/10",
    high: "hover:bg-red-500/10 bg-red-500/5 border-red-500/10",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full h-full p-3 border-l-4 rounded-none text-left transition-all duration-300 cursor-pointer flex flex-col justify-between group/cell ${
        borders[classData.type as keyof typeof borders] || "border-l-primary"
      } ${
        bgColors[classData.type as keyof typeof bgColors] || "bg-primary/5 hover:bg-primary/10 border-primary/10"
      }`}
    >
      <div>
        <div className="font-black text-[10px] tracking-wider uppercase text-white truncate group-hover/cell:text-primary transition-colors">
          {classData.name}
        </div>
        {classData.level && (
          <div className="text-[9px] font-bold tracking-wider uppercase text-gray-500 mt-1 truncate">
            {classData.level}
          </div>
        )}
      </div>
      
      {classData.coach && (
        <div className="text-[9px] text-gray-400 font-light truncate mt-2 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-white/40" />
          {classData.coach}
        </div>
      )}
    </button>
  );
}

function ClassDetailsModal({ 
  classData, 
  onClose 
}: { 
  classData: ClassDetail & { day: string }; 
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-zinc-950 border border-white/10 max-w-md w-full p-8 rounded-none overflow-hidden"
      >
        {/* Top gold bar */}
        <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-primary to-accent" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white hover:rotate-90 transition-all duration-300 cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8 pt-4">
          <span className="inline-block px-3.5 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-widest uppercase mb-4">
            {classData.day} • {classData.time}
          </span>
          <h2 
            className="text-4xl font-black uppercase tracking-wider text-white"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            {classData.name}
          </h2>
        </div>

        <div className="space-y-4">
          {classData.level && (
            <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5">
              <div className="p-2.5 bg-primary/10 text-primary">
                <Zap size={18} />
              </div>
              <div>
                <div className="text-[9px] font-black tracking-wider uppercase text-gray-500">Nivel de Intensidad</div>
                <div className="text-xs font-bold text-white uppercase tracking-wide">{classData.level}</div>
              </div>
            </div>
          )}

          {classData.coach && (
            <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5">
              <div className="p-2.5 bg-primary/10 text-primary">
                <User size={18} />
              </div>
              <div>
                <div className="text-[9px] font-black tracking-wider uppercase text-gray-500">Coach</div>
                <div className="text-xs font-bold text-white uppercase tracking-wide">{classData.coach}</div>
              </div>
            </div>
          )}

          {classData.capacity && (
            <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5">
              <div className="p-2.5 bg-primary/10 text-primary">
                <Users size={18} />
              </div>
              <div>
                <div className="text-[9px] font-black tracking-wider uppercase text-gray-500">Capacidad Máxima</div>
                <div className="text-xs font-bold text-white uppercase tracking-wide">{classData.capacity} personas</div>
              </div>
            </div>
          )}
        </div>

        {/* CTA to reservation page */}
        <Link
          to={`/contacto?clase=${encodeURIComponent(classData.name)}&dia=${encodeURIComponent(classData.day)}&hora=${encodeURIComponent(classData.time)}`}
          onClick={onClose}
          className="w-full mt-8 py-4 bg-primary text-dark hover:bg-primary-600 font-black text-xs tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 rounded-none"
        >
          Reservar esta Clase
          <ArrowRight size={14} />
        </Link>
      </motion.div>
    </motion.div>
  );
}