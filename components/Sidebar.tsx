"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useRole } from "@/lib/role";
import {
  LayoutDashboard, FileText, Receipt, Bell, Zap, Users, ShieldCheck,
  CreditCard, Settings, Wallet, LogOut, Gauge,
} from "lucide-react";
import clsx from "clsx";
import { Logo } from "@/components/Logo";

const itemsContribuyente = [
  { href: "/dashboard",        label: "Dashboard",         icon: LayoutDashboard },
  { href: "/facturacion",      label: "Facturación",       icon: FileText },
  { href: "/cobros",           label: "Trazabilidad cobros", icon: Wallet },
  { href: "/ccma",             label: "Estado de Deuda (CCMA)", icon: Receipt },
  { href: "/notificaciones",   label: "Notificaciones",    icon: Bell },
  { href: "/automatizaciones", label: "Automatizaciones",  icon: Zap },
  { href: "/limites",          label: "Límites y alertas", icon: Gauge },
];

const itemsContador = [
  { href: "/contador/clientes", label: "Mis Clientes",     icon: Users },
  { href: "/contador/riesgo",   label: "Semáforo de riesgo", icon: ShieldCheck },
  { href: "/notificaciones",    label: "Notificaciones",   icon: Bell },
];

const itemsComunes = [
  { href: "/mi-cuenta",   label: "Mi Cuenta",   icon: Settings },
  { href: "/suscripcion", label: "Suscripción", icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, clearRole } = useRole();
  const items = role === "contador" ? itemsContador : itemsContribuyente;

  const logout = () => {
    clearRole();
    router.push("/login");
  };

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="px-4 py-5 flex flex-col items-center gap-2 border-b border-slate-200">
        <Logo className="h-20 w-auto" width={240} height={160} priority />
        <span
          className={clsx(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider",
            role === "contador"
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
          )}
        >
          <span className={clsx("w-1.5 h-1.5 rounded-full", role === "contador" ? "bg-emerald-500" : "bg-brand-500")} />
          {role === "contador" ? "Modo Contador" : "Modo Contribuyente"}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 px-2 mt-1 mb-1">Principal</div>
        {items.map((it) => {
          const Active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link key={it.href} href={it.href}
              className={clsx("flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition",
                Active ? "bg-brand-50 text-brand-700 font-semibold" : "text-slate-700 hover:bg-slate-100")}>
              <Icon className="w-4 h-4" /> {it.label}
            </Link>
          );
        })}

        <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 px-2 mt-4 mb-1">Cuenta</div>
        {itemsComunes.map((it) => {
          const Active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link key={it.href} href={it.href}
              className={clsx("flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition",
                Active ? "bg-brand-50 text-brand-700 font-semibold" : "text-slate-700 hover:bg-slate-100")}>
              <Icon className="w-4 h-4" /> {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100">
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
