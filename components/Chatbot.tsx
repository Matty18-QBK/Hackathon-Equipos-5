"use client";
import { useState } from "react";
import { MessageSquareText, Send, X, Sparkles } from "lucide-react";
import { NOTIFICACIONES } from "@/lib/mockData";
import clsx from "clsx";

type Msg = { role: "user" | "bot"; text: string };

const SUGERENCIAS = [
  "¿Tengo notificaciones pendientes?",
  "¿Cuánto facturé este año?",
  "¿Cuándo vence mi próxima cuota?",
  "¿Estoy en riesgo de exclusión?",
];

function responder(q: string): string {
  const t = q.toLowerCase();
  if (t.includes("notific")) {
    const sinLeer = NOTIFICACIONES.filter((n) => !n.leida);
    if (!sinLeer.length) return "No tenés notificaciones sin leer en el Domicilio Fiscal Electrónico.";
    return `Tenés ${sinLeer.length} notificaciones pendientes. La más urgente: "${sinLeer[0].asunto}" (${sinLeer[0].origen}).`;
  }
  if (t.includes("ganancias")) return "Según Nuestra Parte, hay datos cargados de Bienes Personales y Ganancias para la DDJJ 2025. ¿Querés que prepare el borrador?";
  if (t.includes("vence") || t.includes("cuota")) return "Tu próxima cuota de Monotributo (Cat. F) vence el 20/06/2026 por $98.044.";
  if (t.includes("riesgo") || t.includes("exclusi") || t.includes("tope")) return "Tu facturación últimos 12 meses está al 87% del tope de Cat. F. Estás en zona de alerta — te conviene recategorizar.";
  if (t.includes("factur")) return "En 2026 llevás facturado $24.300.000 (mock). ¿Querés ver el detalle por mes?";
  if (t.includes("domicilio")) return "Detecté 1 notificación nueva en el DFE: 'Comunicación de inconsistencias' del 05/05/2026.";
  return "Soy tu Asistente Fiscal. Puedo consultarte sobre Nuestra Parte, DFE, CCMA, riesgo de exclusión y cuotas. ¿Qué necesitás?";
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hola, soy tu Asistente Fiscal. Tengo acceso a tu CUIT, DFE y Nuestra Parte. ¿En qué te ayudo?" },
  ]);
  const [input, setInput] = useState("");

  const send = (q?: string) => {
    const text = (q ?? input).trim();
    if (!text) return;
    setMsgs((m) => [...m, { role: "user", text }, { role: "bot", text: responder(text) }]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={clsx(
          "fixed bottom-6 right-6 z-30 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg",
          "px-4 py-3 flex items-center gap-2 transition", open && "hidden"
        )}>
        <MessageSquareText className="w-5 h-5" />
        <span className="text-sm font-semibold">Asistente Fiscal</span>
      </button>

      {open && (
        <div className="fixed bottom-6 right-6 z-30 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] card flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <div>
                <div className="text-sm font-bold">Asistente Fiscal</div>
                <div className="text-[11px] opacity-80">Conectado a DFE & Nuestra Parte</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/10"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {msgs.map((m, i) => (
              <div key={i} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={clsx("max-w-[80%] text-sm px-3 py-2 rounded-2xl",
                  m.role === "user" ? "bg-brand-600 text-white rounded-br-sm" : "bg-white border border-slate-200 rounded-bl-sm")}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="px-3 pt-2 flex flex-wrap gap-1.5 border-t border-slate-200 bg-white">
            {SUGERENCIAS.map((s) => (
              <button key={s} onClick={() => send(s)}
                className="text-[11px] px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700">
                {s}
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Escribí tu consulta..."
              className="input"
            />
            <button onClick={() => send()} className="btn-primary !px-3"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </>
  );
}
