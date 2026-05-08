"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, User, Briefcase } from "lucide-react";
import { useRole, HOME_BY_ROLE, Role } from "@/lib/role";
import clsx from "clsx";

export default function RegisterPage() {
  const r = useRouter();
  const { setRole } = useRole();
  const [perfil, setPerfil] = useState<Role>("contribuyente");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(perfil);
    r.push(HOME_BY_ROLE[perfil]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-brand-50">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-6">
          <div className="w-9 h-9 rounded-xl bg-brand-600 grid place-items-center text-white"><Sparkles className="w-5 h-5" /></div>
          <span className="font-bold">ZenFiscal</span>
        </Link>

        <div className="card p-8 space-y-5">
          <div>
            <h1 className="text-2xl font-bold">Crear cuenta</h1>
            <p className="text-sm text-slate-500">El perfil que elijas define tu dashboard. No se puede cambiar después.</p>
          </div>

          <div>
            <label className="label">¿Cómo te describís?</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setPerfil("contribuyente")}
                className={clsx("p-4 rounded-xl border text-left transition",
                  perfil === "contribuyente" ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50")}>
                <User className="w-5 h-5 text-brand-700 mb-2" />
                <div className="font-semibold text-sm">Contribuyente</div>
                <div className="text-xs text-slate-500">Monotributo / RI</div>
              </button>
              <button type="button" onClick={() => setPerfil("contador")}
                className={clsx("p-4 rounded-xl border text-left transition",
                  perfil === "contador" ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50")}>
                <Briefcase className="w-5 h-5 text-brand-700 mb-2" />
                <div className="font-semibold text-sm">Contador</div>
                <div className="text-xs text-slate-500">Multi-CUIT</div>
              </button>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Nombre</label><input className="input" required /></div>
              <div><label className="label">Apellido</label><input className="input" required /></div>
            </div>
            <div><label className="label">CUIT/CUIL</label><input className="input font-mono" placeholder="20-12345678-9" required /></div>
            <div><label className="label">Email</label><input className="input" type="email" required /></div>
            <div><label className="label">Contraseña</label><input className="input" type="password" required /></div>
            <button className="btn-primary w-full justify-center">Crear cuenta</button>
          </form>

          <div className="text-sm text-center text-slate-500">
            ¿Ya tenés cuenta? <Link href="/login" className="text-brand-700 font-semibold hover:underline">Iniciar sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
