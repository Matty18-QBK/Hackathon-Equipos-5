import "./globals.css";
import type { Metadata } from "next";
import { RoleProvider } from "@/lib/role";

export const metadata: Metadata = {
  title: "ARCA Fiscal — Plataforma Fiscal Inteligente",
  description: "Gestioná tu relación con ARCA. Facturación, CCMA, alertas y automatizaciones.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <RoleProvider>{children}</RoleProvider>
      </body>
    </html>
  );
}
