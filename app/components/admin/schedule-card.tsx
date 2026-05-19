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
        className={`group card p-2 text-xs cursor-grab active:cursor-grabbing ${
          !schedule.isActive ? 'opacity-50' : ''
        }`}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-start gap-1 mb-1">
          <GripVertical size={12} className="text-light/30 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate text-primary">{schedule.className}</div>
            {schedule.level && <div className="text-light/60 truncate text-[10px]">{schedule.level}</div>}
          </div>
          {!schedule.isActive && (
            <XCircle size={10} className="text-red-400 flex-shrink-0" />
          )}
        </div>
        
        {/* Inline action buttons */}
        <div className="flex gap-0.5 mt-1 flex-wrap">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(schedule);
            }}
            className="px-1 py-0.5 text-[10px] hover:bg-primary/20 rounded transition-colors"
            title="Editar"
          >
            <Edit size={10} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(schedule);
            }}
            className="px-1 py-0.5 text-[10px] hover:bg-primary/20 rounded transition-colors"
            title="Duplicar"
          >
            <Copy size={10} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(schedule);
            }}
            className="px-1 py-0.5 text-[10px] hover:bg-primary/20 rounded transition-colors"
            title={schedule.isActive ? 'Desactivar' : 'Activar'}
          >
            {schedule.isActive ? <XCircle size={10} /> : <CheckCircle2 size={10} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(schedule.id);
            }}
            className="px-1 py-0.5 text-[10px] hover:bg-red-500/20 rounded text-red-400 transition-colors"
            title="Eliminar"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
