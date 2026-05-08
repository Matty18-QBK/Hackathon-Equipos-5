"use client";
import { Fragment, useState } from "react";
import { COMPROBANTES } from "@/lib/mockData";
import { ARS, fmtDate } from "@/lib/fiscal";
import { CheckCircle2, Circle, FileText, Mail, Wallet, ChevronDown } from "lucide-react";
import clsx from "clsx";

export default function CobrosPage() {
  const [data, setData] = useState(COMPROBANTES.slice(0, 18));
  const [filter, setFilter] = useState<"todos" | "pendiente" | "cobrado">("todos");
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (id: string) =>
    setData((d) => d.map((c) => (c.id === id ? { ...c, cobrado: !c.cobrado, fechaCobro: !c.cobrado ? new Date().toISOString() : undefined } : c)));

  const filtered = data.filter((c) =>
    filter === "todos" ? true : filter === "cobrado" ? c.cobrado : !c.cobrado
  );

  const totalFacturado = data.reduce((a, c) => a + c.total, 0);
  const totalCobrado = data.filter((c) => c.cobrado).reduce((a, c) => a + c.total, 0);
  const totalPendiente = totalFacturado - totalCobrado;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Trazabilidad de Cobro</h1>
        <p className="text-sm text-slate-500">Cierra la brecha entre facturación y flujo de caja real</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="text-xs text-slate-500">Facturado</div>
          <div className="text-2xl font-bold text-slate-900">{ARS(totalFacturado)}</div>
          <div className="text-xs text-slate-400 mt-1">{data.length} comprobantes</div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-emerald-600"><Wallet className="w-4 h-4" /><div className="text-xs font-medium">Cobrado</div></div>
          <div className="text-2xl font-bold text-emerald-700">{ARS(totalCobrado)}</div>
          <div className="text-xs text-slate-400 mt-1">{data.filter((c) => c.cobrado).length} cobrados</div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-amber-600"><Circle className="w-4 h-4" /><div className="text-xs font-medium">Pendiente de cobro</div></div>
          <div className="text-2xl font-bold text-amber-700">{ARS(totalPendiente)}</div>
          <div className="text-xs text-slate-400 mt-1">{data.filter((c) => !c.cobrado).length} pendientes</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["todos", "pendiente", "cobrado"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${
              filter === f ? "bg-brand-600 text-white" : "bg-white border border-slate-200 hover:bg-slate-50"
            }`}>{f === "todos" ? "Todos" : f[0].toUpperCase() + f.slice(1) + "s"}</button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs text-slate-500">
              <th className="py-3 px-4"></th>
              <th className="py-3 px-4 font-medium">Número / Cliente</th>
              <th className="py-3 px-4 font-medium">Fecha</th>
              <th className="py-3 px-4 font-medium text-right">Total</th>
              <th className="py-3 px-4 font-medium">Estado de cobro</th>
              <th className="py-3 px-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <Fragment key={c.id}>
                <tr className={clsx("border-t border-slate-100", open === c.id && "bg-slate-50")}>
                  <td className="px-4">
                    <button onClick={() => toggle(c.id)} className="grid place-items-center">
                      {c.cobrado
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        : <Circle className="w-5 h-5 text-slate-300 hover:text-amber-500 transition" />}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono text-xs text-slate-500">{c.numero}</div>
                    <div className="font-medium">{c.razonSocial}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{fmtDate(c.fecha)}</td>
                  <td className="py-3 px-4 text-right font-semibold">{ARS(c.total)}</td>
                  <td className="py-3 px-4">
                    {c.cobrado
                      ? <span className="badge-green">Cobrado · {c.fechaCobro && fmtDate(c.fechaCobro)}</span>
                      : <span className="badge-amber">Pendiente</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => setOpen(open === c.id ? null : c.id)} className="btn-ghost !p-1.5">
                      <ChevronDown className={clsx("w-4 h-4 transition", open === c.id && "rotate-180")} />
                    </button>
                  </td>
                </tr>
                {open === c.id && (
                  <tr className="bg-slate-50 border-t border-slate-100">
                    <td colSpan={6} className="px-4 pb-4 pt-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 grid place-items-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-slate-500">Comprobante PDF</div>
                            <div className="font-semibold text-sm">{c.numero}.pdf</div>
                          </div>
                          <button className="btn-outline !text-xs !py-1.5">Ver</button>
                        </div>
                        <div className="card p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-slate-500">Envío al cliente</div>
                            <div className="font-semibold text-sm">{c.razonSocial.toLowerCase().replace(/[^a-z]/g, "")}@mail.com</div>
                          </div>
                          <button className="btn-outline !text-xs !py-1.5">Reenviar</button>
                        </div>
                        <div className="card p-4">
                          <div className="text-xs text-slate-500 mb-1">Cobro manual</div>
                          <button onClick={() => toggle(c.id)} className={clsx("w-full justify-center", c.cobrado ? "btn-outline" : "btn-primary")}>
                            {c.cobrado ? "Marcar como pendiente" : "Marcar como cobrado"}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
