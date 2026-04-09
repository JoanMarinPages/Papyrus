import { useEffect, useRef, useState, useCallback } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  ZoomIn,
  ZoomOut,
  Filter,
  Network,
  FileText,
  Users,
  Building,
  Loader2,
  Send,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Shield,
  Car,
  MapPin,
  ShoppingBag,
} from "lucide-react"
import { api, type RagGraphNode, type RagGraphEdge, type RagQueryResult } from "@/lib/api"

interface CanvasNode extends RagGraphNode {
  x: number
  y: number
}

const NODE_COLORS: Record<string, { fill: string; stroke: string }> = {
  document: { fill: "rgba(45, 212, 191, 0.2)", stroke: "#2dd4bf" },
  person: { fill: "rgba(167, 139, 250, 0.2)", stroke: "#a78bfa" },
  organization: { fill: "rgba(251, 113, 133, 0.2)", stroke: "#fb7185" },
  policy: { fill: "rgba(96, 165, 250, 0.2)", stroke: "#60a5fa" },
  coverage: { fill: "rgba(251, 191, 36, 0.15)", stroke: "#fbbf24" },
  vehicle: { fill: "rgba(74, 222, 128, 0.2)", stroke: "#4ade80" },
  location: { fill: "rgba(251, 146, 60, 0.2)", stroke: "#fb923c" },
  product: { fill: "rgba(232, 121, 249, 0.2)", stroke: "#e879f9" },
}

const TYPE_ICONS: Record<string, typeof Network> = {
  document: FileText,
  person: Users,
  organization: Building,
  policy: Shield,
  vehicle: Car,
  location: MapPin,
  product: ShoppingBag,
}

const TYPE_LABELS: Record<string, string> = {
  document: "Documentos",
  person: "Personas",
  organization: "Organizaciones",
  policy: "Polizas",
  coverage: "Coberturas",
  vehicle: "Vehiculos",
  location: "Ubicaciones",
  product: "Productos",
}

function layoutNodes(nodes: RagGraphNode[], edges: RagGraphEdge[], width: number, height: number): CanvasNode[] {
  // Simple force-directed-ish layout
  const cx = width / 2
  const cy = height / 2
  const canvasNodes: CanvasNode[] = nodes.map((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2
    const typeIndex = Object.keys(NODE_COLORS).indexOf(n.type)
    const radius = 120 + typeIndex * 60 + Math.random() * 40
    return {
      ...n,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    }
  })

  // Simple repulsion iterations
  for (let iter = 0; iter < 50; iter++) {
    for (let i = 0; i < canvasNodes.length; i++) {
      for (let j = i + 1; j < canvasNodes.length; j++) {
        const dx = canvasNodes[j].x - canvasNodes[i].x
        const dy = canvasNodes[j].y - canvasNodes[i].y
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
        if (dist < 80) {
          const force = (80 - dist) / dist * 0.5
          canvasNodes[i].x -= dx * force
          canvasNodes[i].y -= dy * force
          canvasNodes[j].x += dx * force
          canvasNodes[j].y += dy * force
        }
      }
    }
    // Pull edges closer
    for (const edge of edges) {
      const a = canvasNodes.find((n) => n.id === edge.source)
      const b = canvasNodes.find((n) => n.id === edge.target)
      if (a && b) {
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 150) {
          const force = (dist - 150) / dist * 0.02
          a.x += dx * force
          a.y += dy * force
          b.x -= dx * force
          b.y -= dy * force
        }
      }
    }
  }

  // Keep in bounds
  const margin = 60
  for (const n of canvasNodes) {
    n.x = Math.max(margin, Math.min(width - margin, n.x))
    n.y = Math.max(margin, Math.min(height - margin, n.y))
  }

  return canvasNodes
}

export default function GraphPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodes, setNodes] = useState<CanvasNode[]>([])
  const [edges, setEdges] = useState<RagGraphEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(null)
  const [neighbors, setNeighbors] = useState<{ id: string; label: string; type: string; relation: string }[]>([])
  const [zoom, setZoom] = useState(1)
  const [typeFilter, setTypeFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState<Record<string, number>>({})
  const [totalEdges, setTotalEdges] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [storage, setStorage] = useState("")

  // Query panel
  const [question, setQuestion] = useState("")
  const [queryResult, setQueryResult] = useState<RagQueryResult | null>(null)
  const [querying, setQuerying] = useState(false)

  const loadGraph = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      // Auto-ingest + load graph
      const data = await api.ragGraph({
        type: typeFilter !== "all" ? typeFilter : undefined,
        search: searchTerm || undefined,
        limit: 150,
      })
      const canvasNodes = layoutNodes(data.nodes, data.edges, 900, 600)
      setNodes(canvasNodes)
      setEdges(data.edges)
      setStorage(data.storage || "")

      // Load stats
      const statsData = await api.ragStats()
      if (statsData.graph) {
        setStats(statsData.graph.types || {})
        setTotalEdges(statsData.graph.total_edges || 0)
      }
    } catch (e: any) {
      setError(e.message || "Error al conectar con el backend")
    } finally {
      setLoading(false)
    }
  }, [typeFilter, searchTerm])

  useEffect(() => {
    loadGraph()
  }, [loadGraph])

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || nodes.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2 * zoom, 2 * zoom)
    ctx.clearRect(0, 0, rect.width / zoom, rect.height / zoom)

    // Draw edges
    for (const edge of edges) {
      const from = nodes.find((n) => n.id === edge.source)
      const to = nodes.find((n) => n.id === edge.target)
      if (from && to) {
        ctx.beginPath()
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)"
        ctx.lineWidth = 1
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.stroke()
      }
    }

    // Draw nodes
    for (const node of nodes) {
      const colors = NODE_COLORS[node.type] || NODE_COLORS.document
      const isSelected = selectedNode?.id === node.id
      const radius = Math.max(20, 15 + node.connections * 3)

      if (isSelected) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius + 8, 0, Math.PI * 2)
        ctx.fillStyle = colors.stroke + "30"
        ctx.fill()
      }

      ctx.beginPath()
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = colors.fill
      ctx.fill()
      ctx.strokeStyle = colors.stroke
      ctx.lineWidth = isSelected ? 3 : 1.5
      ctx.stroke()

      ctx.fillStyle = "#ffffff"
      ctx.font = `${Math.max(9, 11 - nodes.length / 30)}px sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      let label = node.label
      const maxWidth = radius * 1.6
      if (ctx.measureText(label).width > maxWidth) {
        while (ctx.measureText(label + "..").width > maxWidth && label.length > 0) {
          label = label.slice(0, -1)
        }
        label += ".."
      }
      ctx.fillText(label, node.x, node.y)
    }
  }, [nodes, edges, selectedNode, zoom])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    const clicked = nodes.find((node) => {
      const radius = Math.max(20, 15 + node.connections * 3)
      return Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2) <= radius
    })

    setSelectedNode(clicked || null)
    setNeighbors([])
    if (clicked) {
      api.ragEntityDetail(clicked.id).then((detail) => {
        if (detail?.neighbors) setNeighbors(detail.neighbors)
      }).catch(() => {})
    }
  }

  const handleQuery = async () => {
    if (!question.trim()) return
    setQuerying(true)
    setQueryResult(null)
    try {
      const result = await api.ragQuery(question)
      setQueryResult(result)
    } catch (e: any) {
      setQueryResult({ answer: "Error: " + (e.message || "sin conexion"), sources: [], confidence: 0, reasoning: [] })
    } finally {
      setQuerying(false)
    }
  }

  const totalNodes = Object.values(stats).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header title="Knowledge Graph" description="Grafo de conocimiento con datos reales de AXA" />
        <div className="p-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Nodos Totales", value: totalNodes, icon: Network },
              { label: "Polizas", value: stats.policy || 0, icon: Shield },
              { label: "Personas", value: stats.person || 0, icon: Users },
              { label: "Relaciones", value: totalEdges, icon: Building },
            ].map((stat) => (
              <Card key={stat.label} className="border-border bg-card">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Controls */}
          <Card className="mt-6 border-border bg-card">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar entidades..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadGraph()}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-44">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {Object.entries(TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label} ({stats[key] || 0})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={loadGraph}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                {storage && (
                  <Badge variant="outline" className="text-xs">
                    {storage === "neo4j" ? "Neo4j" : "In-Memory"}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-4">
            {/* Graph Canvas */}
            <Card className="border-border bg-card lg:col-span-3">
              <CardContent className="p-0">
                <div className="relative h-[600px] overflow-hidden rounded-lg bg-background">
                  {loading ? (
                    <div className="flex h-full items-center justify-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-muted-foreground">Cargando grafo...</span>
                    </div>
                  ) : error ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                      <p className="text-sm text-destructive">{error}</p>
                      <p className="text-xs text-muted-foreground">
                        Asegurate de que el backend este corriendo en localhost:8001
                      </p>
                      <Button variant="outline" size="sm" onClick={loadGraph}>Reintentar</Button>
                    </div>
                  ) : (
                    <>
                      <canvas
                        ref={canvasRef}
                        className="h-full w-full cursor-pointer"
                        style={{ width: "100%", height: "100%" }}
                        onClick={handleCanvasClick}
                      />
                      {/* Legend */}
                      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 rounded-lg bg-card/90 px-3 py-2 backdrop-blur">
                        {Object.entries(NODE_COLORS).map(([type, colors]) => (
                          <div key={type} className="flex items-center gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full border" style={{ borderColor: colors.stroke, backgroundColor: colors.fill }} />
                            <span className="text-[10px] text-muted-foreground">{TYPE_LABELS[type] || type}</span>
                          </div>
                        ))}
                      </div>
                      <div className="absolute bottom-4 right-4 rounded bg-card/90 px-2 py-1 text-xs text-muted-foreground backdrop-blur">
                        {nodes.length} nodos | Zoom {Math.round(zoom * 100)}%
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Side panel */}
            <div className="space-y-6">
              {/* Node details */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Detalles del Nodo</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedNode ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Nombre</p>
                        <p className="text-sm font-medium text-foreground">{selectedNode.label}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tipo</p>
                        <Badge variant="outline" className="mt-0.5" style={{
                          borderColor: NODE_COLORS[selectedNode.type]?.stroke,
                          color: NODE_COLORS[selectedNode.type]?.stroke,
                        }}>
                          {TYPE_LABELS[selectedNode.type] || selectedNode.type}
                        </Badge>
                      </div>
                      {Object.entries(selectedNode.properties || {}).filter(([, v]) => v).map(([k, v]) => (
                        <div key={k}>
                          <p className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, " ")}</p>
                          <p className="text-sm text-foreground">{v}</p>
                        </div>
                      ))}
                      {neighbors.length > 0 && (
                        <div className="border-t border-border pt-3">
                          <p className="mb-2 text-xs text-muted-foreground">Relaciones ({neighbors.length})</p>
                          <div className="max-h-40 space-y-1.5 overflow-y-auto">
                            {neighbors.map((n, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs">
                                <span className="text-primary">→</span>
                                <span className="text-muted-foreground">{n.relation}</span>
                                <span className="truncate font-medium text-foreground">{n.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <Network className="mx-auto h-8 w-8 text-muted-foreground/30" />
                      <p className="mt-2 text-xs text-muted-foreground">Click en un nodo</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Query panel */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Consultar Grafo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Ej: Que polizas tiene Garcia Martinez?"
                      rows={2}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleQuery() } }}
                      className="resize-none text-sm"
                    />
                    <Button
                      size="sm"
                      className="w-full gap-2"
                      onClick={handleQuery}
                      disabled={querying || !question.trim()}
                    >
                      {querying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      {querying ? "Consultando..." : "Consultar"}
                    </Button>

                    {queryResult && (
                      <div className="space-y-2 border-t border-border pt-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={
                            queryResult.confidence >= 0.8 ? "border-green-500/20 bg-green-500/10 text-green-500" :
                            queryResult.confidence >= 0.5 ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-500" :
                            "border-red-500/20 bg-red-500/10 text-red-500"
                          }>
                            {Math.round(queryResult.confidence * 100)}% confianza
                          </Badge>
                        </div>
                        <div className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded-lg bg-secondary/30 p-3 text-xs leading-relaxed text-foreground">
                          {queryResult.answer}
                        </div>
                        {queryResult.sources.length > 0 && (
                          <div>
                            <p className="mb-1 text-[10px] text-muted-foreground">Fuentes ({queryResult.sources.length})</p>
                            <div className="flex flex-wrap gap-1">
                              {queryResult.sources.slice(0, 5).map((s, i) => (
                                <Badge key={i} variant="outline" className="text-[10px]">{s.label}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground">Prueba:</p>
                      {["Polizas de Garcia Martinez", "Cuantas polizas de auto hay?", "Estadisticas del grafo"].map((q) => (
                        <button
                          key={q}
                          onClick={() => { setQuestion(q); }}
                          className="block w-full rounded px-2 py-1 text-left text-[10px] text-primary hover:bg-secondary/50"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
