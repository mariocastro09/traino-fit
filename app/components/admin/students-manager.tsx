import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Search, Mail, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalConditions?: string;
  membershipType?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  notes?: string;
  isActive: boolean;
}

interface StudentsManagerProps {
  students: Student[];
  onAdd: (student: Partial<Student>) => Promise<void>;
  onUpdate: (id: number, student: Partial<Student>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function StudentsManager({ students, onAdd, onUpdate, onDelete }: StudentsManagerProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Student>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(query) ||
      student.lastName.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.phone.includes(query)
    );
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ isActive: true });
    setShowDialog(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingId(student.id);
    setForm(student);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (editingId) {
      await onUpdate(editingId, form);
    } else {
      await onAdd(form);
    }
    setShowDialog(false);
    setForm({});
    setEditingId(null);
  };

  const handleCancel = () => {
    setShowDialog(false);
    setForm({});
    setEditingId(null);
  };

  const handleToggleActive = async (student: Student) => {
    await onUpdate(student.id, { ...student, isActive: !student.isActive });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            Gestión de <span className="text-gradient">Alumnos</span>
          </h2>
          <p className="text-sm text-light/70">
            {filteredStudents.length} alumnos • {students.filter(s => s.isActive).length} activos
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-light/50" />
            <input
              type="text"
              placeholder="Buscar alumno..."
              className="pl-9 pr-4 py-2 rounded bg-secondary/30 border border-secondary focus:border-primary outline-none w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleOpenAdd}>
            <Plus size={16} className="mr-1" />
            <span className="hidden sm:inline">Nuevo Alumno</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredStudents.map((student) => (
          <Card key={student.id} className={!student.isActive ? 'opacity-50' : ''}>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-lg">
                      {student.firstName} {student.lastName}
                    </h3>
                    {!student.isActive && (
                      <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">
                        Inactivo
                      </span>
                    )}
                    {student.membershipType && (
                      <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
                        {student.membershipType}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-light/70 space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      <span className="truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} />
                      <span>{student.phone}</span>
                    </div>
                    {student.membershipEndDate && (
                      <div className="text-xs">
                        Vence: {new Date(student.membershipEndDate).toLocaleDateString('es-AR')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-wrap lg:flex-nowrap">
                  <Button size="sm" variant="outline" onClick={() => handleOpenEdit(student)}>
                    <Edit size={14} className="mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(student)}
                  >
                    {student.isActive ? (
                      <XCircle size={14} className="mr-1" />
                    ) : (
                      <CheckCircle2 size={14} className="mr-1" />
                    )}
                    <span className="hidden sm:inline">
                      {student.isActive ? 'Desactivar' : 'Activar'}
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm(`¿Eliminar a ${student.firstName} ${student.lastName}?`)) {
                        onDelete(student.id);
                      }
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} className="mr-1" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Alumno' : 'Nuevo Alumno'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Required Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre *</label>
                <input
                  type="text"
                  className="w-full p-2 rounded bg-secondary/30 border border-secondary focus:border-primary outline-none"
                  value={form.firstName || ''}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Juan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Apellido *</label>
                <input
                  type="text"
                  className="w-full p-2 rounded bg-secondary/30 border border-secondary focus:border-primary outline-none"
                  value={form.lastName || ''}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  className="w-full p-2 rounded bg-secondary/30 border border-secondary focus:border-primary outline-none"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="juan@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Teléfono *</label>
                <input
                  type="tel"
                  className="w-full p-2 rounded bg-secondary/30 border border-secondary focus:border-primary outline-none"
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>

            {/* Optional Fields */}
            <hr className="border-white/10" />
            <p className="text-sm text-light/50">Campos Opcionales</p>

            <div>
              <label className="block text-sm font-medium mb-2">Fecha de Nacimiento</label>
              <input
                type="date"
                className="w-full p-2 rounded bg-secondary/30 border border-secondary focus:border-primary outline-none"
                value={form.dateOfBirth || ''}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Contacto de Emergencia</label>
                <input
                  type="text"
                  className="w-full p-2 rounded bg-secondary/30 border border-secondary focus:border-primary outline-none"
                  value={form.emergencyContact || ''}
                  onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Teléfono de Emergencia</label>
                <input
                  type="tel"
                  className="w-full p-2 rounded bg-secondary/30 border border-secondary focus:border-primary outline-none"
                  value={form.emergencyPhone || ''}
                  onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                  placeholder="+56 9 8765 4321"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Condiciones Médicas</label>
              <textarea
                className="w-full p-2 rounded bg-secondary/30 border border-secondary focus:border-primary outline-none"
                value={form.medicalConditions || ''}
                onChange={(e) => setForm({ ...form, medicalConditions: e.target.value })}
                placeholder="Alergias, lesiones, etc."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Membresía</label>
                <select
                  className="w-full p-2 rounded bg-secondary/30 border border-secondary focus:border-primary outline-none"
                  value={form.membershipType || ''}
                  onChange={(e) => setForm({ ...form, membershipType: e.target.value })}
                >
                  <option value="">Seleccionar</option>
                  <option value="Mensual">Mensual</option>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Semestral">Semestral</option>
                  <option value="Anual">Anual</option>
                  <option value="Clase Única">Clase Única</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
                <input
                  type="date"
                  className="w-full p-2 rounded bg-secondary/30 border border-secondary focus:border-primary outline-none"
                  value={form.membershipStartDate || ''}
                  onChange={(e) => setForm({ ...form, membershipStartDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fecha Vencimiento</label>
                <input
                  type="date"
                  className="w-full p-2 rounded bg-secondary/30 border border-secondary focus:border-primary outline-none"
                  value={form.membershipEndDate || ''}
                  onChange={(e) => setForm({ ...form, membershipEndDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notas</label>
              <textarea
                className="w-full p-2 rounded bg-secondary/30 border border-secondary focus:border-primary outline-none"
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notas adicionales..."
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActiveStudent"
                checked={form.isActive ?? true}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActiveStudent" className="text-sm font-medium cursor-pointer">
                Alumno Activo
              </label>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!form.firstName?.trim() || !form.lastName?.trim() || !form.email?.trim() || !form.phone?.trim()}
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
