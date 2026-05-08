"use client";
import Link from "next/link";
import { CLIENTES_CONTADOR } from "@/lib/mockData";
import { ARS } from "@/lib/fiscal";
import { Plus, Users, Search, Settings2 } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

export default function ClientesContadorPage() {
  const [q, setQ] = useState("");
  const list = CLIENTES_CONTADOR.filter((c) => (c.razonSocial + c.cuit).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Clientes</h1>
          <p className="text-sm text-slate-500">CUITs delegados que administrás como contador</p>
        </div>
        <button className="btn-primary"><Plus className="w-4 h-4" /> Agregar cliente</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPI label="Clientes activos" value={String(CLIENTES_CONTADOR.length)} accent="brand" />
        <KPI label="En riesgo alto" value={String(CLIENTES_CONTADOR.filter((c) => c.riesgo === "alto").length)} accent="rose" />
        <KPI label="Con deuda CCMA" value={String(CLIENTES_CONTADOR.filter((c) => c.deudaCCMA > 0).length)} accent="amber" />
        <KPI label="Notif. sin leer" value={String(CLIENTES_CONTADOR.reduce((a, c) => a + c.notifSinLeer, 0))} accent="brand" />
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Buscar por razón social o CUIT..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs text-slate-500">
              <th className="py-3 px-4 font-medium">Cliente</th>
              <th className="py-3 px-4 font-medium">CUIT</th>
              <th className="py-3 px-4 font-medium">Categoría</th>
              <th className="py-3 px-4 font-medium text-right">Facturado 12m</th>
              <th className="py-3 px-4 font-medium text-right">Deuda CCMA</th>
              <th className="py-3 px-4 font-medium text-center">Notif.</th>
              <th className="py-3 px-4 font-medium">Riesgo</th>
              <th className="py-3 px-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white grid place-items-center text-xs font-bold shrink-0">
                      {c.razonSocial.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <div className="font-medium">{c.razonSocial}</div>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">{c.cuit}</td>
                <td className="py-3 px-4"><span className="badge-slate">Cat. {c.categoria}</span></td>
                <td className="py-3 px-4 text-right font-semibold">{ARS(c.facturado12m)}</td>
                <td className="py-3 px-4 text-right">
                  {c.deudaCCMA > 0
                    ? <span className="text-rose-600 font-semibold">{ARS(c.deudaCCMA)}</span>
                    : <span className="text-slate-400">—</span>}
                </td>
                <td className="py-3 px-4 text-center">
                  {c.notifSinLeer > 0
                    ? <span className="badge-amber">{c.notifSinLeer}</span>
                    : <span className="text-slate-400">0</span>}
                </td>
                <td className="py-3 px-4">
                  <span className={clsx("badge",
                    c.riesgo === "alto" && "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
                    c.riesgo === "medio" && "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
                    c.riesgo === "bajo" && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
                  )}>
                    <span className={clsx("w-1.5 h-1.5 rounded-full",
                      c.riesgo === "alto" && "bg-rose-500",
                      c.riesgo === "medio" && "bg-amber-500",
                      c.riesgo === "bajo" && "bg-emerald-500")} />
                    {c.riesgo[0].toUpperCase() + c.riesgo.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Link href={`/contador/cliente/${c.id}`} className="btn-primary !py-1.5 !px-3 !text-xs">
                    <Settings2 className="w-3.5 h-3.5" /> Gestionar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPI({ label, value, accent }: { label: string; value: string; accent: "brand" | "rose" | "amber" }) {
  const map = { brand: "text-brand-700 bg-brand-50", rose: "text-rose-700 bg-rose-50", amber: "text-amber-700 bg-amber-50" };
  return (
    <div className="card p-5">
      <div className={clsx("inline-flex w-9 h-9 rounded-lg items-center justify-center", map[accent])}><Users className="w-4 h-4" /></div>
      <div className="mt-3 text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
