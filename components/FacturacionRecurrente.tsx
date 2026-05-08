"use client";
import { useState } from "react";
import { ARS, fmtDate, validarCUIT } from "@/lib/fiscal";
import {
  Repeat, Plus, Trash2, Sparkles, X, Calendar, Clock, Receipt, FileText,
} from "lucide-react";
import clsx from "clsx";

export type Frecuencia = "cada_2h" | "diaria" | "semanal" | "quincenal" | "mensual";

export type AutoFactura = {
  id: string;
  titulo: string;
  frecuencia: Frecuencia;
  diaSemana?: number;
  diaMes?: number;
  hora: string;
  tipo: "A" | "B" | "C";
  cuitReceptor: string;
  razonSocialReceptor: string;
  concepto: string;
  neto: number;
  desde: string;
  hasta: string;
  activa: boolean;
};

const FREC_LABEL: Record<Frecuencia, string> = {
  cada_2h: "Cada 2 horas",
  diaria: "Diaria",
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual",
};

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function resumirFrecuencia(a: AutoFactura): string {
  if (a.frecuencia === "cada_2h") return "Cada 2 horas";
  if (a.frecuencia === "diaria") return `Todos los días a las ${a.hora}`;
  if (a.frecuencia === "semanal") return `Cada ${DIAS_SEMANA[a.diaSemana ?? 0]} a las ${a.hora}`;
  if (a.frecuencia === "quincenal") return `Cada 15 días a las ${a.hora}`;
  return `Día ${a.diaMes ?? 1} de cada mes a las ${a.hora}`;
}

export default function FacturacionRecurrente({ subtitle }: { subtitle?: string }) {
  const [autos, setAutos] = useState<AutoFactura[]>([]);
  const [openModal, setOpenModal] = useState(false);

  const toggle = (id: string) => setAutos((l) => l.map((a) => (a.id === id ? { ...a, activa: !a.activa } : a)));
  const remove = (id: string) => setAutos((l) => l.filter((a) => a.id !== id));
  const add = (a: AutoFactura) => setAutos((l) => [...l, a]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" /> Facturación recurrente personalizada
          </h3>
          <p className="text-xs text-slate-500">{subtitle ?? "Programá emisiones automáticas según un calendario y rango de fechas"}</p>
        </div>
        <button onClick={() => setOpenModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva automatización
        </button>
      </div>

      {autos.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 grid place-items-center mx-auto mb-3">
            <Repeat className="w-6 h-6" />
          </div>
          <div className="font-semibold text-slate-900">Sin automatizaciones personalizadas</div>
          <p className="text-sm text-slate-500 mt-1">Creá una para emitir facturas en piloto automático según un calendario.</p>
          <button onClick={() => setOpenModal(true)} className="btn-primary mt-4 mx-auto">
            <Plus className="w-4 h-4" /> Crear primera automatización
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {autos.map((a) => (
            <div key={a.id} className={clsx("card p-5", a.activa && "ring-1 ring-brand-100")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 grid place-items-center shrink-0">
                    <Repeat className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{a.titulo}</div>
                    <div className="text-xs text-slate-500">Factura {a.tipo} · {a.razonSocialReceptor}</div>
                  </div>
                </div>
                <button onClick={() => toggle(a.id)}
                  className={clsx("relative w-11 h-6 rounded-full transition-colors shrink-0",
                    a.activa ? "bg-brand-600" : "bg-slate-300")}>
                  <span className={clsx("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                    a.activa && "translate-x-5")} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <Info icon={Clock} label="Frecuencia" value={resumirFrecuencia(a)} />
                <Info icon={Receipt} label="Importe neto" value={ARS(a.neto)} />
                <Info icon={Calendar} label="Vigencia" value={`${fmtDate(a.desde)} → ${fmtDate(a.hasta)}`} />
                <Info icon={FileText} label="Concepto" value={a.concepto} />
              </div>

              <div className="mt-4 flex justify-end">
                <button onClick={() => remove(a.id)} className="text-xs text-rose-600 inline-flex items-center gap-1 hover:underline">
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {openModal && <ModalNuevaAutomatizacion onClose={() => setOpenModal(false)} onSave={(a) => { add(a); setOpenModal(false); }} />}
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="text-slate-900 font-medium mt-0.5 truncate">{value}</div>
    </div>
  );
}

function ModalNuevaAutomatizacion({ onClose, onSave }: { onClose: () => void; onSave: (a: AutoFactura) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const inOneYear = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);

  const [titulo, setTitulo] = useState("Honorarios mensuales");
  const [frecuencia, setFrecuencia] = useState<Frecuencia>("mensual");
  const [diaSemana, setDiaSemana] = useState(0);
  const [diaMes, setDiaMes] = useState(1);
  const [hora, setHora] = useState("09:00");
  const [tipo, setTipo] = useState<"A" | "B" | "C">("B");
  const [cuitReceptor, setCuitReceptor] = useState("");
  const [razonSocialReceptor, setRazonSocialReceptor] = useState("");
  const [concepto, setConcepto] = useState("Servicios profesionales");
  const [neto, setNeto] = useState<number>(150_000);
  const [desde, setDesde] = useState(today);
  const [hasta, setHasta] = useState(inOneYear);

  const cuitOk = validarCUIT(cuitReceptor);
  const valid = titulo && cuitOk && razonSocialReceptor && neto > 0 && desde && hasta && desde <= hasta;

  const guardar = () => {
    onSave({
      id: String(Date.now()),
      titulo, frecuencia, diaSemana, diaMes, hora, tipo, cuitReceptor, razonSocialReceptor,
      concepto, neto, desde, hasta, activa: true,
    });
  };

  const iva = tipo === "A" ? neto * 0.21 : 0;
  const total = neto + iva;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-brand-600" /> Nueva automatización de facturación</h2>
            <p className="text-xs text-slate-500">La plataforma emitirá facturas automáticamente según el calendario que definas</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="label">Nombre de la automatización</label>
            <input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>

          <div>
            <label className="label flex items-center gap-1"><Repeat className="w-3.5 h-3.5" /> Frecuencia</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {(Object.keys(FREC_LABEL) as Frecuencia[]).map((f) => (
                <button key={f} onClick={() => setFrecuencia(f)}
                  className={clsx("p-2.5 rounded-lg border text-sm font-semibold transition",
                    frecuencia === f ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 hover:bg-slate-50")}>
                  {FREC_LABEL[f]}
                </button>
              ))}
            </div>
          </div>

          {frecuencia !== "cada_2h" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {frecuencia === "semanal" && (
                <div className="md:col-span-2">
                  <label className="label">Día de la semana</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DIAS_SEMANA.map((d, i) => (
                      <button key={d} onClick={() => setDiaSemana(i)}
                        className={clsx("w-12 py-2 rounded-lg border text-xs font-semibold transition",
                          diaSemana === i ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 hover:bg-slate-50")}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {frecuencia === "mensual" && (
                <div>
                  <label className="label">Día del mes</label>
                  <input type="number" min={1} max={31} className="input" value={diaMes}
                    onChange={(e) => setDiaMes(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))} />
                </div>
              )}
              <div>
                <label className="label">Hora de emisión</label>
                <input type="time" className="input" value={hora} onChange={(e) => setHora(e.target.value)} />
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 pt-5">
            <div className="font-bold text-slate-900 mb-3 text-sm">Datos de la factura a emitir</div>
            <div className="space-y-4">
              <div>
                <label className="label">Tipo de comprobante</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["A", "B", "C"] as const).map((t) => (
                    <button key={t} onClick={() => setTipo(t)}
                      className={clsx("p-2.5 rounded-lg border text-sm font-semibold transition",
                        tipo === t ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 hover:bg-slate-50")}>
                      Factura {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">CUIT del cliente receptor</label>
                  <input className={clsx("input font-mono", cuitReceptor && !cuitOk && "border-rose-400 focus:ring-rose-300")}
                    placeholder="30-71234567-8" value={cuitReceptor} onChange={(e) => setCuitReceptor(e.target.value)} />
                  {cuitReceptor && !cuitOk && <div className="text-[11px] text-rose-600 mt-1">CUIT inválido</div>}
                </div>
                <div>
                  <label className="label">Razón social</label>
                  <input className="input" value={razonSocialReceptor} onChange={(e) => setRazonSocialReceptor(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="label">Concepto</label><input className="input" value={concepto} onChange={(e) => setConcepto(e.target.value)} /></div>
                <div><label className="label">Importe neto (ARS)</label>
                  <input type="number" min={0} className="input" value={neto} onChange={(e) => setNeto(parseFloat(e.target.value) || 0)} /></div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-xs">
                <div><div className="text-slate-500">Neto</div><div className="font-semibold">{ARS(neto)}</div></div>
                <div><div className="text-slate-500">IVA {tipo === "A" ? "21%" : "—"}</div><div className="font-semibold">{ARS(iva)}</div></div>
                <div><div className="text-slate-500">Total por emisión</div><div className="font-bold text-brand-700">{ARS(total)}</div></div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <div className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Rango de fechas en que estará vigente
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Desde</label><input type="date" className="input" value={desde} onChange={(e) => setDesde(e.target.value)} /></div>
              <div><label className="label">Hasta</label><input type="date" className="input" value={hasta} onChange={(e) => setHasta(e.target.value)} /></div>
            </div>
            {desde > hasta && <div className="text-[11px] text-rose-600 mt-1">La fecha de inicio debe ser anterior a la de fin</div>}
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 flex justify-between items-center gap-3 bg-slate-50 sticky bottom-0">
          <div className="text-xs text-slate-500">
            Resumen: <b>{FREC_LABEL[frecuencia]}</b> · Factura {tipo} de {ARS(total)} · {fmtDate(desde)} → {fmtDate(hasta)}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-outline">Cancelar</button>
            <button onClick={guardar} disabled={!valid} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              <Sparkles className="w-4 h-4" /> Crear automatización
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
