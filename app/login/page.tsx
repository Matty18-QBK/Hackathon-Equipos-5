"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRole, HOME_BY_ROLE, Role } from "@/lib/role";
import { Sparkles, ShieldCheck, AlertCircle } from "lucide-react";

type MockUser = {
  email: string;
  password: string;
  role: Role;
  nombre: string;
  detalle: string;
};

const MOCK_USERS: MockUser[] = [
  {
    email: "juan.perez@gmail.com",
    password: "Monotributo2026!",
    role: "contribuyente",
    nombre: "Juan Pérez",
    detalle: "Monotributo Cat. F · CUIT 20-28456789-3",
  },
  {
    email: "lopez@estudiolopez.com.ar",
    password: "Contador$2026",
    role: "contador",
    nombre: "Estudio López & Asoc.",
    detalle: "6 clientes activos · Multi-CUIT",
  },
];

export default function LoginPage() {
  const r = useRouter();
  const { setRole } = useRole();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const found = MOCK_USERS.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!found) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    setRole(found.role);
    r.push(HOME_BY_ROLE[found.role]);
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
            <h2 className="text-2xl font-bold">Iniciá sesión</h2>
            <p className="text-sm text-slate-500 mt-1">Ingresá con tu usuario y contraseña.</p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="tu@email.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 transition"
            >
              Ingresar
            </button>
          </form>

          <div className="text-sm text-center text-slate-500 pt-2">
            ¿Querés crear una cuenta nueva?{" "}
            <Link href="/register" className="text-brand-700 font-semibold hover:underline">Registrate</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
