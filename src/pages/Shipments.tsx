import { useState, useCallback } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronRight,
  ChevronDown,
  Package,
  FileText,
  Printer,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Pause,
  Search,
  Filter,
  Send,
  Building2,
  MapPin,
  Calendar,
  Hash,
  Eye,
  RefreshCw,
  XCircle,
} from "lucide-react"

// --- Types ---
interface PrintInfo {
  printer: string
  location: string
  machine: string
  responsible: string
  printedAt: string
  copies: number
}

interface ShipmentDocument {
  id: string
  name: string
  type: string
  pages: number
  status: "sent" | "delivered" | "error" | "pending"
  recipient: string
  recipientEmail: string
  sentAt: string
  deliveredAt: string | null
  error: string | null
  print: PrintInfo | null
}

interface Batch {
  id: string
  code: string
  name: string
  status: "completed" | "processing" | "paused" | "error" | "partial"
  createdAt: string
  completedAt: string | null
  totalDocs: number
  sentDocs: number
  errorDocs: number
  client: string
  department: string
  documents: ShipmentDocument[] | null // null = not loaded yet (lazy)
}

// --- Status helpers ---
const BATCH_STATUS: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  completed: { label: "Completado", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
  processing: { label: "En proceso", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Loader2 },
  paused: { label: "Pausado", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Pause },
  error: { label: "Con errores", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: AlertCircle },
  partial: { label: "Parcial", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: RefreshCw },
}

const DOC_STATUS: Record<string, { label: string; color: string }> = {
  sent: { label: "Enviado", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  delivered: { label: "Entregado", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  error: { label: "Error", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  pending: { label: "Pendiente", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
}

// --- Mock data ---
const MOCK_BATCHES: Batch[] = [
  {
    id: "b1", code: "BATCH-2026-0412", name: "Contratos Q2 - Cliente Meridian",
    status: "completed", createdAt: "2026-04-05T09:30:00Z", completedAt: "2026-04-05T11:45:00Z",
    totalDocs: 12, sentDocs: 12, errorDocs: 0, client: "Meridian Corp", department: "Legal",
    documents: null,
  },
  {
    id: "b2", code: "BATCH-2026-0411", name: "Propuestas comerciales Abril",
    status: "processing", createdAt: "2026-04-05T14:00:00Z", completedAt: null,
    totalDocs: 8, sentDocs: 5, errorDocs: 0, client: "Varios", department: "Ventas",
    documents: null,
  },
  {
    id: "b3", code: "BATCH-2026-0410", name: "Informes auditoria interna",
    status: "error", createdAt: "2026-04-04T10:00:00Z", completedAt: null,
    totalDocs: 6, sentDocs: 4, errorDocs: 2, client: "Internal", department: "Compliance",
    documents: null,
  },
  {
    id: "b4", code: "BATCH-2026-0409", name: "Politicas RRHH actualizadas",
    status: "paused", createdAt: "2026-04-03T16:30:00Z", completedAt: null,
    totalDocs: 15, sentDocs: 7, errorDocs: 0, client: "Internal", department: "RRHH",
    documents: null,
  },
  {
    id: "b5", code: "BATCH-2026-0408", name: "Manuales tecnicos v3.2",
    status: "completed", createdAt: "2026-04-02T08:00:00Z", completedAt: "2026-04-02T09:15:00Z",
    totalDocs: 4, sentDocs: 4, errorDocs: 0, client: "TechNova S.L.", department: "Producto",
    documents: null,
  },
  {
    id: "b6", code: "BATCH-2026-0407", name: "Contratos proveedores Q1",
    status: "partial", createdAt: "2026-04-01T11:00:00Z", completedAt: "2026-04-01T14:30:00Z",
    totalDocs: 20, sentDocs: 18, errorDocs: 2, client: "Multi-proveedor", department: "Compras",
    documents: null,
  },
]

function generateMockDocuments(batch: Batch): ShipmentDocument[] {
  const names = [
    "Contrato de servicios", "Propuesta comercial", "Informe de auditoria",
    "Politica interna", "Manual tecnico", "Acuerdo NDA", "Factura proforma",
    "Acta de reunion", "Memoria anual", "Certificado de calidad",
    "Pliego de condiciones", "Orden de compra", "Presupuesto detallado",
    "Informe de riesgos", "Plan estrategico", "Protocolo de seguridad",
    "Convenio marco", "Anexo tecnico", "Carta de intencion", "Dictamen legal",
  ]
  const recipients = [
    { name: "Carlos Martinez", email: "carlos@meridian.com" },
    { name: "Ana Lopez", email: "ana.lopez@technova.es" },
    { name: "Pedro Garcia", email: "pgarcia@empresa.com" },
    { name: "Maria Fernandez", email: "mfernandez@corp.com" },
    { name: "Luis Sanchez", email: "lsanchez@proveedor.es" },
  ]
  const printers = ["HP LaserJet Pro M404", "Xerox VersaLink C405", "Canon imageCLASS MF743", "Epson WorkForce Pro"]
  const locations = ["Oficina Central - Planta 2", "Almacen Norte", "Despacho Direccion", "Sala de Reprografia"]
  const machines = ["IMP-001", "IMP-003", "IMP-007", "IMP-012"]
  const responsibles = ["Joan Marin", "Laura Ruiz", "David Torres", "Sofia Blanco"]

  const docs: ShipmentDocument[] = []
  for (let i = 0; i < batch.totalDocs; i++) {
    const isError = i >= batch.totalDocs - batch.errorDocs && batch.errorDocs > 0
    const isSent = i < batch.sentDocs && !isError
    const recipient = recipients[i % recipients.length]
    const hasPrint = Math.random() > 0.3

    docs.push({
      id: `${batch.id}-d${i}`,
      name: `${names[i % names.length]} - ${batch.client}`,
      type: ["PDF", "DOCX", "PDF", "PDF"][i % 4],
      pages: Math.floor(Math.random() * 20) + 2,
      status: isError ? "error" : isSent ? (Math.random() > 0.3 ? "delivered" : "sent") : "pending",
      recipient: recipient.name,
      recipientEmail: recipient.email,
      sentAt: isSent || isError ? new Date(new Date(batch.createdAt).getTime() + i * 300000).toISOString() : "",
      deliveredAt: isSent && Math.random() > 0.3
        ? new Date(new Date(batch.createdAt).getTime() + i * 300000 + 600000).toISOString()
        : null,
      error: isError
        ? ["Timeout de conexion con el servidor de correo", "Direccion de email invalida", "Documento corrupto - fallo en la generacion PDF", "Cuota de envio excedida"][i % 4]
        : null,
      print: hasPrint
        ? {
            printer: printers[i % printers.length],
            location: locations[i % locations.length],
            machine: machines[i % machines.length],
            responsible: responsibles[i % responsibles.length],
            printedAt: new Date(new Date(batch.createdAt).getTime() + i * 200000).toISOString(),
            copies: Math.floor(Math.random() * 3) + 1,
          }
        : null,
    })
  }
  return docs
}

function formatDate(iso: string) {
  if (!iso) return "-"
  const d = new Date(iso)
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

// --- Components ---

function DocumentPrintDetail({ print }: { print: PrintInfo }) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border border-border bg-background p-3 text-xs md:grid-cols-3">
      <div className="flex items-center gap-2">
        <Printer className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">Impresora:</span>
        <span className="font-medium text-foreground">{print.printer}</span>
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">Ubicacion:</span>
        <span className="font-medium text-foreground">{print.location}</span>
      </div>
      <div className="flex items-center gap-2">
        <Hash className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">Maquina:</span>
        <span className="font-medium text-foreground">{print.machine}</span>
      </div>
      <div className="flex items-center gap-2">
        <User className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">Responsable:</span>
        <span className="font-medium text-foreground">{print.responsible}</span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">Impreso:</span>
        <span className="font-medium text-foreground">{formatDate(print.printedAt)}</span>
      </div>
      <div className="flex items-center gap-2">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">Copias:</span>
        <span className="font-medium text-foreground">{print.copies}</span>
      </div>
    </div>
  )
}

function DocumentRow({ doc }: { doc: ShipmentDocument }) {
  const [expanded, setExpanded] = useState(false)
  const status = DOC_STATUS[doc.status]

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/30"
      >
        {expanded ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{doc.name}</span>
        <Badge variant="outline" className="shrink-0 text-xs">{doc.type}</Badge>
        <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">{doc.pages} pag.</span>
        <div className="hidden shrink-0 items-center gap-1.5 md:flex">
          <Send className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{doc.recipient}</span>
        </div>
        <Badge variant="outline" className={`shrink-0 border text-xs ${status.color}`}>{status.label}</Badge>
      </button>

      {expanded && (
        <div className="space-y-3 bg-secondary/10 px-11 pb-4 pt-1">
          {/* Document detail */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs md:grid-cols-3">
            <div>
              <span className="text-muted-foreground">Destinatario:</span>{" "}
              <span className="font-medium text-foreground">{doc.recipient}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>{" "}
              <span className="font-medium text-foreground">{doc.recipientEmail}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Enviado:</span>{" "}
              <span className="font-medium text-foreground">{formatDate(doc.sentAt)}</span>
            </div>
            {doc.deliveredAt && (
              <div>
                <span className="text-muted-foreground">Entregado:</span>{" "}
                <span className="font-medium text-foreground">{formatDate(doc.deliveredAt)}</span>
              </div>
            )}
          </div>

          {/* Error */}
          {doc.error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <div>
                <p className="font-medium text-red-500">Error en el envio</p>
                <p className="mt-0.5 text-red-400">{doc.error}</p>
              </div>
            </div>
          )}

          {/* Print info */}
          {doc.print && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Informacion de impresion</p>
              <DocumentPrintDetail print={doc.print} />
            </div>
          )}
          {!doc.print && (
            <p className="text-xs italic text-muted-foreground">No se ha impreso este documento</p>
          )}
        </div>
      )}
    </div>
  )
}

function BatchCard({ batch: initialBatch }: { batch: Batch }) {
  const [expanded, setExpanded] = useState(false)
  const [batch, setBatch] = useState(initialBatch)
  const [loading, setLoading] = useState(false)
  const statusInfo = BATCH_STATUS[batch.status]
  const StatusIcon = statusInfo.icon
  const progress = batch.totalDocs > 0 ? (batch.sentDocs / batch.totalDocs) * 100 : 0

  const handleExpand = useCallback(() => {
    if (!expanded && !batch.documents) {
      // Lazy load documents
      setLoading(true)
      setExpanded(true)
      setTimeout(() => {
        setBatch((prev) => ({ ...prev, documents: generateMockDocuments(prev) }))
        setLoading(false)
      }, 600)
    } else {
      setExpanded(!expanded)
    }
  }, [expanded, batch.documents])

  return (
    <Card className="border-border bg-card">
      {/* Batch header - Level 1 */}
      <button
        onClick={handleExpand}
        className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-secondary/20"
      >
        {expanded
          ? <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
          : <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        }
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{batch.name}</span>
            <span className="text-xs text-muted-foreground">{batch.code}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{batch.client}</span>
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{batch.department}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(batch.createdAt)}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
          <span className="text-xs text-muted-foreground">{batch.sentDocs}/{batch.totalDocs} docs</span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {batch.errorDocs > 0 && (
          <Badge variant="outline" className="shrink-0 border-red-500/20 bg-red-500/10 text-xs text-red-500">
            {batch.errorDocs} errores
          </Badge>
        )}

        <Badge variant="outline" className={`shrink-0 border text-xs ${statusInfo.color}`}>
          {batch.status === "processing" && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          {statusInfo.label}
        </Badge>
      </button>

      {/* Expanded - Documents list - Level 2 */}
      {expanded && (
        <div className="border-t border-border">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Cargando documentos...</span>
            </div>
          ) : (
            <>
              {/* Batch summary bar */}
              <div className="flex flex-wrap items-center gap-4 border-b border-border bg-secondary/20 px-5 py-2.5 text-xs text-muted-foreground">
                <span>{batch.totalDocs} documentos totales</span>
                <span className="text-green-500">{batch.documents?.filter((d) => d.status === "delivered").length || 0} entregados</span>
                <span className="text-blue-500">{batch.documents?.filter((d) => d.status === "sent").length || 0} enviados</span>
                <span className="text-yellow-500">{batch.documents?.filter((d) => d.status === "pending").length || 0} pendientes</span>
                {batch.errorDocs > 0 && <span className="text-red-500">{batch.errorDocs} con error</span>}
                {batch.completedAt && <span className="ml-auto">Finalizado: {formatDate(batch.completedAt)}</span>}
              </div>

              {/* Document rows - Level 2, each expandable to Level 3 */}
              <div>
                {batch.documents?.map((doc) => (
                  <DocumentRow key={doc.id} doc={doc} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  )
}

// --- Main page ---
export default function ShipmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredBatches = MOCK_BATCHES.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false
    if (searchTerm && !b.name.toLowerCase().includes(searchTerm.toLowerCase()) && !b.code.toLowerCase().includes(searchTerm.toLowerCase()) && !b.client.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const totalDocs = MOCK_BATCHES.reduce((a, b) => a + b.totalDocs, 0)
  const totalSent = MOCK_BATCHES.reduce((a, b) => a + b.sentDocs, 0)
  const totalErrors = MOCK_BATCHES.reduce((a, b) => a + b.errorDocs, 0)

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header title="Envios" description="Seguimiento de batches y documentos enviados" />
        <div className="p-6">
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5"><Package className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{MOCK_BATCHES.length}</p>
                    <p className="text-xs text-muted-foreground">Batches totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2.5"><Send className="h-5 w-5 text-blue-500" /></div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalDocs}</p>
                    <p className="text-xs text-muted-foreground">Documentos totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-2.5"><CheckCircle2 className="h-5 w-5 text-green-500" /></div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalSent}</p>
                    <p className="text-xs text-muted-foreground">Enviados con exito</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-500/10 p-2.5"><AlertCircle className="h-5 w-5 text-red-500" /></div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalErrors}</p>
                    <p className="text-xs text-muted-foreground">Con errores</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, codigo o cliente..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="processing">En proceso</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="error">Con errores</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Batches list */}
          <div className="mt-6 space-y-3">
            {filteredBatches.map((batch) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
            {filteredBatches.length === 0 && (
              <Card className="border-border bg-card">
                <CardContent className="py-12 text-center">
                  <Package className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 font-medium text-foreground">No se encontraron envios</p>
                  <p className="mt-1 text-sm text-muted-foreground">Prueba con otros filtros de busqueda</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
