import { useState, useEffect, useRef } from "react";
import { Bot, Send, Dumbbell, Zap, RotateCcw } from "lucide-react";
import { Button } from "~/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCall?: {
    action: "save_routine";
    routines: Array<{
      routineName: string;
      exerciseName: string;
      description?: string;
      sets: number;
      reps: string;
      intensityPct?: number;
      difficulty: string;
    }>;
  };
  toolSaved?: boolean;
}

function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="bg-white/10 px-1 py-0.5 rounded text-primary text-xs font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 mb-1"><span class="text-primary mt-0.5 flex-shrink-0">▸</span><span>$1</span></li>')
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, "<br/>");
}

const STARTER_PROMPTS = [
  "Dame una rutina de piernas avanzada",
  "¿Qué es un WOD?",
  "Rutina para ganar fuerza en el pecho",
  "Diseña un WOD metabólico de 20 min",
];

const INITIAL_MSG: Message = {
  role: "assistant",
  content: "👋 ¡Hola Coach! Soy tu **Asistente de Rutinas TrainoFit**.\n\nConozco todas las rutinas cargadas en la base de datos. Puedo ayudarte a diseñar nuevas rutinas, validar series/reps o responder dudas sobre entrenamiento.\n\n¿Qué rutina construimos hoy?",
};

interface AIChatWidgetProps {
  embedded?: boolean;
  onRoutineSaved?: () => void;
}

export function AIChatWidget({ embedded = false, onRoutineSaved }: AIChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of chat body only (does not scroll window)
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (embedded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [embedded]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setHasInteracted(true);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        credentials: "include", // send HttpOnly session cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });

      if (res.status === 401) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "⛔ Sesión de administrador no válida. Por favor, inicia sesión nuevamente en /admin." },
        ]);
        return;
      }

      const data = (await res.json()) as any;
      const reply = data.text || "Lo siento, no pude procesar tu pregunta. ¡Intenta de nuevo!";
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: reply,
        toolCall: data.toolCall,
        toolSaved: false
      }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error de conexión. Verifica tu red e inténtalo de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_MSG]);
    setHasInteracted(false);
  };

  const handleSaveProposedRoutine = async (index: number, toolCallData: any) => {
    if (!toolCallData || !toolCallData.routines) return;
    setSavingId(index);
    try {
      const response = await fetch("/api/admin/routines", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toolCallData.routines),
      });

      if (response.ok) {
        setMessages((prev) =>
          prev.map((msg, i) => (i === index ? { ...msg, toolSaved: true } : msg))
        );
        if (onRoutineSaved) {
          onRoutineSaved();
        }
      } else {
        alert("Error al intentar guardar la rutina.");
      }
    } catch (error) {
      console.error("Failed to save proposed routine:", error);
      alert("Error de conexión.");
    } finally {
      setSavingId(null);
    }
  };

  // ── Shared chat body ────────────────────────────────────
  const chatBody = (
    <div className={`flex flex-col ${embedded ? "h-[600px] rounded-2xl border border-white/8 bg-zinc-950 overflow-hidden" : "h-full"}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-white/8 flex-shrink-0">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center">
            <Dumbbell className="text-primary" size={16} />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-zinc-900" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-wider text-white leading-none">Asistente de Rutinas</p>
          <p className="text-[10px] text-emerald-400 font-medium mt-0.5">TrainoFit · Herramienta Interna</p>
        </div>
        <button
          onClick={handleReset}
          title="Nueva conversación"
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
        >
          <RotateCcw size={12} />
          <span className="hidden sm:inline">Reiniciar</span>
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={12} className="text-primary" />
              </div>
            )}
            <div
              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-tr-sm font-medium"
                  : "bg-zinc-800/80 text-gray-200 rounded-tl-sm border border-white/5"
              }`}
            >
              {msg.role === "assistant" ? (
                <>
                  <div
                    className="[&_strong]:text-white [&_strong]:font-bold [&_li]:flex [&_li]:items-start [&_li]:gap-1.5 [&_li]:mb-1 [&_em]:text-primary/90"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                  />
                  {msg.toolCall && msg.toolCall.routines && (
                    <div className="mt-3 p-3 rounded-xl bg-zinc-950 border border-white/8 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2 mb-2">
                        <span className="font-black text-primary uppercase text-[9px] tracking-wider">
                          Rutina Propuesta
                        </span>
                        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/5 text-light/75 border border-white/10">
                          {msg.toolCall.routines[0]?.difficulty}
                        </span>
                      </div>
                      
                      <div className="font-extrabold text-white text-xs mb-1">
                        {msg.toolCall.routines[0]?.routineName}
                      </div>

                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {msg.toolCall.routines.map((routine: any, rIdx: number) => (
                          <div key={rIdx} className="bg-white/2 p-2 rounded-lg border border-white/5">
                            <div className="font-bold text-zinc-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                              {routine.exerciseName}
                            </div>
                            <div className="text-[9px] text-light/60 mt-1 flex gap-2 font-semibold">
                              <span>{routine.sets} series x {routine.reps} reps</span>
                              {routine.intensityPct && (
                                <>
                                  <span>•</span>
                                  <span>{routine.intensityPct}% RM</span>
                                </>
                              )}
                            </div>
                            {routine.description && (
                              <p className="text-[9px] text-light/40 mt-1 leading-relaxed italic">
                                {routine.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        {msg.toolSaved ? (
                          <div className="w-full text-center py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider text-[9px]">
                            ✅ Guardado en Base de Rutinas
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleSaveProposedRoutine(i, msg.toolCall)}
                            disabled={savingId !== null}
                            className="w-full bg-primary text-white hover:bg-primary/80 transition-all font-bold uppercase tracking-wider text-[9px] h-8"
                          >
                            {savingId === i ? "Guardando..." : "💾 Guardar Rutina en BD"}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 flex-row">
            <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot size={12} className="text-primary" />
            </div>
            <div className="bg-zinc-800/80 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Starter prompts */}
      {!hasInteracted && (
        <div className="px-4 pb-2 flex flex-col gap-1.5 flex-shrink-0">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="w-full text-left text-[11px] px-3 py-2 rounded-xl bg-zinc-800/60 border border-white/8 text-gray-400 hover:text-white hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 flex items-center gap-2"
            >
              <Zap size={10} className="text-primary flex-shrink-0" />
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-3 border-t border-white/8 flex gap-2 flex-shrink-0 bg-zinc-900/50">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Pregunta sobre rutinas, series, técnica..."
          disabled={loading}
          id="ai-chat-input"
          className="flex-1 bg-zinc-800/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          id="ai-chat-send-btn"
          className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
        >
          <Send size={15} />
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 bg-zinc-900/80 border-t border-white/5 flex-shrink-0">
        <p className="text-[9px] text-gray-600 text-center">
          Powered by <span className="text-gray-500">Hugging Face Qwen2.5</span> · Rutinas TrainoFit DB · Admin Only
        </p>
      </div>
    </div>
  );

  // Embedded mode: render inline inside admin panel
  if (embedded) {
    return chatBody;
  }

  // Standalone mode: not used but kept for future use
  return null;
}
