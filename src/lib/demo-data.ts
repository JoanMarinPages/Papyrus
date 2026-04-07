/**
 * Demo data engine - simulates the full RAG pipeline locally.
 * Stores sample AXA documents in memory and generates formatted outputs.
 */

// --- Raw document data (mirrors sample-docs/axa/) ---

export interface ClientData {
  id: string
  name: string
  dni: string
  email: string
  phone: string
  address: string
  city: string
}

export interface PolicyData {
  id: string
  clientId: string
  type: "hogar" | "auto" | "vida" | "salud" | "comercio"
  policyNumber: string
  ref: string
  effectDate: string
  expiryDate: string
  annualPremium: number
  paymentMethod: string
  coverages: { name: string; value: string }[]
  extras: Record<string, string>
}

export interface SummaryData {
  clientId: string
  period: string
  policies: { number: string; type: string; premium: number; status: string }[]
  totalPremium: number
  claims: number
  claimsCost: number
  loyaltyDiscount: string
  recommendations: string[]
}

export interface PromoData {
  id: string
  name: string
  headline: string
  description: string
  features: string[]
  pricing: { item: string; before: string; after: string }[]
  totalSaving: string
  validUntil: string
  cta: string
}

// --- Clients ---
export const CLIENTS: ClientData[] = [
  { id: "c1", name: "Maria Garcia Martinez", dni: "43.567.891-K", email: "mgarcia@email.com", phone: "+34 612 345 678", address: "Calle Mallorca 234, 3o 2a", city: "08036 Barcelona" },
  { id: "c2", name: "Carlos Lopez Fernandez", dni: "38.912.456-B", email: "clopez@email.com", phone: "+34 623 456 789", address: "Calle Serrano 89, 4o A", city: "28006 Madrid" },
  { id: "c3", name: "Pedro Sanchez Ruiz", dni: "51.234.678-M", email: "psanchez@email.com", phone: "+34 634 567 890", address: "Av. Constitucion 45, 2o B", city: "41001 Sevilla" },
  { id: "c4", name: "Laura Martinez Torres", dni: "47.890.123-S", email: "lmartinez@email.com", phone: "+34 645 678 901", address: "Calle Colon 67, 5o 1a", city: "46004 Valencia" },
  { id: "c5", name: "Elena Rodriguez Diaz", dni: "29.456.789-T", email: "erodriguez@email.com", phone: "+34 656 789 012", address: "Calle Mayor 12, Bajo", city: "46002 Valencia" },
]

// --- Policies ---
export const POLICIES: PolicyData[] = [
  {
    id: "p1", clientId: "c1", type: "hogar", policyNumber: "HOG-BCN-2026-00142", ref: "AXA-HOG-2026-00142",
    effectDate: "01/04/2026", expiryDate: "01/04/2027", annualPremium: 487.35, paymentMethod: "Trimestral",
    coverages: [
      { name: "Continente", value: "180.000 EUR" }, { name: "Contenido", value: "45.000 EUR" },
      { name: "Responsabilidad Civil", value: "300.000 EUR" }, { name: "Robo", value: "15.000 EUR" },
      { name: "Danos por agua", value: "Incluido" }, { name: "Asistencia 24h", value: "Incluido" },
    ],
    extras: { vivienda: "95 m2, 3er piso", construccion: "1998", alarma: "Si", franquicia: "150 EUR" },
  },
  {
    id: "p2", clientId: "c1", type: "auto", policyNumber: "AUT-BCN-2026-00891", ref: "AXA-AUT-2026-00891",
    effectDate: "15/03/2026", expiryDate: "15/03/2027", annualPremium: 623.90, paymentMethod: "Semestral",
    coverages: [
      { name: "Todo riesgo con franquicia", value: "400 EUR" }, { name: "RC obligatoria", value: "Ilimitada" },
      { name: "RC voluntaria", value: "50M EUR" }, { name: "Lunas", value: "Sin franquicia" },
      { name: "Asistencia viaje", value: "Peninsula + Europa" }, { name: "Vehiculo sustitucion", value: "30 dias" },
    ],
    extras: { vehiculo: "Seat Leon 1.5 TSI FR (2024)", matricula: "4523-KLM", bonificacion: "Nivel 7 (-35%)" },
  },
  {
    id: "p3", clientId: "c2", type: "vida", policyNumber: "VID-MAD-2026-00567", ref: "AXA-VID-2026-00567",
    effectDate: "01/01/2026", expiryDate: "01/01/2027", annualPremium: 312.00, paymentMethod: "Mensual (26 EUR/mes)",
    coverages: [
      { name: "Fallecimiento", value: "200.000 EUR" }, { name: "Fallecimiento accidente", value: "400.000 EUR" },
      { name: "Invalidez permanente", value: "200.000 EUR" }, { name: "Incapacidad temporal", value: "50 EUR/dia" },
    ],
    extras: { profesion: "Ingeniero informatico", fumador: "No", beneficiarios: "Ana Ruiz (60%), Pablo (20%), Laura (20%)" },
  },
  {
    id: "p4", clientId: "c2", type: "salud", policyNumber: "SAL-MAD-2026-00234", ref: "AXA-SAL-2026-00234",
    effectDate: "01/01/2026", expiryDate: "01/01/2027", annualPremium: 3144.00, paymentMethod: "Mensual (262 EUR/mes)",
    coverages: [
      { name: "Medicina general", value: "Sin copago" }, { name: "Hospitalizacion", value: "Hab. individual" },
      { name: "Cirugia", value: "Cuadro completo" }, { name: "Urgencias 24h", value: "Red propia" },
      { name: "Dental basico", value: "Incluido" }, { name: "Internacional", value: "Europa 90 dias" },
    ],
    extras: { asegurados: "4 (titular + conyuge + 2 hijos)", copago: "0 EUR" },
  },
  {
    id: "p5", clientId: "c3", type: "hogar", policyNumber: "HOG-SEV-2026-00298", ref: "AXA-HOG-2026-00298",
    effectDate: "01/02/2026", expiryDate: "01/02/2027", annualPremium: 534.20, paymentMethod: "Anual",
    coverages: [
      { name: "Continente", value: "220.000 EUR" }, { name: "Contenido", value: "60.000 EUR" },
      { name: "RC", value: "600.000 EUR" }, { name: "Robo", value: "20.000 EUR" },
      { name: "Fenomenos atmosfericos", value: "Incluido" }, { name: "Asistencia 24h", value: "Incluido" },
    ],
    extras: { vivienda: "120 m2, 2a planta", construccion: "2005" },
  },
  {
    id: "p6", clientId: "c3", type: "auto", policyNumber: "AUT-SEV-2026-01102", ref: "AXA-AUT-2026-01102",
    effectDate: "01/03/2026", expiryDate: "01/03/2027", annualPremium: 745.60, paymentMethod: "Trimestral",
    coverages: [
      { name: "Todo riesgo sin franquicia", value: "Incluido" }, { name: "RC obligatoria", value: "Ilimitada" },
      { name: "RC voluntaria", value: "50M EUR" }, { name: "Lunas", value: "Sin franquicia" },
      { name: "Accidentes conductor", value: "50.000 EUR" },
    ],
    extras: { vehiculo: "VW Golf 2.0 TDI (2023)", matricula: "8901-BNT", bonificacion: "Nivel 9 (-45%)" },
  },
  {
    id: "p7", clientId: "c4", type: "vida", policyNumber: "VID-VLC-2026-00890", ref: "AXA-VID-2026-00890",
    effectDate: "01/03/2026", expiryDate: "01/03/2027", annualPremium: 198.00, paymentMethod: "Anual",
    coverages: [
      { name: "Fallecimiento", value: "150.000 EUR" }, { name: "Fallecimiento accidente", value: "300.000 EUR" },
      { name: "Invalidez permanente", value: "150.000 EUR" }, { name: "Enfermedades graves", value: "30.000 EUR" },
    ],
    extras: { profesion: "Arquitecta", fumadora: "No", beneficiarios: "Herederos legales" },
  },
  {
    id: "p8", clientId: "c4", type: "hogar", policyNumber: "HOG-VLC-2026-00512", ref: "AXA-HOG-2026-00512",
    effectDate: "01/04/2026", expiryDate: "01/04/2027", annualPremium: 412.80, paymentMethod: "Mensual (34,40 EUR)",
    coverages: [
      { name: "Continente", value: "160.000 EUR" }, { name: "Contenido", value: "40.000 EUR" },
      { name: "RC", value: "300.000 EUR" }, { name: "Robo", value: "12.000 EUR" },
      { name: "Asistencia 24h", value: "Incluido" },
    ],
    extras: { vivienda: "78 m2, 5a planta", construccion: "2012" },
  },
  {
    id: "p9", clientId: "c5", type: "comercio", policyNumber: "COM-VLC-2026-00456", ref: "AXA-COM-2026-00456",
    effectDate: "01/01/2026", expiryDate: "01/01/2027", annualPremium: 1245.00, paymentMethod: "Trimestral",
    coverages: [
      { name: "Continente", value: "150.000 EUR" }, { name: "Contenido (stock)", value: "80.000 EUR" },
      { name: "RC explotacion", value: "600.000 EUR" }, { name: "RC patronal", value: "300.000 EUR" },
      { name: "Perdida beneficios", value: "12 meses" }, { name: "Robo", value: "25.000 EUR" },
    ],
    extras: { actividad: "Tienda de ropa - Moda Elena", superficie: "85 m2", empleados: "3", alarma: "Si" },
  },
  {
    id: "p10", clientId: "c5", type: "auto", policyNumber: "AUT-VLC-2026-01345", ref: "AXA-AUT-2026-01345",
    effectDate: "01/02/2026", expiryDate: "01/02/2027", annualPremium: 385.40, paymentMethod: "Semestral",
    coverages: [
      { name: "Terceros ampliado", value: "Incluido" }, { name: "Lunas", value: "Franquicia 50 EUR" },
      { name: "Robo e incendio", value: "Valor venal" }, { name: "Asistencia viaje", value: "Peninsula" },
      { name: "Accidentes conductor", value: "30.000 EUR" },
    ],
    extras: { vehiculo: "Toyota Corolla 1.8 Hybrid (2025)", matricula: "2345-HMN", bonificacion: "Nivel 5 (-25%)" },
  },
]

// --- Summaries ---
export const SUMMARIES: SummaryData[] = [
  {
    clientId: "c1", period: "Abril 2025 - Marzo 2026",
    policies: [
      { number: "HOG-BCN-2026-00142", type: "Hogar", premium: 487.35, status: "Vigente" },
      { number: "AUT-BCN-2026-00891", type: "Automovil", premium: 623.90, status: "Vigente" },
    ],
    totalPremium: 1111.25, claims: 0, claimsCost: 0, loyaltyDiscount: "78,50 EUR (-7%)",
    recommendations: ["Seguro de vida vinculado a hipoteca", "Pack familia con 15% descuento"],
  },
  {
    clientId: "c2", period: "Abril 2025 - Marzo 2026",
    policies: [
      { number: "VID-MAD-2026-00567", type: "Vida", premium: 312.00, status: "Vigente" },
      { number: "SAL-MAD-2026-00234", type: "Salud", premium: 3144.00, status: "Vigente" },
    ],
    totalPremium: 3456.00, claims: 0, claimsCost: 0, loyaltyDiscount: "245 EUR (-7%)",
    recommendations: ["Ampliar cobertura dental", "Seguro hogar con 10% descuento cruzado"],
  },
  {
    clientId: "c3", period: "Abril 2025 - Marzo 2026",
    policies: [
      { number: "HOG-SEV-2026-00298", type: "Hogar", premium: 534.20, status: "Vigente" },
      { number: "AUT-SEV-2026-01102", type: "Automovil", premium: 745.60, status: "Vigente" },
    ],
    totalPremium: 1279.80, claims: 1, claimsCost: 1850, loyaltyDiscount: "Sin impacto (1er siniestro en 5 anos)",
    recommendations: ["Seguro de vida familiar", "Revision de capitales del hogar"],
  },
]

// --- Promos ---
export const PROMOS: PromoData[] = [
  {
    id: "promo1", name: "Pack Familia AXA 2026", headline: "Protege a los tuyos con hasta un 25% de descuento",
    description: "Combina hogar, auto, vida y salud en un unico pack.",
    features: ["Hasta 25% descuento", "Un solo recibo", "Asistente personal", "App AXA Familia", "Sin carencias al migrar"],
    pricing: [
      { item: "Hogar", before: "490 EUR", after: "392 EUR" },
      { item: "Auto", before: "650 EUR", after: "520 EUR" },
      { item: "Vida", before: "300 EUR", after: "255 EUR" },
      { item: "Salud (2 adultos)", before: "2.136 EUR", after: "1.816 EUR" },
    ],
    totalSaving: "593 EUR/ano", validUntil: "30/06/2026", cta: "Llama al 900 100 AXA",
  },
  {
    id: "promo2", name: "Seguro de Mascotas AXA", headline: "Porque ellos tambien son familia",
    description: "Seguro para perros y gatos desde 9,90 EUR/mes.",
    features: ["Veterinario enfermedad: 3.000 EUR/ano", "Veterinario accidente: 5.000 EUR/ano", "Cirugia sin limite", "RC perros: 300.000 EUR"],
    pricing: [
      { item: "Plan Basico", before: "14,90 EUR/mes", after: "9,90 EUR/mes" },
      { item: "Plan Completo", before: "24,90 EUR/mes", after: "19,90 EUR/mes" },
    ],
    totalSaving: "Primera mensualidad gratis", validUntil: "31/12/2026", cta: "Codigo: MASCOTA2026",
  },
]

// --- Helpers ---
export function getClient(id: string) { return CLIENTS.find((c) => c.id === id) }
export function getClientPolicies(clientId: string) { return POLICIES.filter((p) => p.clientId === clientId) }
export function getClientSummary(clientId: string) { return SUMMARIES.find((s) => s.clientId === clientId) }

export function getPolicyTypeLabel(type: PolicyData["type"]): string {
  const map = { hogar: "Hogar", auto: "Automovil", vida: "Vida", salud: "Salud", comercio: "Comercio" }
  return map[type]
}
