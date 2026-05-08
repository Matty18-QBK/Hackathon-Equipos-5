"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Role = "contribuyente" | "contador";
type Ctx = {
  role: Role | null;
  ready: boolean;
  setRole: (r: Role) => void;
  clearRole: () => void;
};
const RoleCtx = createContext<Ctx>({ role: null, ready: false, setRole: () => {}, clearRole: () => {} });

export const HOME_BY_ROLE: Record<Role, string> = {
  contribuyente: "/dashboard",
  contador: "/contador/clientes",
};

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const r = localStorage.getItem("role") as Role | null;
    if (r === "contribuyente" || r === "contador") setRoleState(r);
    setReady(true);
  }, []);
  const setRole = (r: Role) => {
    localStorage.setItem("role", r);
    setRoleState(r);
  };
  const clearRole = () => {
    localStorage.removeItem("role");
    setRoleState(null);
  };
  return <RoleCtx.Provider value={{ role, ready, setRole, clearRole }}>{children}</RoleCtx.Provider>;
}

export const useRole = () => useContext(RoleCtx);
