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
    setForm({ isActive: true, color: "#E63946" });
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            Tipos de <span className="text-gradient">Clases</span>
          </h2>
          <p className="text-sm text-light/70">
            Gestiona los tipos de clases disponibles y su código de color
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-primary text-black hover:scale-105 transition-all duration-300 font-bold w-full sm:w-auto">
          <Plus size={16} className="mr-1" />
          Nueva Clase
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classTypes.map((classType) => (
          <Card 
            key={classType.id} 
            className={`relative overflow-hidden transition-all duration-300 bg-zinc-900/40 border-white/5 backdrop-blur-md hover:border-white/10 ${
              !classType.isActive ? 'opacity-50' : ''
            }`}
          >
            {/* Left side accent indicator */}
            {classType.color && (
              <div 
                className="absolute top-0 left-0 w-1.5 h-full"
                style={{ backgroundColor: classType.color }}
              />
            )}

            <CardHeader className="pb-3 pl-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <CardTitle className="text-lg font-bold truncate text-white">{classType.name}</CardTitle>
                </div>
                {!classType.isActive && (
                  <XCircle size={16} className="text-red-400 flex-shrink-0" />
                )}
              </div>
              {classType.description && (
                <CardDescription className="line-clamp-2 text-xs text-light/60 mt-1">
                  {classType.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pl-6">
              <div className="flex gap-1.5 flex-wrap">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleOpenEdit(classType)}
                  className="border-white/10 hover:bg-white/5 text-xs h-8"
                >
                  <Edit size={12} className="mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleActive(classType)}
                  className="border-white/10 hover:bg-white/5 text-xs h-8"
                >
                  {classType.isActive ? (
                    <XCircle size={12} className="mr-1" />
                  ) : (
                    <CheckCircle2 size={12} className="mr-1" />
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
                  className="border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-xs h-8 text-red-400"
                >
                  <Trash2 size={12} className="mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px] bg-zinc-950 border border-white/10 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingId ? 'Editar Tipo de Clase' : 'Nuevo Tipo de Clase'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-2">Nombre *</label>
              <input
                type="text"
                className="w-full p-3 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: CrossFit WOD"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-2">Descripción</label>
              <textarea
                className="w-full p-3 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descripción del tipo de clase"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-2">Color de Identificación</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  className="h-11 w-20 rounded border border-white/10 cursor-pointer bg-zinc-900 p-1"
                  value={form.color || '#E63946'}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
                <input
                  type="text"
                  className="flex-1 p-3 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white font-mono"
                  value={form.color || ''}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="#E63946"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive ?? true}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-primary focus:ring-0 cursor-pointer"
              />
              <label htmlFor="isActive" className="text-sm font-medium cursor-pointer text-light/80">
                Tipo de Clase Activo
              </label>
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t border-white/5">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!form.name?.trim()}
                className="bg-primary text-black hover:scale-105 transition-all duration-300 font-bold"
              >
                {editingId ? 'Actualizar Clase' : 'Crear Clase'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
