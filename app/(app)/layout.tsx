"use client";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Chatbot from "@/components/Chatbot";
import { useRole, HOME_BY_ROLE, Role } from "@/lib/role";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const ROUTE_OWNER: { prefix: string; role: Role }[] = [
  { prefix: "/dashboard",        role: "contribuyente" },
  { prefix: "/facturacion",      role: "contribuyente" },
  { prefix: "/cobros",           role: "contribuyente" },
  { prefix: "/ccma",             role: "contribuyente" },
  { prefix: "/automatizaciones", role: "contribuyente" },
  { prefix: "/limites",          role: "contribuyente" },
  { prefix: "/contador",         role: "contador" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { role, ready } = useRole();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!role) {
      router.replace("/login");
      return;
    }
    const owner = ROUTE_OWNER.find((r) => pathname.startsWith(r.prefix));
    if (owner && owner.role !== role) {
      router.replace(HOME_BY_ROLE[role]);
    }
  }, [ready, role, pathname, router]);

  if (!ready || !role) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-slate-500">
        Cargando...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto">{children}</main>
        <Chatbot />
      </div>
    </div>
  );
}
