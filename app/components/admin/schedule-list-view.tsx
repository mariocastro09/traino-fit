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
          <Card key={day}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{day}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {daySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      schedule.isActive 
                        ? 'bg-secondary/20 border-secondary' 
                        : 'bg-secondary/10 border-secondary/50 opacity-60'
                    }`}
                  >
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
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-lg font-bold text-primary">{schedule.time}</span>
                              <span className="font-semibold truncate">{schedule.className}</span>
                              {!schedule.isActive && (
                                <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">
                                  Inactivo
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-light/70 flex flex-wrap gap-3">
                              {schedule.level && <span>• {schedule.level}</span>}
                              {schedule.coach && <span>• {schedule.coach}</span>}
                              {schedule.maxCapacity && <span>• Cap: {schedule.maxCapacity}</span>}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-1 flex-wrap pt-1 border-t border-white/5">
                          <Button size="sm" variant="outline" onClick={() => onEdit(schedule)}>
                            <Edit size={14} className="mr-1" />
                            <span className="text-xs">Editar</span>
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onDuplicate(schedule)}>
                            <Copy size={14} className="mr-1" />
                            <span className="text-xs">Copiar</span>
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onToggleActive(schedule)}>
                            {schedule.isActive ? (
                              <XCircle size={14} className="mr-1" />
                            ) : (
                              <CheckCircle2 size={14} className="mr-1" />
                            )}
                            <span className="text-xs">
                              {schedule.isActive ? 'Desactivar' : 'Activar'}
                            </span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => onDelete(schedule.id)} 
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={14} className="mr-1" />
                            <span className="text-xs">Eliminar</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
