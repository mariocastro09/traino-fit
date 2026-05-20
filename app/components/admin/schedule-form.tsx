import { Button } from "~/components/ui/button";
import { Save, X } from "lucide-react";

interface ClassSchedule {
  id?: number;
  dayOfWeek?: string;
  time?: string;
  className?: string;
  level?: string;
  coach?: string;
  maxCapacity?: number;
  isActive?: boolean;
}

interface ClassType {
  id: number;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
}

interface ScheduleFormProps {
  form: Partial<ClassSchedule>;
  setForm: (form: Partial<ClassSchedule>) => void;
  daysOfWeek: string[];
  classTypes: ClassType[];
  timeSlots: string[];
  onSave: () => void;
  onCancel: () => void;
  compact?: boolean;
  isMobile?: boolean;
}

export function ScheduleForm({
  form,
  setForm,
  daysOfWeek,
  classTypes,
  timeSlots,
  onSave,
  onCancel,
  compact = false,
  isMobile = false,
}: ScheduleFormProps) {
  const inputClass = compact
    ? "w-full p-1 text-xs rounded bg-zinc-900 text-white border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors duration-200"
    : "w-full p-2 rounded bg-zinc-900 text-white border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors duration-200";
  const labelClass = compact 
    ? "block text-[10px] font-medium mb-0.5 text-light/70" 
    : "block text-sm font-medium mb-2";

  return (
    <div className="space-y-2">
      <div className={compact ? "grid grid-cols-2 gap-1" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
        <div>
          <label className={labelClass}>Día</label>
          <select
            className={inputClass}
            value={form.dayOfWeek || ''}
            onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
          >
            <option value="" className="bg-zinc-900 text-white">Día</option>
            {daysOfWeek.map((day) => (
              <option key={day} value={day} className="bg-zinc-900 text-white">
                {isMobile && compact ? day.slice(0, 3) : day}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Hora</label>
          <select
            className={inputClass}
            value={form.time || ''}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          >
            <option value="" className="bg-zinc-900 text-white">Hora</option>
            {timeSlots.map((time) => (
              <option key={time} value={time} className="bg-zinc-900 text-white">{time}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Clase</label>
        <select
          className={inputClass}
          value={form.className || ''}
          onChange={(e) => setForm({ ...form, className: e.target.value })}
        >
          <option value="" className="bg-zinc-900 text-white">Seleccionar</option>
          {classTypes.map((type) => (
            <option key={type.id} value={type.name} className="bg-zinc-900 text-white">{type.name}</option>
          ))}
        </select>
      </div>

      <div className={compact ? "grid grid-cols-2 gap-1" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"}>
        <div>
          <label className={labelClass}>Nivel</label>
          <input
            type="text"
            className={inputClass}
            value={form.level || ''}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            placeholder="Nivel"
          />
        </div>
        <div>
          <label className={labelClass}>Coach</label>
          <input
            type="text"
            className={inputClass}
            value={form.coach || ''}
            onChange={(e) => setForm({ ...form, coach: e.target.value })}
            placeholder="Coach"
          />
        </div>
        {!compact && (
          <div>
            <label className={labelClass}>Capacidad</label>
            <input
              type="number"
              className={inputClass}
              value={form.maxCapacity || ''}
              onChange={(e) => setForm({ ...form, maxCapacity: parseInt(e.target.value) || undefined })}
              placeholder="Cap."
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <Button variant="outline" size={compact ? "sm" : "default"} onClick={onCancel}>
          <X size={compact ? 12 : 16} className="mr-1" />
          Cancelar
        </Button>
        <Button size={compact ? "sm" : "default"} onClick={onSave}>
          <Save size={compact ? 12 : 16} className="mr-1" />
          Guardar
        </Button>
      </div>
    </div>
  );
}
