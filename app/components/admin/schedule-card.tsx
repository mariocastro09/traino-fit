import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, Trash2, Copy, CheckCircle2, XCircle, GripVertical } from "lucide-react";
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

interface ScheduleCardProps {
  schedule: ClassSchedule;
  onEdit: (s: ClassSchedule) => void;
  onDelete: (id: number) => void;
  onDuplicate: (s: ClassSchedule) => void;
  onToggleActive: (s: ClassSchedule) => void;
  isEditing: boolean;
  editForm: Partial<ClassSchedule>;
  setEditForm: (form: Partial<ClassSchedule>) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  daysOfWeek: string[];
  classTypes: ClassType[];
  timeSlots: string[];
  isMobile: boolean;
}

export function ScheduleCard({
  schedule,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  isEditing,
  editForm,
  setEditForm,
  onSave,
  onCancelEdit,
  daysOfWeek,
  classTypes,
  timeSlots,
  isMobile,
}: ScheduleCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: schedule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const matchingClassType = classTypes.find(
    (c) => c.name.toLowerCase() === schedule.className.toLowerCase()
  );
  const classColor = matchingClassType?.color || "#ff6b35";

  if (isEditing && isMobile) {
    return (
      <div className="card p-2 text-xs">
        <ScheduleForm
          form={editForm}
          setForm={setEditForm}
          daysOfWeek={daysOfWeek}
          classTypes={classTypes}
          timeSlots={timeSlots}
          onSave={onSave}
          onCancel={onCancelEdit}
          compact
          isMobile={isMobile}
        />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`relative group p-2.5 rounded-xl border transition-all duration-300 cursor-grab active:cursor-grabbing ${
          schedule.isActive 
            ? 'bg-zinc-900/50 border-white/5 hover:border-white/10 hover:scale-[1.02] shadow-lg shadow-black/20' 
            : 'bg-zinc-900/20 border-white/5 opacity-40'
        }`}
        {...attributes}
        {...listeners}
      >
        {/* Left border indicator matching class type color */}
        {schedule.isActive && (
          <div 
            className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
            style={{ backgroundColor: classColor }}
          />
        )}

        <div className="flex items-start gap-1.5 mb-1.5 pl-1.5">
          <GripVertical size={11} className="text-light/30 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white truncate text-[11px] uppercase tracking-wide">{schedule.className}</div>
            {schedule.level && <div className="text-light/50 truncate text-[10px]">{schedule.level}</div>}
            {schedule.coach && <div className="text-primary/70 truncate text-[9px] mt-0.5">Coach: {schedule.coach}</div>}
          </div>
          {!schedule.isActive && (
            <XCircle size={10} className="text-red-400 flex-shrink-0" />
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-1 mt-2 pt-1.5 border-t border-white/5 pl-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(schedule);
            }}
            className="p-1 text-light/50 hover:text-white hover:bg-white/5 rounded transition-colors"
            title="Editar"
          >
            <Edit size={10} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(schedule);
            }}
            className="p-1 text-light/50 hover:text-white hover:bg-white/5 rounded transition-colors"
            title="Duplicar"
          >
            <Copy size={10} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(schedule);
            }}
            className="p-1 text-light/50 hover:text-white hover:bg-white/5 rounded transition-colors"
            title={schedule.isActive ? 'Desactivar' : 'Activar'}
          >
            {schedule.isActive ? <XCircle size={10} className="text-red-400" /> : <CheckCircle2 size={10} className="text-green-400" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(schedule.id);
            }}
            className="p-1 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
            title="Eliminar"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
