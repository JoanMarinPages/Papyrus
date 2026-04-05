"use client"

import { useEffect, useRef, useState } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  Maximize2,
  Download,
  Filter,
  Network,
  FileText,
  Users,
  Building,
} from "lucide-react"

interface Node {
  id: string
  x: number
  y: number
  label: string
  type: "document" | "entity" | "concept" | "person" | "organization"
  connections: number
}

interface Edge {
  from: string
  to: string
  label?: string
}

const nodes: Node[] = [
  { id: "1", x: 400, y: 300, label: "Contratos", type: "concept", connections: 12 },
  { id: "2", x: 600, y: 200, label: "Cliente ABC Corp", type: "organization", connections: 8 },
  { id: "3", x: 200, y: 400, label: "Servicios IT", type: "concept", connections: 15 },
  { id: "4", x: 500, y: 450, label: "Cumplimiento GDPR", type: "concept", connections: 6 },
  { id: "5", x: 700, y: 350, label: "Facturación", type: "concept", connections: 9 },
  { id: "6", x: 300, y: 200, label: "Propuesta Q2", type: "document", connections: 4 },
  { id: "7", x: 600, y: 500, label: "Legal", type: "concept", connections: 11 },
  { id: "8", x: 150, y: 300, label: "Política Privacidad", type: "document", connections: 5 },
  { id: "9", x: 450, y: 150, label: "Juan Pérez", type: "person", connections: 7 },
  { id: "10", x: 750, y: 250, label: "Proveedor XYZ", type: "organization", connections: 3 },
  { id: "11", x: 350, y: 500, label: "Manual Técnico", type: "document", connections: 8 },
  { id: "12", x: 550, y: 100, label: "Ventas", type: "concept", connections: 10 },
]

const edges: Edge[] = [
  { from: "1", to: "2", label: "firmado_por" },
  { from: "1", to: "3", label: "incluye" },
  { from: "1", to: "4", label: "cumple" },
  { from: "2", to: "5", label: "genera" },
  { from: "4", to: "7", label: "relacionado" },
  { from: "6", to: "1", label: "referencia" },
  { from: "6", to: "2", label: "destinado_a" },
  { from: "8", to: "3", label: "aplica_a" },
  { from: "8", to: "4", label: "cumple" },
  { from: "3", to: "7", label: "regulado_por" },
  { from: "9", to: "2", label: "contacto_en" },
  { from: "9", to: "6", label: "creó" },
  { from: "10", to: "5", label: "factura_a" },
  { from: "11", to: "3", label: "documenta" },
  { from: "12", to: "6", label: "área" },
  { from: "12", to: "2", label: "gestiona" },
]

const nodeColors: Record<string, { fill: string; stroke: string }> = {
  document: { fill: "rgba(45, 212, 191, 0.2)", stroke: "#2dd4bf" },
  entity: { fill: "rgba(96, 165, 250, 0.2)", stroke: "#60a5fa" },
  concept: { fill: "rgba(251, 191, 36, 0.2)", stroke: "#fbbf24" },
  person: { fill: "rgba(167, 139, 250, 0.2)", stroke: "#a78bfa" },
  organization: { fill: "rgba(251, 113, 133, 0.2)", stroke: "#fb7185" },
}

const stats = [
  { label: "Nodos Totales", value: "3,542", icon: Network },
  { label: "Documentos", value: "847", icon: FileText },
  { label: "Personas", value: "234", icon: Users },
  { label: "Organizaciones", value: "89", icon: Building },
]

export default function GraphPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2 * zoom, 2 * zoom)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width / zoom, rect.height / zoom)

    // Draw edges
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from)
      const toNode = nodes.find((n) => n.id === edge.to)
      if (fromNode && toNode) {
        ctx.beginPath()
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"
        ctx.lineWidth = 1
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(toNode.x, toNode.y)
        ctx.stroke()

        // Draw edge label
        if (edge.label) {
          const midX = (fromNode.x + toNode.x) / 2
          const midY = (fromNode.y + toNode.y) / 2
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
          ctx.font = "8px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(edge.label, midX, midY)
        }
      }
    })

    // Draw nodes
    nodes.forEach((node) => {
      const colors = nodeColors[node.type] || nodeColors.entity
      const isSelected = selectedNode?.id === node.id
      const radius = 28 + node.connections * 1.5

      // Glow effect for selected node
      if (isSelected) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius + 10, 0, Math.PI * 2)
        ctx.fillStyle = colors.stroke + "20"
        ctx.fill()
      }

      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = colors.fill
      ctx.fill()
      ctx.strokeStyle = colors.stroke
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.stroke()

      // Node label
      ctx.fillStyle = "#ffffff"
      ctx.font = "11px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const maxWidth = radius * 1.6
      let label = node.label
      if (ctx.measureText(label).width > maxWidth) {
        while (ctx.measureText(label + "...").width > maxWidth && label.length > 0) {
          label = label.slice(0, -1)
        }
        label += "..."
      }
      ctx.fillText(label, node.x, node.y)
    })
  }, [selectedNode, zoom])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    const clickedNode = nodes.find((node) => {
      const radius = 28 + node.connections * 1.5
      const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2)
      return distance <= radius
    })

    setSelectedNode(clickedNode || null)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header
          title="Knowledge Graph"
          description="Visualización del grafo de conocimiento"
        />
        <div className="p-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-border bg-card">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Graph Controls */}
          <Card className="mt-6 border-border bg-card">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar en el grafo..." className="pl-9" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="document">Documentos</SelectItem>
                    <SelectItem value="person">Personas</SelectItem>
                    <SelectItem value="organization">Organizaciones</SelectItem>
                    <SelectItem value="concept">Conceptos</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Graph Canvas */}
          <div className="mt-6 grid gap-6 lg:grid-cols-4">
            <Card className="border-border bg-card lg:col-span-3">
              <CardContent className="p-0">
                <div className="relative h-[600px] overflow-hidden rounded-lg bg-background">
                  <canvas
                    ref={canvasRef}
                    className="h-full w-full cursor-pointer"
                    style={{ width: "100%", height: "100%" }}
                    onClick={handleCanvasClick}
                  />

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 rounded-lg bg-card/90 px-4 py-3 backdrop-blur">
                    {Object.entries(nodeColors).map(([type, colors]) => (
                      <div key={type} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full border-2"
                          style={{
                            borderColor: colors.stroke,
                            backgroundColor: colors.fill,
                          }}
                        />
                        <span className="text-xs capitalize text-muted-foreground">
                          {type === "document"
                            ? "Documentos"
                            : type === "concept"
                              ? "Conceptos"
                              : type === "person"
                                ? "Personas"
                                : type === "organization"
                                  ? "Organizaciones"
                                  : type}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Zoom indicator */}
                  <div className="absolute bottom-4 right-4 rounded-lg bg-card/90 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
                    Zoom: {Math.round(zoom * 100)}%
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Node Details */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Detalles del Nodo</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedNode ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre</p>
                      <p className="font-medium text-foreground">
                        {selectedNode.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <Badge
                        variant="outline"
                        className="mt-1"
                        style={{
                          borderColor: nodeColors[selectedNode.type].stroke,
                          color: nodeColors[selectedNode.type].stroke,
                        }}
                      >
                        {selectedNode.type}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Conexiones</p>
                      <p className="font-medium text-foreground">
                        {selectedNode.connections} nodos relacionados
                      </p>
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="mb-2 text-sm text-muted-foreground">
                        Relaciones
                      </p>
                      <div className="space-y-2">
                        {edges
                          .filter(
                            (e) =>
                              e.from === selectedNode.id ||
                              e.to === selectedNode.id
                          )
                          .slice(0, 5)
                          .map((edge, i) => {
                            const otherNodeId =
                              edge.from === selectedNode.id ? edge.to : edge.from
                            const otherNode = nodes.find(
                              (n) => n.id === otherNodeId
                            )
                            return (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-sm"
                              >
                                <span className="text-primary">→</span>
                                <span className="text-muted-foreground">
                                  {edge.label}
                                </span>
                                <span className="text-foreground">
                                  {otherNode?.label}
                                </span>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                    <Button className="w-full" variant="secondary">
                      Ver documentos relacionados
                    </Button>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Network className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Haz clic en un nodo para ver sus detalles
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
