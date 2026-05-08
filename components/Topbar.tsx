"use client";
import { Bell } from "lucide-react";
import { PERFIL_USUARIO, PERFIL_CONTADOR, NOTIFICACIONES } from "@/lib/mockData";
import { useRole } from "@/lib/role";
import PlanBadge from "./PlanBadge";

export default function Topbar() {
  const { role } = useRole();
  const sinLeer = NOTIFICACIONES.filter((n) => !n.leida).length;
  const perfil = role === "contador" ? PERFIL_CONTADOR : PERFIL_USUARIO;
  const subtitle = `CUIT ${perfil.cuit}`;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-end sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-slate-100">
          <Bell className="w-5 h-5 text-slate-600" />
          {sinLeer > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 text-[10px] grid place-items-center bg-rose-500 text-white rounded-full font-bold">{sinLeer}</span>
          )}
        </button>
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right leading-tight">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-sm font-semibold text-slate-900">{perfil.nombre}</span>
              <PlanBadge plan={perfil.plan} size="sm" />
            </div>
            <div className="text-xs text-slate-500">{subtitle}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white grid place-items-center text-sm font-bold">
            {perfil.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
        </div>
      </div>
    </header>
  );
}
