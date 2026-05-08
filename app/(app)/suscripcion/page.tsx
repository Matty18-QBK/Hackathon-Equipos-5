"use client";
import { useState } from "react";
import { PLANES } from "@/lib/mockData";
import { ARS, fmtDate } from "@/lib/fiscal";
import { CheckCircle2, CreditCard, Star, Download, FileText, Receipt } from "lucide-react";
import clsx from "clsx";

type Comprobante = {
  id: string;
  numero: string;
  fecha: string;
  plan: "Pro" | "Estudio" | "Free";
  ciclo: "Mensual" | "Anual";
  metodo: string;
  importe: number;
  estado: "pagado" | "fallido" | "reembolsado";
};

const COMPROBANTES_SUSC: Comprobante[] = [
  { id: "p1", numero: "ARC-2026-000128", fecha: "2026-05-15", plan: "Pro", ciclo: "Mensual", metodo: "VISA •••• 4242", importe:  9990, estado: "pagado" },
  { id: "p2", numero: "ARC-2026-000099", fecha: "2026-04-15", plan: "Pro", ciclo: "Mensual", metodo: "VISA •••• 4242", importe:  9990, estado: "pagado" },
  { id: "p3", numero: "ARC-2026-000076", fecha: "2026-03-15", plan: "Pro", ciclo: "Mensual", metodo: "VISA •••• 4242", importe:  9990, estado: "pagado" },
  { id: "p4", numero: "ARC-2026-000051", fecha: "2026-02-15", plan: "Pro", ciclo: "Mensual", metodo: "VISA •••• 4242", importe:  9990, estado: "fallido" },
  { id: "p5", numero: "ARC-2026-000050", fecha: "2026-02-15", plan: "Pro", ciclo: "Mensual", metodo: "VISA •••• 4242", importe:  9990, estado: "pagado" },
  { id: "p6", numero: "ARC-2026-000022", fecha: "2026-01-15", plan: "Pro", ciclo: "Mensual", metodo: "VISA •••• 4242", importe:  9990, estado: "pagado" },
  { id: "p7", numero: "ARC-2025-001233", fecha: "2025-12-15", plan: "Pro", ciclo: "Mensual", metodo: "VISA •••• 4242", importe:  8990, estado: "pagado" },
  { id: "p8", numero: "ARC-2025-001145", fecha: "2025-11-15", plan: "Pro", ciclo: "Mensual", metodo: "VISA •••• 4242", importe:  8990, estado: "pagado" },
];

export default function SuscripcionPage() {
  const [plan, setPlan] = useState("pro");
  const [ciclo, setCiclo] = useState<"mensual" | "anual">("mensual");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tu suscripción</h1>
        <p className="text-sm text-slate-500">Elegí el plan que mejor se adapte a tu operación</p>
      </div>

      <div className="card p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"><CreditCard className="w-5 h-5" /></div>
          <div>
            <div className="text-xs text-slate-500">Plan actual</div>
            <div className="font-semibold">Pro · Mensual</div>
          </div>
        </div>
        <div className="text-sm text-slate-500">Próxima renovación: <span className="font-semibold text-slate-900">15/06/2026</span></div>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-slate-100 rounded-full">
          <button onClick={() => setCiclo("mensual")} className={clsx("text-xs px-4 py-1.5 rounded-full font-semibold", ciclo === "mensual" && "bg-white shadow")}>Mensual</button>
          <button onClick={() => setCiclo("anual")} className={clsx("text-xs px-4 py-1.5 rounded-full font-semibold", ciclo === "anual" && "bg-white shadow")}>Anual <span className="text-emerald-600 ml-1">−20%</span></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANES.map((p) => {
          const precio = ciclo === "anual" ? p.precio * 12 * 0.8 : p.precio;
          const sel = plan === p.id;
          return (
            <div key={p.id} className={clsx("card p-6 relative",
              p.destacado && "ring-2 ring-brand-500",
              sel && "border-brand-500")}>
              {p.destacado && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[11px] font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <Star className="w-3 h-3" /> Más elegido
                </div>
              )}
              <div className="text-sm text-slate-500">Plan</div>
              <div className="text-2xl font-bold text-slate-900">{p.nombre}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{p.precio === 0 ? "Gratis" : ARS(precio)}</span>
                {p.precio > 0 && <span className="text-sm text-slate-500">/{ciclo === "anual" ? "año" : "mes"}</span>}
              </div>
              <ul className="mt-5 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => setPlan(p.id)}
                className={clsx("mt-6 w-full justify-center", sel ? "btn-primary" : "btn-outline")}>
                {sel ? "Plan seleccionado" : "Elegir plan"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-slate-900 mb-4">Método de pago</h3>
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
          <div className="w-12 h-8 rounded bg-gradient-to-r from-slate-700 to-slate-900 grid place-items-center text-white text-[10px] font-bold">VISA</div>
          <div className="flex-1">
            <div className="font-semibold">•••• •••• •••• 4242</div>
            <div className="text-xs text-slate-500">Vence 09/28 · {PERFIL_PAYMENT_LABEL}</div>
          </div>
          <button className="btn-outline">Cambiar</button>
        </div>
      </div>

      {/* Historial de comprobantes de suscripción */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"><Receipt className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-slate-900">Comprobantes de pago</h3>
              <p className="text-xs text-slate-500">Historial de cobros de tu suscripción · {COMPROBANTES_SUSC.length} comprobantes</p>
            </div>
          </div>
          <button className="btn-outline"><Download className="w-4 h-4" /> Descargar todo</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs text-slate-500">
                <th className="py-3 px-4 font-medium">Número</th>
                <th className="py-3 px-4 font-medium">Fecha</th>
                <th className="py-3 px-4 font-medium">Plan</th>
                <th className="py-3 px-4 font-medium">Método</th>
                <th className="py-3 px-4 font-medium text-right">Importe</th>
                <th className="py-3 px-4 font-medium">Estado</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {COMPROBANTES_SUSC.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-xs">{c.numero}</td>
                  <td className="py-3 px-4 text-slate-500">{fmtDate(c.fecha)}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{c.plan}</div>
                    <div className="text-[11px] text-slate-400">{c.ciclo}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="inline-flex items-center gap-2">
                      <span className="w-7 h-4 rounded bg-gradient-to-r from-slate-700 to-slate-900 grid place-items-center text-white text-[8px] font-bold">VISA</span>
                      <span className="text-xs">{c.metodo.replace("VISA ", "")}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">{ARS(c.importe)}</td>
                  <td className="py-3 px-4">
                    {c.estado === "pagado" && <span className="badge-green">Pagado</span>}
                    {c.estado === "fallido" && <span className="badge-red">Fallido</span>}
                    {c.estado === "reembolsado" && <span className="badge-slate">Reembolsado</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {c.estado === "pagado" ? (
                      <button className="btn-ghost !text-xs !py-1.5 !px-2 text-brand-700">
                        <FileText className="w-3.5 h-3.5" /> PDF
                      </button>
                    ) : c.estado === "fallido" ? (
                      <button className="btn-outline !text-xs !py-1.5">Reintentar</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
const PERFIL_PAYMENT_LABEL = "Juan Pérez";
