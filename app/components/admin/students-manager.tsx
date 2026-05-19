import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Search, Mail, Phone, User } from "lucide-react";
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

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0) || ""}${last.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            Gestión de <span className="text-gradient">Alumnos</span>
          </h2>
          <p className="text-sm text-light/70">
            {filteredStudents.length} alumnos • {students.filter(s => s.isActive).length} activos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light/40" />
            <input
              type="text"
              placeholder="Buscar alumno..."
              className="pl-10 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-white/5 focus:border-primary outline-none w-full md:w-64 text-sm text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleOpenAdd} className="bg-primary text-black hover:scale-105 transition-all duration-300 font-bold py-2.5">
            <Plus size={16} className="mr-1" />
            Nuevo Alumno
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/10 rounded-xl text-light/40">
            No se encontraron alumnos con el criterio de búsqueda
          </div>
        ) : (
          filteredStudents.map((student) => (
            <Card 
              key={student.id} 
              className={`transition-all duration-300 bg-zinc-900/30 border-white/5 hover:border-white/10 backdrop-blur-md ${
                !student.isActive ? 'opacity-50' : ''
              }`}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Side: Avatar + Details */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center flex-shrink-0">
                      {student.firstName ? (
                        <span className="text-sm font-black text-primary">
                          {getInitials(student.firstName, student.lastName)}
                        </span>
                      ) : (
                        <User size={18} className="text-light/40" />
                      )}
                    </div>
                    
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-white">
                          {student.firstName} {student.lastName}
                        </h3>
                        {!student.isActive && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded">
                            Inactivo
                          </span>
                        )}
                        {student.membershipType && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded">
                            {student.membershipType}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-xs text-light/60">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail size={12} className="text-light/40" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-light/40" />
                          <span>{student.phone}</span>
                        </div>
                        {student.membershipEndDate && (
                          <div className="text-[11px] text-light/40 sm:border-l sm:border-white/10 sm:pl-4">
                            Vence: <span className="text-white/80 font-medium">{new Date(student.membershipEndDate).toLocaleDateString('es-CL')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex items-center gap-1.5 border-t border-white/5 pt-3 sm:border-t-0 sm:pt-0 justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleOpenEdit(student)}
                      className="border-white/10 hover:bg-white/5 text-xs h-9"
                    >
                      <Edit size={12} className="mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(student)}
                      className="border-white/10 hover:bg-white/5 text-xs h-9"
                    >
                      {student.isActive ? (
                        <XCircle size={12} className="mr-1" />
                      ) : (
                        <CheckCircle2 size={12} className="mr-1" />
                      )}
                      <span>{student.isActive ? 'Desactivar' : 'Activar'}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm(`¿Eliminar a ${student.firstName} ${student.lastName}?`)) {
                          onDelete(student.id);
                        }
                      }}
                      className="border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-xs h-9 text-red-400"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-zinc-950 border border-white/10 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingId ? 'Editar Alumno' : 'Nuevo Alumno'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Required Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-2">Nombre *</label>
                <input
                  type="text"
                  className="w-full p-3 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={form.firstName || ''}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Juan"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-2">Apellido *</label>
                <input
                  type="text"
                  className="w-full p-3 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={form.lastName || ''}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-2">Email *</label>
                <input
                  type="email"
                  className="w-full p-3 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="juan@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-2">Teléfono *</label>
                <input
                  type="tel"
                  className="w-full p-3 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>

            {/* Optional Fields Header */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-start">
                <span className="bg-zinc-950 pr-3 text-[10px] uppercase font-bold tracking-widest text-light/40">
                  Información Opcional
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-2">Fecha de Nacimiento</label>
              <input
                type="date"
                className="w-full p-3 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                value={form.dateOfBirth || ''}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-2">Contacto de Emergencia</label>
                <input
                  type="text"
                  className="w-full p-3 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={form.emergencyContact || ''}
                  onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-2">Teléfono de Emergencia</label>
                <input
                  type="tel"
                  className="w-full p-3 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={form.emergencyPhone || ''}
                  onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                  placeholder="+56 9 8765 4321"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-2">Condiciones Médicas</label>
              <textarea
                className="w-full p-3 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                value={form.medicalConditions || ''}
                onChange={(e) => setForm({ ...form, medicalConditions: e.target.value })}
                placeholder="Alergias, lesiones, etc."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-2">Tipo Membresía</label>
                <select
                  className="w-full p-3 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-2">Fecha Inicio</label>
                <input
                  type="date"
                  className="w-full p-3 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={form.membershipStartDate || ''}
                  onChange={(e) => setForm({ ...form, membershipStartDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-2">Fecha Vencimiento</label>
                <input
                  type="date"
                  className="w-full p-3 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={form.membershipEndDate || ''}
                  onChange={(e) => setForm({ ...form, membershipEndDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-2">Notas Internas</label>
              <textarea
                className="w-full p-3 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notas adicionales..."
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActiveStudent"
                checked={form.isActive ?? true}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-primary focus:ring-0 cursor-pointer"
              />
              <label htmlFor="isActiveStudent" className="text-sm font-medium cursor-pointer text-light/80">
                Alumno Activo
              </label>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-white/5">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!form.firstName?.trim() || !form.lastName?.trim() || !form.email?.trim() || !form.phone?.trim()}
                className="bg-primary text-black hover:scale-105 transition-all duration-300 font-bold"
              >
                {editingId ? 'Actualizar Alumno' : 'Crear Alumno'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
