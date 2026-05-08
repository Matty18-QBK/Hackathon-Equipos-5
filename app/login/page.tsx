"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole, HOME_BY_ROLE, Role } from "@/lib/role";
import { Sparkles, ShieldCheck, User, Briefcase, ArrowRight } from "lucide-react";

const DEMO = [
  {
    role: "contribuyente" as Role,
    titulo: "Entrar como Contribuyente",
    nombre: "Juan Pérez",
    detalle: "Monotributo Cat. F · CUIT 20-28456789-3",
    icon: User,
    accent: "from-brand-500 to-brand-700",
  },
  {
    role: "contador" as Role,
    titulo: "Entrar como Contador",
    nombre: "Estudio López & Asoc.",
    detalle: "6 clientes activos · Multi-CUIT",
    icon: Briefcase,
    accent: "from-emerald-500 to-emerald-700",
  },
];

export default function LoginPage() {
  const r = useRouter();
  const { setRole } = useRole();

  const enterAs = (role: Role) => {
    setRole(role);
    r.push(HOME_BY_ROLE[role]);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 text-white p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/10 grid place-items-center"><Sparkles className="w-5 h-5" /></div>
          <span className="font-bold text-lg">ZenFiscal</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-3">La inteligencia fiscal que ARCA no te da.</h1>
          <p className="text-brand-100 max-w-md">Anticipá la exclusión del Monotributo, automatizá tus facturas y respondé a tu DFE antes de que te penalicen.</p>
          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Conexión segura via Afip SDK</li>
            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Espejo Retrovisor 12m móviles</li>
            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Multi-CUIT para contadores</li>
          </ul>
        </div>
        <div className="text-xs text-brand-200">© 2026 ZenFiscal · Plataforma independiente</div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-brand-600 grid place-items-center text-white"><Sparkles className="w-5 h-5" /></div>
            <span className="font-bold">ZenFiscal</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Elegí tu cuenta demo</h2>
            <p className="text-sm text-slate-500 mt-1">Cada perfil ve su propio dashboard. No hay forma de cambiar de modo una vez adentro.</p>
          </div>

          <div className="space-y-3">
            {DEMO.map((d) => {
              const Icon = d.icon;
              return (
                <button
                  key={d.role}
                  onClick={() => enterAs(d.role)}
                  className="group w-full card p-5 text-left hover:border-brand-400 hover:shadow-md transition flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${d.accent} text-white grid place-items-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900">{d.titulo}</div>
                    <div className="text-sm text-slate-500">{d.nombre}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{d.detalle}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
                </button>
              );
            })}
          </div>

          <div className="text-sm text-center text-slate-500 pt-2">
            ¿Querés crear una cuenta nueva?{" "}
            <Link href="/register" className="text-brand-700 font-semibold hover:underline">Registrate</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
