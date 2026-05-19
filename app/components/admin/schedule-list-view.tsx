import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Edit, Trash2, Copy, CheckCircle2, XCircle } from "lucide-react";
import { ScheduleForm } from "./schedule-form";

interface ClassSchedule {
  id: number;
  dayOfWeek: string;
  time: string;
  className: string;
  level?: string;
  coach?: string;
  maxCapacity?: number;
  isActive: boolean;
}

interface ClassType {
  id: number;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
}

interface ListViewProps {
  schedules: ClassSchedule[];
  daysOfWeek: string[];
  onEdit: (s: ClassSchedule) => void;
  onDelete: (id: number) => void;
  onDuplicate: (s: ClassSchedule) => void;
  onToggleActive: (s: ClassSchedule) => void;
  editingId: number | null;
  editForm: Partial<ClassSchedule>;
  setEditForm: (form: Partial<ClassSchedule>) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  classTypes: ClassType[];
  timeSlots: string[];
  isMobile: boolean;
}

export function ScheduleListView({
  schedules,
  daysOfWeek,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  editingId,
  editForm,
  setEditForm,
  onSave,
  onCancelEdit,
  classTypes,
  timeSlots,
  isMobile,
}: ListViewProps) {
  return (
    <div className="space-y-4">
      {daysOfWeek.map((day) => {
        const daySchedules = schedules
          .filter((s) => s.dayOfWeek === day)
          .sort((a, b) => a.time.localeCompare(b.time));

        if (daySchedules.length === 0) return null;

        return (
          <Card key={day} className="bg-zinc-950 border-white/5 overflow-hidden">
            <CardHeader className="pb-3 bg-zinc-900/30 border-b border-white/5 px-4 sm:px-6">
              <CardTitle className="text-lg font-black tracking-wider text-white uppercase">{day}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                {daySchedules.map((schedule) => {
                  const matchingClassType = classTypes.find(
                    (c) => c.name.toLowerCase() === schedule.className.toLowerCase()
                  );
                  const classColor = matchingClassType?.color || "#ff6b35";

                  return (
                    <div
                      key={schedule.id}
                      className={`relative pl-4 sm:pl-6 p-4 rounded-xl border transition-all duration-300 ${
                        schedule.isActive 
                          ? 'bg-zinc-900/40 border-white/5 hover:border-white/10' 
                          : 'bg-zinc-900/10 border-white/5 opacity-50'
                      }`}
                    >
                      {/* Left border accent line matching ClassType color */}
                      {schedule.isActive && (
                        <div 
                          className="absolute top-0 left-0 w-1.5 h-full rounded-l-xl"
                          style={{ backgroundColor: classColor }}
                        />
                      )}

                      {editingId === schedule.id ? (
                        <ScheduleForm
                          form={editForm}
                          setForm={setEditForm}
                          daysOfWeek={daysOfWeek}
                          classTypes={classTypes}
                          timeSlots={timeSlots}
                          onSave={onSave}
                          onCancel={onCancelEdit}
                          isMobile={isMobile}
                        />
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                                <span className="text-lg font-black text-white">{schedule.time}</span>
                                <span className="font-bold text-light truncate">{schedule.className}</span>
                                {!schedule.isActive && (
                                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded">
                                    Inactivo
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-light/50 flex flex-wrap gap-x-3 gap-y-1">
                                {schedule.level && <span>• Nivel: <strong className="text-light/70">{schedule.level}</strong></span>}
                                {schedule.coach && <span>• Coach: <strong className="text-light/70">{schedule.coach}</strong></span>}
                                {schedule.maxCapacity && <span>• Cupo: <strong className="text-light/70">{schedule.maxCapacity}</strong></span>}
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-1.5 flex-wrap pt-2 border-t border-white/5">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => onEdit(schedule)}
                              className="border-white/10 hover:bg-white/5 text-xs h-8"
                            >
                              <Edit size={12} className="mr-1" />
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => onDuplicate(schedule)}
                              className="border-white/10 hover:bg-white/5 text-xs h-8"
                            >
                              <Copy size={12} className="mr-1" />
                              Copiar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => onToggleActive(schedule)}
                              className="border-white/10 hover:bg-white/5 text-xs h-8"
                            >
                              {schedule.isActive ? (
                                <XCircle size={12} className="mr-1" />
                              ) : (
                                <CheckCircle2 size={12} className="mr-1" />
                              )}
                              <span>
                                {schedule.isActive ? 'Desactivar' : 'Activar'}
                              </span>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => onDelete(schedule.id)} 
                              className="border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-xs h-8 text-red-400"
                            >
                              <Trash2 size={12} className="mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
