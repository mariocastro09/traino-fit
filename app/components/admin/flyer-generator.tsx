import { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { 
  Download, Image as ImageIcon, Type, Sparkles, 
  RefreshCw, Layers, Dumbbell, Calendar, Info, Upload
} from "lucide-react";

interface Workout {
  id: number;
  name: string;
  description?: string;
  difficulty: string;
  exercises?: Array<{
    exerciseName: string;
    sets: number;
    reps: string;
    intensityPct?: number;
    restSeconds?: number;
  }>;
}

export function FlyerGenerator() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("custom");

  // Flyer Form State
  const [template, setTemplate] = useState<"promo" | "wod" | "matriculas">("promo");
  const [styleTheme, setStyleTheme] = useState<"dark" | "amber" | "crimson">("amber");
  
  const [title, setTitle] = useState("MATRÍCULAS ABIERTAS");
  const [subtitle, setSubtitle] = useState("CLASES DISPONIBLES DE LUNES A SÁBADO");
  const [description, setDescription] = useState(
    "Ven a entrenar con nosotros y lleva tu capacidad física al siguiente nivel. Contamos con entrenadores certificados, CrossFit WOD y equipamiento premium."
  );
  const [ctaText, setCtaText] = useState("📲 AGENDA TU CLASE GRATIS: +56 9 9363 6005");
  const [priceTag, setPriceTag] = useState("Planes desde $29.990");

  // Custom WOD Exercises list
  const [wodExercises, setWodExercises] = useState<string>(
    "1. Sentadillas de Aire: 3 series x 20 reps\n2. Flexiones de Brazo: 3 series x 15 reps\n3. Dominadas (Pull-ups): 3 series x 8 reps\n4. Burpees Intensos: 3 series x 10 reps"
  );

  // Logo Customization State
  const [logoPosition, setLogoPosition] = useState<"top-center" | "top-left" | "bottom-right" | "none">("top-center");
  const [logoSource, setLogoSource] = useState<"default" | "custom">("default");
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState<number>(1.0);
  const [lightMode, setLightMode] = useState<boolean>(false);

  // Premium Background & Effect States
  const [backgroundPattern, setBackgroundPattern] = useState<"dots" | "stripes" | "clean">("dots");
  const [showWatermark, setShowWatermark] = useState(false);
  const [glassEffect, setGlassEffect] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const customLogoImgRef = useRef<HTMLImageElement | null>(null);

  // Load workouts for the selector
  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const res = await fetch("/api/admin/workouts", { credentials: "include" });
      if (res.ok) {
        setWorkouts(await res.json() as Workout[]);
      }
    } catch (err) {
      console.error("Failed to load workouts:", err);
    } finally {
      setLoadingWorkouts(false);
    }
  };

  // Handle custom logo image file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setCustomLogoUrl(url);
        
        const img = new Image();
        img.onload = () => {
          customLogoImgRef.current = img;
          drawFlyer(); // Redraw canvas immediately once loaded
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-populate templates
  useEffect(() => {
    if (template === "promo") {
      setTitle("MATRÍCULAS ABIERTAS");
      setSubtitle("CLASES DISPONIBLES DE LUNES A SÁBADO");
      setDescription(
        "Ven a entrenar con nosotros y lleva tu capacidad física al siguiente nivel. Contamos con entrenadores certificados, CrossFit WOD y equipamiento premium."
      );
      setPriceTag("Planes desde $29.990");
    } else if (template === "matriculas") {
      setTitle("ENTRENA EN TRAINOFIT");
      setSubtitle("PRECIOS E INSCRIPCIONES 2026");
      setDescription(
        "Únete hoy a la mejor comunidad de entrenamiento funcional y CrossFit. Planes flexibles mensuales, trimestrales y anuales adaptados a tu ritmo."
      );
      setPriceTag("Matrícula Gratis esta Semana");
    } else if (template === "wod" && selectedWorkoutId === "custom") {
      setTitle("WOD DEL DÍA");
      setSubtitle("COMPLEMENTO DÍA DE ENTRENAMIENTO");
      setDescription("Sigue la planificación del coach con cuidado y mantén la intensidad recomendada.");
      setPriceTag("Nivel: Intermedio");
    }
  }, [template]);

  // Handle workout selection
  useEffect(() => {
    if (template === "wod" && selectedWorkoutId !== "custom") {
      const selected = workouts.find(w => w.id.toString() === selectedWorkoutId);
      if (selected) {
        setTitle(selected.name.toUpperCase());
        setSubtitle(`DIFICULTAD: ${selected.difficulty.toUpperCase()}`);
        setDescription(selected.description || "Rutina diseñada para el día de hoy.");
        setPriceTag(`Nivel: ${selected.difficulty}`);
        
        if (selected.exercises && selected.exercises.length > 0) {
          const listStr = selected.exercises.map((e, idx) => 
            `${idx + 1}. ${e.exerciseName}: ${e.sets}x${e.reps}${e.intensityPct ? ` (${e.intensityPct}% RM)` : ""}${e.restSeconds ? ` · ${e.restSeconds}s rest` : ""}`
          ).join("\n");
          setWodExercises(listStr);
        } else {
          setWodExercises("Sin ejercicios registrados.");
        }
      }
    }
  }, [selectedWorkoutId, workouts, template]);

  // Render preview on canvas
  useEffect(() => {
    drawFlyer();
  }, [
    template, styleTheme, title, subtitle, description, ctaText, priceTag, wodExercises,
    logoPosition, logoSource, customLogoUrl, logoScale, lightMode, backgroundPattern, showWatermark, glassEffect
  ]);

  const drawFlyer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Color Setup based on theme
    let primaryColor = "#d4a017"; // amber
    let secondaryColor = "#f59e0b"; // dark amber
    let darkBg = "#09090b"; // zinc-950

    if (styleTheme === "crimson") {
      primaryColor = "#ef4444"; // red
      secondaryColor = "#b91c1c"; 
    } else if (styleTheme === "dark") {
      primaryColor = lightMode ? "#09090b" : "#ffffff"; // black for light mode, white for dark mode
      secondaryColor = "#71717a"; // zinc-500
    }

    // Gradient background colors (Light vs Dark Mode)
    const bgStart = lightMode ? "#fafaf9" : "#1c1917"; // stone-50 vs stone-900
    const bgEnd = lightMode ? "#e7e5e4" : darkBg;     // stone-200 vs zinc-950
    const bgGradient = ctx.createRadialGradient(540, 540, 100, 540, 540, 700);
    bgGradient.addColorStop(0, bgStart);
    bgGradient.addColorStop(1, bgEnd);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid overlays (adaptive contrast)
    const patternColor = lightMode ? "rgba(0, 0, 0, 0.025)" : "rgba(255, 255, 255, 0.025)";
    const stripesColor = lightMode ? "rgba(0, 0, 0, 0.015)" : "rgba(255, 255, 255, 0.012)";
    const gridColor = lightMode ? "rgba(0, 0, 0, 0.02)" : "rgba(255, 255, 255, 0.015)";

    if (backgroundPattern === "dots") {
      ctx.fillStyle = patternColor;
      for (let x = 40; x < canvas.width; x += 30) {
        for (let y = 40; y < canvas.height; y += 30) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (backgroundPattern === "stripes") {
      ctx.strokeStyle = stripesColor;
      ctx.lineWidth = 12;
      for (let i = -500; i < canvas.width; i += 70) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 500, canvas.height);
        ctx.stroke();
      }
    } else {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
    }

    // Faint diagonal Watermark (adaptive contrast)
    if (showWatermark) {
      ctx.save();
      ctx.translate(540, 540);
      ctx.rotate(-Math.PI / 6);
      ctx.fillStyle = lightMode ? "rgba(0, 0, 0, 0.015)" : "rgba(255, 255, 255, 0.015)";
      ctx.font = "900 130px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(template === "wod" ? "WOD OF THE DAY" : "TRAINOFIT BOX", 0, 0);
      ctx.restore();
    }

    // Glowing center light
    const glowGradient = ctx.createRadialGradient(540, 540, 10, 540, 540, 450);
    glowGradient.addColorStop(0, lightMode ? `${primaryColor}06` : `${primaryColor}13`);
    glowGradient.addColorStop(1, "transparent");
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(540, 540, 450, 0, Math.PI * 2);
    ctx.fill();

    // Flyer Outer Border
    ctx.strokeStyle = lightMode ? "rgba(0, 0, 0, 0.05)" : `${primaryColor}22`;
    ctx.lineWidth = 15;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Inner corner accents
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 4;
    
    ctx.beginPath();
    ctx.moveTo(50, 90); ctx.lineTo(50, 50); ctx.lineTo(90, 50);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvas.width - 50, 90); ctx.lineTo(canvas.width - 50, 50); ctx.lineTo(canvas.width - 90, 50);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(50, canvas.height - 90); ctx.lineTo(50, canvas.height - 50); ctx.lineTo(90, canvas.height - 50);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvas.width - 50, canvas.height - 90); ctx.lineTo(canvas.width - 50, canvas.height - 50); ctx.lineTo(canvas.width - 90, canvas.height - 50);
    ctx.stroke();

    // Adjust heights and positions based on logo placement
    const hasTopLogo = logoPosition === "top-center";
    const titleY = hasTopLogo ? 230 : 155;
    const subtitleY = hasTopLogo ? 285 : 210;
    const boxY = hasTopLogo ? 320 : 245;
    const boxHeight = template === "wod" 
      ? (hasTopLogo ? 440 : 515) 
      : (hasTopLogo ? 380 : 455);

    // Draw Logo function
    const drawLogo = (x: number, y: number, align: "center" | "left" | "right", scale = 1) => {
      ctx.save();
      if (logoSource === "custom" && customLogoImgRef.current) {
        // Draw uploaded logo image
        const img = customLogoImgRef.current;
        const aspect = img.width / img.height;
        const targetHeight = 55 * scale;
        const targetWidth = targetHeight * aspect;
        
        let drawX = x;
        if (align === "center") {
          drawX = x - targetWidth / 2;
        } else if (align === "right") {
          drawX = x - targetWidth;
        }
        
        ctx.drawImage(img, drawX, y - targetHeight / 2, targetWidth, targetHeight);
      } else {
        // Draw default dumbbell brand mark
        ctx.fillStyle = primaryColor;
        
        let iconX = x;
        let textX = x;
        let textY = y + 45;
        let subY = y + 62;
        
        if (align === "left") {
          iconX = x + 35;
          textX = x + 90;
          textY = y - 5;
          subY = y + 12;
          ctx.textAlign = "left";
        } else if (align === "right") {
          iconX = x - 35;
          textX = x - 90;
          textY = y - 5;
          subY = y + 12;
          ctx.textAlign = "right";
        } else {
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
        }
        
        // Dumbbell Bar
        ctx.save();
        ctx.translate(iconX, y);
        ctx.scale(scale, scale);
        ctx.fillRect(-25, -4, 50, 8);
        ctx.fillRect(-35, -15, 10, 30);
        ctx.fillRect(-45, -20, 8, 40);
        ctx.fillRect(25, -15, 10, 30);
        ctx.fillRect(37, -20, 8, 40);
        ctx.restore();

        // Text
        ctx.fillStyle = lightMode ? "#09090b" : "#ffffff";
        ctx.font = `black ${20 * scale}px 'Inter', sans-serif`;
        ctx.letterSpacing = `${6 * scale}px`;
        ctx.textBaseline = "middle";
        ctx.fillText("TRAINOFIT", textX, textY);

        ctx.fillStyle = primaryColor;
        ctx.font = `bold ${9 * scale}px 'Inter', sans-serif`;
        ctx.letterSpacing = `${3 * scale}px`;
        ctx.fillText("CROSSFIT & BOX GYM", textX, subY);
      }
      ctx.restore();
    };

    // Render Logo if active (applying logoScale slider factor)
    if (logoPosition === "top-center") {
      drawLogo(540, 110, "center", logoScale);
    } else if (logoPosition === "top-left") {
      drawLogo(80, 100, "left", logoScale);
    } else if (logoPosition === "bottom-right") {
      drawLogo(960, 955, "right", 0.75 * logoScale);
    }

    // 3. Draw Title (Heavy typography)
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = lightMode ? "#09090b" : "#ffffff";
    ctx.font = "900 48px 'Inter', sans-serif";
    ctx.fillText(title, 540, titleY);

    // Subtitle
    ctx.fillStyle = primaryColor;
    ctx.font = "bold 16px 'Inter', sans-serif";
    ctx.fillText(subtitle, 540, subtitleY);

    // 4. Main Body / Content Box
    const boxWidth = 840;
    const boxX = (canvas.width - boxWidth) / 2;

    // Draw card container (Glassmorphism if active)
    if (glassEffect) {
      ctx.fillStyle = lightMode ? "rgba(255, 255, 255, 0.85)" : "rgba(10, 10, 10, 0.75)";
      ctx.strokeStyle = lightMode ? "rgba(0, 0, 0, 0.05)" : `${primaryColor}22`;
      ctx.lineWidth = 1.5;
    } else {
      ctx.fillStyle = lightMode ? "#ffffff" : "#0c0a09"; // Pure solid
      ctx.strokeStyle = lightMode ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
    }
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 20);
    ctx.fill();
    ctx.stroke();

    // Highlight card inner line
    ctx.strokeStyle = lightMode ? "rgba(0, 0, 0, 0.03)" : `rgba(255, 255, 255, 0.04)`;
    ctx.beginPath();
    ctx.roundRect(boxX + 1, boxY + 1, boxWidth - 2, boxHeight - 2, 20);
    ctx.stroke();

    // Draw Price Badge or difficulty badge in card corner
    if (priceTag) {
      const badgeText = priceTag.toUpperCase();
      ctx.font = "black 11px 'Inter', sans-serif";
      const textWidth = ctx.measureText(badgeText).width;
      const bW = textWidth + 30;
      const bH = 30;
      const bX = boxX + boxWidth - bW - 20;
      const bY = boxY + 20;

      ctx.fillStyle = `${primaryColor}20`;
      ctx.strokeStyle = `${primaryColor}40`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bX, bY, bW, bH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = primaryColor;
      ctx.fillText(badgeText, bX + bW/2, bY + bH/2 + 1);
    }

    // Render Template Content
    if (template === "wod") {
      ctx.textAlign = "left";
      ctx.fillStyle = lightMode ? "#27272a" : "#e4e4e7"; // zinc-800 vs zinc-200
      ctx.font = "500 15px 'Inter', sans-serif";
      
      // Draw small workout info intro
      ctx.fillText(description, boxX + 30, boxY + 40);

      // Draw horizontal line divider
      ctx.strokeStyle = lightMode ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.05)";
      ctx.beginPath();
      ctx.moveTo(boxX + 30, boxY + 70);
      ctx.lineTo(boxX + boxWidth - 30, boxY + 70);
      ctx.stroke();

      // Draw exercises list
      ctx.fillStyle = lightMode ? "#09090b" : "#ffffff";
      ctx.font = "bold 15px 'Inter', sans-serif";
      
      const lines = wodExercises.split("\n");
      let lineY = boxY + 110;
      lines.forEach((line) => {
        if (!line.trim()) return;

        // Draw small bullet point indicator
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.arc(boxX + 45, lineY - 1, 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw exercise text
        ctx.fillStyle = lightMode ? "#09090b" : "#ffffff";
        ctx.font = "bold 16px 'Inter', sans-serif";
        
        const colonIdx = line.indexOf(":");
        if (colonIdx !== -1) {
          const exName = line.substring(0, colonIdx + 1);
          const exDetails = line.substring(colonIdx + 1);
          
          ctx.fillText(exName, boxX + 65, lineY);
          
          ctx.fillStyle = lightMode ? "#71717a" : "#a1a1aa"; // zinc-500 vs zinc-400
          ctx.font = "500 15px 'Inter', sans-serif";
          ctx.fillText(exDetails, boxX + 65 + ctx.measureText(exName).width + 5, lineY);
        } else {
          ctx.fillText(line, boxX + 65, lineY);
        }
        
        lineY += 42;
      });
    } else {
      ctx.textAlign = "center";
      ctx.fillStyle = lightMode ? "#18181b" : "#f4f4f5";
      ctx.font = "600 24px 'Inter', sans-serif";
      
      // Wrap description text
      const words = description.split(" ");
      let line = "";
      const lines = [];
      const maxWidth = boxWidth - 100;
      
      ctx.font = "600 20px 'Inter', sans-serif";
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + " ";
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      let textY = boxY + (boxHeight / 2) - ((lines.length - 1) * 15);
      
      // Draw quotes background mark
      ctx.fillStyle = lightMode ? `${primaryColor}10` : `${primaryColor}15`;
      ctx.font = "italic bold 120px serif";
      ctx.fillText("“", boxX + (boxWidth / 2), textY - 45);

      ctx.fillStyle = lightMode ? "#27272a" : "#e4e4e7"; // zinc-800 vs zinc-200
      ctx.font = "500 17px 'Inter', sans-serif";
      lines.forEach((lineStr) => {
        ctx.fillText(lineStr.trim(), boxX + (boxWidth / 2), textY);
        textY += 32;
      });
    }

    // 5. Draw Footer / CTA Bar
    const footerY = 900;
    ctx.textAlign = "center";

    // Bottom decorative bar
    ctx.fillStyle = primaryColor;
    ctx.fillRect(boxX + 150, footerY - 50, boxWidth - 300, 2);

    ctx.fillStyle = lightMode ? "#09090b" : "#ffffff";
    ctx.font = "black 17px 'Inter', sans-serif";
    ctx.fillText(ctaText, 540, footerY);

    ctx.fillStyle = lightMode ? "#57534e" : "#71717a"; // stone-600 vs zinc-500
    ctx.font = "bold 11px 'Inter', sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("WWW.TRAINOFIT.CL · SANTIAGO, CHILE", 540, footerY + 45);
    ctx.letterSpacing = "normal";
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert to PNG and trigger download
    const link = document.createElement("a");
    link.download = `Flyer_${template}_${styleTheme}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
      {/* Settings Form */}
      <div className="xl:col-span-5 p-5 rounded-2xl bg-zinc-950/40 border border-white/5 backdrop-blur-xl flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Layers className="text-primary" size={16} />
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Configuración del Flyer</h3>
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-light/50 mb-1.5">Tipo de Flyer</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "promo", label: "Promoción", icon: Sparkles },
                { id: "wod", label: "WOD / Rutina", icon: Dumbbell },
                { id: "matriculas", label: "Matrículas", icon: Calendar },
              ].map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id as any)}
                    className={`py-2 px-3 rounded-xl border text-[11px] font-bold uppercase tracking-wider flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-200 ${
                      template === t.id
                        ? "bg-primary/25 border-primary/45 text-white"
                        : "bg-zinc-900 border-white/5 text-light/40 hover:text-white"
                    }`}
                  >
                    <Icon size={14} className={template === t.id ? "text-primary" : ""} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme & Mode Selector */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-light/50 mb-1.5">Esquema de Colores</label>
              <select
                value={styleTheme}
                onChange={(e) => setStyleTheme(e.target.value as any)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-2 text-[10px] text-white outline-none focus:border-primary/40"
              >
                <option value="amber">Ámbar Warm</option>
                <option value="crimson">Rojo Nitro</option>
                <option value="dark">Monocromo</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-light/50 mb-1.5">Fondo del Flyer</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setLightMode(false)}
                  className={`py-2 px-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider text-center cursor-pointer transition-all duration-200 ${
                    !lightMode
                      ? "bg-primary/20 border-primary/40 text-white"
                      : "bg-zinc-900 border-white/5 text-light/40 hover:text-white"
                  }`}
                >
                  Oscuro
                </button>
                <button
                  onClick={() => setLightMode(true)}
                  className={`py-2 px-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider text-center cursor-pointer transition-all duration-200 ${
                    lightMode
                      ? "bg-white border-white text-zinc-950 font-black"
                      : "bg-zinc-900 border-white/5 text-light/40 hover:text-white"
                  }`}
                >
                  Claro
                </button>
              </div>
            </div>
          </div>

          {/* Premium Logo Customization Controls */}
          <div className="space-y-3 p-3 rounded-xl bg-zinc-900/40 border border-white/5">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-primary">Branding & Logo</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-extrabold uppercase tracking-wider text-light/40 mb-1">Alineación</label>
                <select
                  value={logoPosition}
                  onChange={(e) => setLogoPosition(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none focus:border-primary/40"
                >
                  <option value="top-center">Superior Centro</option>
                  <option value="top-left">Superior Izquierda</option>
                  <option value="bottom-right">Inferior Derecha</option>
                  <option value="none">Ocultar Logo</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-extrabold uppercase tracking-wider text-light/40 mb-1">Origen del Logo</label>
                <select
                  value={logoSource}
                  onChange={(e) => setLogoSource(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none focus:border-primary/40"
                >
                  <option value="default">Logo TrainoFit</option>
                  <option value="custom">Subir Personalizado</option>
                </select>
              </div>
            </div>

            {logoSource === "custom" && (
              <div className="pt-2 border-t border-white/5 flex flex-col gap-1">
                <label className="block text-[8px] font-black uppercase tracking-wider text-light/30">Imagen de Logo (.PNG/.JPG)</label>
                <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-lg border border-white/5">
                  <Upload size={12} className="text-primary flex-shrink-0" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full text-[10px] text-light/40 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-zinc-800 file:text-white file:hover:bg-zinc-700 file:cursor-pointer cursor-pointer"
                  />
                </div>
              </div>
            )}

            {logoPosition !== "none" && (
              <div className="pt-2.5 border-t border-white/5 space-y-1">
                <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-wider text-light/40">
                  <span>Escala del Logo</span>
                  <span className="text-primary font-mono font-black">{logoScale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={logoScale}
                  onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-primary border border-white/5"
                />
              </div>
            )}
          </div>

          {/* Premium Visual Effects Section */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-wider text-light/40 mb-1">Trama Fondo</label>
              <select
                value={backgroundPattern}
                onChange={(e) => setBackgroundPattern(e.target.value as any)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-2 text-[10px] text-white outline-none focus:border-primary/40"
              >
                <option value="dots">Puntos Sport</option>
                <option value="stripes">Líneas Vel.</option>
                <option value="clean">Simple</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowWatermark(!showWatermark)}
              className={`py-1.5 px-2 rounded-lg border text-[9px] font-bold uppercase tracking-wider flex flex-col justify-center items-center gap-0.5 cursor-pointer transition-all duration-200 ${
                showWatermark
                  ? "bg-primary/20 border-primary/45 text-white"
                  : "bg-zinc-900 border-white/5 text-light/40 hover:text-white"
              }`}
            >
              <span className="text-[12px]">🔥</span>
              <span>Marca de Agua</span>
            </button>

            <button
              onClick={() => setGlassEffect(!glassEffect)}
              className={`py-1.5 px-2 rounded-lg border text-[9px] font-bold uppercase tracking-wider flex flex-col justify-center items-center gap-0.5 cursor-pointer transition-all duration-200 ${
                glassEffect
                  ? "bg-primary/20 border-primary/45 text-white"
                  : "bg-zinc-900 border-white/5 text-light/40 hover:text-white"
              }`}
            >
              <span className="text-[12px]">💎</span>
              <span>Efecto Glass</span>
            </button>
          </div>

          {/* Conditionally show workout import dropdown */}
          {template === "wod" && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-light/50 mb-1">Importar Workout Guardado</label>
              <select
                value={selectedWorkoutId}
                onChange={(e) => setSelectedWorkoutId(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-primary/40"
              >
                <option value="custom">✍️ Escribir rutina personalizada...</option>
                {workouts.map(w => (
                  <option key={w.id} value={w.id.toString()}>🏋️ {w.name} ({w.difficulty})</option>
                ))}
              </select>
            </div>
          )}

          {/* Text Customization Fields */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-light/50 mb-1">Título Principal</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.toUpperCase())}
                placeholder="Título del flyer"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary/40"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-light/50 mb-1">Subtítulo / Dificultad</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value.toUpperCase())}
                placeholder="Subtítulo informativo"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary/40"
              />
            </div>

            {template === "wod" ? (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/50 mb-1">Lista de Ejercicios</label>
                <textarea
                  value={wodExercises}
                  onChange={(e) => setWodExercises(e.target.value)}
                  rows={6}
                  placeholder="1. Ejercicio: 4 series x 10 reps..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-mono resize-none outline-none focus:border-primary/40 scrollbar-thin"
                />
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/50 mb-1">Texto Descriptivo</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Detalles de la promoción..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white resize-none outline-none focus:border-primary/40"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/50 mb-1">Línea de Llamado (CTA)</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Llamado a la acción (WhatsApp, sitio web)"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary/40"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-light/50 mb-1">Etiqueta de Valor / Badge</label>
                <input
                  type="text"
                  value={priceTag}
                  onChange={(e) => setPriceTag(e.target.value)}
                  placeholder="Ej: Planes desde $29.990"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary/40"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex gap-2">
          <Button
            onClick={() => {
              drawFlyer();
            }}
            variant="outline"
            className="flex-1 border-white/10 hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider h-11"
          >
            <RefreshCw size={13} className="mr-1.5" /> Refrescar
          </Button>
          <Button
            onClick={handleDownload}
            className="flex-1 bg-primary text-white hover:bg-primary/90 text-xs font-bold uppercase tracking-wider h-11"
          >
            <Download size={13} className="mr-1.5" /> Descargar Flyer
          </Button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="xl:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-950/60 border border-white/8 relative">
        <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[10px] font-black text-light/40 uppercase tracking-widest">
          <ImageIcon size={12} className="text-primary" /> Vista Previa (Instagram 1080x1080)
        </div>
        
        {/* Aspect-Ratio Box containing the scaled canvas preview */}
        <div className="w-full max-w-[420px] aspect-square rounded-xl overflow-hidden border border-white/10 shadow-2xl relative bg-zinc-950 my-6">
          <canvas
            ref={canvasRef}
            width={1080}
            height={1080}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="max-w-md text-center flex items-start gap-2 bg-zinc-900/40 p-3.5 rounded-xl border border-white/5">
          <Info size={14} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-light/40 text-left leading-normal">
            Este generador crea una imagen promocional de alta definición lista para publicar en tus redes sociales. Puedes importar cualquier rutina planificada en el <strong>Coach IA</strong> para convertirla en un flyer del día al instante.
          </p>
        </div>
      </div>
    </div>
  );
}
