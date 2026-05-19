import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Star, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface Plan {
  id: number;
  name: string;
  moduleName: string;
  hook?: string;
  price: string;
  description?: string;
  features: string;
  featured: boolean;
  cta: string;
  orderIndex?: number;
  isActive: boolean;
}

interface PlansManagerProps {
  plans: Plan[];
  onAdd: (plan: Partial<Plan>) => Promise<void>;
  onUpdate: (id: number, plan: Partial<Plan>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function PlansManager({ plans, onAdd, onUpdate, onDelete }: PlansManagerProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Plan>>({});

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      name: "",
      moduleName: "TRAINO BOX",
      hook: "",
      price: "$29.990",
      description: "",
      features: "",
      featured: false,
      cta: "Empieza aquí",
      orderIndex: 0,
      isActive: true,
    });
    setShowDialog(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setForm(plan);
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

  const handleToggleActive = async (plan: Plan) => {
    await onUpdate(plan.id, { ...plan, isActive: !plan.isActive });
  };

  const handleToggleFeatured = async (plan: Plan) => {
    await onUpdate(plan.id, { ...plan, featured: !plan.featured });
  };

  // Group plans by module name
  const modules = ["TRAINO BOX", "TRAINO GYM", "TRAINO HYBRID"];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            Planes y <span className="text-gradient">Membresías</span>
          </h2>
          <p className="text-sm text-light/70">
            Personaliza y gestiona las tarifas y planes que se muestran online
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus size={16} className="mr-1" />
          Nuevo Plan
        </Button>
      </div>

      <div className="space-y-8">
        {modules.map((moduleName) => {
          const modulePlans = plans.filter((p) => p.moduleName === moduleName);
          return (
            <div key={moduleName} className="border-t border-white/5 pt-6 first:border-none first:pt-0">
              <h3 className="text-lg font-black tracking-wider uppercase text-primary mb-4">
                {moduleName}
              </h3>
              
              {modulePlans.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-white/10 text-light/40 rounded">
                  No hay planes creados en este módulo
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modulePlans.map((plan) => (
                    <Card 
                      key={plan.id} 
                      className={`relative overflow-hidden transition-all duration-300 ${
                        !plan.isActive ? "opacity-50" : ""
                      } ${plan.featured ? "border-primary/40 bg-primary/5" : ""}`}
                    >
                      {plan.featured && (
                        <div className="absolute top-2 right-2 text-primary">
                          <Star size={16} className="fill-primary" />
                        </div>
                      )}
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                            {plan.hook && (
                              <CardDescription className="text-xs uppercase tracking-wider text-primary">
                                {plan.hook}
                              </CardDescription>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-black text-white">{plan.price}</div>
                            <div className="text-[10px] text-light/50">/ mes</div>
                          </div>
                        </div>
                        {plan.description && (
                          <CardDescription className="text-sm mt-2">
                            {plan.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="border-t border-white/5 pt-3">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-light/40 block mb-1">
                            Beneficios
                          </span>
                          <ul className="space-y-1">
                            {plan.features.split(",").filter(Boolean).map((feat, idx) => (
                              <li key={idx} className="text-xs text-light/80 flex items-center gap-1.5 truncate">
                                <Sparkles size={10} className="text-primary flex-shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex gap-1 flex-wrap pt-2 border-t border-white/5">
                          <Button size="sm" variant="outline" onClick={() => handleOpenEdit(plan)}>
                            <Edit size={14} className="mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleFeatured(plan)}
                          >
                            <Star size={14} className="mr-1" />
                            {plan.featured ? "Quitar Destacado" : "Destacar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(plan)}
                          >
                            {plan.isActive ? (
                              <XCircle size={14} className="mr-1" />
                            ) : (
                              <CheckCircle2 size={14} className="mr-1" />
                            )}
                            {plan.isActive ? "Desactivar" : "Activar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm(`¿Eliminar "${plan.name}"?`)) {
                                onDelete(plan.id);
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
              )}
            </div>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[550px] bg-zinc-950 border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingId ? "Editar Plan de Membresía" : "Nuevo Plan de Membresía"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: STARTER"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">
                  Módulo / Grupo *
                </label>
                <select
                  className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={form.moduleName || "TRAINO BOX"}
                  onChange={(e) => setForm({ ...form, moduleName: e.target.value })}
                >
                  <option value="TRAINO BOX">TRAINO BOX</option>
                  <option value="TRAINO GYM">TRAINO GYM</option>
                  <option value="TRAINO HYBRID">TRAINO HYBRID</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">
                  Hook / Subtítulo
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={form.hook || ""}
                  onChange={(e) => setForm({ ...form, hook: e.target.value })}
                  placeholder="Ej: Crea el Hábito"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">
                  Precio *
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={form.price || ""}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Ej: $29.990"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">
                Descripción / Horario
              </label>
              <input
                type="text"
                className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ej: 2 Clases / semana + Coaching"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">
                Beneficios (separados por coma) *
              </label>
              <textarea
                className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                value={form.features || ""}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                placeholder="Ej: 2 clases por semana,Coaching certificado,Escalable a tu nivel"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">
                  Texto Botón CTA *
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={form.cta || "Empieza aquí"}
                  onChange={(e) => setForm({ ...form, cta: e.target.value })}
                  placeholder="Ej: Empieza aquí"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">
                  Índice de Orden
                </label>
                <input
                  type="number"
                  className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={form.orderIndex || 0}
                  onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })}
                  placeholder="Ej: 0"
                />
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="planFeatured"
                  checked={form.featured || false}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-primary focus:ring-0 cursor-pointer"
                />
                <label htmlFor="planFeatured" className="text-sm font-medium cursor-pointer text-light/80">
                  Plan Destacado (Recomendado)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="planActive"
                  checked={form.isActive ?? true}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-primary focus:ring-0 cursor-pointer"
                />
                <label htmlFor="planActive" className="text-sm font-medium cursor-pointer text-light/80">
                  Plan Activo
                </label>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-white/5">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!form.name?.trim() || !form.price?.trim() || !form.features?.trim() || !form.cta?.trim()}
                className="bg-primary text-black hover:scale-105 transition-all duration-300 font-bold"
              >
                {editingId ? "Actualizar Plan" : "Crear Plan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
