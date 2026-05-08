"use client";
import Link from "next/link";
import { CLIENTES_CONTADOR, type Cliente, type Plan } from "@/lib/mockData";
import { ARS } from "@/lib/fiscal";
import { Plus, Users, Search, Settings2, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

const CATEGORIAS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"] as const;
const PLANES: { value: Plan; label: string }[] = [
  { value: "free",   label: "Free" },
  { value: "pro",    label: "Pro" },
  { value: "studio", label: "Studio" },
];

const CUIT_RE = /^\d{2}-\d{8}-\d$/;

export default function ClientesContadorPage() {
  const [q, setQ] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>(CLIENTES_CONTADOR);
  const [openModal, setOpenModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const list = useMemo(
    () => clientes.filter((c) => (c.razonSocial + c.cuit).toLowerCase().includes(q.toLowerCase())),
    [clientes, q]
  );

  const handleCreate = (data: NewClienteForm) => {
    const nuevo: Cliente = {
      id: `c${Date.now()}`,
      cuit: data.cuit,
      razonSocial: data.razonSocial,
      categoria: data.categoria,
      facturado12m: 0,
      deudaCCMA: 0,
      notifSinLeer: 0,
      riesgo: "bajo",
      plan: data.plan,
      proximoVto: "—",
    };
    setClientes((prev) => [nuevo, ...prev]);
    setOpenModal(false);
    setToast(`Cliente “${nuevo.razonSocial}” agregado.`);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Clientes</h1>
          <p className="text-sm text-slate-500">CUITs delegados que administrás como contador</p>
        </div>
        <button onClick={() => setOpenModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Agregar cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPI label="Clientes activos" value={String(clientes.length)} accent="brand" />
        <KPI label="En riesgo alto"   value={String(clientes.filter((c) => c.riesgo === "alto").length)} accent="rose" />
        <KPI label="Con deuda CCMA"   value={String(clientes.filter((c) => c.deudaCCMA > 0).length)} accent="amber" />
        <KPI label="Notif. sin leer"  value={String(clientes.reduce((a, c) => a + c.notifSinLeer, 0))} accent="brand" />
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

      {openModal && (
        <NuevoClienteModal
          onClose={() => setOpenModal(false)}
          onSubmit={handleCreate}
          existingCuits={clientes.map((c) => c.cuit)}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}
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

/* ----------------- Modal de alta ----------------- */

type NewClienteForm = {
  razonSocial: string;
  cuit: string;
  categoria: Cliente["categoria"];
  email: string;
  telefono: string;
  actividad: string;
  inicioActividad: string;
  plan: Plan;
  notas: string;
};

const EMPTY_FORM: NewClienteForm = {
  razonSocial: "",
  cuit: "",
  categoria: "A",
  email: "",
  telefono: "",
  actividad: "",
  inicioActividad: "",
  plan: "free",
  notas: "",
};

function NuevoClienteModal({
  onClose,
  onSubmit,
  existingCuits,
}: {
  onClose: () => void;
  onSubmit: (data: NewClienteForm) => void;
  existingCuits: string[];
}) {
  const [form, setForm] = useState<NewClienteForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof NewClienteForm, string>>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [onClose]);

  const update = <K extends keyof NewClienteForm>(k: K, v: NewClienteForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.razonSocial.trim()) next.razonSocial = "Requerido";
    if (!form.cuit.trim()) next.cuit = "Requerido";
    else if (!CUIT_RE.test(form.cuit.trim())) next.cuit = "Formato XX-XXXXXXXX-X";
    else if (existingCuits.includes(form.cuit.trim())) next.cuit = "Ya existe un cliente con ese CUIT";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Email inválido";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      razonSocial: form.razonSocial.trim(),
      cuit: form.cuit.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      actividad: form.actividad.trim(),
    });
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-start justify-center p-4 sm:p-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nuevo-cliente-title"
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200">
          <div>
            <h2 id="nuevo-cliente-title" className="text-lg font-bold text-slate-900">Agregar cliente</h2>
            <p className="text-sm text-slate-500">Completá los datos del CUIT que vas a administrar.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg w-8 h-8 grid place-items-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <Section title="Datos fiscales">
            <Field label="Razón social" error={errors.razonSocial} className="md:col-span-2">
              <input
                className="input"
                value={form.razonSocial}
                onChange={(e) => update("razonSocial", e.target.value)}
                placeholder="Juan Pérez / Acme S.A."
                autoFocus
              />
            </Field>
            <Field label="CUIT" error={errors.cuit}>
              <input
                className="input font-mono"
                value={form.cuit}
                onChange={(e) => update("cuit", e.target.value)}
                placeholder="20-12345678-9"
                inputMode="numeric"
              />
            </Field>
            <Field label="Categoría Monotributo">
              <select
                className="input"
                value={form.categoria}
                onChange={(e) => update("categoria", e.target.value as Cliente["categoria"])}
              >
                {CATEGORIAS.map((c) => <option key={c} value={c}>Cat. {c}</option>)}
              </select>
            </Field>
            <Field label="Actividad principal" className="md:col-span-2">
              <input
                className="input"
                value={form.actividad}
                onChange={(e) => update("actividad", e.target.value)}
                placeholder="Servicios profesionales / Comercio / etc."
              />
            </Field>
            <Field label="Inicio de actividad">
              <input
                className="input"
                type="date"
                value={form.inicioActividad}
                onChange={(e) => update("inicioActividad", e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Contacto">
            <Field label="Email" error={errors.email}>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="cliente@ejemplo.com"
              />
            </Field>
            <Field label="Teléfono">
              <input
                className="input"
                value={form.telefono}
                onChange={(e) => update("telefono", e.target.value)}
                placeholder="+54 11 5555-5555"
              />
            </Field>
          </Section>

          <Section title="Plan y notas">
            <Field label="Plan asignado">
              <select
                className="input"
                value={form.plan}
                onChange={(e) => update("plan", e.target.value as Plan)}
              >
                {PLANES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="Notas internas" className="md:col-span-2">
              <textarea
                className="input min-h-[80px] resize-y"
                value={form.notas}
                onChange={(e) => update("notas", e.target.value)}
                placeholder="Observaciones, recordatorios, etc."
              />
            </Field>
          </Section>

          {Object.values(errors).some(Boolean) && (
            <div className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Revisá los campos marcados antes de continuar.</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
            <button type="submit" className="btn-primary"><Plus className="w-4 h-4" /> Agregar cliente</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">{title}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={clsx("space-y-1", className)}>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
