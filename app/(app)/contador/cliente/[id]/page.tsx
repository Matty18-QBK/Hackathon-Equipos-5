"use client";
import { Fragment, use, useState } from "react";
import Link from "next/link";
import {
  CLIENTES_CONTADOR, CATEGORIAS_MONOTRIBUTO, COMPROBANTES, CCMA_MOVIMIENTOS, NOTIFICACIONES,
} from "@/lib/mockData";
import { ARS, fmtDate, saldoCCMA, calcularRiesgoExclusion, validarCUIT } from "@/lib/fiscal";
import EspejoRetrovisor from "@/components/EspejoRetrovisor";
import PlanBadge from "@/components/PlanBadge";
import FacturacionRecurrente from "@/components/FacturacionRecurrente";
import {
  ArrowLeft, LayoutDashboard, FileText, Wallet, Receipt, Bell, Zap,
  Plus, Download, CheckCircle2, Circle, Mail, ChevronDown, AlertCircle,
  MailOpen, BellRing, Globe, KeyRound, FileLock2, Key, Upload, ShieldCheck,
  Gauge, Lock, Trash2, MessageSquare, X, Search, Loader2, Ban, FileMinus, AlertTriangle,
  Sparkles,
} from "lucide-react";
import { notFound } from "next/navigation";
import clsx from "clsx";

type TabId = "resumen" | "facturacion" | "cobros" | "ccma" | "notificaciones" | "automatizaciones" | "credenciales" | "limites";

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "resumen",          label: "Resumen",            icon: LayoutDashboard },
  { id: "facturacion",      label: "Facturación",        icon: FileText },
  { id: "cobros",           label: "Trazabilidad",       icon: Wallet },
  { id: "ccma",             label: "CCMA",               icon: Receipt },
  { id: "notificaciones",   label: "Notificaciones",     icon: Bell },
  { id: "automatizaciones", label: "Automatizaciones",   icon: Zap },
  { id: "credenciales",     label: "Credenciales ARCA",  icon: KeyRound },
  { id: "limites",          label: "Límites y alertas",  icon: Gauge },
];

export default function GestionarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const cli = CLIENTES_CONTADOR.find((c) => c.id === id);
  if (!cli) return notFound();
  const cat = CATEGORIAS_MONOTRIBUTO.find((x) => x.letra === cli.categoria)!;
  const [tab, setTab] = useState<TabId>("resumen");

  return (
    <div className="space-y-6">
      <Link href="/contador/clientes" className="text-sm text-slate-500 inline-flex items-center gap-1 hover:text-slate-700">
        <ArrowLeft className="w-4 h-4" /> Volver a Mis Clientes
      </Link>

      <div className="card p-6 flex flex-wrap items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white grid place-items-center text-xl font-bold">
          {cli.razonSocial.split(" ").map((p) => p[0]).slice(0, 2).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{cli.razonSocial}</h1>
            <span className="badge-blue">Gestionado por contador</span>
            <PlanBadge plan={cli.plan} />
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-1 text-sm text-slate-500">
            <span className="font-mono">CUIT {cli.cuit}</span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-sm ring-1 ring-brand-700/20">
              <Sparkles className="w-3 h-3" /> Categoría {cli.categoria}
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono">Tope {ARS(cat.topeIngresos)}</span>
            {cli.plan !== "free" && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-xs">Renueva {fmtDate(cli.proximoVto)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline"><Download className="w-4 h-4" /> Exportar</button>
          <Link href={`/contador/cliente/${cli.id}`} className="btn-primary">
            <Plus className="w-4 h-4" /> Acción rápida
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-1.5 flex flex-wrap gap-1 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={clsx("flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition",
                active ? "bg-brand-600 text-white shadow" : "text-slate-700 hover:bg-slate-100")}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "resumen" && <PanelResumen cli={cli} />}
      {tab === "facturacion" && <PanelFacturacion />}
      {tab === "cobros" && <PanelCobros />}
      {tab === "ccma" && <PanelCCMA />}
      {tab === "notificaciones" && <PanelNotificaciones />}
      {tab === "automatizaciones" && <PanelAutomatizaciones />}
      {tab === "credenciales" && <PanelCredenciales cuit={cli.cuit} razonSocial={cli.razonSocial} />}
      {tab === "limites" && <PanelLimites cli={cli} />}
    </div>
  );
}

/* ----------------- Resumen ----------------- */
function PanelResumen({ cli }: { cli: typeof CLIENTES_CONTADOR[number] }) {
  const r = calcularRiesgoExclusion(cli.categoria);
  const cobrado = COMPROBANTES.filter((c) => c.cobrado).reduce((a, c) => a + c.total, 0);
  const pendiente = COMPROBANTES.filter((c) => !c.cobrado).reduce((a, c) => a + c.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Facturado 12m" value={ARS(r.facturado)} hint={`${r.porcentaje.toFixed(0)}% del tope`} />
        <Stat label="Cobrado" value={ARS(cobrado)} hint={`Pend. ${ARS(pendiente)}`} accent="emerald" />
        <Stat label="Deuda CCMA" value={cli.deudaCCMA > 0 ? ARS(cli.deudaCCMA) : "—"} accent={cli.deudaCCMA > 0 ? "rose" : "slate"} />
        <Stat label="DFE sin leer" value={String(cli.notifSinLeer)} accent={cli.notifSinLeer ? "amber" : "slate"} />
      </div>
      <EspejoRetrovisor categoria={cli.categoria} />
    </div>
  );
}

function Stat({ label, value, hint, accent = "brand" }:
  { label: string; value: string; hint?: string; accent?: "brand" | "emerald" | "amber" | "rose" | "slate" }) {
  const map: Record<string, string> = {
    brand: "text-brand-700",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    rose: "text-rose-700",
    slate: "text-slate-700",
  };
  return (
    <div className="card p-5">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={clsx("text-2xl font-bold", map[accent])}>{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}

/* ----------------- Facturación ----------------- */
type FacturaRow = (typeof COMPROBANTES)[number] & { anulada?: boolean; notaCredito?: string };

function PanelFacturacion() {
  const [tipo, setTipo] = useState<"todos" | "A" | "B" | "C">("todos");
  const [openModal, setOpenModal] = useState(false);
  const [data, setData] = useState<FacturaRow[]>(() => COMPROBANTES.slice(0, 20));
  const [confirmar, setConfirmar] = useState<FacturaRow | null>(null);

  const filtered = data.filter((c) => tipo === "todos" || c.tipo === tipo);

  const anular = (c: FacturaRow) => {
    const nc = `0001-NC-${c.numero.split("-")[1]}`;
    setData((d) => d.map((x) => (x.id === c.id ? { ...x, anulada: true, notaCredito: nc } : x)));
    setConfirmar(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(["todos", "A", "B", "C"] as const).map((t) => (
            <button key={t} onClick={() => setTipo(t)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${
                tipo === t ? "bg-brand-600 text-white" : "bg-white border border-slate-200 hover:bg-slate-50"
              }`}>{t === "todos" ? "Todos" : `Factura ${t}`}</button>
          ))}
        </div>
        <button onClick={() => setOpenModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Emitir en nombre del cliente
        </button>
      </div>

      {openModal && <ModalEmitirFactura onClose={() => setOpenModal(false)} />}
      {confirmar && (
        <ModalAnularFactura
          factura={confirmar}
          onCancel={() => setConfirmar(null)}
          onConfirm={() => anular(confirmar)}
        />
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs text-slate-500">
              <th className="py-3 px-4 font-medium">Número</th>
              <th className="py-3 px-4 font-medium">Tipo</th>
              <th className="py-3 px-4 font-medium">Cliente</th>
              <th className="py-3 px-4 font-medium">Fecha</th>
              <th className="py-3 px-4 font-medium text-right">Total</th>
              <th className="py-3 px-4 font-medium">Estado</th>
              <th className="py-3 px-4 font-medium">Nota de crédito</th>
              <th className="py-3 px-4 font-medium text-right">Anular</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className={clsx("border-t border-slate-100 hover:bg-slate-50", c.anulada && "bg-rose-50/40")}>
                <td className="py-2.5 px-4 font-mono text-xs">
                  <span className={c.anulada ? "line-through text-slate-400" : ""}>{c.numero}</span>
                </td>
                <td className="py-2.5 px-4"><span className="badge-slate">F. {c.tipo}</span></td>
                <td className="py-2.5 px-4">{c.razonSocial}</td>
                <td className="py-2.5 px-4 text-slate-500">{fmtDate(c.fecha)}</td>
                <td className="py-2.5 px-4 text-right font-semibold">{ARS(c.total)}</td>
                <td className="py-2.5 px-4">
                  {c.anulada
                    ? <span className="badge-red">Anulada</span>
                    : c.cobrado
                      ? <span className="badge-green">Cobrado</span>
                      : <span className="badge-amber">Pendiente</span>}
                </td>
                <td className="py-2.5 px-4">
                  {c.notaCredito ? (
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-full px-2 py-0.5">
                      <FileMinus className="w-3 h-3" /> {c.notaCredito}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="py-2.5 px-4 text-right">
                  {c.anulada ? (
                    <span className="text-xs text-slate-400">Ya anulada</span>
                  ) : (
                    <button onClick={() => setConfirmar(c)}
                      className="btn !text-xs !py-1.5 !px-2.5 text-rose-700 bg-rose-50 hover:bg-rose-100 ring-1 ring-rose-200">
                      <Ban className="w-3.5 h-3.5" /> Anular factura
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------- Modal Anular Factura ----------------- */
function ModalAnularFactura({ factura, onCancel, onConfirm }:
  { factura: FacturaRow; onCancel: () => void; onConfirm: () => void }) {
  const ncNumero = `0001-NC-${factura.numero.split("-")[1]}`;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 grid place-items-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900">¿Anular esta factura?</h2>
              <p className="text-sm text-slate-600 mt-1">
                Para anular la factura <span className="font-mono font-semibold">{factura.numero}</span> se generará automáticamente una <b>Nota de Crédito tipo {factura.tipo}</b> asociada por el mismo importe ({ARS(factura.total)}).
              </p>
            </div>
          </div>

          <div className="mt-5 bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Factura original</span>
              <span className="font-mono font-semibold">{factura.numero}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nota de crédito a emitir</span>
              <span className="font-mono font-semibold text-rose-700">{ncNumero}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-500">Importe</span>
              <span className="font-bold">{ARS(factura.total)}</span>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-500 bg-amber-50 ring-1 ring-amber-200 rounded-lg p-3">
            ⚠️ Esta acción se informará a ARCA vía Afip SDK y no se puede revertir. El cliente recibirá una copia de la NC por email.
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button onClick={onCancel} className="btn-outline">No, cancelar</button>
            <button onClick={onConfirm} className="btn-primary !bg-rose-600 hover:!bg-rose-700">
              <Ban className="w-4 h-4" /> Sí, anular y generar NC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------- Modal Emitir Factura ----------------- */
type PadronResult = { ok: boolean; razonSocial?: string; condicionIVA?: string; domicilio?: string; tipo?: "RI" | "MT" | "CF" };
const PADRON_MOCK: Record<string, PadronResult> = {
  "30712345678": { ok: true, razonSocial: "Acme Software SA", condicionIVA: "Responsable Inscripto", domicilio: "Av. Corrientes 1234, CABA", tipo: "RI" },
  "20284567893": { ok: true, razonSocial: "Juan Pérez", condicionIVA: "Monotributo Cat. F", domicilio: "Belgrano 2000, Rosario", tipo: "MT" },
  "30709998887": { ok: true, razonSocial: "Distribuidora del Sur SRL", condicionIVA: "Responsable Inscripto", domicilio: "Mitre 500, Mar del Plata", tipo: "RI" },
};

function ModalEmitirFactura({ onClose }: { onClose: () => void }) {
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

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold">{emitida ? "Factura emitida" : "Emitir factura en nombre del cliente"}</h2>
            <p className="text-xs text-slate-500">{emitida ? "Comprobante autorizado por ARCA" : "Validación de CUIT vía Padrón · CAE automático con Afip SDK"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>

        {emitida ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold">¡Factura {tipo} emitida!</h3>
            <p className="text-sm text-slate-500 mt-1">Se generó el comprobante y se autorizó vía CAE.</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-left bg-slate-50 rounded-xl p-4">
              <div><div className="text-xs text-slate-500">Tipo</div><div className="font-semibold">Factura {tipo}</div></div>
              <div><div className="text-xs text-slate-500">Total</div><div className="font-semibold">{ARS(total)}</div></div>
              <div><div className="text-xs text-slate-500">CAE</div><div className="font-mono text-sm">74829304857261</div></div>
              <div><div className="text-xs text-slate-500">Vto. CAE</div><div className="font-semibold">15/05/2026</div></div>
            </div>
            <div className="mt-5 flex justify-center gap-2">
              <button onClick={onClose} className="btn-outline">Cerrar</button>
              <button onClick={() => { setEmitida(false); setCuit(""); setNeto(0); setPadron(null); }} className="btn-primary">Emitir otra</button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
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
                      {t === "A" ? "Resp. Inscripto" : t === "B" ? "Monotrib./CF" : "Monotrib. a CF"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">CUIT del cliente receptor</label>
              <div className="flex gap-2">
                <input className="input font-mono" placeholder="30-71234567-8" value={cuit} onChange={(e) => setCuit(e.target.value)} />
                <button onClick={consultarPadron} className="btn-outline whitespace-nowrap">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Padrón
                </button>
              </div>
              {padron && !padron.ok && <div className="mt-2 text-xs text-rose-600">CUIT inválido. Revisá los dígitos.</div>}
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
              <div className="flex justify-between text-base pt-1.5 border-t border-slate-200">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-brand-700">{ARS(total)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={onClose} className="btn-outline">Cancelar</button>
              <button
                disabled={!padron?.ok || neto <= 0}
                onClick={() => setEmitida(true)}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                Emitir y solicitar CAE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------- Cobros ----------------- */
function PanelCobros() {
  const [data, setData] = useState(COMPROBANTES.slice(0, 14));
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (id: string) =>
    setData((d) => d.map((c) => (c.id === id ? { ...c, cobrado: !c.cobrado, fechaCobro: !c.cobrado ? new Date().toISOString() : undefined } : c)));

  const totalFact = data.reduce((a, c) => a + c.total, 0);
  const totalCob = data.filter((c) => c.cobrado).reduce((a, c) => a + c.total, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Facturado" value={ARS(totalFact)} />
        <Stat label="Cobrado" value={ARS(totalCob)} accent="emerald" />
        <Stat label="Pendiente" value={ARS(totalFact - totalCob)} accent="amber" />
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs text-slate-500">
              <th className="py-3 px-4"></th>
              <th className="py-3 px-4 font-medium">Comprobante</th>
              <th className="py-3 px-4 font-medium">Fecha</th>
              <th className="py-3 px-4 font-medium text-right">Total</th>
              <th className="py-3 px-4 font-medium">Estado</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="card p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 grid place-items-center"><FileText className="w-4 h-4" /></div>
                          <div className="flex-1 text-xs">
                            <div className="text-slate-500">PDF</div>
                            <div className="font-semibold">{c.numero}.pdf</div>
                          </div>
                          <button className="btn-outline !text-xs !py-1.5">Ver</button>
                        </div>
                        <div className="card p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 grid place-items-center"><Mail className="w-4 h-4" /></div>
                          <div className="flex-1 text-xs">
                            <div className="text-slate-500">Reenviar al cliente</div>
                            <div className="font-semibold truncate">{c.razonSocial.toLowerCase().replace(/[^a-z]/g, "")}@mail.com</div>
                          </div>
                          <button className="btn-outline !text-xs !py-1.5">Enviar</button>
                        </div>
                        <button onClick={() => toggle(c.id)} className={clsx("justify-center", c.cobrado ? "btn-outline" : "btn-primary")}>
                          {c.cobrado ? "Marcar pendiente" : "Marcar cobrado"}
                        </button>
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

/* ----------------- CCMA ----------------- */
function PanelCCMA() {
  const saldo = saldoCCMA(CCMA_MOVIMIENTOS);
  const debe = CCMA_MOVIMIENTOS.reduce((a, m) => a + m.debe, 0);
  const haber = CCMA_MOVIMIENTOS.reduce((a, m) => a + m.haber, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Cargos (Debe)" value={ARS(debe)} />
        <Stat label="Pagos (Haber)" value={ARS(haber)} accent="emerald" />
        <Stat label="Saldo" value={ARS(saldo)} accent={saldo > 0 ? "rose" : "emerald"} />
      </div>
      {saldo > 0 && (
        <div className="card p-4 bg-rose-50/50 ring-1 ring-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-rose-800">Saldo deudor: {ARS(saldo)}</div>
            <p className="text-sm text-rose-700">Generá un VEP en nombre del cliente para cancelar la deuda.</p>
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

/* ----------------- Notificaciones ----------------- */
function PanelNotificaciones() {
  const [data, setData] = useState(NOTIFICACIONES);
  const toggle = (id: string) => setData((d) => d.map((n) => (n.id === id ? { ...n, leida: !n.leida } : n)));

  return (
    <div className="card divide-y divide-slate-100">
      {data.map((n) => (
        <div key={n.id} className={clsx("p-5 flex items-start gap-4", !n.leida && "bg-brand-50/30")}>
          <div className={clsx("w-10 h-10 rounded-xl grid place-items-center shrink-0",
            n.prioridad === "alta" ? "bg-rose-100 text-rose-600"
              : n.prioridad === "media" ? "bg-amber-100 text-amber-700"
              : "bg-slate-100 text-slate-600")}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900">{n.asunto}</h3>
              {!n.leida && <span className="badge-blue">Nueva</span>}
              <span className="badge-slate">{n.origen}</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">{n.detalle}</p>
            <div className="text-xs text-slate-400 mt-2">{fmtDate(n.fecha)}</div>
          </div>
          <button onClick={() => toggle(n.id)} className="btn-ghost">
            {n.leida ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
            {n.leida ? "Sin leer" : "Marcar leída"}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ----------------- Credenciales ARCA ----------------- */
function PanelCredenciales({ cuit, razonSocial }: { cuit: string; razonSocial: string }) {
  const [crt, setCrt] = useState<string | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [alias, setAlias] = useState(`cert-${razonSocial.toLowerCase().replace(/[^a-z]/g, "")}`);
  const [delegacion, setDelegacion] = useState(true);
  const [servicios, setServicios] = useState({ wsfe: true, wsaa: true, wscdc: true, padron: true, ccma: false });

  const conectado = Boolean(crt && key);

  return (
    <div className="space-y-6">
      <div className={clsx("card p-5 flex items-start gap-4",
        conectado ? "bg-emerald-50/50 ring-1 ring-emerald-200" : "bg-amber-50/50 ring-1 ring-amber-200")}>
        <div className={clsx("w-11 h-11 rounded-xl grid place-items-center shrink-0",
          conectado ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className={clsx("font-semibold", conectado ? "text-emerald-800" : "text-amber-800")}>
            {conectado ? "Conexión activa con ARCA" : "Falta cargar credenciales"}
          </div>
          <p className="text-sm text-slate-600">
            {conectado
              ? `Estás operando en nombre de ${razonSocial} (CUIT ${cuit}) vía Afip SDK.`
              : `Subí el certificado y la clave privada para poder operar en nombre de ${razonSocial}.`}
          </p>
        </div>
        <div className={conectado ? "badge-green" : "badge-amber"}>
          {conectado ? "Conectado" : "Pendiente"}
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"><KeyRound className="w-5 h-5" /></div>
          <div>
            <h3 className="font-bold text-slate-900">Credenciales del Afip SDK</h3>
            <p className="text-xs text-slate-500">Generadas en el portal de ARCA con clave fiscal nivel 3</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">CUIT representado</label>
            <input className="input font-mono" value={cuit} disabled />
          </div>
          <div>
            <label className="label">Alias del certificado</label>
            <input className="input font-mono" value={alias} onChange={(e) => setAlias(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FileSlot label="Certificado .crt" icon={FileLock2} file={crt}
            onUpload={() => setCrt(`${alias}.crt`)} onRemove={() => setCrt(null)} />
          <FileSlot label="Clave privada .key" icon={Key} file={key}
            onUpload={() => setKey(`${alias}.key`)} onRemove={() => setKey(null)} />
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
          🔒 Las credenciales se almacenan cifradas con AES-256 y nunca abandonan tu cuenta. Sólo se usan para autenticarse contra los webservices de ARCA en nombre de este cliente.
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900">Servicios habilitados</h3>
          <p className="text-xs text-slate-500">Webservices de ARCA que la plataforma podrá invocar para este cliente</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {([
            ["wsfe",   "WSFE — Facturación electrónica"],
            ["wsaa",   "WSAA — Autenticación y autorización"],
            ["wscdc",  "WSCDC — Constatación de comprobantes"],
            ["padron", "Padrón A5 — Datos de contribuyentes"],
            ["ccma",   "CCMA — Cuenta corriente del Monotributo"],
          ] as const).map(([k, label]) => (
            <label key={k} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-brand-600"
                checked={servicios[k]}
                onChange={(e) => setServicios((s) => ({ ...s, [k]: e.target.checked }))} />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900">Delegación fiscal</h3>
          <p className="text-xs text-slate-500">Confirmá que el cliente te delegó los servicios necesarios en su clave fiscal</p>
        </div>
        <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 accent-brand-600 mt-0.5"
            checked={delegacion} onChange={(e) => setDelegacion(e.target.checked)} />
          <div className="text-sm">
            <div className="font-medium">El cliente delegó los servicios en mi CUIT</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Verificable en <span className="font-mono">arca.gob.ar → Administrador de Relaciones de Clave Fiscal</span>
            </div>
          </div>
        </label>
        <div className="flex justify-end gap-2">
          <button className="btn-outline">Probar conexión</button>
          <button disabled={!crt || !key || !delegacion} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            Guardar credenciales
          </button>
        </div>
      </div>
    </div>
  );
}

function FileSlot({ label, icon: Icon, file, onUpload, onRemove }:
  { label: string; icon: any; file: string | null; onUpload: () => void; onRemove: () => void }) {
  return (
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 hover:border-brand-400 transition">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 grid place-items-center"><Icon className="w-5 h-5" /></div>
        <div className="font-semibold text-slate-900">{label}</div>
      </div>
      {file ? (
        <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
          <div className="text-xs">
            <div className="font-mono text-slate-700">{file}</div>
            <div className="text-emerald-600 mt-0.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Cargado</div>
          </div>
          <button onClick={onRemove} className="text-xs text-rose-600 font-semibold hover:underline">Quitar</button>
        </div>
      ) : (
        <button onClick={onUpload} className="w-full py-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm text-slate-600 inline-flex items-center justify-center gap-2">
          <Upload className="w-4 h-4" /> Subir archivo
        </button>
      )}
    </div>
  );
}

/* ----------------- Límites y alertas ----------------- */
function PanelLimites({ cli }: { cli: typeof CLIENTES_CONTADOR[number] }) {
  const cat = CATEGORIAS_MONOTRIBUTO.find((x) => x.letra === cli.categoria)!;
  const r = calcularRiesgoExclusion(cli.categoria);

  const [bloqueo, setBloqueo] = useState({
    activo: true,
    porcentaje: 100,
    importeManual: cat.topeIngresos,
    usaPorcentaje: true,
  });

  const [alertas, setAlertas] = useState<{ id: string; pct: number; canales: { email: boolean; push: boolean; whatsapp: boolean } }[]>([
    { id: "1", pct: 70, canales: { email: true,  push: true,  whatsapp: false } },
    { id: "2", pct: 85, canales: { email: true,  push: true,  whatsapp: true  } },
    { id: "3", pct: 95, canales: { email: true,  push: true,  whatsapp: true  } },
  ]);

  const limiteEfectivo = bloqueo.usaPorcentaje
    ? Math.round((cat.topeIngresos * bloqueo.porcentaje) / 100)
    : bloqueo.importeManual;

  const restante = Math.max(limiteEfectivo - r.facturado, 0);
  const pctActual = (r.facturado / limiteEfectivo) * 100;

  const updateAlerta = (id: string, patch: Partial<(typeof alertas)[number]>) =>
    setAlertas((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const toggleCanal = (id: string, canal: "email" | "push" | "whatsapp") =>
    setAlertas((a) => a.map((x) => (x.id === id ? { ...x, canales: { ...x.canales, [canal]: !x.canales[canal] } } : x)));
  const removeAlerta = (id: string) => setAlertas((a) => a.filter((x) => x.id !== id));
  const addAlerta = () =>
    setAlertas((a) => [...a, { id: String(Date.now()), pct: 80, canales: { email: true, push: false, whatsapp: false } }]);

  return (
    <div className="space-y-6">
      {/* Estado actual */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"><Gauge className="w-5 h-5" /></div>
          <div>
            <h3 className="font-bold text-slate-900">Estado actual contra el límite</h3>
            <p className="text-xs text-slate-500">Categoría {cli.categoria} · Tope oficial ARCA {ARS(cat.topeIngresos)}</p>
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
              pctActual >= 100 ? "bg-rose-600" : pctActual >= 85 ? "bg-orange-500" : pctActual >= 70 ? "bg-amber-400" : "bg-emerald-500")}
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
              <p className="text-xs text-slate-500">Cuando el cliente alcance este límite, la plataforma rechazará nuevas facturas</p>
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
            Al activarse, los intentos de emitir nuevas facturas (A/B/C) <b>serán rechazados con un mensaje al cliente</b> sugiriendo recategorizar o contactar al estudio. El bloqueo evita superar el tope por descuido.
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
              <p className="text-xs text-slate-500">Recibí avisos cuando el cliente cruce ciertos % del límite configurado</p>
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
                  <CanalChip active={a.canales.email}    onClick={() => toggleCanal(a.id, "email")}    icon={Mail}        label="Email" />
                  <CanalChip active={a.canales.push}     onClick={() => toggleCanal(a.id, "push")}     icon={Bell}        label="Push" />
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

function CanalChip({ active, onClick, icon: Icon, label }:
  { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button onClick={onClick}
      className={clsx("inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition",
        active
          ? "bg-brand-50 text-brand-700 border-brand-200"
          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50")}>
      <Icon className="w-3.5 h-3.5" /> {label}
      {active && <CheckCircle2 className="w-3 h-3" />}
    </button>
  );
}

/* ----------------- Automatizaciones ----------------- */
function PanelAutomatizaciones() {
  const [list, setList] = useState([
    { id: "a1", titulo: "Descarga automática de facturas", desc: "Archivado nocturno en la nube del estudio.", activa: true,  Icon: Download,  color: "brand"   },
    { id: "a2", titulo: "Reporte mensual del DFE",         desc: "Resumen al contador el día 1 de cada mes.", activa: true,  Icon: Mail,      color: "emerald" },
    { id: "a3", titulo: "Alertas de cuadro tarifario",     desc: "Avisamos cambios de topes/alícuotas.",      activa: false, Icon: BellRing,  color: "amber"   },
    { id: "a4", titulo: "Pago automático de Monotributo",  desc: "VEP el día 15, aprobación 1-click.",        activa: false, Icon: Receipt,   color: "rose"    },
    { id: "a5", titulo: "Sync con Padrón ARCA",            desc: "Detección diaria de cambios.",              activa: true,  Icon: Globe,     color: "brand"   },
  ]);
  const toggle = (id: string) => setList((l) => l.map((a) => (a.id === id ? { ...a, activa: !a.activa } : a)));

  return (
    <div className="space-y-6">
      {/* Automatizaciones built-in */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900">Automatizaciones del sistema</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((a) => (
            <div key={a.id} className={clsx("card p-5 transition", a.activa && "ring-1 ring-brand-100")}>
              <div className="flex items-start gap-4">
                <div className={clsx("w-11 h-11 rounded-xl grid place-items-center shrink-0",
                  a.color === "brand"   && "bg-brand-50 text-brand-700",
                  a.color === "emerald" && "bg-emerald-50 text-emerald-700",
                  a.color === "amber"   && "bg-amber-50 text-amber-700",
                  a.color === "rose"    && "bg-rose-50 text-rose-700",
                )}><a.Icon className="w-5 h-5" /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{a.titulo}</h3>
                    <button onClick={() => toggle(a.id)}
                      className={clsx("relative w-11 h-6 rounded-full transition-colors shrink-0",
                        a.activa ? "bg-brand-600" : "bg-slate-300")}>
                      <span className={clsx("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                        a.activa && "translate-x-5")} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{a.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FacturacionRecurrente subtitle="Programá emisiones automáticas de facturas a un cliente concreto en una frecuencia y rango de fechas" />
    </div>
  );
}

