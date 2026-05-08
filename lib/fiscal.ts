import { CATEGORIAS_MONOTRIBUTO, Categoria, COMPROBANTES, Comprobante } from "./mockData";

export const ARS = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export const fmtDate = (d: string | Date) =>
  new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d));

export function getCategoria(letra: Categoria["letra"]) {
  return CATEGORIAS_MONOTRIBUTO.find((c) => c.letra === letra)!;
}

// "Espejo Retrovisor": facturación últimos 12 meses móviles
export function facturacion12mMoviles(comprobantes = COMPROBANTES, ref = new Date()) {
  const cutoff = new Date(ref);
  cutoff.setMonth(cutoff.getMonth() - 12);
  return comprobantes
    .filter((c) => new Date(c.fecha) >= cutoff && new Date(c.fecha) <= ref)
    .reduce((acc, c) => acc + c.total, 0);
}

export function facturacionPorMes(comprobantes = COMPROBANTES, ref = new Date()) {
  const meses: { mes: string; total: number; cobrado: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    const next = new Date(ref.getFullYear(), ref.getMonth() - i + 1, 1);
    const slice = comprobantes.filter((c) => {
      const f = new Date(c.fecha);
      return f >= d && f < next;
    });
    meses.push({
      mes: d.toLocaleDateString("es-AR", { month: "short" }),
      total: slice.reduce((a, c) => a + c.total, 0),
      cobrado: slice.filter((c) => c.cobrado).reduce((a, c) => a + c.total, 0),
    });
  }
  return meses;
}

export type RiesgoExclusion = {
  facturado: number;
  tope: number;
  porcentaje: number; // 0-100+
  meses_proyeccion: number; // cuándo cruza el tope al ritmo actual
  nivel: "ok" | "vigilar" | "alerta" | "exclusion";
  recomendacion: string;
  proxCategoria?: Categoria;
};

// Calcula riesgo de saltar al Régimen General (IVA + Ganancias)
export function calcularRiesgoExclusion(
  letra: Categoria["letra"],
  comprobantes: Comprobante[] = COMPROBANTES,
  ref = new Date()
): RiesgoExclusion {
  const cat = getCategoria(letra);
  const facturado = facturacion12mMoviles(comprobantes, ref);
  const porcentaje = (facturado / cat.topeIngresos) * 100;

  // Promedio mensual últimos 3 meses para proyección
  const meses = facturacionPorMes(comprobantes, ref);
  const ult3 = meses.slice(-3).reduce((a, m) => a + m.total, 0) / 3;
  const restante = Math.max(cat.topeIngresos - facturado, 0);
  const meses_proyeccion = ult3 > 0 ? restante / ult3 : Infinity;

  let nivel: RiesgoExclusion["nivel"] = "ok";
  if (porcentaje >= 100) nivel = "exclusion";
  else if (porcentaje >= 85 || meses_proyeccion <= 2) nivel = "alerta";
  else if (porcentaje >= 70 || meses_proyeccion <= 4) nivel = "vigilar";

  const idx = CATEGORIAS_MONOTRIBUTO.findIndex((c) => c.letra === letra);
  const proxCategoria = CATEGORIAS_MONOTRIBUTO[idx + 1];

  let recomendacion = "Tu nivel de facturación está dentro de un rango saludable.";
  if (nivel === "vigilar")
    recomendacion = `Estás superando el 70% del tope. Revisá tu ritmo de facturación; podrías necesitar pasar a Cat. ${proxCategoria?.letra ?? "—"}.`;
  if (nivel === "alerta")
    recomendacion = `Riesgo alto: a este ritmo, en ~${meses_proyeccion.toFixed(1)} meses superás el tope. Considerá recategorizar a Cat. ${proxCategoria?.letra ?? "—"} o evaluar pasar a Régimen General.`;
  if (nivel === "exclusion")
    recomendacion = `Superaste el tope anual. Estás expuesto a exclusión del Monotributo y pase obligatorio a IVA + Ganancias. Contactá a tu contador ya.`;

  return { facturado, tope: cat.topeIngresos, porcentaje, meses_proyeccion, nivel, recomendacion, proxCategoria };
}

export function saldoCCMA(movs: { debe: number; haber: number }[]) {
  return movs.reduce((acc, m) => acc + m.debe - m.haber, 0);
}

// Validación CUIT (algoritmo oficial)
export function validarCUIT(cuit: string): boolean {
  const clean = cuit.replace(/[-\s]/g, "");
  if (!/^\d{11}$/.test(clean)) return false;
  const mult = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = mult.reduce((a, m, i) => a + m * parseInt(clean[i], 10), 0);
  const mod = 11 - (sum % 11);
  const dv = mod === 11 ? 0 : mod === 10 ? 9 : mod;
  return dv === parseInt(clean[10], 10);
}
