import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Plus, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface ClassType {
  id: number;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
}

interface ClassTypesManagerProps {
  classTypes: ClassType[];
  onAdd: (classType: Partial<ClassType>) => Promise<void>;
  onUpdate: (id: number, classType: Partial<ClassType>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function ClassTypesManager({ classTypes, onAdd, onUpdate, onDelete }: ClassTypesManagerProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<ClassType>>({});

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ isActive: true });
    setShowDialog(true);
  };

  const handleOpenEdit = (classType: ClassType) => {
    setEditingId(classType.id);
    setForm(classType);
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

  const handleToggleActive = async (classType: ClassType) => {
    await onUpdate(classType.id, { ...classType, isActive: !classType.isActive });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            Tipos de <span className="text-gradient">Clases</span>
          </h2>
          <p className="text-sm text-light/70">
            Gestiona los tipos de clases disponibles
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus size={16} className="mr-1" />
          Nueva Clase
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classTypes.map((classType) => (
          <Card key={classType.id} className={!classType.isActive ? 'opacity-50' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {classType.color && (
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: classType.color }}
                    />
                  )}
                  <CardTitle className="text-lg truncate">{classType.name}</CardTitle>
                </div>
                {!classType.isActive && (
                  <XCircle size={16} className="text-red-400 flex-shrink-0" />
                )}
              </div>
              {classType.description && (
                <CardDescription className="line-clamp-2">
                  {classType.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => handleOpenEdit(classType)}>
                  <Edit size={14} className="mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleActive(classType)}
                >
                  {classType.isActive ? (
                    <XCircle size={14} className="mr-1" />
                  ) : (
                    <CheckCircle2 size={14} className="mr-1" />
                  )}
                  {classType.isActive ? 'Desactivar' : 'Activar'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm(`¿Eliminar "${classType.name}"?`)) {
                      onDelete(classType.id);
                    }
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={14} className="mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Tipo de Clase' : 'Nuevo Tipo de Clase'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre *</label>
              <input
                type="text"
                className="w-full p-2 rounded bg-secondary/30 border border-secondary focus:border-primary outline-none"
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: CrossFit WOD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                className="w-full p-2 rounded bg-secondary/30 border border-secondary focus:border-primary outline-none"
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descripción del tipo de clase"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  className="h-10 w-20 rounded border border-secondary cursor-pointer"
                  value={form.color || '#E63946'}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
                <input
                  type="text"
                  className="flex-1 p-2 rounded bg-secondary/30 border border-secondary focus:border-primary outline-none"
                  value={form.color || ''}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="#E63946"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive ?? true}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                Activo
              </label>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!form.name?.trim()}>
                {editingId ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
