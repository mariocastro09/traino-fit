import { Layout } from "~/components/layout";
import { Section } from "~/components/ui/section";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Clock, Calendar, User, Users, Info, Zap, X, Filter } from "lucide-react";
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
    setHighlightedDay(daysMap[today] || null);
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
        <Section className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-light/70">Cargando horarios...</p>
          </motion.div>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Section>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-6">
            <Calendar className="text-primary" size={64} />
          </div>
          <h1 className="text-5xl md:text-4xl font-bold mb-4">
            Horario de <span className="text-gradient">Clases</span>
          </h1>
          <p className="text-xl text-light/70 max-w-2xl mx-auto">
            Encuentra el horario perfecto para ti. Todas las clases incluyen coaching profesional.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-4 mb-8 p-4 bg-primary/5 rounded-xl border border-white/10"
        >
          <div className="flex items-center gap-2 text-light/70 mr-2">
            <Filter size={18} />
            <span className="font-medium">Filtrar por:</span>
          </div>

          {/* Time Filter */}
          <div className="flex gap-2">
            <Button 
              variant={filterTime === 'AM' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterTime(filterTime === 'AM' ? null : 'AM')}
              className={filterTime === 'AM' ? "bg-primary text-dark hover:bg-primary/90" : ""}
            >
              Mañana (AM)
            </Button>
            <Button 
              variant={filterTime === 'PM' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterTime(filterTime === 'PM' ? null : 'PM')}
              className={filterTime === 'PM' ? "bg-primary text-dark hover:bg-primary/90" : ""}
            >
              Tarde (PM)
            </Button>
          </div>

          <div className="h-6 w-px bg-white/10 hidden md:block"></div>

          {/* Type Filter */}
          <select 
            className="bg-secondary/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:border-primary outline-none min-w-[180px]"
            value={filterType || ''}
            onChange={(e) => setFilterType(e.target.value || null)}
          >
            <option value="">Todas las clases</option>
            {classTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          {/* Clear Button */}
          {(filterType || filterTime) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setFilterType(null); setFilterTime(null); }}
              className="text-light/50 hover:text-white ml-2"
            >
              <X size={14} className="mr-1" />
              Limpiar
            </Button>
          )}
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-6 mb-8"
        >
          <LegendItem color="bg-success" label="Principiantes" icon="🟢" />
          <LegendItem color="bg-amber-500" label="Intermedio" icon="🟡" />
          <LegendItem color="bg-red-500" label="Avanzado" icon="🔴" />
        </motion.div>

        {/* Desktop Schedule - Grid View */}
        <div className="hidden lg:block overflow-x-auto mb-8">
          <div className="bg-primary/5 rounded-md border border-white/10 p-6 min-w-[900px]">
            {allTimeSlots.length > 0 ? (
              <div className="grid grid-cols-8 gap-3 relative">
                {/* Current Day Highlight Column */}
                {highlightedDay && (
                  <div 
                    className="bg-primary/5 rounded-2xl pointer-events-none absolute"
                    style={{
                      gridColumn: daysOrder.indexOf(highlightedDay) + 2,
                      gridRow: '1 / -1',
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Header */}
                <div className="font-bold text-center flex items-center justify-center sticky top-0 bg-dark/80 backdrop-blur-sm z-10">
                  <Clock className="text-primary" size={20} />
                </div>
                {filteredSchedule.map((day) => (
                  <div
                    key={day.day}
                    className={`font-bold text-center text-sm py-2 rounded-lg transition-colors ${
                      highlightedDay === day.day 
                        ? 'bg-primary/20 text-primary' 
                        : 'text-light/70'
                    }`}
                  >
                    {day.day}
                    {highlightedDay === day.day && (
                      <div className="text-[10px] text-primary/70">Hoy</div>
                    )}
                  </div>
                ))}

                {/* Time slots */}
                {allTimeSlots.map((time) => (
                  <div key={time} className="contents">
                    <div className="text-sm font-semibold text-light/70 text-right py-3 border-t border-white/10 flex items-center justify-end pr-2">
                      {time}
                    </div>
                    {filteredSchedule.map((day) => {
                      const classAtTime = day.classes.find((c) => c.time === time);
                      return (
                        <div 
                          key={`${day.day}-${time}`} 
                          className="py-2 border-t border-white/10 min-h-[80px] flex items-center transition-colors"
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
              <div className="text-center py-12 text-light/50">
                <p className="text-lg">No se encontraron clases con los filtros seleccionados.</p>
                <Button 
                  variant="link" 
                  onClick={() => { setFilterType(null); setFilterTime(null); }}
                  className="mt-2 text-primary"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Schedule - List View */}
        <div className="lg:hidden space-y-4">
          {filteredSchedule.some(day => day.classes.length > 0) ? (
            filteredSchedule.map((day, dayIndex) => (
              day.classes.length > 0 && (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dayIndex * 0.05 }}
                  className={`card p-6 ${highlightedDay === day.day ? 'ring-2 ring-primary/50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-primary">{day.day}</h3>
                    {highlightedDay === day.day && (
                      <Badge variant="accent">Hoy</Badge>
                    )}
                  </div>
                  <div className="space-y-3">
                    {day.classes.map((cls, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedClass({ ...cls, day: day.day })}
                        className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 min-w-[60px]">
                            <Clock size={16} className="text-primary" />
                            <span className="font-semibold">{cls.time}</span>
                          </div>
                          <div>
                            <ClassBadge name={cls.name} type={cls.type} />
                            {cls.level && (
                              <div className="text-xs text-light/50 mt-1">{cls.level}</div>
                            )}
                          </div>
                        </div>
                        <Info size={16} className="text-light/30 group-hover:text-primary transition-colors" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            ))
          ) : (
            <div className="text-center py-12 text-light/50 card">
              <p className="text-lg">No se encontraron clases con los filtros seleccionados.</p>
              <Button 
                variant="link" 
                onClick={() => { setFilterType(null); setFilterTime(null); }}
                className="mt-2 text-primary"
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-gradient-to-br from-secondary/30 to-primary/10 rounded-2xl p-8 text-center"
        >
          <div className="flex justify-center mb-4">
            <Zap className="text-primary" size={48} />
          </div>
          <h3 className="text-2xl font-bold mb-4">Open Gym</h3>
          <p className="text-light/70 max-w-2xl mx-auto mb-4">
            Acceso libre al equipamiento disponible todos los días de 08:00 a 21:00.
            Los coaches están disponibles durante las clases programadas para consultas.
          </p>
          <Badge variant="accent" className="text-sm px-4 py-2">
            Sin reserva requerida para miembros
          </Badge>
        </motion.div>
      </Section>

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

function LegendItem({ color, label, icon }: { color: string; label: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
      <span className="text-lg">{icon}</span>
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function ClassBadge({ name, type }: { name: string; type: string }) {
  const colors = {
    low: "bg-success/20 text-success border-success/30",
    medium: "bg-accent/20 text-accent border-accent/30",
    high: "bg-primary/20 text-primary border-primary/30",
  };

  return (
    <div className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${colors[type as keyof typeof colors]}`}>
      {name}
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
  const colors = {
    low: "bg-success/20 text-success border-success/30 hover:bg-success/30",
    medium: "bg-accent/20 text-accent border-accent/30 hover:bg-accent/30",
    high: "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
        colors[classData.type as keyof typeof colors]
      }`}
    >
      <div className="truncate">{classData.name}</div>
      {classData.level && (
        <div className="text-[10px] opacity-70 truncate mt-0.5">{classData.level}</div>
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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="card p-8 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <div className="inline-block px-4 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold mb-4">
            {classData.day} • {classData.time}
          </div>
          <h2 className="text-3xl font-bold mb-2">{classData.name}</h2>
        </div>

        <div className="space-y-4">
          {classData.level && (
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <Zap className="text-primary flex-shrink-0" size={20} />
              <div>
                <div className="text-xs text-light/50">Nivel</div>
                <div className="font-semibold">{classData.level}</div>
              </div>
            </div>
          )}

          {classData.coach && (
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <User className="text-primary flex-shrink-0" size={20} />
              <div>
                <div className="text-xs text-light/50">Coach</div>
                <div className="font-semibold">{classData.coach}</div>
              </div>
            </div>
          )}

          {classData.capacity && (
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <Users className="text-primary flex-shrink-0" size={20} />
              <div>
                <div className="text-xs text-light/50">Capacidad Máxima</div>
                <div className="font-semibold">{classData.capacity} personas</div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-6 py-3 bg-primary hover:bg-primary/90 text-dark font-semibold rounded-lg transition-colors"
        >
          Cerrar
        </button>
      </motion.div>
    </motion.div>
  );
}