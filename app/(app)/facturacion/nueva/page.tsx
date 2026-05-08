"use client";
import { useState } from "react";
import Link from "next/link";
import { ARS, validarCUIT } from "@/lib/fiscal";
import { ArrowLeft, CheckCircle2, Search, ShieldCheck, Loader2 } from "lucide-react";

type PadronResult = { ok: boolean; razonSocial?: string; condicionIVA?: string; domicilio?: string; tipo?: "RI" | "MT" | "CF" };

const PADRON_MOCK: Record<string, PadronResult> = {
  "30712345678": { ok: true, razonSocial: "Acme Software SA", condicionIVA: "Responsable Inscripto", domicilio: "Av. Corrientes 1234, CABA", tipo: "RI" },
  "20284567893": { ok: true, razonSocial: "Juan Pérez", condicionIVA: "Monotributo Cat. F", domicilio: "Belgrano 2000, Rosario", tipo: "MT" },
  "30709998887": { ok: true, razonSocial: "Distribuidora del Sur SRL", condicionIVA: "Responsable Inscripto", domicilio: "Mitre 500, Mar del Plata", tipo: "RI" },
};

export default function NuevaFacturaPage() {
  const [tipo, setTipo] = useState<"A" | "B" | "C">("B");
  const [cuit, setCuit] = useState("");
  const [neto, setNeto] = useState<number>(0);
  const [concepto, setConcepto] = useState("Servicios profesionales");
  const [padron, setPadron] = useState<PadronResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [emitida, setEmitida] = useState(false);

  const consultarPadron = () => {
    setPadron(null);
    if (!validarCUIT(cuit)) {
      setPadron({ ok: false });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const r = PADRON_MOCK[cuit.replace(/[-\s]/g, "")] ?? { ok: true, razonSocial: "Consumidor Final", condicionIVA: "Consumidor Final", domicilio: "—", tipo: "CF" as const };
      setPadron(r);
      if (r.tipo === "RI") setTipo("A");
      else if (r.tipo === "MT" || r.tipo === "CF") setTipo("B");
      setLoading(false);
    }, 600);
  };

  const iva = tipo === "A" ? neto * 0.21 : 0;
  const total = neto + iva;

  if (emitida) {
    return (
      <div className="max-w-xl mx-auto card p-10 text-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">Factura emitida</h1>
        <p className="text-slate-500 mt-2">Se generó el comprobante y se autorizó vía CAE.</p>
        <div className="mt-6 grid grid-cols-2 gap-4 text-left bg-slate-50 rounded-xl p-5">
          <div><div className="text-xs text-slate-500">Tipo</div><div className="font-semibold">Factura {tipo}</div></div>
          <div><div className="text-xs text-slate-500">Total</div><div className="font-semibold">{ARS(total)}</div></div>
          <div><div className="text-xs text-slate-500">CAE</div><div className="font-mono text-sm">74829304857261</div></div>
          <div><div className="text-xs text-slate-500">Vto. CAE</div><div className="font-semibold">15/05/2026</div></div>
        </div>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/facturacion" className="btn-outline">Volver al listado</Link>
          <button onClick={() => { setEmitida(false); setCuit(""); setNeto(0); setPadron(null); }} className="btn-primary">Emitir otra</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/facturacion" className="text-sm text-slate-500 inline-flex items-center gap-1 hover:text-slate-700"><ArrowLeft className="w-4 h-4" /> Volver</Link>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Emitir factura rápida</h1>
        <p className="text-sm text-slate-500">Validación de CUIT vía Padrón ARCA · CAE automático con Afip SDK</p>
      </div>

      <div className="card p-6 space-y-5">
        <div>
          <label className="label">Tipo de comprobante</label>
          <div className="grid grid-cols-3 gap-2">
            {(["A", "B", "C"] as const).map((t) => (
              <button key={t} onClick={() => setTipo(t)}
                className={`p-3 rounded-lg border text-sm font-semibold transition ${
                  tipo === t ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 hover:bg-slate-50"
                }`}>
                Factura {t}
                <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                  {t === "A" ? "Resp. Inscripto" : t === "B" ? "Monotributo / CF" : "Monotributo a CF"}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">CUIT del cliente</label>
          <div className="flex gap-2">
            <input className="input font-mono" placeholder="30-71234567-8" value={cuit} onChange={(e) => setCuit(e.target.value)} />
            <button onClick={consultarPadron} className="btn-outline whitespace-nowrap">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Consultar Padrón
            </button>
          </div>
          {padron && !padron.ok && (
            <div className="mt-2 text-xs text-rose-600">CUIT inválido. Revisá los dígitos.</div>
          )}
          {padron && padron.ok && (
            <div className="mt-3 p-3 bg-emerald-50 ring-1 ring-emerald-200 rounded-lg flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold text-emerald-800">{padron.razonSocial}</div>
                <div className="text-emerald-700">{padron.condicionIVA} · {padron.domicilio}</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Concepto</label>
            <input className="input" value={concepto} onChange={(e) => setConcepto(e.target.value)} />
          </div>
          <div>
            <label className="label">Importe neto</label>
            <input type="number" className="input" value={neto} onChange={(e) => setNeto(parseFloat(e.target.value) || 0)} />
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Neto</span><span className="font-semibold">{ARS(neto)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">IVA {tipo === "A" ? "21%" : "—"}</span><span className="font-semibold">{ARS(iva)}</span></div>
          <div className="flex justify-between text-base pt-1.5 border-t border-slate-200"><span className="font-semibold">Total</span><span className="font-bold text-brand-700">{ARS(total)}</span></div>
        </div>

        <button
          disabled={!padron?.ok || neto <= 0}
          onClick={() => setEmitida(true)}
          className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
          Emitir y solicitar CAE
        </button>
      </div>
    </div>
  );
}
