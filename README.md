# ARCA Fiscal — Plataforma Fiscal Inteligente

Prototipo de alta fidelidad construido con **Next.js 15 (App Router)**, **Tailwind CSS**, **Recharts** y **Lucide React**.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abrir http://localhost:3000

## Estructura

- `app/login` y `app/register` — autenticación
- `app/(app)/dashboard` — Dashboard del Contribuyente con **Espejo Retrovisor**
- `app/(app)/facturacion` — Listado y emisión rápida (A/B/C) con validación de CUIT vía Padrón mock
- `app/(app)/cobros` — **Trazabilidad de Cobro** (cierra la brecha facturado vs cobrado)
- `app/(app)/ccma` — Estado de Deuda CCMA con saldo
- `app/(app)/notificaciones` — DFE / Nuestra Parte / ARCA
- `app/(app)/automatizaciones` — Centro con toggles
- `app/(app)/contador/clientes` — Multi-tenancy
- `app/(app)/contador/riesgo` — **Semáforo de Riesgo**
- `app/(app)/mi-cuenta` — Carga de credenciales `.crt` y `.key` (Afip SDK)
- `app/(app)/suscripcion` — Planes
- `lib/mockData.ts` — Categorías Monotributo 2026, comprobantes 12m, CCMA, notificaciones
- `lib/fiscal.ts` — `calcularRiesgoExclusion`, `facturacion12mMoviles`, `validarCUIT`
- `components/EspejoRetrovisor.tsx` — Widget de riesgo de exclusión
- `components/Chatbot.tsx` — Asistente Fiscal flotante

## Toggle de rol

El sidebar tiene un selector **Contribuyente / Contador** que cambia los menús dinámicamente. Persiste en `localStorage`.
