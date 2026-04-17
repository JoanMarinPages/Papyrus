
import { useEffect, useRef, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Maximize2 } from "lucide-react"

interface Node {
  id: string
  x: number
  y: number
  label: string
  type: "document" | "entity" | "concept"
}

interface Edge {
  from: string
  to: string
}

const nodes: Node[] = [
  { id: "1", x: 200, y: 150, label: "Contratos", type: "concept" },
  { id: "2", x: 350, y: 80, label: "Cliente ABC", type: "entity" },
  { id: "3", x: 100, y: 250, label: "Servicios", type: "concept" },
  { id: "4", x: 300, y: 220, label: "Legal", type: "concept" },
  { id: "5", x: 450, y: 180, label: "Facturación", type: "entity" },
  { id: "6", x: 180, y: 80, label: "Propuestas", type: "document" },
  { id: "7", x: 400, y: 280, label: "Cumplimiento", type: "concept" },
  { id: "8", x: 80, y: 150, label: "Políticas", type: "document" },
]

const edges: Edge[] = [
  { from: "1", to: "2" },
  { from: "1", to: "3" },
  { from: "1", to: "4" },
  { from: "2", to: "5" },
  { from: "4", to: "7" },
  { from: "6", to: "1" },
  { from: "6", to: "2" },
  { from: "8", to: "3" },
  { from: "8", to: "4" },
  { from: "3", to: "7" },
]

const nodeColors = {
  document: { fill: "rgba(45, 212, 191, 0.2)", stroke: "#2dd4bf" },
  entity: { fill: "rgba(96, 165, 250, 0.2)", stroke: "#60a5fa" },
  concept: { fill: "rgba(251, 191, 36, 0.2)", stroke: "#fbbf24" },
}

const NODE_RADIUS = 24

function getNodeAtPosition(
  mouseX: number,
  mouseY: number,
  canvas: HTMLCanvasElement
): Node | null {
  const rect = canvas.getBoundingClientRect()
  const x = mouseX - rect.left
  const y = mouseY - rect.top
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i]
    const dx = x - node.x
    const dy = y - node.y
    if (dx * dx + dy * dy <= NODE_RADIUS * NODE_RADIUS) {
      return node
    }
  }
  return null
}

export function KnowledgeGraphPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const navigate = useNavigate()
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    label: string
    type: string
  } | null>(null)

  const draw = useCallback(
    (highlightId: string | null) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      canvas.width = rect.width * 2
      canvas.height = rect.height * 2
      ctx.scale(2, 2)

      ctx.clearRect(0, 0, rect.width, rect.height)

      // Draw edges
      edges.forEach((edge) => {
        const fromNode = nodes.find((n) => n.id === edge.from)
        const toNode = nodes.find((n) => n.id === edge.to)
        if (fromNode && toNode) {
          const isHighlighted =
            highlightId === edge.from || highlightId === edge.to
          ctx.beginPath()
          ctx.moveTo(fromNode.x, fromNode.y)
          ctx.lineTo(toNode.x, toNode.y)
          ctx.strokeStyle = isHighlighted
            ? "rgba(255, 255, 255, 0.35)"
            : "rgba(255, 255, 255, 0.1)"
          ctx.lineWidth = isHighlighted ? 2 : 1
          ctx.stroke()
        }
      })

      // Draw nodes
      nodes.forEach((node) => {
        const colors = nodeColors[node.type]
        const isHovered = node.id === highlightId

        ctx.beginPath()
        ctx.arc(node.x, node.y, isHovered ? NODE_RADIUS + 4 : NODE_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = isHovered
          ? colors.stroke.replace(")", ", 0.35)").replace("rgb", "rgba")
          : colors.fill
        ctx.fill()
        ctx.strokeStyle = colors.stroke
        ctx.lineWidth = isHovered ? 3 : 2
        ctx.stroke()

        // Glow effect on hover
        if (isHovered) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, NODE_RADIUS + 8, 0, Math.PI * 2)
          ctx.strokeStyle = colors.stroke.replace(")", ", 0.3)").replace("rgb", "rgba")
          ctx.lineWidth = 1
          ctx.stroke()
        }

        // Node label
        ctx.fillStyle = "#ffffff"
        ctx.font = isHovered ? "bold 11px sans-serif" : "10px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        const maxWidth = 40
        let label = node.label
        if (ctx.measureText(label).width > maxWidth) {
          while (
            ctx.measureText(label + "...").width > maxWidth &&
            label.length > 0
          ) {
            label = label.slice(0, -1)
          }
          label += "..."
        }
        ctx.fillText(label, node.x, node.y)
      })
    },
    []
  )

  useEffect(() => {
    // Draw immediately
    draw(hoveredNode)

    // Also observe resize so canvas draws when container gets dimensions
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => {
      draw(hoveredNode)
    })
    observer.observe(canvas.parentElement!)
    return () => observer.disconnect()
  }, [draw, hoveredNode])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const node = getNodeAtPosition(e.clientX, e.clientY, canvas)
    if (node) {
      setHoveredNode(node.id)
      const rect = canvas.getBoundingClientRect()
      setTooltip({
        x: node.x,
        y: node.y - NODE_RADIUS - 12,
        label: node.label,
        type: node.type === "document" ? "Documento" : node.type === "entity" ? "Entidad" : "Concepto",
      })
      canvas.style.cursor = "pointer"
    } else {
      setHoveredNode(null)
      setTooltip(null)
      canvas.style.cursor = "default"
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const node = getNodeAtPosition(e.clientX, e.clientY, canvas)
    if (node) {
      navigate(`/graph?node=${node.id}`)
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">
            Knowledge Graph
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Vista previa del grafo de conocimiento
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => navigate("/graph")}
        >
          <Maximize2 className="h-4 w-4" />
          Expandir
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative h-[300px] overflow-hidden rounded-lg bg-background">
          <canvas
            ref={canvasRef}
            className="h-full w-full"
            style={{ width: "100%", height: "100%" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              setHoveredNode(null)
              setTooltip(null)
              if (canvasRef.current) canvasRef.current.style.cursor = "default"
            }}
            onClick={handleClick}
          />

          {/* Tooltip */}
          {tooltip && (
            <div
              className="pointer-events-none absolute z-10 rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: "translate(-50%, -100%)",
              }}
            >
              <span className="font-medium">{tooltip.label}</span>
              <span className="ml-1 text-muted-foreground">({tooltip.type})</span>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex gap-4 rounded-lg bg-card/80 px-3 py-2 backdrop-blur">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border-2 border-[#2dd4bf] bg-[rgba(45,212,191,0.2)]" />
              <span className="text-xs text-muted-foreground">Documentos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border-2 border-[#60a5fa] bg-[rgba(96,165,250,0.2)]" />
              <span className="text-xs text-muted-foreground">Entidades</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border-2 border-[#fbbf24] bg-[rgba(251,191,36,0.2)]" />
              <span className="text-xs text-muted-foreground">Conceptos</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
