"use client";
import EspejoRetrovisor from "@/components/EspejoRetrovisor";
import { ARS, facturacionPorMes, fmtDate, saldoCCMA } from "@/lib/fiscal";
import { CCMA_MOVIMIENTOS, COMPROBANTES, NOTIFICACIONES, PERFIL_USUARIO } from "@/lib/mockData";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";
import Link from "next/link";
import {
  FileText, Receipt, AlertCircle, ArrowRight, Plus, Wallet, BellRing
} from "lucide-react";

export default function Dashboard() {
  const datosMes = facturacionPorMes();
  const saldo = saldoCCMA(CCMA_MOVIMIENTOS);
  const cobrado = COMPROBANTES.filter((c) => c.cobrado).reduce((a, c) => a + c.total, 0);
  const pendiente = COMPROBANTES.filter((c) => !c.cobrado).reduce((a, c) => a + c.total, 0);
  const sinLeer = NOTIFICACIONES.filter((n) => !n.leida);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hola, {PERFIL_USUARIO.nombre.split(" ")[0]} 👋</h1>
          <p className="text-sm text-slate-500">Categoría {PERFIL_USUARIO.categoria} · {PERFIL_USUARIO.actividad} · Inicio {fmtDate(PERFIL_USUARIO.inicioActividad)}</p>
        </div>
        <Link href="/facturacion/nueva" className="btn-primary"><Plus className="w-4 h-4" /> Emitir factura rápida</Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPI icon={FileText} label="Comprobantes (12m)" value={String(COMPROBANTES.length)} hint="Tipos A, B y C" />
        <KPI icon={Wallet} label="Cobrado" value={ARS(cobrado)} hint={`Pendiente ${ARS(pendiente)}`} accent="emerald" />
        <KPI icon={Receipt} label="Saldo CCMA" value={ARS(saldo)} hint={saldo > 0 ? "A pagar" : "Sin deuda"} accent={saldo > 0 ? "rose" : "emerald"} />
        <KPI icon={BellRing} label="DFE sin leer" value={String(sinLeer.length)} hint={sinLeer[0]?.asunto ?? "Sin novedades"} accent={sinLeer.length ? "amber" : "slate"} />
      </div>

      {/* Espejo retrovisor */}
      <EspejoRetrovisor categoria={PERFIL_USUARIO.categoria} />

      {/* Charts + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900">Facturación mensual</h3>
              <p className="text-xs text-slate-500">Total facturado vs cobrado, últimos 12 meses</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => ARS(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total" name="Facturado" fill="#2f78f5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="cobrado" name="Cobrado" fill="#34d399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900">Notificaciones recientes</h3>
            <Link href="/notificaciones" className="text-xs text-brand-700 font-semibold inline-flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ul className="space-y-3">
            {NOTIFICACIONES.slice(0, 4).map((n) => (
              <li key={n.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                <div className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${
                  n.prioridad === "alta" ? "bg-rose-100 text-rose-600" :
                  n.prioridad === "media" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                }`}><AlertCircle className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900 truncate">{n.asunto}</span>
                    {!n.leida && <span className="badge-blue">Nueva</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.detalle}</p>
                  <div className="text-[11px] text-slate-400 mt-1">{n.origen} · {fmtDate(n.fecha)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Últimos comprobantes */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">Últimos comprobantes</h3>
          <Link href="/facturacion" className="text-xs text-brand-700 font-semibold inline-flex items-center gap-1">
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
                <th className="py-2 font-medium">Número</th>
                <th className="py-2 font-medium">Tipo</th>
                <th className="py-2 font-medium">Cliente</th>
                <th className="py-2 font-medium">Fecha</th>
                <th className="py-2 font-medium text-right">Total</th>
                <th className="py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {COMPROBANTES.slice(0, 6).map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="py-2.5 font-mono text-xs">{c.numero}</td>
                  <td className="py-2.5"><span className="badge-slate">F. {c.tipo}</span></td>
                  <td className="py-2.5">{c.razonSocial}</td>
                  <td className="py-2.5 text-slate-500">{fmtDate(c.fecha)}</td>
                  <td className="py-2.5 text-right font-semibold">{ARS(c.total)}</td>
                  <td className="py-2.5">{c.cobrado ? <span className="badge-green">Cobrado</span> : <span className="badge-amber">Pendiente</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, hint, accent = "brand" }:
  { icon: any; label: string; value: string; hint?: string; accent?: "brand" | "emerald" | "amber" | "rose" | "slate" }) {
  const map: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl grid place-items-center ${map[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}
