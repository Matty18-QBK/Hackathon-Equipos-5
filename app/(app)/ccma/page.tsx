"use client";
import { CCMA_MOVIMIENTOS } from "@/lib/mockData";
import { ARS, fmtDate, saldoCCMA } from "@/lib/fiscal";
import { Receipt, AlertCircle, Download } from "lucide-react";

export default function CCMAPage() {
  const saldo = saldoCCMA(CCMA_MOVIMIENTOS);
  const totalDebe = CCMA_MOVIMIENTOS.reduce((a, m) => a + m.debe, 0);
  const totalHaber = CCMA_MOVIMIENTOS.reduce((a, m) => a + m.haber, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cuenta Corriente del Monotributo (CCMA)</h1>
          <p className="text-sm text-slate-500">Movimientos, débitos y créditos de tus obligaciones fiscales</p>
        </div>
        <button className="btn-outline"><Download className="w-4 h-4" /> Descargar VEP</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="text-xs text-slate-500">Total cargos (Debe)</div>
          <div className="text-2xl font-bold text-slate-900">{ARS(totalDebe)}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500">Pagos (Haber)</div>
          <div className="text-2xl font-bold text-emerald-700">{ARS(totalHaber)}</div>
        </div>
        <div className={`card p-5 ${saldo > 0 ? "ring-2 ring-rose-200" : ""}`}>
          <div className="flex items-center gap-2 text-xs text-slate-500"><Receipt className="w-3.5 h-3.5" /> Saldo a la fecha</div>
          <div className={`text-2xl font-bold ${saldo > 0 ? "text-rose-700" : "text-emerald-700"}`}>{ARS(saldo)}</div>
          <div className="text-xs text-slate-500 mt-1">{saldo > 0 ? "Tenés deuda pendiente" : "Sin deuda"}</div>
        </div>
      </div>

      {saldo > 0 && (
        <div className="card p-4 bg-rose-50/50 ring-1 ring-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-rose-800">Saldo deudor: {ARS(saldo)}</div>
            <p className="text-sm text-rose-700">Generá un VEP para cancelar tu deuda y evitar intereses resarcitorios.</p>
          </div>
          <button className="btn-primary !bg-rose-600 hover:!bg-rose-700">Generar VEP</button>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs text-slate-500">
              <th className="py-3 px-4 font-medium">Fecha</th>
              <th className="py-3 px-4 font-medium">Concepto</th>
              <th className="py-3 px-4 font-medium">Período</th>
              <th className="py-3 px-4 font-medium text-right">Debe</th>
              <th className="py-3 px-4 font-medium text-right">Haber</th>
            </tr>
          </thead>
          <tbody>
            {CCMA_MOVIMIENTOS.map((m) => (
              <tr key={m.id} className="border-t border-slate-100">
                <td className="py-2.5 px-4 text-slate-500">{fmtDate(m.fecha)}</td>
                <td className="py-2.5 px-4 font-medium">{m.concepto}</td>
                <td className="py-2.5 px-4 text-slate-500">{m.periodo}</td>
                <td className="py-2.5 px-4 text-right font-semibold text-rose-600">{m.debe ? ARS(m.debe) : "—"}</td>
                <td className="py-2.5 px-4 text-right font-semibold text-emerald-600">{m.haber ? ARS(m.haber) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
