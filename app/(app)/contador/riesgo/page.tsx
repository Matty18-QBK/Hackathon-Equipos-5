"use client";
import { CLIENTES_CONTADOR, CATEGORIAS_MONOTRIBUTO } from "@/lib/mockData";
import { ARS } from "@/lib/fiscal";
import { ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

export default function RiesgoPage() {
  const enriched = CLIENTES_CONTADOR.map((c) => {
    const cat = CATEGORIAS_MONOTRIBUTO.find((x) => x.letra === c.categoria)!;
    const pct = (c.facturado12m / cat.topeIngresos) * 100;
    return { ...c, pct, tope: cat.topeIngresos };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Semáforo de Riesgo</h1>
        <p className="text-sm text-slate-500">Visión consolidada del estado fiscal de tu cartera de clientes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Crítico (≥85% del tope)" count={enriched.filter((e) => e.pct >= 85).length} icon={ShieldAlert} accent="rose" />
        <Card title="A vigilar (70–85%)"     count={enriched.filter((e) => e.pct >= 70 && e.pct < 85).length} icon={AlertTriangle} accent="amber" />
        <Card title="Saludables (<70%)"      count={enriched.filter((e) => e.pct < 70).length} icon={CheckCircle2} accent="emerald" />
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-bold">Detalle por cliente</h3>
          <p className="text-xs text-slate-500">Ordenado por mayor utilización del tope</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs text-slate-500">
              <th className="py-3 px-4 font-medium">Cliente</th>
              <th className="py-3 px-4 font-medium">Cat.</th>
              <th className="py-3 px-4 font-medium">Utilización</th>
              <th className="py-3 px-4 font-medium text-right">Facturado / Tope</th>
              <th className="py-3 px-4 font-medium text-right">Deuda</th>
              <th className="py-3 px-4 font-medium text-center">DFE</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map((c) => {
              const color =
                c.pct >= 100 ? "bg-rose-600" :
                c.pct >= 85 ? "bg-orange-500" :
                c.pct >= 70 ? "bg-amber-400" : "bg-emerald-500";
              return (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{c.razonSocial}</div>
                    <div className="font-mono text-[11px] text-slate-400">{c.cuit}</div>
                  </td>
                  <td className="py-3 px-4"><span className="badge-slate">{c.categoria}</span></td>
                  <td className="py-3 px-4 w-72">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={clsx("h-full rounded-full", color)} style={{ width: `${Math.min(c.pct, 100)}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 w-12 text-right">{c.pct.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-xs">
                    <div className="font-semibold">{ARS(c.facturado12m)}</div>
                    <div className="text-slate-500">/ {ARS(c.tope)}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {c.deudaCCMA > 0
                      ? <span className="text-rose-600 font-semibold">{ARS(c.deudaCCMA)}</span>
                      : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {c.notifSinLeer > 0
                      ? <span className="badge-amber">{c.notifSinLeer} sin leer</span>
                      : <span className="badge-green">Al día</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ title, count, icon: Icon, accent }:
  { title: string; count: number; icon: any; accent: "rose" | "amber" | "emerald" }) {
  const map = {
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };
  return (
    <div className="card p-5">
      <div className={clsx("w-10 h-10 rounded-xl grid place-items-center", map[accent])}><Icon className="w-5 h-5" /></div>
      <div className="mt-3 text-xs text-slate-500">{title}</div>
      <div className="text-3xl font-bold text-slate-900">{count}</div>
    </div>
  );
}
