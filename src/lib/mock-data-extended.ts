/**
 * Extended mock data for new Papyrus features.
 * Kept separate from demo-data.ts (insurance demo) so insurance demo stays pristine.
 */

import type {
  IndustryCatalog,
  EnvelopeConfig,
  PrintQueue,
  PostalAgent,
  FrankingRule,
  Workflow,
  DocumentMatch,
} from "./types"

// ============ Industry Catalogs ============
export const INDUSTRY_CATALOGS: IndustryCatalog[] = [
  {
    id: "seguros",
    industry: "seguros",
    displayName: "Seguros",
    icon: "Shield",
    color: "blue",
    documentTypes: [
      { id: "poliza-hogar", code: "POL-HOG", name: "Póliza de Hogar", industry: "seguros", description: "Póliza de seguro de hogar con coberturas básicas y ampliadas", requiredFields: ["tomador", "dni", "direccion", "coberturas"], outputFormats: ["pdf", "docx"], active: true, icon: "Home", color: "blue" },
      { id: "poliza-auto", code: "POL-AUT", name: "Póliza de Auto", industry: "seguros", description: "Póliza de seguro de vehículo terrestre", requiredFields: ["tomador", "matricula", "modelo", "coberturas"], outputFormats: ["pdf"], active: true, icon: "Car", color: "blue" },
      { id: "poliza-vida", code: "POL-VID", name: "Póliza de Vida", industry: "seguros", description: "Seguro de vida con beneficiarios designados", requiredFields: ["tomador", "beneficiarios", "capital"], outputFormats: ["pdf"], active: true, icon: "Heart", color: "blue" },
      { id: "poliza-salud", code: "POL-SAL", name: "Póliza de Salud", industry: "seguros", description: "Seguro médico individual o familiar", requiredFields: ["tomador", "asegurados", "cuadro_medico"], outputFormats: ["pdf"], active: true, icon: "Stethoscope", color: "blue" },
      { id: "siniestro", code: "SIN-001", name: "Declaración de Siniestro", industry: "seguros", description: "Documento de declaración tras un siniestro", requiredFields: ["poliza", "fecha_siniestro", "descripcion"], outputFormats: ["pdf"], active: true, icon: "AlertTriangle", color: "red" },
      { id: "resumen-anual", code: "RES-ANU", name: "Resumen Anual", industry: "seguros", description: "Resumen anual con todas las pólizas del cliente", requiredFields: ["cliente", "ano"], outputFormats: ["pdf"], active: true, icon: "BarChart3", color: "green" },
      { id: "publicidad", code: "PUB-001", name: "Material Publicitario", industry: "seguros", description: "Cartas y folletos promocionales", requiredFields: ["cliente"], outputFormats: ["pdf", "html"], active: true, icon: "Megaphone", color: "purple" },
    ],
  },
  {
    id: "legal",
    industry: "legal",
    displayName: "Legal",
    icon: "Scale",
    color: "slate",
    documentTypes: [
      { id: "contrato-servicios", code: "CON-SER", name: "Contrato de Servicios", industry: "legal", description: "Contrato marco de prestación de servicios", requiredFields: ["partes", "objeto", "precio", "duracion"], outputFormats: ["pdf", "docx"], active: true, icon: "FileText", color: "slate" },
      { id: "nda", code: "NDA-001", name: "Acuerdo de Confidencialidad", industry: "legal", description: "NDA bilateral o unilateral", requiredFields: ["partes", "objeto", "vigencia"], outputFormats: ["pdf", "docx"], active: true, icon: "Lock", color: "slate" },
      { id: "poder-notarial", code: "POD-NOT", name: "Poder Notarial", industry: "legal", description: "Poder notarial general o especial", requiredFields: ["otorgante", "apoderado", "facultades"], outputFormats: ["pdf"], active: true, icon: "Gavel", color: "slate" },
      { id: "demanda", code: "DEM-001", name: "Demanda", industry: "legal", description: "Escrito de demanda civil/mercantil", requiredFields: ["demandante", "demandado", "hechos", "suplico"], outputFormats: ["pdf"], active: true, icon: "Scale", color: "red" },
    ],
  },
  {
    id: "banca",
    industry: "banca",
    displayName: "Banca",
    icon: "Landmark",
    color: "emerald",
    documentTypes: [
      { id: "alta-cuenta", code: "DVC2801", name: "Apertura de Cuenta", industry: "banca", description: "Check-list de apertura de cuenta bancaria (equivalente a DVC2801 del legacy)", requiredFields: ["titular", "dni", "domiciliacion"], outputFormats: ["pdf"], active: true, icon: "FileText", color: "emerald" },
      { id: "extracto-cuenta", code: "GCC0901", name: "Extracto de Cuenta", industry: "banca", description: "Extracto contable mensual/trimestral", requiredFields: ["cuenta", "periodo"], outputFormats: ["pdf", "xlsx"], active: true, icon: "BarChart3", color: "emerald" },
      { id: "fondo-inversion", code: "FNC1101", name: "Ficha de Fondo", industry: "banca", description: "Ficha informativa de fondo de inversión", requiredFields: ["fondo", "participe", "posicion"], outputFormats: ["pdf"], active: true, icon: "TrendingUp", color: "emerald" },
      { id: "hipoteca", code: "HIP-001", name: "Escritura de Hipoteca", industry: "banca", description: "Contrato hipotecario", requiredFields: ["prestatario", "inmueble", "capital"], outputFormats: ["pdf"], active: true, icon: "Home", color: "emerald" },
      { id: "prestamo-personal", code: "PRE-001", name: "Préstamo Personal", industry: "banca", description: "Contrato de préstamo personal", requiredFields: ["prestatario", "capital", "plazo", "tae"], outputFormats: ["pdf"], active: true, icon: "CreditCard", color: "emerald" },
    ],
  },
  {
    id: "salud",
    industry: "salud",
    displayName: "Salud",
    icon: "Stethoscope",
    color: "pink",
    documentTypes: [
      { id: "informe-medico", code: "INF-MED", name: "Informe Médico", industry: "salud", description: "Informe de diagnóstico y tratamiento", requiredFields: ["paciente", "diagnostico", "tratamiento"], outputFormats: ["pdf"], active: true, icon: "FileText", color: "pink" },
      { id: "receta", code: "REC-001", name: "Receta", industry: "salud", description: "Prescripción farmacológica", requiredFields: ["paciente", "medicamento", "posologia"], outputFormats: ["pdf"], active: true, icon: "Pill", color: "pink" },
      { id: "consentimiento", code: "CON-INF", name: "Consentimiento Informado", industry: "salud", description: "Consentimiento para procedimiento médico", requiredFields: ["paciente", "procedimiento", "riesgos"], outputFormats: ["pdf"], active: true, icon: "ShieldCheck", color: "pink" },
    ],
  },
  {
    id: "logistica",
    industry: "logistica",
    displayName: "Logística",
    icon: "Package",
    color: "orange",
    documentTypes: [
      { id: "albaran", code: "ALB-001", name: "Albarán de Entrega", industry: "logistica", description: "Documento de entrega de mercancía", requiredFields: ["remitente", "destinatario", "mercancia"], outputFormats: ["pdf"], active: true, icon: "Package", color: "orange" },
      { id: "factura", code: "FAC-001", name: "Factura", industry: "logistica", description: "Factura comercial", requiredFields: ["emisor", "receptor", "lineas"], outputFormats: ["pdf", "xml"], active: true, icon: "Receipt", color: "orange" },
      { id: "carta-porte", code: "CMR-001", name: "Carta de Porte CMR", industry: "logistica", description: "Documento de transporte internacional de mercancías", requiredFields: ["cargador", "transportista", "mercancia"], outputFormats: ["pdf"], active: true, icon: "Truck", color: "orange" },
    ],
  },
]

// ============ Envelope Configs ============
export const MOCK_ENVELOPES: EnvelopeConfig[] = [
  { id: "env-standard-dl", name: "Sobre DL Estándar", size: "DL", maxWeightGrams: 50, maxDocuments: 4, groupingRule: "by_client" },
  { id: "env-campaign-c5", name: "Sobre C5 Campaña", size: "C5", maxWeightGrams: 100, maxDocuments: 8, groupingRule: "by_postal_code" },
  { id: "env-bulk-c4", name: "Sobre C4 Envíos Grandes", size: "C4", maxWeightGrams: 250, maxDocuments: 20, groupingRule: "by_region" },
  { id: "env-legal-a4", name: "Sobre A4 Legal", size: "A4", maxWeightGrams: 500, maxDocuments: 50, groupingRule: "by_type" },
]

// ============ Print Queues ============
export const MOCK_PRINT_QUEUES: PrintQueue[] = [
  { id: "print-main", printerName: "Xerox AltaLink C8170", location: "Planta 3 - Sala Imprenta", status: "online", documentTypes: ["poliza-hogar", "poliza-auto", "poliza-vida", "resumen-anual"], capacityPagesPerHour: 4800, currentLoad: 620, ip: "10.0.1.50" },
  { id: "print-urgent", printerName: "HP LaserJet Enterprise", location: "Planta 1 - Urgencias", status: "online", documentTypes: ["siniestro"], capacityPagesPerHour: 2400, currentLoad: 45, ip: "10.0.1.51" },
  { id: "print-color", printerName: "Ricoh Pro C7200", location: "Planta 3 - Campañas", status: "online", documentTypes: ["publicidad"], capacityPagesPerHour: 3600, currentLoad: 1200, ip: "10.0.1.52" },
  { id: "print-secondary", printerName: "Xerox VersaLink B7100", location: "Planta 2 - Backup", status: "offline", documentTypes: [], capacityPagesPerHour: 2000, currentLoad: 0, ip: "10.0.1.53" },
]

// ============ Postal Agents ============
export const MOCK_POSTAL_AGENTS: PostalAgent[] = [
  { id: "agent-correos", name: "Correos", type: "correos", regions: ["*"], costPerKg: 2.50, certified: false, hasTracking: true, averageDeliveryDays: 3 },
  { id: "agent-correos-certif", name: "Correos Certificado", type: "correos", regions: ["*"], costPerKg: 5.80, certified: true, hasTracking: true, averageDeliveryDays: 2 },
  { id: "agent-mrw", name: "MRW Urgente", type: "mrw", regions: ["*"], costPerKg: 8.90, certified: true, hasTracking: true, averageDeliveryDays: 1 },
  { id: "agent-seur", name: "SEUR 24h", type: "seur", regions: ["*"], costPerKg: 9.50, certified: true, hasTracking: true, averageDeliveryDays: 1 },
  { id: "agent-ups", name: "UPS Express", type: "ups", regions: ["EU", "INT"], costPerKg: 12.00, certified: true, hasTracking: true, averageDeliveryDays: 2 },
]

// ============ Franking Rules ============
export const MOCK_FRANKING: FrankingRule[] = [
  { id: "f-ord-20", weightMinGrams: 0, weightMaxGrams: 20, serviceType: "ordinario", cost: 0.70, postalAgentId: "agent-correos" },
  { id: "f-ord-50", weightMinGrams: 21, weightMaxGrams: 50, serviceType: "ordinario", cost: 1.05, postalAgentId: "agent-correos" },
  { id: "f-ord-100", weightMinGrams: 51, weightMaxGrams: 100, serviceType: "ordinario", cost: 1.60, postalAgentId: "agent-correos" },
  { id: "f-cert-100", weightMinGrams: 0, weightMaxGrams: 100, serviceType: "certificado", cost: 4.55, postalAgentId: "agent-correos-certif" },
  { id: "f-urg-100", weightMinGrams: 0, weightMaxGrams: 100, serviceType: "urgente", cost: 6.25, postalAgentId: "agent-mrw" },
  { id: "f-urg-500", weightMinGrams: 101, weightMaxGrams: 500, serviceType: "urgente", cost: 9.80, postalAgentId: "agent-mrw" },
]

// ============ Workflows ============
export const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: "wf-poliza-nueva",
    name: "Alta de Póliza Nueva",
    description: "Cuando se recibe un Excel nuevo con pólizas → valida, convierte, genera PDFs, ensobra y envía",
    triggerType: "file_arrival",
    conditions: [
      { field: "extension", operator: "in", value: ["xlsx", "csv"] },
      { field: "location", operator: "equals", value: "/data/inbox/polizas" },
    ],
    actions: [
      { id: "a1", type: "convert", config: { target: "pdf" }, order: 1, description: "Convertir datos a PDF" },
      { id: "a2", type: "extract", config: {}, order: 2, description: "Extraer entidades al Knowledge Graph" },
      { id: "a3", type: "generate", config: { template: "poliza-hogar" }, order: 3, description: "Generar póliza completa" },
      { id: "a4", type: "postprocess", config: { envelope: "env-standard-dl" }, order: 4, description: "Ensobrar" },
      { id: "a5", type: "send", config: { channel: "postal" }, order: 5, description: "Enviar por correo" },
    ],
    processProfileId: "profile-daily",
    active: true,
    lastRun: "2026-04-16T03:00:00Z",
    runCount: 142,
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "wf-siniestro-urgente",
    name: "Siniestro Urgente",
    description: "Siniestros declarados por email → genera documentación y envía por mensajero",
    triggerType: "webhook",
    conditions: [
      { field: "type", operator: "equals", value: "siniestro" },
      { field: "priority", operator: "equals", value: "alta" },
    ],
    actions: [
      { id: "a1", type: "extract", config: {}, order: 1 },
      { id: "a2", type: "generate", config: { template: "siniestro" }, order: 2 },
      { id: "a3", type: "notify", config: { channel: "sms" }, order: 3 },
      { id: "a4", type: "send", config: { agent: "agent-mrw" }, order: 4 },
    ],
    processProfileId: "profile-urgent",
    active: true,
    lastRun: "2026-04-17T08:30:00Z",
    runCount: 23,
    createdAt: "2026-02-01T14:00:00Z",
  },
  {
    id: "wf-campana-renovacion",
    name: "Campaña Renovaciones Primavera",
    description: "Cada lunes → envía recordatorios de renovación a pólizas que vencen en 30 días",
    triggerType: "schedule",
    conditions: [
      { field: "schedule", operator: "equals", value: "0 9 * * 1" },
    ],
    actions: [
      { id: "a1", type: "generate", config: { template: "publicidad", variant: "renovacion" }, order: 1 },
      { id: "a2", type: "send", config: { channel: "email" }, order: 2 },
    ],
    processProfileId: "profile-campaign",
    active: true,
    lastRun: "2026-04-15T09:00:00Z",
    runCount: 12,
    createdAt: "2026-03-01T09:00:00Z",
  },
]

// ============ Document Matches ============
export const MOCK_MATCHES: DocumentMatch[] = [
  { id: "m1", documentId: "doc-1", matchedDocumentId: "doc-5", matchType: "auto_entity", confidence: 0.95, matchReason: "Mismo cliente: Maria Garcia Martinez", sharedEntities: ["person:garcia-martinez"], createdAt: "2026-04-15T10:00:00Z", createdBy: "system" },
  { id: "m2", documentId: "doc-1", matchedDocumentId: "doc-8", matchType: "auto_reference", confidence: 0.88, matchReason: "Referencia cruzada: misma póliza HOG-BCN-2026-00142", sharedEntities: ["policy:hog-bcn-2026-00142"], createdAt: "2026-04-15T10:00:00Z", createdBy: "system" },
  { id: "m3", documentId: "doc-2", matchedDocumentId: "doc-6", matchType: "manual", confidence: 1.0, matchReason: "Vinculación manual por operador", createdAt: "2026-04-16T14:23:00Z", createdBy: "user" },
]

// ============ Spanish cities / regions for audience filtering ============
export const SPANISH_CITIES = [
  "Barcelona", "Madrid", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Murcia", "Palma",
  "Las Palmas", "Bilbao", "Alicante", "Córdoba", "Valladolid", "Vigo", "Gijón", "Vitoria",
  "Granada", "La Coruña", "Pamplona", "Santander", "Toledo", "Salamanca",
]

export const SPANISH_REGIONS = [
  "Cataluña", "Madrid", "Andalucía", "Valencia", "Galicia", "País Vasco", "Castilla y León",
  "Canarias", "Castilla-La Mancha", "Aragón", "Murcia", "Baleares", "Asturias", "Navarra",
  "Extremadura", "Cantabria", "La Rioja",
]
