import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ScheduleForm } from "./schedule-form";

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

interface EditScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: Partial<ClassSchedule>;
  setForm: (form: Partial<ClassSchedule>) => void;
  daysOfWeek: string[];
  classTypes: ClassType[];
  timeSlots: string[];
  onSave: () => void;
  onCancel: () => void;
}

export function EditScheduleDialog({
  open,
  onOpenChange,
  form,
  setForm,
  daysOfWeek,
  classTypes,
  timeSlots,
  onSave,
  onCancel,
}: EditScheduleDialogProps) {
  const handleSave = () => {
    onSave();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Clase</DialogTitle>
        </DialogHeader>
        <ScheduleForm
          form={form}
          setForm={setForm}
          daysOfWeek={daysOfWeek}
          classTypes={classTypes}
          timeSlots={timeSlots}
          onSave={handleSave}
          onCancel={handleCancel}
          isMobile={false}
        />
      </DialogContent>
    </Dialog>
  );
}
