import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  ChevronRight, ChevronDown, FileText, FileSpreadsheet, FileOutput,
  CheckCircle2, AlertCircle, Clock, Loader2, Pause, RotateCcw,
  Square, Eye, Download, Search, Filter, FileInput, Zap,
  Calendar, User, Hash, Info, ExternalLink, Copy, X,
} from "lucide-react"

// --- Types ---
type DocStatus = "queued" | "processing" | "completed" | "error" | "paused" | "cancelled"

interface InputFile {
  name: string
  type: string
  size: string
  rows?: number
  path?: string
  preview?: string[]
}

interface OutputFile {
  name: string
  type: string
  size: string
  pages?: number
  status: "ready" | "generating" | "error"
  previewUrl?: string
}

interface ProcessingStep {
  name: string
  status: DocStatus
  startedAt?: string
  completedAt?: string
  duration?: string
  details?: string
  logs?: string[]
}

interface ProcessedDocument {
  id: string
  clientName: string
  clientId: string
  documentType: string
  policyNumber?: string
  status: DocStatus
  priority: number
  inputFiles: InputFile[]
  outputFiles: OutputFile[]
  steps: ProcessingStep[]
  createdAt: string
  completedAt?: string
  error?: string
  retryCount: number
  batchId: string
}

// --- Status config ---
const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  queued: { label: "En cola", color: "border-gray-500/20 bg-gray-500/10 text-gray-400", icon: Clock },
  processing: { label: "Procesando", color: "border-blue-500/20 bg-blue-500/10 text-blue-500", icon: Loader2 },
  completed: { label: "Completado", color: "border-green-500/20 bg-green-500/10 text-green-500", icon: CheckCircle2 },
  error: { label: "Error", color: "border-red-500/20 bg-red-500/10 text-red-500", icon: AlertCircle },
  paused: { label: "Pausado", color: "border-yellow-500/20 bg-yellow-500/10 text-yellow-500", icon: Pause },
  cancelled: { label: "Cancelado", color: "border-gray-500/20 bg-gray-500/10 text-gray-500", icon: Square },
}

// --- Mock data ---
const MOCK_DOCUMENTS: ProcessedDocument[] = [
  {
    id: "proc-1", clientName: "Maria Garcia Martinez", clientId: "c1",
    documentType: "Poliza Hogar", policyNumber: "HOG-BCN-2026-00142",
    status: "completed", priority: 1, retryCount: 0, batchId: "BATCH-2026-0415",
    createdAt: "10/04/2026 09:00", completedAt: "10/04/2026 09:02",
    inputFiles: [
      { name: "clientes_axa_abril.xlsx", type: "XLSX", size: "245 KB", rows: 500, path: "/data/inbox/clientes_axa_abril.xlsx", preview: ["Fila 1: Maria Garcia Martinez, 43.567.891-K, Calle Mallorca 234", "Fila 2: Carlos Lopez Fernandez, 28.345.678-L", "Fila 3: Pedro Sanchez Ruiz, 51.234.567-M", "... (500 filas total)"] },
      { name: "template_poliza_hogar.json", type: "JSON", size: "12 KB", path: "/data/templates/template_poliza_hogar.json", preview: ['{ "name": "Poliza de Hogar",', '  "sections": ["datos_tomador", "coberturas", "contrato", "extras"],', '  "industry": "seguros",', '  "language": "es" }'] },
      { name: "diseno_corporativo_axa.json", type: "JSON", size: "3 KB", path: "/data/templates/diseno_corporativo_axa.json", preview: ['{ "brand": "AXA Seguros",', '  "primaryColor": "#1e3a8a",', '  "header": "banner",', '  "footer": "legal_disclaimer" }'] },
    ],
    outputFiles: [
      { name: "poliza_hogar_garcia_martinez.pdf", type: "PDF", size: "185 KB", pages: 3, status: "ready", previewUrl: "/preview?type=poliza&client=c1" },
      { name: "carta_presentacion_garcia.pdf", type: "PDF", size: "42 KB", pages: 1, status: "ready", previewUrl: "/preview?type=poliza&client=c1" },
    ],
    steps: [
      { name: "Lectura de datos", status: "completed", startedAt: "09:00:00", completedAt: "09:00:02", duration: "2s", details: "Fila 1/500 del Excel", logs: ["[09:00:00] Abriendo fichero clientes_axa_abril.xlsx", "[09:00:01] Parseando fila 1: Maria Garcia Martinez", "[09:00:02] Datos extraidos: nombre, dni, direccion, ciudad, poliza"] },
      { name: "Clasificacion", status: "completed", startedAt: "09:00:02", completedAt: "09:00:03", duration: "1s", details: "Tipo: poliza (confianza: 100%)", logs: ["[09:00:02] Analizando tipo documental...", "[09:00:03] Clasificado como: poliza_hogar (confianza: 100%)"] },
      { name: "Aplicacion de template", status: "completed", startedAt: "09:00:03", completedAt: "09:00:08", duration: "5s", details: "8 secciones generadas", logs: ["[09:00:03] Cargando template: template_poliza_hogar.json", "[09:00:04] Generando seccion: datos_tomador", "[09:00:05] Generando seccion: coberturas (6 coberturas)", "[09:00:06] Generando seccion: contrato", "[09:00:07] Generando seccion: extras", "[09:00:08] 8 secciones completadas"] },
      { name: "Aplicacion de diseno", status: "completed", startedAt: "09:00:08", completedAt: "09:00:12", duration: "4s", details: "Corporativo AXA, banner header", logs: ["[09:00:08] Aplicando diseno: diseno_corporativo_axa.json", "[09:00:10] Header: banner AXA", "[09:00:11] Footer: disclaimer legal", "[09:00:12] Diseno aplicado correctamente"] },
      { name: "Generacion PDF", status: "completed", startedAt: "09:00:12", completedAt: "09:00:18", duration: "6s", details: "3 paginas, 185 KB", logs: ["[09:00:12] Iniciando render PDF", "[09:00:14] Pagina 1/3 renderizada", "[09:00:16] Pagina 2/3 renderizada", "[09:00:17] Pagina 3/3 renderizada", "[09:00:18] PDF generado: 185 KB"] },
      { name: "Carta de presentacion", status: "completed", startedAt: "09:00:18", completedAt: "09:00:22", duration: "4s", details: "1 pagina, 42 KB", logs: ["[09:00:18] Generando carta de presentacion", "[09:00:22] Carta generada: 1 pagina, 42 KB"] },
      { name: "Marcas OMR", status: "completed", startedAt: "09:00:22", completedAt: "09:00:23", duration: "1s", details: "3 marcas insertadas", logs: ["[09:00:22] Insertando marcas OMR en paginas 1-3", "[09:00:23] 3 marcas OMR insertadas"] },
      { name: "Validacion final", status: "completed", startedAt: "09:00:23", completedAt: "09:00:24", duration: "1s", details: "OK - sin errores", logs: ["[09:00:23] Validando integridad del documento", "[09:00:24] Validacion OK: 0 errores, 0 advertencias"] },
    ],
  },
  {
    id: "proc-2", clientName: "Carlos Lopez Fernandez", clientId: "c2",
    documentType: "Poliza Vida", policyNumber: "VID-MAD-2026-00567",
    status: "completed", priority: 1, retryCount: 0, batchId: "BATCH-2026-0415",
    createdAt: "10/04/2026 09:00", completedAt: "10/04/2026 09:03",
    inputFiles: [
      { name: "clientes_axa_abril.xlsx", type: "XLSX", size: "245 KB", rows: 500 },
      { name: "template_poliza_vida.json", type: "JSON", size: "10 KB" },
    ],
    outputFiles: [
      { name: "poliza_vida_lopez_fernandez.pdf", type: "PDF", size: "156 KB", pages: 2, status: "ready", previewUrl: "/preview?type=poliza&client=c2" },
      { name: "carta_presentacion_lopez.pdf", type: "PDF", size: "38 KB", pages: 1, status: "ready", previewUrl: "/preview?type=poliza&client=c2" },
    ],
    steps: [
      { name: "Lectura de datos", status: "completed", duration: "2s", details: "Fila 2/500", logs: ["[09:00:24] Parseando fila 2: Carlos Lopez Fernandez"] },
      { name: "Clasificacion", status: "completed", duration: "1s", details: "Tipo: poliza (100%)" },
      { name: "Aplicacion de template", status: "completed", duration: "4s", details: "6 secciones" },
      { name: "Generacion PDF", status: "completed", duration: "5s", details: "2 paginas" },
      { name: "Validacion final", status: "completed", duration: "1s", details: "OK" },
    ],
  },
  {
    id: "proc-3", clientName: "Pedro Sanchez Ruiz", clientId: "c3",
    documentType: "Poliza Auto", policyNumber: "AUT-SEV-2026-01102",
    status: "processing", priority: 1, retryCount: 0, batchId: "BATCH-2026-0415",
    createdAt: "10/04/2026 09:00",
    inputFiles: [
      { name: "clientes_axa_abril.xlsx", type: "XLSX", size: "245 KB", rows: 500 },
      { name: "template_poliza_auto.json", type: "JSON", size: "11 KB" },
    ],
    outputFiles: [
      { name: "poliza_auto_sanchez_ruiz.pdf", type: "PDF", size: "-", status: "generating" },
    ],
    steps: [
      { name: "Lectura de datos", status: "completed", duration: "2s", details: "Fila 3/500" },
      { name: "Clasificacion", status: "completed", duration: "1s", details: "Tipo: poliza (100%)" },
      { name: "Aplicacion de template", status: "completed", duration: "5s", details: "7 secciones" },
      { name: "Generacion PDF", status: "processing", details: "Generando pagina 2...", logs: ["[09:03:12] Iniciando render PDF", "[09:03:14] Pagina 1/3 renderizada", "[09:03:16] Renderizando pagina 2..."] },
      { name: "Validacion final", status: "queued" },
    ],
  },
  {
    id: "proc-4", clientName: "Laura Martinez Torres", clientId: "c4",
    documentType: "Poliza Vida", policyNumber: "VID-VLC-2026-00890",
    status: "error", priority: 1, retryCount: 1, batchId: "BATCH-2026-0415",
    createdAt: "10/04/2026 09:00",
    error: "Error en la generacion PDF: campo 'beneficiarios' vacio en la fila 4 del Excel. Se requiere al menos un beneficiario para polizas de vida.",
    inputFiles: [
      { name: "clientes_axa_abril.xlsx", type: "XLSX", size: "245 KB", rows: 500 },
      { name: "template_poliza_vida.json", type: "JSON", size: "10 KB" },
    ],
    outputFiles: [
      { name: "poliza_vida_martinez_torres.pdf", type: "PDF", size: "-", status: "error" },
    ],
    steps: [
      { name: "Lectura de datos", status: "completed", duration: "2s", details: "Fila 4/500" },
      { name: "Clasificacion", status: "completed", duration: "1s", details: "Tipo: poliza (100%)" },
      { name: "Aplicacion de template", status: "completed", duration: "4s" },
      { name: "Generacion PDF", status: "error", details: "Campo 'beneficiarios' vacio", logs: ["[09:03:30] Iniciando render PDF", "[09:03:31] ERROR: campo 'beneficiarios' es obligatorio", "[09:03:31] Abortando generacion"] },
      { name: "Validacion final", status: "cancelled" },
    ],
  },
  {
    id: "proc-5", clientName: "Elena Rodriguez Diaz", clientId: "c5",
    documentType: "Poliza Comercio", policyNumber: "COM-VLC-2026-00456",
    status: "queued", priority: 2, retryCount: 0, batchId: "BATCH-2026-0415",
    createdAt: "10/04/2026 09:00",
    inputFiles: [
      { name: "clientes_axa_abril.xlsx", type: "XLSX", size: "245 KB", rows: 500 },
      { name: "template_poliza_comercio.json", type: "JSON", size: "14 KB" },
    ],
    outputFiles: [],
    steps: [
      { name: "Lectura de datos", status: "queued" },
      { name: "Clasificacion", status: "queued" },
      { name: "Aplicacion de template", status: "queued" },
      { name: "Generacion PDF", status: "queued" },
      { name: "Validacion final", status: "queued" },
    ],
  },
]

// --- Component ---
export default function ProcessingDetailPage() {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS)
  const [expandedDoc, setExpandedDoc] = useState<string | null>("proc-1")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Detail dialogs
  const [selectedInputFile, setSelectedInputFile] = useState<{ file: InputFile; docName: string } | null>(null)
  const [selectedStep, setSelectedStep] = useState<{ step: ProcessingStep; docName: string } | null>(null)
  const [selectedOutputFile, setSelectedOutputFile] = useState<{ file: OutputFile; doc: ProcessedDocument } | null>(null)

  const filtered = documents.filter((d) => {
    if (statusFilter !== "all" && d.status !== statusFilter) return false
    if (searchTerm && !d.clientName.toLowerCase().includes(searchTerm.toLowerCase()) && !d.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const retryDoc = (id: string) => {
    setDocuments((prev) => prev.map((d) => d.id === id ? {
      ...d, status: "queued" as DocStatus, error: undefined, retryCount: d.retryCount + 1,
      steps: d.steps.map((s) => ({ ...s, status: "queued" as DocStatus })),
    } : d))
  }

  const pauseDoc = (id: string) => {
    setDocuments((prev) => prev.map((d) => d.id === id ? { ...d, status: "paused" as DocStatus } : d))
  }

  const cancelDoc = (id: string) => {
    setDocuments((prev) => prev.map((d) => d.id === id ? { ...d, status: "cancelled" as DocStatus } : d))
  }

  const handleDownload = (fileName: string) => {
    // Simulate download
    const a = document.createElement("a")
    a.href = "#"
    a.download = fileName
    const blob = new Blob([`[Contenido simulado de ${fileName}]`], { type: "application/octet-stream" })
    a.href = URL.createObjectURL(blob)
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const counts = {
    total: documents.length,
    completed: documents.filter((d) => d.status === "completed").length,
    processing: documents.filter((d) => d.status === "processing").length,
    error: documents.filter((d) => d.status === "error").length,
    queued: documents.filter((d) => d.status === "queued").length,
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header title="Detalle de Procesamiento" description="Estado documento a documento" />
        <div className="p-6">
          {/* Summary */}
          <div className="grid gap-3 sm:grid-cols-5">
            {[
              { label: "Total", value: counts.total, color: "text-foreground", icon: FileText },
              { label: "Completados", value: counts.completed, color: "text-green-500", icon: CheckCircle2 },
              { label: "Procesando", value: counts.processing, color: "text-blue-500", icon: Loader2 },
              { label: "Errores", value: counts.error, color: "text-red-500", icon: AlertCircle },
              { label: "En cola", value: counts.queued, color: "text-gray-400", icon: Clock },
            ].map((s) => (
              <Card key={s.label} className="border-border bg-card">
                <CardContent className="flex items-center gap-3 p-3">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                  <div>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="mt-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por cliente o poliza..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
                <SelectItem value="processing">Procesando</SelectItem>
                <SelectItem value="error">Errores</SelectItem>
                <SelectItem value="queued">En cola</SelectItem>
                <SelectItem value="paused">Pausados</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-xs">{documents[0]?.batchId}</Badge>
          </div>

          {/* Document list */}
          <div className="mt-4 space-y-2">
            {filtered.map((doc) => {
              const isExpanded = expandedDoc === doc.id
              const statusConf = STATUS_CONFIG[doc.status]
              const completedSteps = doc.steps.filter((s) => s.status === "completed").length
              const progress = (completedSteps / doc.steps.length) * 100

              return (
                <Card key={doc.id} className="border-border bg-card">
                  {/* Row header */}
                  <button
                    onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                    className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/20"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{doc.clientName}</span>
                        <span className="text-xs text-muted-foreground">{doc.documentType}</span>
                        {doc.policyNumber && <span className="font-mono text-[10px] text-muted-foreground">{doc.policyNumber}</span>}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                          <div className={`h-full rounded-full transition-all ${doc.status === "error" ? "bg-red-500" : doc.status === "completed" ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{completedSteps}/{doc.steps.length}</span>
                      </div>
                    </div>
                    {doc.retryCount > 0 && (
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        <RotateCcw className="mr-1 h-2.5 w-2.5" />{doc.retryCount}
                      </Badge>
                    )}
                    <Badge variant="outline" className={`shrink-0 text-xs ${statusConf.color}`}>
                      {doc.status === "processing" && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                      {statusConf.label}
                    </Badge>
                    <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
                      {doc.status === "error" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => retryDoc(doc.id)} title="Reintentar">
                          <RotateCcw className="h-3.5 w-3.5 text-primary" />
                        </Button>
                      )}
                      {doc.status === "processing" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => pauseDoc(doc.id)} title="Pausar">
                          <Pause className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {(doc.status === "queued" || doc.status === "processing") && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => cancelDoc(doc.id)} title="Cancelar">
                          <Square className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      )}
                      {doc.status === "completed" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/preview?type=poliza&client=${doc.clientId}`)} title="Ver">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Descargar" onClick={() => handleDownload(`${doc.documentType.toLowerCase().replace(/ /g, "_")}_${doc.clientName.toLowerCase().replace(/ /g, "_")}.pdf`)}>
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-border bg-secondary/10 p-4">
                      <div className="grid gap-4 lg:grid-cols-3">
                        {/* Input files */}
                        <div>
                          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <FileInput className="h-3.5 w-3.5" /> Ficheros de entrada ({doc.inputFiles.length})
                          </p>
                          <div className="space-y-1.5">
                            {doc.inputFiles.map((f, i) => (
                              <div
                                key={i}
                                className="flex cursor-pointer items-center gap-2 rounded border border-border bg-background p-2 text-xs transition-colors hover:border-primary/40 hover:bg-primary/5"
                                onClick={() => setSelectedInputFile({ file: f, docName: doc.clientName })}
                              >
                                <FileSpreadsheet className="h-3.5 w-3.5 shrink-0 text-green-500" />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium text-foreground">{f.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{f.type} · {f.size}{f.rows ? ` · ${f.rows} filas` : ""}</p>
                                </div>
                                <Eye className="h-3 w-3 shrink-0 text-muted-foreground" />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Processing steps */}
                        <div>
                          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <Zap className="h-3.5 w-3.5" /> Pasos del proceso ({doc.steps.length})
                          </p>
                          <div className="space-y-1">
                            {doc.steps.map((step, i) => (
                              <div
                                key={i}
                                className="flex cursor-pointer items-center gap-2 rounded border border-border bg-background p-2 text-xs transition-colors hover:border-primary/40 hover:bg-primary/5"
                                onClick={() => setSelectedStep({ step, docName: doc.clientName })}
                              >
                                {step.status === "processing" ? (
                                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-blue-500" />
                                ) : step.status === "completed" ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                                ) : step.status === "error" ? (
                                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                                ) : (
                                  <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-foreground">{step.name}</p>
                                  {step.details && <p className="text-[10px] text-muted-foreground">{step.details}</p>}
                                </div>
                                {step.duration && <span className="shrink-0 text-[10px] text-muted-foreground">{step.duration}</span>}
                                {step.logs && <Info className="h-3 w-3 shrink-0 text-muted-foreground" />}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Output files */}
                        <div>
                          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <FileOutput className="h-3.5 w-3.5" /> Ficheros de salida ({doc.outputFiles.length})
                          </p>
                          <div className="space-y-1.5">
                            {doc.outputFiles.length === 0 && (
                              <p className="py-2 text-center text-[10px] text-muted-foreground">Sin ficheros generados aun</p>
                            )}
                            {doc.outputFiles.map((f, i) => (
                              <div
                                key={i}
                                className={`flex items-center gap-2 rounded border border-border bg-background p-2 text-xs transition-colors ${f.status === "ready" ? "cursor-pointer hover:border-primary/40 hover:bg-primary/5" : ""}`}
                                onClick={() => f.status === "ready" && setSelectedOutputFile({ file: f, doc })}
                              >
                                <FileOutput className={`h-3.5 w-3.5 shrink-0 ${f.status === "ready" ? "text-primary" : f.status === "error" ? "text-red-500" : "text-yellow-500"}`} />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium text-foreground">{f.name}</p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {f.type} · {f.size}{f.pages ? ` · ${f.pages} pag.` : ""}
                                  </p>
                                </div>
                                {f.status === "ready" && (
                                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigate(f.previewUrl || `/preview?type=poliza&client=${doc.clientId}`)} title="Ver documento">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDownload(f.name)} title="Descargar">
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                                {f.status === "generating" && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                                {f.status === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Error message */}
                      {doc.error && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                          <div>
                            <p className="font-medium text-red-500">Error en el procesamiento</p>
                            <p className="mt-0.5 text-red-400">{doc.error}</p>
                          </div>
                          <Button size="sm" variant="outline" className="ml-auto shrink-0 gap-1 text-xs" onClick={() => retryDoc(doc.id)}>
                            <RotateCcw className="h-3 w-3" /> Reintentar
                          </Button>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Creado: {doc.createdAt}</span>
                        {doc.completedAt && <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Completado: {doc.completedAt}</span>}
                        <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{doc.batchId}</span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{doc.clientId}</span>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      </main>

      {/* --- Input File Detail Dialog --- */}
      <Dialog open={!!selectedInputFile} onOpenChange={() => setSelectedInputFile(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-4 w-4 text-green-500" />
              {selectedInputFile?.file.name}
            </DialogTitle>
          </DialogHeader>
          {selectedInputFile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <p className="font-medium">{selectedInputFile.file.type}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Tamano</p>
                  <p className="font-medium">{selectedInputFile.file.size}</p>
                </div>
                {selectedInputFile.file.rows && (
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Filas</p>
                    <p className="font-medium">{selectedInputFile.file.rows}</p>
                  </div>
                )}
                {selectedInputFile.file.path && (
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Ruta</p>
                    <p className="truncate font-mono text-xs">{selectedInputFile.file.path}</p>
                  </div>
                )}
              </div>
              {selectedInputFile.file.preview && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">Vista previa del contenido</p>
                  <div className="rounded-lg bg-black/40 p-3 font-mono text-xs leading-relaxed text-green-400">
                    {selectedInputFile.file.preview.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                {selectedInputFile.file.path && (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
                    navigator.clipboard.writeText(selectedInputFile.file.path || "")
                  }}>
                    <Copy className="h-3.5 w-3.5" /> Copiar ruta
                  </Button>
                )}
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleDownload(selectedInputFile.file.name)}>
                  <Download className="h-3.5 w-3.5" /> Descargar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- Step Detail Dialog --- */}
      <Dialog open={!!selectedStep} onOpenChange={() => setSelectedStep(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-primary" />
              {selectedStep?.step.name}
            </DialogTitle>
          </DialogHeader>
          {selectedStep && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <Badge variant="outline" className={STATUS_CONFIG[selectedStep.step.status].color}>
                    {STATUS_CONFIG[selectedStep.step.status].label}
                  </Badge>
                </div>
                {selectedStep.step.duration && (
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Duracion</p>
                    <p className="font-medium">{selectedStep.step.duration}</p>
                  </div>
                )}
                {selectedStep.step.startedAt && (
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Inicio</p>
                    <p className="font-mono text-xs">{selectedStep.step.startedAt}</p>
                  </div>
                )}
                {selectedStep.step.completedAt && (
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Fin</p>
                    <p className="font-mono text-xs">{selectedStep.step.completedAt}</p>
                  </div>
                )}
              </div>
              {selectedStep.step.details && (
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Detalle</p>
                  <p className="text-sm">{selectedStep.step.details}</p>
                </div>
              )}
              {selectedStep.step.logs && selectedStep.step.logs.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">Logs de ejecucion</p>
                  <div className="max-h-48 overflow-y-auto rounded-lg bg-black/40 p-3 font-mono text-[11px] leading-relaxed">
                    {selectedStep.step.logs.map((log, i) => (
                      <div key={i} className={log.includes("ERROR") ? "text-red-400" : "text-green-400"}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- Output File Detail Dialog --- */}
      <Dialog open={!!selectedOutputFile} onOpenChange={() => setSelectedOutputFile(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileOutput className="h-4 w-4 text-primary" />
              {selectedOutputFile?.file.name}
            </DialogTitle>
          </DialogHeader>
          {selectedOutputFile && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <p className="font-medium">{selectedOutputFile.file.type}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Tamano</p>
                  <p className="font-medium">{selectedOutputFile.file.size}</p>
                </div>
                {selectedOutputFile.file.pages && (
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Paginas</p>
                    <p className="font-medium">{selectedOutputFile.file.pages}</p>
                  </div>
                )}
              </div>
              <div className="rounded-lg border border-border bg-secondary/20 p-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">Vista previa del documento</p>
                <p className="text-xs text-muted-foreground">
                  {selectedOutputFile.file.pages} pagina(s) · {selectedOutputFile.file.size}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
                  setSelectedOutputFile(null)
                  navigate(selectedOutputFile.file.previewUrl || `/preview?type=poliza&client=${selectedOutputFile.doc.clientId}`)
                }}>
                  <ExternalLink className="h-3.5 w-3.5" /> Ver completo
                </Button>
                <Button size="sm" className="gap-1.5" onClick={() => handleDownload(selectedOutputFile.file.name)}>
                  <Download className="h-3.5 w-3.5" /> Descargar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
