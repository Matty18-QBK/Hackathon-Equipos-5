"use client";
import Link from "next/link";
import { useState } from "react";
import { COMPROBANTES } from "@/lib/mockData";
import { ARS, fmtDate } from "@/lib/fiscal";
import { Plus, Download, Filter, FileText } from "lucide-react";

export default function FacturacionPage() {
  const [tipo, setTipo] = useState<"todos" | "A" | "B" | "C">("todos");
  const filtered = COMPROBANTES.filter((c) => tipo === "todos" || c.tipo === tipo);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Comprobantes</h1>
          <p className="text-sm text-slate-500">Facturación electrónica vía Afip SDK · 12 meses móviles</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline"><Download className="w-4 h-4" /> Exportar</button>
          <Link href="/facturacion/nueva" className="btn-primary"><Plus className="w-4 h-4" /> Emitir factura</Link>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-500 uppercase">Tipo:</span>
        {(["todos", "A", "B", "C"] as const).map((t) => (
          <button key={t} onClick={() => setTipo(t)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${
              tipo === t ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}>{t === "todos" ? "Todos" : `Factura ${t}`}</button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs text-slate-500">
                <th className="py-3 px-4 font-medium">Número</th>
                <th className="py-3 px-4 font-medium">Tipo</th>
                <th className="py-3 px-4 font-medium">Cliente</th>
                <th className="py-3 px-4 font-medium">CUIT</th>
                <th className="py-3 px-4 font-medium">Fecha</th>
                <th className="py-3 px-4 font-medium text-right">Neto</th>
                <th className="py-3 px-4 font-medium text-right">IVA</th>
                <th className="py-3 px-4 font-medium text-right">Total</th>
                <th className="py-3 px-4 font-medium">Estado</th>
                <th className="py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono text-xs">{c.numero}</td>
                  <td className="py-2.5 px-4"><span className="badge-slate">F. {c.tipo}</span></td>
                  <td className="py-2.5 px-4">{c.razonSocial}</td>
                  <td className="py-2.5 px-4 font-mono text-xs text-slate-500">{c.cuitCliente}</td>
                  <td className="py-2.5 px-4 text-slate-500">{fmtDate(c.fecha)}</td>
                  <td className="py-2.5 px-4 text-right">{ARS(c.neto)}</td>
                  <td className="py-2.5 px-4 text-right text-slate-500">{ARS(c.iva)}</td>
                  <td className="py-2.5 px-4 text-right font-semibold">{ARS(c.total)}</td>
                  <td className="py-2.5 px-4">{c.cobrado ? <span className="badge-green">Cobrado</span> : <span className="badge-amber">Pendiente</span>}</td>
                  <td className="py-2.5 px-4 text-right">
                    <button className="text-slate-400 hover:text-brand-600"><FileText className="w-4 h-4" /></button>
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
