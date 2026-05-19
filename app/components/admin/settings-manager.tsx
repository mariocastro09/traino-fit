import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Save, RefreshCw, CheckCircle, Tv, Coins, Layers, Clock } from "lucide-react";

interface SettingsManagerProps {
  sessionToken: string | null;
}

export function SettingsManager({ sessionToken }: SettingsManagerProps) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = (await res.json()) as Record<string, string>;
        setSettings(data);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken || localStorage.getItem("admin_session")}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Error al guardar la configuración");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Error de red al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <RefreshCw size={24} className="animate-spin text-primary mx-auto mb-4" />
        <p className="text-light/60 text-sm">Cargando configuración...</p>
      </div>
    );
  }

  const tabs = [
    { id: "hero", name: "Carrusel Hero", icon: Tv },
    { id: "precios", name: "Hero Precios", icon: Coins },
    { id: "solucion", name: "Pilares", icon: Layers },
    { id: "countdown", name: "Cuenta Regresiva", icon: Clock },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            Configuración de la <span className="text-gradient">Web</span>
          </h2>
          <p className="text-sm text-light/70">
            Modifica textos, banners, cuenta regresiva y contenido de las secciones dinámicas
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-green-400 text-xs font-bold flex items-center gap-1.5 animate-fade-in">
              <CheckCircle size={14} /> ¡Guardado correctamente!
            </span>
          )}
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-primary text-white font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/15"
          >
            <Save size={16} className="mr-1.5" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-light/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={14} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content Panels ── */}
      <div className="pt-2">
        {activeTab === "hero" && (
          <div className="space-y-6">
            <Card className="bg-zinc-950 border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-white">Hero Principal (General)</CardTitle>
                <CardDescription className="text-xs text-light/50">
                  Modifica la fecha/badge superior del Hero y el subtítulo de apertura general.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">
                    Badge del Hero (Año/Apertura)
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                    value={settings.hero_apertura_badge || ""}
                    onChange={(e) => handleChange("hero_apertura_badge", e.target.value)}
                    placeholder="Ej: — Apertura Agosto 2026"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">
                    Subtítulo de Apertura (Amarillo)
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                    value={settings.hero_apertura_sub || ""}
                    onChange={(e) => handleChange("hero_apertura_sub", e.target.value)}
                    placeholder="Ej: Nueva apertura en AGOSTO."
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Slide 1: Gym */}
              <Card className="bg-zinc-950 border-white/5">
                <CardHeader className="pb-3 border-b border-white/5 mb-4">
                  <CardTitle className="text-sm font-black text-white uppercase tracking-wider">Slide 1: Traino Gym</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Tag (Nombre del módulo)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.hero_slide_gym_tag || ""}
                      onChange={(e) => handleChange("hero_slide_gym_tag", e.target.value)}
                      placeholder="Ej: TRAINO GYM"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Focus (Palabra cambiante)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.hero_slide_gym_focus || ""}
                      onChange={(e) => handleChange("hero_slide_gym_focus", e.target.value)}
                      placeholder="Ej: FUERZA"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Tagline / Descripción corta</label>
                    <textarea
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.hero_slide_gym_tagline || ""}
                      onChange={(e) => handleChange("hero_slide_gym_tagline", e.target.value)}
                      placeholder="Ej: Máquinas de última generación..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Slide 2: Box */}
              <Card className="bg-zinc-950 border-white/5">
                <CardHeader className="pb-3 border-b border-white/5 mb-4">
                  <CardTitle className="text-sm font-black text-white uppercase tracking-wider">Slide 2: Traino Box</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Tag (Nombre del módulo)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.hero_slide_box_tag || ""}
                      onChange={(e) => handleChange("hero_slide_box_tag", e.target.value)}
                      placeholder="Ej: TRAINO BOX"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Focus (Palabra cambiante)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.hero_slide_box_focus || ""}
                      onChange={(e) => handleChange("hero_slide_box_focus", e.target.value)}
                      placeholder="Ej: COMUNIDAD"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Tagline / Descripción corta</label>
                    <textarea
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.hero_slide_box_tagline || ""}
                      onChange={(e) => handleChange("hero_slide_box_tagline", e.target.value)}
                      placeholder="Ej: Coaching de élite, WODs diarios..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Slide 3: Hybrid */}
              <Card className="bg-zinc-950 border-white/5">
                <CardHeader className="pb-3 border-b border-white/5 mb-4">
                  <CardTitle className="text-sm font-black text-white uppercase tracking-wider">Slide 3: Traino Hybrid</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Tag (Nombre del módulo)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.hero_slide_hybrid_tag || ""}
                      onChange={(e) => handleChange("hero_slide_hybrid_tag", e.target.value)}
                      placeholder="Ej: TRAINO HYBRID"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Focus (Palabra cambiante)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.hero_slide_hybrid_focus || ""}
                      onChange={(e) => handleChange("hero_slide_hybrid_focus", e.target.value)}
                      placeholder="Ej: RENDIMIENTO"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Tagline / Descripción corta</label>
                    <textarea
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.hero_slide_hybrid_tagline || ""}
                      onChange={(e) => handleChange("hero_slide_hybrid_tagline", e.target.value)}
                      placeholder="Ej: Gym + CrossFit. El sistema definitivo..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "precios" && (
          <div className="space-y-6">
            <Card className="bg-zinc-950 border-white/5 max-w-4xl mx-auto">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-white">Hero de la Sección de Precios</CardTitle>
                <CardDescription className="text-xs text-light/50">
                  Personaliza la cabecera y el mensaje principal de la página de tarifas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">
                      Badge Superior de Precios
                    </label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.pricing_hero_badge || ""}
                      onChange={(e) => handleChange("pricing_hero_badge", e.target.value)}
                      placeholder="Ej: Arquitectura de Precios"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">
                      Título Principal de Precios
                    </label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.pricing_hero_title || ""}
                      onChange={(e) => handleChange("pricing_hero_title", e.target.value)}
                      placeholder="Ej: EL PLAN [PERFECTO] PARA TI"
                    />
                    <span className="text-[10px] text-light/40 mt-1 block">
                      Tip: Pon corchetes <code className="text-primary bg-white/5 px-1 py-0.5 rounded">[como esto]</code> alrededor de la palabra que deseas destacar en amarillo.
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">
                    Subtítulo / Mensaje Secundario
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                    value={settings.pricing_hero_subtitle || ""}
                    onChange={(e) => handleChange("pricing_hero_subtitle", e.target.value)}
                    placeholder="Ej: Sin cargos ocultos. Sin contratos largos. Solo resultados."
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Módulo 1 */}
              <Card className="bg-zinc-950 border-white/5">
                <CardHeader className="pb-3 border-b border-white/5 mb-4">
                  <CardTitle className="text-sm font-black text-white uppercase tracking-wider">Módulo 1: Traino Box</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Badge (Módulo)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.pricing_module_box_tag || ""}
                      onChange={(e) => handleChange("pricing_module_box_tag", e.target.value)}
                      placeholder="Ej: Módulo 1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Título</label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.pricing_module_box_title || ""}
                      onChange={(e) => handleChange("pricing_module_box_title", e.target.value)}
                      placeholder="Ej: TRAINO BOX — La Comunidad"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Descripción / Subtítulo</label>
                    <textarea
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.pricing_module_box_subtitle || ""}
                      onChange={(e) => handleChange("pricing_module_box_subtitle", e.target.value)}
                      placeholder="Ej: Coaching, comunidad y WODs de alto rendimiento..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Módulo 2 */}
              <Card className="bg-zinc-950 border-white/5">
                <CardHeader className="pb-3 border-b border-white/5 mb-4">
                  <CardTitle className="text-sm font-black text-white uppercase tracking-wider">Módulo 2: Traino Gym</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Badge (Módulo)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.pricing_module_gym_tag || ""}
                      onChange={(e) => handleChange("pricing_module_gym_tag", e.target.value)}
                      placeholder="Ej: Módulo 2"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Título</label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.pricing_module_gym_title || ""}
                      onChange={(e) => handleChange("pricing_module_gym_title", e.target.value)}
                      placeholder="Ej: TRAINO GYM — La Libertad"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Descripción / Subtítulo</label>
                    <textarea
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.pricing_module_gym_subtitle || ""}
                      onChange={(e) => handleChange("pricing_module_gym_subtitle", e.target.value)}
                      placeholder="Ej: Autonomía total, fuerza bruta y equipamiento..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Módulo 3 */}
              <Card className="bg-zinc-950 border-white/5">
                <CardHeader className="pb-3 border-b border-white/5 mb-4">
                  <CardTitle className="text-sm font-black text-white uppercase tracking-wider">Módulo 3: Traino Hybrid</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Badge (Módulo)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.pricing_module_hybrid_tag || ""}
                      onChange={(e) => handleChange("pricing_module_hybrid_tag", e.target.value)}
                      placeholder="Ej: Módulo 3"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Título</label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.pricing_module_hybrid_title || ""}
                      onChange={(e) => handleChange("pricing_module_hybrid_title", e.target.value)}
                      placeholder="Ej: TRAINO HYBRID — La Élite"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-light/60 mb-1">Descripción / Subtítulo</label>
                    <textarea
                      className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                      value={settings.pricing_module_hybrid_subtitle || ""}
                      onChange={(e) => handleChange("pricing_module_hybrid_subtitle", e.target.value)}
                      placeholder="Ej: Lo mejor de ambos mundos..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "solucion" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Traino Box Section */}
            <Card className="bg-zinc-950 border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-white">Pilar 1: Traino Box (Comunidad)</CardTitle>
                <CardDescription className="text-xs text-light/50">
                  Tarjeta de la solución.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">Hook / Subtítulo</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                    value={settings.three_pillars_box_hook || ""}
                    onChange={(e) => handleChange("three_pillars_box_hook", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">Descripción</label>
                  <textarea
                    className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                    value={settings.three_pillars_box_description || ""}
                    onChange={(e) => handleChange("three_pillars_box_description", e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">Beneficios (separados por coma)</label>
                  <textarea
                    className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                    value={settings.three_pillars_box_features || ""}
                    onChange={(e) => handleChange("three_pillars_box_features", e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Traino Gym Section */}
            <Card className="bg-zinc-950 border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-white">Pilar 2: Traino Gym (Libertad)</CardTitle>
                <CardDescription className="text-xs text-light/50">
                  Tarjeta de la solución.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">Hook / Subtítulo</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                    value={settings.three_pillars_gym_hook || ""}
                    onChange={(e) => handleChange("three_pillars_gym_hook", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">Descripción</label>
                  <textarea
                    className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                    value={settings.three_pillars_gym_description || ""}
                    onChange={(e) => handleChange("three_pillars_gym_description", e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">Beneficios (separados por coma)</label>
                  <textarea
                    className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                    value={settings.three_pillars_gym_features || ""}
                    onChange={(e) => handleChange("three_pillars_gym_features", e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Traino Full Section */}
            <Card className="bg-zinc-950 border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-white">Pilar 3: Traino Full (Élite)</CardTitle>
                <CardDescription className="text-xs text-light/50">
                  Tarjeta de la solución.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">Hook / Subtítulo</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                    value={settings.three_pillars_full_hook || ""}
                    onChange={(e) => handleChange("three_pillars_full_hook", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">Descripción</label>
                  <textarea
                    className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                    value={settings.three_pillars_full_description || ""}
                    onChange={(e) => handleChange("three_pillars_full_description", e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">Beneficios (separados por coma)</label>
                  <textarea
                    className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                    value={settings.three_pillars_full_features || ""}
                    onChange={(e) => handleChange("three_pillars_full_features", e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "countdown" && (
          <Card className="bg-zinc-950 border-white/5 max-w-2xl mx-auto">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-white">Cuenta Regresiva (Apertura)</CardTitle>
              <CardDescription className="text-xs text-light/50">
                Modifica la fecha límite y textos del banner de espera.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">
                  Fecha de Apertura (Formato ISO)
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={settings.waitlist_countdown_target || "2026-08-01T00:00:00-04:00"}
                  onChange={(e) => handleChange("waitlist_countdown_target", e.target.value)}
                  placeholder="AAAA-MM-DDT00:00:00-04:00"
                />
                <span className="text-[10px] text-light/40 mt-1 block">
                  Usa el formato estándar ISO. Ej: 2026-08-01T00:00:00-04:00
                </span>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">
                  Título del Countdown
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={settings.waitlist_countdown_title || ""}
                  onChange={(e) => handleChange("waitlist_countdown_title", e.target.value)}
                  placeholder="Ej: APERTURA AGOSTO"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light/60 mb-1">
                  Texto del Descuento
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 rounded bg-zinc-900 border border-white/10 focus:border-primary outline-none text-sm text-white"
                  value={settings.waitlist_discount_text || ""}
                  onChange={(e) => handleChange("waitlist_discount_text", e.target.value)}
                  placeholder="Ej: 20% OFF TU PRIMER MES"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </form>
  );
}
