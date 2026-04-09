import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Eraser, Check, Download, PenLine } from "lucide-react"

interface SignaturePadProps {
  onSave: (dataUrl: string) => void
  onCancel: () => void
  width?: number
  height?: number
}

export function SignaturePad({ onSave, onCancel, width = 500, height = 200 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = "#1a1a2e"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    // Draw baseline
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = "#cccccc"
    ctx.beginPath()
    ctx.moveTo(40, height - 40)
    ctx.lineTo(width - 40, height - 40)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.strokeStyle = "#1a1a2e"
    // Label
    ctx.fillStyle = "#999999"
    ctx.font = "11px system-ui"
    ctx.fillText("Firma aqui", 40, height - 20)
  }, [width, height])

  const getPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true)
    setHasSignature(true)
    const ctx = canvasRef.current!.getContext("2d")!
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }, [getPos])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return
    const ctx = canvasRef.current!.getContext("2d")!
    const pos = getPos(e)
    ctx.strokeStyle = "#1a1a2e"
    ctx.lineWidth = 2
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }, [drawing, getPos])

  const handleMouseUp = useCallback(() => {
    setDrawing(false)
  }, [])

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)
    // Redraw baseline
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = "#cccccc"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, height - 40)
    ctx.lineTo(width - 40, height - 40)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = "#999999"
    ctx.font = "11px system-ui"
    ctx.fillText("Firma aqui", 40, height - 20)
    setHasSignature(false)
  }

  const handleSave = () => {
    if (!canvasRef.current || !hasSignature) return
    const dataUrl = canvasRef.current.toDataURL("image/png")
    onSave(dataUrl)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <PenLine className="h-4 w-4" />
        <span>Dibuja tu firma con el raton</span>
      </div>
      <div className="overflow-hidden rounded-lg border-2 border-border bg-white">
        <canvas
          ref={canvasRef}
          style={{ width, height, cursor: "crosshair" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleClear} className="gap-1.5">
          <Eraser className="h-3.5 w-3.5" /> Borrar
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" onClick={handleSave} disabled={!hasSignature} className="gap-1.5">
          <Check className="h-3.5 w-3.5" /> Firmar documento
        </Button>
      </div>
    </div>
  )
}
