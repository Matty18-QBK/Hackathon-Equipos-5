"use client";
import { useState } from "react";
import { CATEGORIAS_MONOTRIBUTO, PERFIL_USUARIO } from "@/lib/mockData";
import { ARS, calcularRiesgoExclusion } from "@/lib/fiscal";
import {
  Gauge, Lock, BellRing, Plus, Trash2, AlertCircle, CheckCircle2,
  Mail, Bell, MessageSquare,
} from "lucide-react";
import clsx from "clsx";

type Alerta = { id: string; pct: number; canales: { email: boolean; push: boolean; whatsapp: boolean } };

export default function LimitesPage() {
  const cat = CATEGORIAS_MONOTRIBUTO.find((x) => x.letra === PERFIL_USUARIO.categoria)!;
  const r = calcularRiesgoExclusion(PERFIL_USUARIO.categoria);

  const [bloqueo, setBloqueo] = useState({
    activo: true,
    porcentaje: 100,
    importeManual: cat.topeIngresos,
    usaPorcentaje: true,
  });

  const [alertas, setAlertas] = useState<Alerta[]>([
    { id: "1", pct: 70, canales: { email: true, push: true, whatsapp: false } },
    { id: "2", pct: 85, canales: { email: true, push: true, whatsapp: true } },
    { id: "3", pct: 95, canales: { email: true, push: true, whatsapp: true } },
  ]);

  const limiteEfectivo = bloqueo.usaPorcentaje
    ? Math.round((cat.topeIngresos * bloqueo.porcentaje) / 100)
    : bloqueo.importeManual;
  const restante = Math.max(limiteEfectivo - r.facturado, 0);
  const pctActual = (r.facturado / limiteEfectivo) * 100;

  const updateAlerta = (id: string, patch: Partial<Alerta>) =>
    setAlertas((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const toggleCanal = (id: string, canal: keyof Alerta["canales"]) =>
    setAlertas((a) => a.map((x) => (x.id === id ? { ...x, canales: { ...x.canales, [canal]: !x.canales[canal] } } : x)));
  const removeAlerta = (id: string) => setAlertas((a) => a.filter((x) => x.id !== id));
  const addAlerta = () =>
    setAlertas((a) => [...a, { id: String(Date.now()), pct: 80, canales: { email: true, push: false, whatsapp: false } }]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Límites y alertas</h1>
        <p className="text-sm text-slate-500">Definí un tope propio para tus emisiones y enterate antes de cruzar el límite del Monotributo</p>
      </div>

      {/* Estado actual */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"><Gauge className="w-5 h-5" /></div>
          <div>
            <h3 className="font-bold text-slate-900">Estado actual contra el límite</h3>
            <p className="text-xs text-slate-500">Categoría {PERFIL_USUARIO.categoria} · Tope oficial ARCA {ARS(cat.topeIngresos)}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat label="Facturado 12m" value={ARS(r.facturado)} />
          <Stat label="Límite configurado" value={ARS(limiteEfectivo)} accent="brand" />
          <Stat label="Disponible" value={ARS(restante)} accent={restante > 0 ? "emerald" : "rose"} />
        </div>
        <div className="mt-5">
          <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={clsx("h-full rounded-full transition-all",
              pctActual >= 100 ? "bg-rose-600" :
              pctActual >= 85  ? "bg-orange-500" :
              pctActual >= 70  ? "bg-amber-400" : "bg-emerald-500")}
              style={{ width: `${Math.min(pctActual, 100)}%` }} />
            {alertas.map((a) => (
              <div key={a.id} className="absolute top-0 bottom-0 w-px bg-slate-400/60"
                style={{ left: `${Math.min(a.pct, 100)}%` }}
                title={`Alerta al ${a.pct}%`} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0%</span><span>50%</span><span className="font-semibold text-slate-600">{pctActual.toFixed(1)}% usado</span><span>100%</span>
          </div>
        </div>
      </div>

      {/* Bloqueo de emisión */}
      <div className="card p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 grid place-items-center"><Lock className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-slate-900">Bloqueo automático de emisión</h3>
              <p className="text-xs text-slate-500">Cuando alcances este límite, la plataforma rechazará nuevas facturas para evitar superar el tope.</p>
            </div>
          </div>
          <button onClick={() => setBloqueo((b) => ({ ...b, activo: !b.activo }))}
            className={clsx("relative w-11 h-6 rounded-full transition-colors shrink-0",
              bloqueo.activo ? "bg-rose-600" : "bg-slate-300")}>
            <span className={clsx("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
              bloqueo.activo && "translate-x-5")} />
          </button>
        </div>

        <div className={clsx("grid grid-cols-1 md:grid-cols-2 gap-4 transition", !bloqueo.activo && "opacity-50 pointer-events-none")}>
          <button onClick={() => setBloqueo((b) => ({ ...b, usaPorcentaje: true }))}
            className={clsx("p-4 rounded-xl border text-left transition",
              bloqueo.usaPorcentaje ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50")}>
            <div className="text-xs text-slate-500">% del tope ARCA</div>
            <div className="font-bold text-lg text-slate-900">{bloqueo.porcentaje}%</div>
            <div className="text-xs text-slate-500 mt-0.5">Equivale a {ARS((cat.topeIngresos * bloqueo.porcentaje) / 100)}</div>
          </button>
          <button onClick={() => setBloqueo((b) => ({ ...b, usaPorcentaje: false }))}
            className={clsx("p-4 rounded-xl border text-left transition",
              !bloqueo.usaPorcentaje ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50")}>
            <div className="text-xs text-slate-500">Importe manual</div>
            <div className="font-bold text-lg text-slate-900">{ARS(bloqueo.importeManual)}</div>
            <div className="text-xs text-slate-500 mt-0.5">Definí un tope independiente</div>
          </button>
        </div>

        {bloqueo.activo && (bloqueo.usaPorcentaje ? (
          <div>
            <label className="label">Porcentaje del tope: <span className="font-bold text-brand-700">{bloqueo.porcentaje}%</span></label>
            <input type="range" min={50} max={120} step={1}
              value={bloqueo.porcentaje}
              onChange={(e) => setBloqueo((b) => ({ ...b, porcentaje: parseInt(e.target.value, 10) }))}
              className="w-full accent-brand-600" />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>50%</span><span>85%</span><span>100% (tope ARCA)</span><span>120%</span>
            </div>
          </div>
        ) : (
          <div>
            <label className="label">Importe del límite (ARS)</label>
            <input type="number" min={0} className="input"
              value={bloqueo.importeManual}
              onChange={(e) => setBloqueo((b) => ({ ...b, importeManual: parseFloat(e.target.value) || 0 }))} />
          </div>
        ))}

        <div className="bg-rose-50/50 ring-1 ring-rose-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <div className="text-xs text-rose-700">
            Al activarse, los intentos de emitir nuevas facturas (A/B/C) <b>serán rechazados</b> con un aviso. El bloqueo evita superar el tope por descuido y caer al Régimen General.
          </div>
        </div>
      </div>

      {/* Alertas por % */}
      <div className="card p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 grid place-items-center"><BellRing className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-slate-900">Alertas por nivel de uso</h3>
              <p className="text-xs text-slate-500">Recibí un aviso cuando cruces ciertos % del límite configurado</p>
            </div>
          </div>
          <button onClick={addAlerta} className="btn-outline !text-xs"><Plus className="w-3.5 h-3.5" /> Nueva alerta</button>
        </div>

        <div className="space-y-3">
          {alertas.length === 0 && (
            <div className="text-center text-sm text-slate-400 py-6">No hay alertas configuradas. Agregá una con el botón de arriba.</div>
          )}
          {alertas
            .slice()
            .sort((a, b) => a.pct - b.pct)
            .map((a) => (
              <div key={a.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-2xl font-bold text-slate-900 tabular-nums w-14 text-right">{a.pct}%</span>
                    <span className="text-xs text-slate-500">del límite</span>
                  </div>
                  <input type="range" min={10} max={100} step={5}
                    value={a.pct}
                    onChange={(e) => updateAlerta(a.id, { pct: parseInt(e.target.value, 10) })}
                    className="flex-1 accent-brand-600" />
                  <div className="text-xs text-slate-500 hidden md:block">≈ {ARS((limiteEfectivo * a.pct) / 100)}</div>
                  <button onClick={() => removeAlerta(a.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <CanalChip active={a.canales.email}    onClick={() => toggleCanal(a.id, "email")}    icon={Mail}          label="Email" />
                  <CanalChip active={a.canales.push}     onClick={() => toggleCanal(a.id, "push")}     icon={Bell}          label="Push" />
                  <CanalChip active={a.canales.whatsapp} onClick={() => toggleCanal(a.id, "whatsapp")} icon={MessageSquare} label="WhatsApp" />
                </div>
              </div>
            ))}
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
          💡 Recomendado: configurar alertas en 70% (vigilar), 85% (planificar pase) y 95% (último aviso antes del bloqueo).
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary">Guardar configuración</button>
      </div>
    </div>
  );
}

function Stat({ label, value, accent = "brand" }: { label: string; value: string; accent?: "brand" | "emerald" | "rose" | "slate" }) {
  const map: Record<string, string> = {
    brand: "text-brand-700", emerald: "text-emerald-700", rose: "text-rose-700", slate: "text-slate-700",
  };
  return (
    <div className="card p-5">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={clsx("text-2xl font-bold", map[accent])}>{value}</div>
    </div>
  );
}

function CanalChip({ active, onClick, icon: Icon, label }:
  { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button onClick={onClick}
      className={clsx("inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition",
        active ? "bg-brand-50 text-brand-700 border-brand-200"
               : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50")}>
      <Icon className="w-3.5 h-3.5" /> {label}
      {active && <CheckCircle2 className="w-3 h-3" />}
    </button>
  );
}
