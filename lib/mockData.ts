// Mock data robusto para la Plataforma Fiscal Inteligente
// Categorías de Monotributo 2026 (proyección con actualización semestral)

export type Categoria = {
  id: string;
  letra: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K";
  actividad: "Servicios" | "Bienes" | "Ambas";
  topeIngresos: number; // anual
  cuotaMensual: number;
  alquileres: number;
};

// Topes ARCA Monotributo - vigente 2026 (mock proyectado)
export const CATEGORIAS_MONOTRIBUTO: Categoria[] = [
  { id: "A", letra: "A", actividad: "Ambas", topeIngresos: 8_992_597,  cuotaMensual:  37_815, alquileres: 2_247_149 },
  { id: "B", letra: "B", actividad: "Ambas", topeIngresos: 13_175_201, cuotaMensual:  42_777, alquileres: 2_247_149 },
  { id: "C", letra: "C", actividad: "Ambas", topeIngresos: 18_473_166, cuotaMensual:  50_926, alquileres: 4_494_298 },
  { id: "D", letra: "D", actividad: "Ambas", topeIngresos: 22_934_610, cuotaMensual:  61_874, alquileres: 4_494_298 },
  { id: "E", letra: "E", actividad: "Ambas", topeIngresos: 26_977_793, cuotaMensual:  82_204, alquileres: 5_605_590 },
  { id: "F", letra: "F", actividad: "Ambas", topeIngresos: 33_809_379, cuotaMensual:  98_044, alquileres: 5_605_590 },
  { id: "G", letra: "G", actividad: "Ambas", topeIngresos: 40_431_835, cuotaMensual: 118_888, alquileres: 11_211_180 },
  { id: "H", letra: "H", actividad: "Ambas", topeIngresos: 61_344_853, cuotaMensual: 343_557, alquileres: 11_211_180 },
  { id: "I", letra: "I", actividad: "Bienes", topeIngresos: 68_664_410, cuotaMensual: 461_325, alquileres: 11_211_180 },
  { id: "J", letra: "J", actividad: "Bienes", topeIngresos: 78_632_948, cuotaMensual: 538_966, alquileres: 11_211_180 },
  { id: "K", letra: "K", actividad: "Bienes", topeIngresos: 94_805_682, cuotaMensual: 615_730, alquileres: 11_211_180 },
];

export type Comprobante = {
  id: string;
  numero: string;
  tipo: "A" | "B" | "C";
  fecha: string; // ISO
  cuitCliente: string;
  razonSocial: string;
  neto: number;
  iva: number;
  total: number;
  cobrado: boolean;
  fechaCobro?: string;
  pdfUrl?: string;
};

// Genera 12 meses de facturación (mock)
function gen(): Comprobante[] {
  const base = new Date(2026, 4, 1); // mayo 2026
  const out: Comprobante[] = [];
  const clientes = [
    { cuit: "30-71234567-8", rs: "Acme Software SA" },
    { cuit: "30-70999888-7", rs: "Distribuidora del Sur SRL" },
    { cuit: "20-28456789-3", rs: "Juan Pérez" },
    { cuit: "27-30123456-1", rs: "María González" },
    { cuit: "30-60111222-4", rs: "Tech Solutions SA" },
  ];
  let n = 1;
  for (let m = 11; m >= 0; m--) {
    const d = new Date(base.getFullYear(), base.getMonth() - m, 1);
    const facturasMes = 3 + Math.floor(Math.random() * 4);
    // Crecimiento simulado para forzar riesgo en categoría
    const factor = 1 + (11 - m) * 0.07;
    for (let i = 0; i < facturasMes; i++) {
      const c = clientes[Math.floor(Math.random() * clientes.length)];
      const neto = Math.round((250_000 + Math.random() * 800_000) * factor);
      const tipo: "A" | "B" | "C" = Math.random() > 0.6 ? "A" : "B";
      const iva = tipo === "A" ? Math.round(neto * 0.21) : 0;
      const fecha = new Date(d.getFullYear(), d.getMonth(), 1 + Math.floor(Math.random() * 27));
      const cobrado = m > 1;
      out.push({
        id: `cmp-${n}`,
        numero: `0001-${String(n).padStart(8, "0")}`,
        tipo,
        fecha: fecha.toISOString(),
        cuitCliente: c.cuit,
        razonSocial: c.rs,
        neto,
        iva,
        total: neto + iva,
        cobrado,
        fechaCobro: cobrado ? new Date(fecha.getTime() + 86400000 * 15).toISOString() : undefined,
        pdfUrl: "#",
      });
      n++;
    }
  }
  return out.reverse();
}

export const COMPROBANTES: Comprobante[] = gen();

export type CCMA = {
  id: string;
  fecha: string;
  concepto: string;
  periodo: string;
  debe: number;
  haber: number;
};

export const CCMA_MOVIMIENTOS: CCMA[] = [
  { id: "1", fecha: "2026-04-20", concepto: "Cuota Monotributo Cat. F", periodo: "04/2026", debe: 98044, haber: 0 },
  { id: "2", fecha: "2026-04-22", concepto: "Pago Volante VEP",          periodo: "04/2026", debe: 0, haber: 98044 },
  { id: "3", fecha: "2026-05-20", concepto: "Cuota Monotributo Cat. F", periodo: "05/2026", debe: 98044, haber: 0 },
  { id: "4", fecha: "2026-05-21", concepto: "Intereses resarcitorios",   periodo: "05/2026", debe: 1240,   haber: 0 },
];

export type Notificacion = {
  id: string;
  fecha: string;
  origen: "DFE" | "Nuestra Parte" | "ARCA";
  asunto: string;
  detalle: string;
  leida: boolean;
  prioridad: "alta" | "media" | "baja";
};

export const NOTIFICACIONES: Notificacion[] = [
  { id: "n1", fecha: "2026-05-05", origen: "DFE", asunto: "Comunicación de inconsistencias", detalle: "Diferencias detectadas entre IVA declarado y compras informadas por terceros.", leida: false, prioridad: "alta" },
  { id: "n2", fecha: "2026-05-02", origen: "Nuestra Parte", asunto: "Información de Bienes Personales", detalle: "Se cargaron datos de inmuebles y plazos fijos para la DDJJ 2025.", leida: false, prioridad: "media" },
  { id: "n3", fecha: "2026-04-28", origen: "ARCA", asunto: "Recategorización semestral", detalle: "El próximo período de recategorización vence el 20/07/2026.", leida: true, prioridad: "media" },
  { id: "n4", fecha: "2026-04-15", origen: "DFE", asunto: "Cambio de cuadro tarifario SIRCREB", detalle: "Nueva alícuota aplicable desde el 01/05/2026.", leida: false, prioridad: "baja" },
];

export type Plan = "free" | "pro" | "studio";

export type Cliente = {
  id: string;
  cuit: string;
  razonSocial: string;
  categoria: Categoria["letra"];
  facturado12m: number;
  deudaCCMA: number;
  notifSinLeer: number;
  riesgo: "bajo" | "medio" | "alto";
  plan: Plan;
  proximoVto: string; // ISO date - próxima renovación
};

export const CLIENTES_CONTADOR: Cliente[] = [
  { id: "c1", cuit: "20-28456789-3", razonSocial: "Juan Pérez",          categoria: "F", facturado12m: 31_500_000, deudaCCMA: 1240,   notifSinLeer: 2, riesgo: "alto",  plan: "pro",    proximoVto: "2026-06-15" },
  { id: "c2", cuit: "27-30123456-1", razonSocial: "María González",      categoria: "D", facturado12m: 18_300_000, deudaCCMA: 0,      notifSinLeer: 0, riesgo: "medio", plan: "free",   proximoVto: "—"          },
  { id: "c3", cuit: "20-25111222-7", razonSocial: "Carlos López",        categoria: "B", facturado12m:  9_400_000, deudaCCMA: 0,      notifSinLeer: 1, riesgo: "bajo",  plan: "free",   proximoVto: "—"          },
  { id: "c4", cuit: "30-71234567-8", razonSocial: "Acme Software SA",    categoria: "H", facturado12m: 58_900_000, deudaCCMA: 240500, notifSinLeer: 4, riesgo: "alto",  plan: "studio", proximoVto: "2026-09-01" },
  { id: "c5", cuit: "27-29888777-2", razonSocial: "Lucía Fernández",     categoria: "C", facturado12m: 14_800_000, deudaCCMA: 0,      notifSinLeer: 0, riesgo: "bajo",  plan: "pro",    proximoVto: "2026-07-22" },
  { id: "c6", cuit: "20-31222333-9", razonSocial: "Pedro Martínez",      categoria: "E", facturado12m: 25_900_000, deudaCCMA: 56000,  notifSinLeer: 3, riesgo: "medio", plan: "pro",    proximoVto: "2026-05-30" },
];

export const PERFIL_USUARIO = {
  nombre: "Juan Pérez",
  cuit: "20-28456789-3",
  email: "juan.perez@example.com",
  categoria: "F" as const,
  actividad: "Servicios" as const,
  inicioActividad: "2019-03-15",
  plan: "pro" as Plan,
  proximoVto: "2026-06-15",
};

export const PERFIL_CONTADOR = {
  nombre: "Estudio López & Asoc.",
  cuit: "30-71999888-2",
  email: "contacto@estudiolopez.com.ar",
  matricula: "T° 245 F° 88 CPCE",
  plan: "studio" as Plan,
  proximoVto: "2026-09-01",
};

export const PLANES = [
  { id: "free",  nombre: "Free",       precio: 0,    features: ["Hasta 10 facturas/mes", "Espejo Retrovisor básico", "Alertas por email"] },
  { id: "pro",   nombre: "Pro",        precio: 9990, features: ["Facturas ilimitadas", "Automatizaciones", "Trazabilidad de cobros", "Chatbot fiscal"] , destacado: true },
  { id: "studio",nombre: "Estudio",    precio: 24990,features: ["Multi-CUIT (10 clientes)", "Semáforo de riesgo", "Reportes exportables", "Soporte prioritario"] },
];
