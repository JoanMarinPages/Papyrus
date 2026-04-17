/**
 * Shared types across multiple Papyrus features.
 * These are frontend-first types that will align with backend schemas when real backend arrives.
 */

// ============ Language ============
export type LanguageCode = "es" | "ca" | "eu" | "gl" | "en"

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  es: "Español",
  ca: "Català",
  eu: "Euskara",
  gl: "Galego",
  en: "English",
}

export const LANGUAGE_LEGACY_CODES: Record<LanguageCode, string> = {
  es: "08",
  ca: "01",
  eu: "02",
  gl: "03",
  en: "09",
}

// ============ Queue / Processing ============
export type QueueStage = "inbox" | "validating" | "processing" | "indexing" | "completed" | "error"

export interface QueueStageInfo {
  stage: QueueStage
  label: string
  description: string
  legacy: string
  color: string
}

export const QUEUE_STAGES: QueueStageInfo[] = [
  {
    stage: "inbox",
    label: "Inbox",
    description: "Documentos recién recibidos, pendientes de validación",
    legacy: "Hot Folder vigilada por ValidatePairDaemon",
    color: "gray",
  },
  {
    stage: "validating",
    label: "Validación",
    description: "Comprobando integridad y completitud del fichero",
    legacy: "ValidatePairDaemon verificaba parejas de ficheros",
    color: "yellow",
  },
  {
    stage: "processing",
    label: "Procesamiento",
    description: "Pipeline RAG: parsing, chunking, conversión, extracción",
    legacy: "ProcessingQueue del sistema de colas Papyrus",
    color: "blue",
  },
  {
    stage: "indexing",
    label: "Indexado",
    description: "Guardando en Knowledge Graph y base vectorial",
    legacy: "Object Space de Papyrus + LGPROCESO",
    color: "purple",
  },
  {
    stage: "completed",
    label: "Completado",
    description: "Listo para usar en generación y consultas",
    legacy: "CompletedQueue",
    color: "green",
  },
  {
    stage: "error",
    label: "Error",
    description: "Falló algún paso — reintento manual o automático",
    legacy: "ErrorQueue",
    color: "red",
  },
]

// ============ File Validation ============
export interface FileValidation {
  isComplete: boolean
  pairFileFound: boolean
  checksum?: string
  validatedAt?: string
  sizeVerified: boolean
  errorMessage?: string
}

// ============ Format Conversion ============
export type DocumentFormat = "pdf" | "docx" | "html" | "postscript" | "afp" | "xml" | "xlsx" | "txt" | "md"

export interface FormatConversion {
  sourceFormat: DocumentFormat
  targetFormat: DocumentFormat
  conversionEngine?: string
  status: "pending" | "converting" | "done" | "error"
}

// ============ Document Types Catalog ============
export interface DocumentTypeDefinition {
  id: string
  code: string           // e.g. "POL-HOG" (equivalent to DVC2801 in legacy)
  name: string
  industry: string       // "seguros", "legal", "banca", "salud", "logistica"
  description: string
  requiredFields: string[]
  outputFormats: DocumentFormat[]
  defaultTemplateId?: string
  icon?: string
  color?: string
  active: boolean
}

export interface IndustryCatalog {
  id: string
  industry: string
  displayName: string
  icon: string
  color: string
  documentTypes: DocumentTypeDefinition[]
}

// ============ Process Profiles (daily / urgent / campaign / ad-hoc) ============
export type ProcessProfileType = "daily" | "urgent" | "campaign" | "adhoc"

export interface ProcessProfile {
  id: string
  name: string
  type: ProcessProfileType
  icon: string
  color: string           // tailwind color name
  priority: number        // 1 (urgent) - 5 (low)
  slaMinutes?: number     // Max processing time in minutes
  schedule: {
    mode: "immediate" | "scheduled" | "batch"
    cron?: string         // e.g. "0 3 * * *" for daily at 03:00
    runAt?: string        // ISO for one-off
  }
  pipelineSteps: string[] // Step IDs/names to apply (subset of full pipeline)
  sendRuleIds: string[]   // Rules to apply
  postprocessing: {
    envelopeConfigId?: string
    printQueueId?: string
    postalAgentId?: string
  }
  notifications: {
    onComplete?: string[] // emails
    onError?: string[]
    channel?: "email" | "sms" | "both"
  }
  active: boolean
  description?: string
}

// ============ Audience Filters (for SendRules) ============
export interface AudienceFilter {
  geographic?: {
    cities?: string[]
    postalCodes?: string[]   // supports ranges like "08001-08050" and prefixes "08xxx"
    regions?: string[]
    countries?: string[]
  }
  demographic?: {
    ageRange?: { min?: number; max?: number }
    policyTypes?: string[]
    policyStatus?: ("active" | "expired" | "pending")[]
    loyaltyYears?: { min?: number; max?: number }
    hasClaimsInLastYear?: boolean
  }
  clientSegment?: string[]    // "premium", "standard", "new"
  language?: LanguageCode[]
  customExpression?: string   // advanced: SQL-lite expression
}

// ============ Workflows / Triggers ============
export type WorkflowTriggerType = "file_arrival" | "document_created" | "schedule" | "manual" | "webhook"

export interface WorkflowCondition {
  field: string
  operator: "equals" | "contains" | "starts_with" | "matches_regex" | "in"
  value: string | string[]
}

export interface WorkflowAction {
  id: string
  type: "convert" | "extract" | "index" | "generate" | "send" | "postprocess" | "notify" | "archive"
  config: Record<string, unknown>
  order: number
  description?: string
}

export interface Workflow {
  id: string
  name: string
  description: string
  triggerType: WorkflowTriggerType
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  processProfileId?: string
  active: boolean
  lastRun?: string
  runCount: number
  createdAt: string
}

// ============ Postprocessing ============
export type EnvelopeSize = "DL" | "C5" | "C4" | "A4"

export interface EnvelopeConfig {
  id: string
  name: string
  size: EnvelopeSize
  maxWeightGrams: number
  maxDocuments: number
  groupingRule: "by_client" | "by_postal_code" | "by_type" | "by_region" | "custom"
  customGroupingExpression?: string
}

export interface PrintQueue {
  id: string
  printerName: string
  location: string
  status: "online" | "offline" | "busy" | "error"
  documentTypes: string[]    // which doc types this printer handles
  capacityPagesPerHour: number
  currentLoad: number
  ip?: string
  driver?: string
}

export type PostalAgentType = "correos" | "mrw" | "seur" | "ups" | "dhl" | "custom"

export interface PostalAgent {
  id: string
  name: string
  type: PostalAgentType
  regions: string[]
  costPerKg: number
  certified: boolean
  hasTracking: boolean
  averageDeliveryDays: number
}

export interface FrankingRule {
  id: string
  weightMinGrams: number
  weightMaxGrams: number
  serviceType: "ordinario" | "certificado" | "urgente"
  cost: number
  postalAgentId: string
}

export type PostprocessingStatus =
  | "pending_envelope"
  | "enveloped"
  | "pending_print"
  | "printed"
  | "pending_sort"
  | "sorted"
  | "ready_to_ship"

export interface PostprocessingItem {
  id: string
  batchId: string
  documentId: string
  clientName: string
  status: PostprocessingStatus
  envelopeId?: string
  printQueueId?: string
  postalAgentId?: string
  estimatedPostage?: number
  weightGrams?: number
  postalCode?: string
  trackingNumber?: string
}

// ============ Document Matching (SIM) ============
export type MatchType = "auto_entity" | "auto_reference" | "manual"

export interface DocumentMatch {
  id: string
  documentId: string
  matchedDocumentId: string
  matchType: MatchType
  confidence: number        // 0-1
  matchReason: string       // e.g. "Mismo cliente", "Referencia cruzada"
  sharedEntities?: string[]
  createdAt: string
  createdBy?: "system" | "user"
}

// ============ Batch Scheduling ============
export interface BatchSchedule {
  id: string
  name: string
  cronExpression: string
  humanReadable: string
  processProfileId: string
  batchConfig: {
    templateId: string
    designId?: string
    rulesIds: string[]
    dataSource: string
  }
  nextRun: string
  lastRun?: string
  active: boolean
}

// ============ Consumption & Production Metrics ============
export interface ProductionMetrics {
  period: string
  pagesGenerated: number
  pagesPrinted: number
  documentsGenerated: number
  documentsSent: number
  costTotal: number
  costPerDocument: number
  costPerPage: number
  byTemplate?: Record<string, number>
  byDocumentType?: Record<string, number>
  byProcessProfile?: Record<string, number>
}
