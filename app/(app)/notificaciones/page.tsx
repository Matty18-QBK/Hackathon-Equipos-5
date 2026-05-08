"use client";
import { useState } from "react";
import { NOTIFICACIONES } from "@/lib/mockData";
import { fmtDate } from "@/lib/fiscal";
import { Mail, MailOpen, AlertCircle } from "lucide-react";
import clsx from "clsx";

export default function NotifPage() {
  const [data, setData] = useState(NOTIFICACIONES);
  const toggle = (id: string) => setData((d) => d.map((n) => (n.id === id ? { ...n, leida: !n.leida } : n)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Domicilio Fiscal Electrónico</h1>
        <p className="text-sm text-slate-500">Notificaciones de DFE, Nuestra Parte y ARCA</p>
      </div>

      <div className="card divide-y divide-slate-100">
        {data.map((n) => (
          <div key={n.id} className={clsx("p-5 flex items-start gap-4 transition", !n.leida && "bg-brand-50/30")}>
            <div className={clsx("w-10 h-10 rounded-xl grid place-items-center shrink-0",
              n.prioridad === "alta" ? "bg-rose-100 text-rose-600"
                : n.prioridad === "media" ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-600")}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900">{n.asunto}</h3>
                {!n.leida && <span className="badge-blue">Nueva</span>}
                <span className="badge-slate">{n.origen}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{n.detalle}</p>
              <div className="text-xs text-slate-400 mt-2">{fmtDate(n.fecha)}</div>
            </div>
            <button onClick={() => toggle(n.id)} className="btn-ghost">
              {n.leida ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
              {n.leida ? "Marcar sin leer" : "Marcar leída"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
