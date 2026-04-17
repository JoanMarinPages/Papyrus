import { useEffect, useRef, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Search, ZoomIn, ZoomOut, Filter, Network, FileText, Users, Building,
  Loader2, Send, Sparkles, AlertCircle, RefreshCw, Shield, Car, MapPin,
  ShoppingBag, Eye, Printer,
} from "lucide-react"
import { api, type RagGraphNode, type RagGraphEdge, type RagQueryResult } from "@/lib/api"

// --- Types ---
interface CanvasNode extends RagGraphNode {
  x: number
  y: number
}

// --- Constants ---
const NODE_COLORS: Record<string, { fill: string; stroke: string }> = {
  document: { fill: "rgba(45, 212, 191, 0.25)", stroke: "#2dd4bf" },
  person: { fill: "rgba(167, 139, 250, 0.25)", stroke: "#a78bfa" },
  organization: { fill: "rgba(251, 113, 133, 0.25)", stroke: "#fb7185" },
  policy: { fill: "rgba(96, 165, 250, 0.25)", stroke: "#60a5fa" },
  coverage: { fill: "rgba(251, 191, 36, 0.20)", stroke: "#fbbf24" },
  vehicle: { fill: "rgba(74, 222, 128, 0.25)", stroke: "#4ade80" },
  location: { fill: "rgba(251, 146, 60, 0.25)", stroke: "#fb923c" },
  product: { fill: "rgba(232, 121, 249, 0.25)", stroke: "#e879f9" },
}

const TYPE_LABELS: Record<string, string> = {
  document: "Documentos", person: "Personas", organization: "Organizaciones",
  policy: "Polizas", coverage: "Coberturas", vehicle: "Vehiculos",
  location: "Ubicaciones", product: "Productos",
}

// --- Layout ---
function layoutNodes(rawNodes: RagGraphNode[], edges: RagGraphEdge[]): CanvasNode[] {
  const nodes: CanvasNode[] = rawNodes.map((n, i) => {
    const angle = (i / rawNodes.length) * Math.PI * 2
    const typeIdx = Object.keys(NODE_COLORS).indexOf(n.type)
    const r = 180 + typeIdx * 50 + (Math.sin(i * 1.7) * 30)
    return { ...n, x: 500 + Math.cos(angle) * r, y: 400 + Math.sin(angle) * r }
  })

  // Force simulation
  for (let iter = 0; iter < 80; iter++) {
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x
        const dy = nodes[j].y - nodes[i].y
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
        const minDist = 70
        if (dist < minDist) {
          const f = ((minDist - dist) / dist) * 0.4
          nodes[i].x -= dx * f
          nodes[i].y -= dy * f
          nodes[j].x += dx * f
          nodes[j].y += dy * f
        }
      }
    }
    // Edge attraction
    for (const e of edges) {
      const a = nodes.find((n) => n.id === e.source)
      const b = nodes.find((n) => n.id === e.target)
      if (a && b) {
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 120) {
          const f = ((dist - 120) / dist) * 0.015
          a.x += dx * f; a.y += dy * f
          b.x -= dx * f; b.y -= dy * f
        }
      }
    }
    // Center gravity
    let cx = 0, cy = 0
    nodes.forEach((n) => { cx += n.x; cy += n.y })
    cx /= nodes.length; cy /= nodes.length
    nodes.forEach((n) => { n.x += (500 - cx) * 0.05; n.y += (400 - cy) * 0.05 })
  }

  return nodes
}

function getNodeRadius(n: CanvasNode): number {
  return Math.max(18, 14 + Math.min(n.connections, 15) * 2.5)
}

// --- Main Component ---
export default function GraphPage() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const nodesRef = useRef<CanvasNode[]>([])
  const edgesRef = useRef<RagGraphEdge[]>([])
  const panRef = useRef({ x: 0, y: 0 })
  const zoomRef = useRef(1)
  const dragRef = useRef<{ nodeIdx: number; offsetX: number; offsetY: number } | null>(null)
  const panningRef = useRef<{ startX: number; startY: number; panStartX: number; panStartY: number } | null>(null)
  const rafRef = useRef<number>(0)

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

  const [question, setQuestion] = useState("")
  const [queryResult, setQueryResult] = useState<RagQueryResult | null>(null)
  const [querying, setQuerying] = useState(false)

  // --- Render loop ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const z = zoomRef.current
    const pan = panRef.current
    const allNodes = nodesRef.current
    const allEdges = edgesRef.current

    ctx.clearRect(0, 0, rect.width, rect.height)
    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(z, z)

    // Edges
    for (const edge of allEdges) {
      const from = allNodes.find((n) => n.id === edge.source)
      const to = allNodes.find((n) => n.id === edge.target)
      if (from && to) {
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.strokeStyle = "rgba(255,255,255,0.08)"
        ctx.lineWidth = 0.8
        ctx.stroke()
      }
    }

    // Nodes
    for (const node of allNodes) {
      const colors = NODE_COLORS[node.type] || NODE_COLORS.document
      const r = getNodeRadius(node)
      const isSel = selectedNode?.id === node.id

      // Glow
      if (isSel) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, r + 10, 0, Math.PI * 2)
        ctx.fillStyle = colors.stroke + "25"
        ctx.fill()
      }

      // Circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
      ctx.fillStyle = colors.fill
      ctx.fill()
      ctx.strokeStyle = colors.stroke
      ctx.lineWidth = isSel ? 2.5 : 1.2
      ctx.stroke()

      // Label
      ctx.fillStyle = "#e5e5e5"
      const fontSize = Math.max(8, Math.min(12, r * 0.55))
      ctx.font = `500 ${fontSize}px system-ui, sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      let label = node.label
      const maxW = r * 1.7
      if (ctx.measureText(label).width > maxW) {
        while (label.length > 1 && ctx.measureText(label + "..").width > maxW) label = label.slice(0, -1)
        label += ".."
      }
      ctx.fillText(label, node.x, node.y)
    }

    ctx.restore()
  }, [selectedNode])

  // Continuous render when dragging
  const scheduleRender = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => draw())
  }, [draw])

  // --- Load data ---
  const loadGraph = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await api.ragGraph({
        type: typeFilter !== "all" ? typeFilter : undefined,
        search: searchTerm || undefined,
        limit: 150,
      })
      const laid = layoutNodes(data.nodes, data.edges)
      nodesRef.current = laid
      edgesRef.current = data.edges
      setNodes(laid)
      setEdges(data.edges)
      setStorage(data.storage || "")

      const statsData = await api.ragStats()
      if (statsData.graph) {
        setStats(statsData.graph.types || {})
        setTotalEdges(statsData.graph.total_edges || 0)
      }
    } catch {
      // Fallback: show demo graph when backend is unavailable
      const mockNodes: RagGraphNode[] = [
        { id: "person:garcia-martinez", label: "Garcia Martinez", type: "person", connections: 5, properties: {} },
        { id: "person:lopez-fernandez", label: "Lopez Fernandez", type: "person", connections: 3, properties: {} },
        { id: "person:sanchez-ruiz", label: "Sanchez Ruiz", type: "person", connections: 4, properties: {} },
        { id: "org:axa", label: "AXA Seguros", type: "organization", connections: 8, properties: {} },
        { id: "org:mapfre", label: "MAPFRE", type: "organization", connections: 3, properties: {} },
        { id: "policy:hogar-001", label: "Póliza Hogar #001", type: "policy", connections: 4, properties: {} },
        { id: "policy:auto-002", label: "Póliza Auto #002", type: "policy", connections: 3, properties: {} },
        { id: "policy:vida-003", label: "Póliza Vida #003", type: "policy", connections: 2, properties: {} },
        { id: "policy:salud-004", label: "Póliza Salud #004", type: "policy", connections: 2, properties: {} },
        { id: "coverage:rc", label: "Resp. Civil", type: "coverage", connections: 3, properties: {} },
        { id: "coverage:robo", label: "Robo", type: "coverage", connections: 2, properties: {} },
        { id: "coverage:incendio", label: "Incendio", type: "coverage", connections: 2, properties: {} },
        { id: "vehicle:seat-leon", label: "Seat León 2023", type: "vehicle", connections: 2, properties: {} },
        { id: "location:barcelona", label: "Barcelona", type: "location", connections: 5, properties: {} },
        { id: "location:madrid", label: "Madrid", type: "location", connections: 3, properties: {} },
        { id: "doc:contrato-001", label: "Contrato Servicios", type: "document", connections: 3, properties: {} },
        { id: "doc:informe-002", label: "Informe Anual", type: "document", connections: 2, properties: {} },
        { id: "product:pack-familia", label: "Pack Familia", type: "product", connections: 4, properties: {} },
        { id: "product:pack-auto", label: "Pack Auto Plus", type: "product", connections: 3, properties: {} },
      ]
      const mockEdges: RagGraphEdge[] = [
        { source: "person:garcia-martinez", target: "policy:hogar-001", relation: "titular" },
        { source: "person:garcia-martinez", target: "policy:auto-002", relation: "titular" },
        { source: "person:garcia-martinez", target: "location:barcelona", relation: "reside_en" },
        { source: "person:lopez-fernandez", target: "policy:vida-003", relation: "titular" },
        { source: "person:lopez-fernandez", target: "location:madrid", relation: "reside_en" },
        { source: "person:sanchez-ruiz", target: "policy:salud-004", relation: "titular" },
        { source: "person:sanchez-ruiz", target: "policy:auto-002", relation: "conductor" },
        { source: "person:sanchez-ruiz", target: "location:barcelona", relation: "reside_en" },
        { source: "org:axa", target: "policy:hogar-001", relation: "aseguradora" },
        { source: "org:axa", target: "policy:auto-002", relation: "aseguradora" },
        { source: "org:axa", target: "policy:vida-003", relation: "aseguradora" },
        { source: "org:axa", target: "product:pack-familia", relation: "ofrece" },
        { source: "org:axa", target: "product:pack-auto", relation: "ofrece" },
        { source: "org:mapfre", target: "policy:salud-004", relation: "aseguradora" },
        { source: "policy:hogar-001", target: "coverage:rc", relation: "incluye" },
        { source: "policy:hogar-001", target: "coverage:robo", relation: "incluye" },
        { source: "policy:hogar-001", target: "coverage:incendio", relation: "incluye" },
        { source: "policy:auto-002", target: "coverage:rc", relation: "incluye" },
        { source: "policy:auto-002", target: "vehicle:seat-leon", relation: "cubre" },
        { source: "product:pack-familia", target: "policy:hogar-001", relation: "contiene" },
        { source: "product:pack-familia", target: "policy:vida-003", relation: "contiene" },
        { source: "product:pack-auto", target: "policy:auto-002", relation: "contiene" },
        { source: "doc:contrato-001", target: "org:axa", relation: "con" },
        { source: "doc:contrato-001", target: "person:garcia-martinez", relation: "firmado_por" },
        { source: "doc:informe-002", target: "org:axa", relation: "emitido_por" },
        { source: "location:barcelona", target: "org:axa", relation: "oficina" },
      ]
      const filtered = typeFilter !== "all"
        ? mockNodes.filter((n) => n.type === typeFilter)
        : searchTerm
          ? mockNodes.filter((n) => n.label.toLowerCase().includes(searchTerm.toLowerCase()))
          : mockNodes
      const filteredIds = new Set(filtered.map((n) => n.id))
      const filteredEdges = mockEdges.filter((e) => filteredIds.has(e.source) && filteredIds.has(e.target))
      const laid = layoutNodes(filtered, filteredEdges)
      nodesRef.current = laid
      edgesRef.current = filteredEdges
      setNodes(laid)
      setEdges(filteredEdges)
      setStorage("demo")
      setStats({ person: 3, organization: 2, policy: 4, coverage: 3, vehicle: 1, location: 2, document: 2, product: 2 })
      setTotalEdges(mockEdges.length)
    } finally {
      setLoading(false)
    }
  }, [typeFilter, searchTerm])

  useEffect(() => { loadGraph() }, [loadGraph])
  useEffect(() => { if (!loading && nodes.length) scheduleRender() }, [loading, nodes, scheduleRender, zoom, selectedNode])

  // --- Zoom ---
  useEffect(() => { zoomRef.current = zoom }, [zoom])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.08 : 0.08
      const newZ = Math.max(0.3, Math.min(3, zoomRef.current + delta))
      zoomRef.current = newZ
      setZoom(newZ)
      scheduleRender()
    }
    canvas.addEventListener("wheel", onWheel, { passive: false })
    return () => canvas.removeEventListener("wheel", onWheel)
  }, [scheduleRender])

  // --- Mouse interaction (drag nodes + pan) ---
  const screenToWorld = useCallback((sx: number, sy: number) => {
    return {
      x: (sx - panRef.current.x) / zoomRef.current,
      y: (sy - panRef.current.y) / zoomRef.current,
    }
  }, [])

  const findNodeAt = useCallback((wx: number, wy: number): number => {
    const all = nodesRef.current
    for (let i = all.length - 1; i >= 0; i--) {
      const r = getNodeRadius(all[i])
      const dx = all[i].x - wx
      const dy = all[i].y - wy
      if (dx * dx + dy * dy <= r * r) return i
    }
    return -1
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const { x: wx, y: wy } = screenToWorld(sx, sy)
    const idx = findNodeAt(wx, wy)

    if (idx >= 0) {
      // Start dragging a node
      dragRef.current = {
        nodeIdx: idx,
        offsetX: nodesRef.current[idx].x - wx,
        offsetY: nodesRef.current[idx].y - wy,
      }
    } else {
      // Start panning
      panningRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        panStartX: panRef.current.x,
        panStartY: panRef.current.y,
      }
    }
  }, [screenToWorld, findNodeAt])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragRef.current) {
      const rect = canvasRef.current!.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      const { x: wx, y: wy } = screenToWorld(sx, sy)
      const node = nodesRef.current[dragRef.current.nodeIdx]
      node.x = wx + dragRef.current.offsetX
      node.y = wy + dragRef.current.offsetY
      scheduleRender()
    } else if (panningRef.current) {
      panRef.current = {
        x: panningRef.current.panStartX + (e.clientX - panningRef.current.startX),
        y: panningRef.current.panStartY + (e.clientY - panningRef.current.startY),
      }
      scheduleRender()
    }
  }, [screenToWorld, scheduleRender])

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const wasDragging = dragRef.current !== null
    const wasPanning = panningRef.current !== null
    const movedPan = wasPanning && panningRef.current &&
      (Math.abs(e.clientX - panningRef.current.startX) > 3 || Math.abs(e.clientY - panningRef.current.startY) > 3)

    dragRef.current = null
    panningRef.current = null

    // If it was just a click (no drag/pan), select node
    if (!wasDragging && !movedPan) {
      const rect = canvasRef.current!.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      const { x: wx, y: wy } = screenToWorld(sx, sy)
      const idx = findNodeAt(wx, wy)

      if (idx >= 0) {
        const node = nodesRef.current[idx]
        setSelectedNode(node)
        // Build neighbors from local edges
        const localNeighbors = edgesRef.current
          .filter((e) => e.source === node.id || e.target === node.id)
          .map((e) => {
            const otherId = e.source === node.id ? e.target : e.source
            const other = nodesRef.current.find((n) => n.id === otherId)
            return { id: otherId, label: other?.label || otherId, type: other?.type || "unknown", relation: e.relation }
          })
        setNeighbors(localNeighbors)
        // Try API for richer data, keep local fallback
        api.ragEntityDetail(node.id).then((d) => {
          if (d?.neighbors?.length) setNeighbors(d.neighbors)
        }).catch(() => {})
      } else {
        setSelectedNode(null)
        setNeighbors([])
      }
      scheduleRender()
    }

    // Sync state after drag
    if (wasDragging) {
      setNodes([...nodesRef.current])
    }
  }, [screenToWorld, findNodeAt, scheduleRender])

  // --- Query ---
  const handleQuery = async () => {
    if (!question.trim()) return
    setQuerying(true)
    setQueryResult(null)
    try {
      const result = await api.ragQuery(question)
      setQueryResult(result)
      // Auto-highlight first source node
      if (result.sources.length > 0) {
        const sourceId = result.sources[0].entity_id
        const found = nodesRef.current.find((n) => n.id === sourceId)
        if (found) {
          setSelectedNode(found)
          // Pan to node
          const container = containerRef.current
          if (container) {
            const rect = container.getBoundingClientRect()
            panRef.current = {
              x: rect.width / 2 - found.x * zoomRef.current,
              y: rect.height / 2 - found.y * zoomRef.current,
            }
          }
          api.ragEntityDetail(found.id).then((d) => {
            if (d?.neighbors) setNeighbors(d.neighbors)
          }).catch(() => {})
          scheduleRender()
        }
      }
    } catch {
      // Demo response when backend unavailable
      const q = question.toLowerCase()
      const demoAnswer = q.includes("garcia")
        ? "Garcia Martinez tiene 2 pólizas: Hogar #001 (con coberturas RC, Robo e Incendio) y Auto #002 (Seat León 2023). Ambas con AXA Seguros. Reside en Barcelona."
        : q.includes("auto")
          ? "Hay 1 póliza de auto: Auto #002, titular Garcia Martinez, conductor adicional Sanchez Ruiz. Cubre un Seat León 2023 con RC. Aseguradora: AXA."
          : q.includes("axa")
            ? "AXA Seguros tiene 3 pólizas activas (Hogar, Auto, Vida) y 2 productos (Pack Familia, Pack Auto Plus). Oficina en Barcelona."
            : "Sin conexión al backend. El grafo muestra datos demo. Conecta el backend en localhost:8001 para consultas reales."
      setQueryResult({ answer: demoAnswer, sources: [], confidence: 0.85, reasoning: ["Datos demo (backend no disponible)"] })
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
                  <div className="rounded-lg bg-primary/10 p-2"><stat.icon className="h-5 w-5 text-primary" /></div>
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
                  <Input placeholder="Buscar entidades..." className="pl-9" value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadGraph()} />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-44"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {Object.entries(TYPE_LABELS).map(([k, l]) => (
                      <SelectItem key={k} value={k}>{l} ({stats[k] || 0})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}><ZoomOut className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.min(3, z + 0.15))}><ZoomIn className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => { panRef.current = { x: 0, y: 0 }; setZoom(1); scheduleRender() }}><RefreshCw className="h-4 w-4" /></Button>
                </div>
                {storage && <Badge variant="outline" className="text-xs">{storage === "neo4j" ? "Neo4j" : "In-Memory"}</Badge>}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-4">
            {/* Canvas */}
            <Card className="border-border bg-card lg:col-span-3">
              <CardContent className="p-0">
                <div ref={containerRef} className="relative h-[600px] overflow-hidden rounded-lg bg-background">
                  {loading ? (
                    <div className="flex h-full items-center justify-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-muted-foreground">Cargando grafo...</span>
                    </div>
                  ) : error ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                      <p className="text-sm text-destructive">{error}</p>
                      <p className="text-xs text-muted-foreground">Backend en localhost:8001</p>
                      <Button variant="outline" size="sm" onClick={loadGraph}>Reintentar</Button>
                    </div>
                  ) : (
                    <>
                      <canvas ref={canvasRef} className="h-full w-full"
                        style={{ width: "100%", height: "100%", cursor: dragRef.current ? "grabbing" : "grab" }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={() => { dragRef.current = null; panningRef.current = null }}
                      />
                      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 rounded-lg bg-card/90 px-3 py-2 backdrop-blur">
                        {Object.entries(NODE_COLORS).map(([type, colors]) => (
                          <div key={type} className="flex items-center gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full border" style={{ borderColor: colors.stroke, backgroundColor: colors.fill }} />
                            <span className="text-[10px] text-muted-foreground">{TYPE_LABELS[type] || type}</span>
                          </div>
                        ))}
                      </div>
                      <div className="absolute bottom-4 right-4 rounded bg-card/90 px-2 py-1 text-xs text-muted-foreground backdrop-blur">
                        {nodes.length} nodos | Arrastrar nodos · Scroll zoom · Click detalles
                      </div>
                      <div className="absolute right-4 top-4 rounded bg-card/90 px-2 py-1 text-xs text-muted-foreground backdrop-blur">
                        Zoom {Math.round(zoom * 100)}%
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Side panel */}
            <div className="space-y-4">
              {/* Node details */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Detalles del Nodo</CardTitle></CardHeader>
                <CardContent>
                  {selectedNode ? (
                    <div className="space-y-2.5">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Nombre</p>
                        <p className="text-sm font-medium text-foreground">{selectedNode.label}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Tipo</p>
                        <Badge variant="outline" className="mt-0.5" style={{ borderColor: NODE_COLORS[selectedNode.type]?.stroke, color: NODE_COLORS[selectedNode.type]?.stroke }}>
                          {TYPE_LABELS[selectedNode.type] || selectedNode.type}
                        </Badge>
                      </div>
                      {Object.entries(selectedNode.properties || {}).filter(([, v]) => v).slice(0, 6).map(([k, v]) => (
                        <div key={k}>
                          <p className="text-[10px] text-muted-foreground capitalize">{k.replace(/_/g, " ")}</p>
                          <p className="text-xs text-foreground">{v}</p>
                        </div>
                      ))}
                      {neighbors.length > 0 && (
                        <div className="border-t border-border pt-2">
                          <p className="mb-1.5 text-[10px] text-muted-foreground">Relaciones ({neighbors.length})</p>
                          <div className="max-h-32 space-y-1 overflow-y-auto">
                            {neighbors.map((n, i) => (
                              <div key={i} className="flex items-center gap-1 text-[11px]">
                                <span className="text-primary">→</span>
                                <span className="text-muted-foreground">{n.relation}</span>
                                <span className="truncate font-medium text-foreground">{n.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {(selectedNode.type === "document" || selectedNode.type === "policy") && (
                        <Button size="sm" variant="secondary" className="mt-2 w-full gap-1.5 text-xs"
                          onClick={() => navigate("/preview?type=poliza")}>
                          <Eye className="h-3 w-3" /> Ver documento
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <Network className="mx-auto h-7 w-7 text-muted-foreground/30" />
                      <p className="mt-2 text-[11px] text-muted-foreground">Click en un nodo</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Query */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />Consultar Grafo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Textarea placeholder="Ej: Que polizas tiene Garcia Martinez?" rows={2} value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleQuery() } }}
                      className="resize-none text-xs" />
                    <Button size="sm" className="w-full gap-2" onClick={handleQuery} disabled={querying || !question.trim()}>
                      {querying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      {querying ? "Consultando..." : "Consultar"}
                    </Button>

                    {queryResult && (
                      <div className="space-y-2 border-t border-border pt-2">
                        <Badge variant="outline" className={
                          queryResult.confidence >= 0.8 ? "border-green-500/20 bg-green-500/10 text-green-500" :
                          queryResult.confidence >= 0.5 ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-500" :
                          "border-red-500/20 bg-red-500/10 text-red-500"
                        }>
                          {Math.round(queryResult.confidence * 100)}% confianza
                        </Badge>
                        <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-secondary/30 p-2.5 text-[11px] leading-relaxed text-foreground">
                          {queryResult.answer}
                        </div>
                        {queryResult.sources.length > 0 && (
                          <div>
                            <p className="mb-1 text-[10px] text-muted-foreground">Fuentes</p>
                            <div className="flex flex-wrap gap-1">
                              {queryResult.sources.slice(0, 5).map((s, i) => (
                                <button key={i} className="rounded border border-border px-1.5 py-0.5 text-[9px] text-primary hover:bg-secondary/50"
                                  onClick={() => {
                                    const n = nodesRef.current.find((nd) => nd.id === s.entity_id)
                                    if (n) { setSelectedNode(n); scheduleRender() }
                                  }}>
                                  {s.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-0.5 pt-1">
                      <p className="text-[9px] text-muted-foreground">Prueba:</p>
                      {["Polizas de Garcia Martinez", "Cuantas polizas de auto hay?", "Estadisticas del grafo"].map((q) => (
                        <button key={q} onClick={() => setQuestion(q)}
                          className="block w-full rounded px-1.5 py-0.5 text-left text-[10px] text-primary hover:bg-secondary/50">{q}</button>
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
