"use client";
import { useState } from "react";
import { Download, Mail, BellRing, Receipt, Globe, Zap } from "lucide-react";
import clsx from "clsx";
import FacturacionRecurrente from "@/components/FacturacionRecurrente";

type Auto = { id: string; titulo: string; descripcion: string; activa: boolean; icon: any; color: string; ultimaEjecucion?: string };

const SEED: Auto[] = [
  { id: "a1", titulo: "Descarga automática de facturas", descripcion: "Cada noche descarga las facturas emitidas y recibidas en ARCA y las archiva en la nube.", activa: true, icon: Download, color: "brand", ultimaEjecucion: "Hoy 03:14 AM" },
  { id: "a2", titulo: "Reporte mensual de Domicilio Fiscal", descripcion: "Te enviamos por email un resumen de las notificaciones del DFE el día 1 de cada mes.", activa: true, icon: Mail, color: "emerald", ultimaEjecucion: "01/05/2026" },
  { id: "a3", titulo: "Alertas de cambio de cuadro tarifario", descripcion: "Avisamos por email/push cuando ARCA actualice topes, alícuotas o categorías de Monotributo.", activa: false, icon: BellRing, color: "amber" },
  { id: "a4", titulo: "Pago automático de Monotributo", descripcion: "Generamos el VEP el día 15 y lo enviamos a tu home banking. Vos sólo lo aprobás.", activa: false, icon: Receipt, color: "rose" },
  { id: "a5", titulo: "Sincronización con Padrón web", descripcion: "Verificamos diariamente datos del padrón ARCA para detectar cambios sin previo aviso.", activa: true, icon: Globe, color: "brand", ultimaEjecucion: "Hoy 06:00 AM" },
];

export default function AutosPage() {
  const [list, setList] = useState(SEED);
  const toggle = (id: string) => setList((l) => l.map((a) => (a.id === id ? { ...a, activa: !a.activa } : a)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Centro de Automatizaciones</h1>
          <p className="text-sm text-slate-500">Activá flujos para que la plataforma trabaje por vos en segundo plano</p>
        </div>
        <div className="badge-blue"><Zap className="w-3.5 h-3.5" /> {list.filter((a) => a.activa).length} activas</div>
      </div>

      <div>
        <h2 className="font-bold text-slate-900 mb-3">Automatizaciones del sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.id} className={clsx("card p-5 transition", a.activa ? "ring-1 ring-brand-100" : "opacity-90")}>
                <div className="flex items-start gap-4">
                  <div className={clsx("w-11 h-11 rounded-xl grid place-items-center shrink-0",
                    a.color === "brand" && "bg-brand-50 text-brand-700",
                    a.color === "emerald" && "bg-emerald-50 text-emerald-700",
                    a.color === "amber" && "bg-amber-50 text-amber-700",
                    a.color === "rose" && "bg-rose-50 text-rose-700",
                  )}><Icon className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-slate-900">{a.titulo}</h3>
                      <button onClick={() => toggle(a.id)}
                        className={clsx("relative w-11 h-6 rounded-full transition-colors shrink-0",
                          a.activa ? "bg-brand-600" : "bg-slate-300")}>
                        <span className={clsx("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                          a.activa && "translate-x-5")} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{a.descripcion}</p>
                    {a.activa && a.ultimaEjecucion && (
                      <div className="text-xs text-slate-400 mt-2">Última ejecución: {a.ultimaEjecucion}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <FacturacionRecurrente subtitle="Programá emisiones automáticas a un cliente concreto en una frecuencia y rango de fechas" />
    </div>
  );
}
