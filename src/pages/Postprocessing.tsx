import { useState } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import {
  MOCK_ENVELOPES, MOCK_PRINT_QUEUES, MOCK_POSTAL_AGENTS, MOCK_FRANKING,
} from "@/lib/mock-data-extended"
import {
  Mail, Printer, MapPin, Euro, ListOrdered, Plus, Circle,
  Package2, Layers3,
} from "lucide-react"

// Mock postprocessing queue items
const MOCK_QUEUE_ITEMS = [
  { id: "pp-1", batchId: "BATCH-2026-0415", clientName: "Maria Garcia Martinez", status: "enveloped", postalCode: "08015", weightGrams: 45, estimatedPostage: 1.05, trackingNumber: "ES12345" },
  { id: "pp-2", batchId: "BATCH-2026-0415", clientName: "Carlos Lopez Fernandez", status: "pending_print", postalCode: "28001", weightGrams: 52, estimatedPostage: 1.60 },
  { id: "pp-3", batchId: "BATCH-2026-0415", clientName: "Pedro Sanchez Ruiz", status: "pending_envelope", postalCode: "41001", weightGrams: 38, estimatedPostage: 1.05 },
  { id: "pp-4", batchId: "BATCH-2026-0415", clientName: "Elena Rodriguez Diaz", status: "printed", postalCode: "46001", weightGrams: 68, estimatedPostage: 1.60 },
  { id: "pp-5", batchId: "BATCH-2026-0415", clientName: "Javier Morales Ruiz", status: "ready_to_ship", postalCode: "08020", weightGrams: 42, estimatedPostage: 1.05, trackingNumber: "ES12346" },
  { id: "pp-6", batchId: "BATCH-2026-0415", clientName: "Ana Gutierrez Saez", status: "sorted", postalCode: "28015", weightGrams: 50, estimatedPostage: 1.05, trackingNumber: "ES12347" },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_envelope: { label: "Pendiente ensobrar", color: "border-gray-500/20 bg-gray-500/10 text-gray-400" },
  enveloped: { label: "Ensobrado", color: "border-blue-500/20 bg-blue-500/10 text-blue-500" },
  pending_print: { label: "Pendiente imprimir", color: "border-yellow-500/20 bg-yellow-500/10 text-yellow-500" },
  printed: { label: "Impreso", color: "border-purple-500/20 bg-purple-500/10 text-purple-500" },
  pending_sort: { label: "Pendiente clasificar", color: "border-orange-500/20 bg-orange-500/10 text-orange-500" },
  sorted: { label: "Clasificado", color: "border-cyan-500/20 bg-cyan-500/10 text-cyan-500" },
  ready_to_ship: { label: "Listo para enviar", color: "border-green-500/20 bg-green-500/10 text-green-500" },
}

const PRINTER_STATUS: Record<string, { label: string; color: string }> = {
  online: { label: "En línea", color: "border-green-500/20 bg-green-500/10 text-green-500" },
  offline: { label: "Desconectada", color: "border-gray-500/20 bg-gray-500/10 text-gray-400" },
  busy: { label: "Ocupada", color: "border-yellow-500/20 bg-yellow-500/10 text-yellow-500" },
  error: { label: "Error", color: "border-red-500/20 bg-red-500/10 text-red-500" },
}

export default function PostprocessingPage() {
  const [envelopes] = useState(MOCK_ENVELOPES)
  const [printQueues] = useState(MOCK_PRINT_QUEUES)
  const [agents] = useState(MOCK_POSTAL_AGENTS)
  const [franking] = useState(MOCK_FRANKING)
  const [queueItems] = useState(MOCK_QUEUE_ITEMS)

  const totalPostage = queueItems.reduce((sum, i) => sum + (i.estimatedPostage || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header
          title="Postprocesamiento"
          description="Ensobrado, impresión, clasificación postal y franqueo"
        />
        <div className="p-6">
          {/* Intro + KPIs */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <Mail className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{queueItems.length}</p>
                  <p className="text-xs text-muted-foreground">Docs en postproceso</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <Package2 className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{envelopes.length}</p>
                  <p className="text-xs text-muted-foreground">Configs. de sobres</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <Printer className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{printQueues.filter((p) => p.status === "online").length}</p>
                  <p className="text-xs text-muted-foreground">Impresoras online</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <Euro className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{totalPostage.toFixed(2)}€</p>
                  <p className="text-xs text-muted-foreground">Franqueo estimado</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="queue" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-secondary">
              <TabsTrigger value="queue" className="gap-2">
                <ListOrdered className="h-4 w-4" /> Cola Postproceso
              </TabsTrigger>
              <TabsTrigger value="envelopes" className="gap-2">
                <Mail className="h-4 w-4" /> Ensobrado
              </TabsTrigger>
              <TabsTrigger value="printing" className="gap-2">
                <Printer className="h-4 w-4" /> Impresión
              </TabsTrigger>
              <TabsTrigger value="sorting" className="gap-2">
                <MapPin className="h-4 w-4" /> Clasif. Postal
              </TabsTrigger>
              <TabsTrigger value="franking" className="gap-2">
                <Euro className="h-4 w-4" /> Franqueo
              </TabsTrigger>
            </TabsList>

            {/* --- Tab 1: Queue --- */}
            <TabsContent value="queue" className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Cola de Postproceso
                        <InfoTooltip
                          description="Documentos pendientes de ensobrado, impresión y clasificación. Cada uno avanza por las etapas del postproceso."
                          legacy="Equivalente al PostProcessing engine de Papyrus legacy"
                        />
                      </CardTitle>
                      <CardDescription>Estado en tiempo real de cada documento del batch</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">BATCH-2026-0415</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>CP</TableHead>
                        <TableHead className="text-right">Peso</TableHead>
                        <TableHead className="text-right">Franqueo</TableHead>
                        <TableHead>Tracking</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queueItems.map((item) => {
                        const s = STATUS_LABELS[item.status]
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.clientName}</TableCell>
                            <TableCell className="font-mono text-xs">{item.postalCode}</TableCell>
                            <TableCell className="text-right text-xs">{item.weightGrams}g</TableCell>
                            <TableCell className="text-right font-mono text-xs">{item.estimatedPostage?.toFixed(2)}€</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">{item.trackingNumber || "—"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-xs ${s.color}`}>
                                {s.label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- Tab 2: Envelopes --- */}
            <TabsContent value="envelopes" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Configuraciones de sobres para agrupar documentos antes del envío
                </p>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Nueva configuración
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {envelopes.map((env) => (
                  <Card key={env.id} className="border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{env.name}</h3>
                          <Badge variant="outline" className="mt-1 text-xs">{env.size}</Badge>
                        </div>
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded bg-secondary/40 p-2 text-center">
                          <p className="text-[10px] text-muted-foreground">Peso máx.</p>
                          <p className="font-medium">{env.maxWeightGrams}g</p>
                        </div>
                        <div className="rounded bg-secondary/40 p-2 text-center">
                          <p className="text-[10px] text-muted-foreground">Docs máx.</p>
                          <p className="font-medium">{env.maxDocuments}</p>
                        </div>
                        <div className="rounded bg-secondary/40 p-2 text-center">
                          <p className="text-[10px] text-muted-foreground">Agrupar</p>
                          <p className="font-medium text-[10px]">
                            {env.groupingRule === "by_client" && "Cliente"}
                            {env.groupingRule === "by_postal_code" && "CP"}
                            {env.groupingRule === "by_type" && "Tipo"}
                            {env.groupingRule === "by_region" && "Región"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Grouping rules explanation */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-start gap-3 p-4">
                  <Layers3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="flex-1 text-xs text-muted-foreground">
                    <p className="mb-1 font-semibold text-foreground">Reglas de agrupación</p>
                    <p>
                      <strong>Por cliente:</strong> todos los docs del mismo cliente en un sobre.
                      <strong className="ml-2">Por CP:</strong> docs con mismo código postal.
                      <strong className="ml-2">Por tipo:</strong> mismo tipo documental.
                      <strong className="ml-2">Por región:</strong> misma provincia/comunidad.
                    </p>
                  </div>
                  <InfoTooltip description="La agrupación optimiza el franqueo y facilita la distribución." legacy="Tabla LGSOBRE del legacy" />
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- Tab 3: Printing --- */}
            <TabsContent value="printing" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Impresoras configuradas y asignación por tipo documental
                </p>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Añadir impresora
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {printQueues.map((q) => {
                  const s = PRINTER_STATUS[q.status]
                  const loadPct = (q.currentLoad / q.capacityPagesPerHour) * 100
                  return (
                    <Card key={q.id} className="border-border bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-semibold">{q.printerName}</h3>
                            <p className="text-xs text-muted-foreground">{q.location}</p>
                            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{q.ip}</p>
                          </div>
                          <Badge variant="outline" className={`text-xs ${s.color}`}>
                            <Circle className={`mr-1 h-2 w-2 ${q.status === "online" ? "fill-green-500" : "fill-gray-400"}`} />
                            {s.label}
                          </Badge>
                        </div>
                        <div className="mt-3">
                          <div className="mb-1 flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">Carga actual</span>
                            <span className="font-medium">{q.currentLoad} / {q.capacityPagesPerHour} pág/h</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                            <div className={`h-full rounded-full ${loadPct > 80 ? "bg-red-500" : loadPct > 50 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${loadPct}%` }} />
                          </div>
                        </div>
                        {q.documentTypes.length > 0 && (
                          <div className="mt-3">
                            <p className="mb-1 text-[10px] text-muted-foreground">Tipos asignados:</p>
                            <div className="flex flex-wrap gap-1">
                              {q.documentTypes.slice(0, 3).map((t) => (
                                <Badge key={t} variant="outline" className="text-[9px]">{t}</Badge>
                              ))}
                              {q.documentTypes.length > 3 && <Badge variant="outline" className="text-[9px]">+{q.documentTypes.length - 3}</Badge>}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* --- Tab 4: Postal sorting --- */}
            <TabsContent value="sorting" className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Agentes Postales
                    <InfoTooltip
                      description="Proveedores de servicios postales. Cada uno con su cobertura y tarifas."
                      legacy="Equivalente a CPADMINS del legacy"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agente</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Cobertura</TableHead>
                        <TableHead className="text-right">Coste/kg</TableHead>
                        <TableHead>Certificado</TableHead>
                        <TableHead className="text-right">Días entrega</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agents.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.name}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px] uppercase">{a.type}</Badge></TableCell>
                          <TableCell className="text-xs">{a.regions.join(", ")}</TableCell>
                          <TableCell className="text-right font-mono">{a.costPerKg.toFixed(2)}€</TableCell>
                          <TableCell>
                            {a.certified ? (
                              <Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-500 text-[10px]">Sí</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px]">No</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{a.averageDeliveryDays}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Reglas de asignación por código postal</CardTitle>
                  <CardDescription>Asigna automáticamente agentes según el CP del destinatario</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label className="text-xs">Si CP empieza por</Label>
                    <Input defaultValue="08" className="font-mono" />
                    <Label className="text-xs">→ Usa agente</Label>
                    <Select defaultValue="agent-correos">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label className="text-xs">Si CP empieza por</Label>
                    <Input defaultValue="28" className="font-mono" />
                    <Label className="text-xs">→ Usa agente</Label>
                    <Select defaultValue="agent-correos">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Plus className="h-4 w-4" /> Añadir regla
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- Tab 5: Franking --- */}
            <TabsContent value="franking" className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Tabla de Franqueo
                        <InfoTooltip
                          description="Tarifas por peso y tipo de servicio. Se usa para calcular el coste estimado antes de enviar."
                          legacy="Equivalente a TRAMOSPESO del legacy"
                        />
                      </CardTitle>
                      <CardDescription>Tarifas postales por rango de peso</CardDescription>
                    </div>
                    <Button size="sm" className="gap-1.5">
                      <Plus className="h-4 w-4" /> Nueva tarifa
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rango de peso</TableHead>
                        <TableHead>Servicio</TableHead>
                        <TableHead>Agente</TableHead>
                        <TableHead className="text-right">Coste</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {franking.map((f) => {
                        const agent = agents.find((a) => a.id === f.postalAgentId)
                        return (
                          <TableRow key={f.id}>
                            <TableCell className="font-mono text-xs">{f.weightMinGrams} - {f.weightMaxGrams}g</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] capitalize">{f.serviceType}</Badge>
                            </TableCell>
                            <TableCell className="text-xs">{agent?.name || f.postalAgentId}</TableCell>
                            <TableCell className="text-right font-mono font-semibold">{f.cost.toFixed(2)}€</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-start gap-3 p-4 text-sm">
                  <Euro className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Resumen del batch actual</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {queueItems.length} envíos · Peso total estimado: {queueItems.reduce((s, i) => s + (i.weightGrams || 0), 0)}g ·
                      <strong className="ml-1 text-foreground">Franqueo total: {totalPostage.toFixed(2)}€</strong>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
