"use client";
import { calcularRiesgoExclusion } from "@/lib/fiscal";
import { ARS } from "@/lib/fiscal";
import { CATEGORIAS_MONOTRIBUTO, Categoria } from "@/lib/mockData";
import { TrendingUp, AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import clsx from "clsx";

const STYLE = {
  ok:        { bar: "bg-emerald-500", ring: "ring-emerald-200", text: "text-emerald-700", label: "Saludable",    Icon: CheckCircle2 },
  vigilar:   { bar: "bg-amber-400",   ring: "ring-amber-200",   text: "text-amber-700",   label: "Vigilar",      Icon: TrendingUp },
  alerta:    { bar: "bg-orange-500",  ring: "ring-orange-200",  text: "text-orange-700",  label: "Alerta alta",  Icon: AlertTriangle },
  exclusion: { bar: "bg-rose-600",    ring: "ring-rose-200",    text: "text-rose-700",    label: "Exclusión",    Icon: ShieldAlert },
} as const;

export default function EspejoRetrovisor({ categoria }: { categoria: Categoria["letra"] }) {
  const r = calcularRiesgoExclusion(categoria);
  const s = STYLE[r.nivel];
  const cat = CATEGORIAS_MONOTRIBUTO.find((c) => c.letra === categoria)!;
  const pct = Math.min(r.porcentaje, 110);

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-slate-900">Espejo Retrovisor</h2>
            <span className="badge-slate">12 meses móviles</span>
          </div>
          <p className="text-sm text-slate-500">Tu facturación acumulada vs. el tope de tu categoría actual.</p>
        </div>
        <div className={clsx("flex items-center gap-2 px-3 py-1.5 rounded-full ring-1", s.ring, s.text, "bg-white")}>
          <s.Icon className="w-4 h-4" />
          <span className="text-xs font-semibold">{s.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <div className="text-xs text-slate-500">Facturado (12m)</div>
          <div className="text-xl font-bold text-slate-900">{ARS(r.facturado)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Tope Cat. {cat.letra}</div>
          <div className="text-xl font-bold text-slate-900">{ARS(r.tope)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Proyección al tope</div>
          <div className="text-xl font-bold text-slate-900">
            {Number.isFinite(r.meses_proyeccion) ? `~${r.meses_proyeccion.toFixed(1)} meses` : "—"}
          </div>
        </div>
      </div>

      <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={clsx("h-full rounded-full transition-all", s.bar)} style={{ width: `${Math.min(pct, 100)}%` }} />
        {/* Marca 70% y 85% */}
        <div className="absolute top-0 bottom-0 w-px bg-amber-400/70" style={{ left: "70%" }} />
        <div className="absolute top-0 bottom-0 w-px bg-orange-500/70" style={{ left: "85%" }} />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        <span>0%</span><span>70%</span><span>85%</span><span>100%</span>
      </div>

      <div className={clsx("mt-5 p-4 rounded-xl ring-1", s.ring, "bg-slate-50")}>
        <div className="flex items-start gap-3">
          <s.Icon className={clsx("w-5 h-5 shrink-0 mt-0.5", s.text)} />
          <div className="flex-1">
            <div className={clsx("text-sm font-semibold", s.text)}>{pct.toFixed(1)}% del tope utilizado</div>
            <p className="text-sm text-slate-600 mt-0.5">{r.recomendacion}</p>
            {r.proxCategoria && (r.nivel === "vigilar" || r.nivel === "alerta" || r.nivel === "exclusion") && (
              <button className="mt-3 text-xs font-semibold inline-flex items-center gap-1 text-brand-700 hover:text-brand-800">
                Simular pase a Cat. {r.proxCategoria.letra} ({ARS(r.proxCategoria.cuotaMensual)}/mes) <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
