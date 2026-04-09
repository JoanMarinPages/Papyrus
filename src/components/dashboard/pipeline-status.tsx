import { useState, useEffect, useCallback } from "react"
import { Upload, Cpu, Search, FileOutput, CheckCircle2, Play, Pause, RotateCcw, Square, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StepStatus = "pending" | "running" | "completed" | "error"
type PipelineState = "idle" | "running" | "paused" | "completed" | "error"

interface PipelineStep {
  id: string
  name: string
  description: string
  icon: typeof Upload
  status: StepStatus
  count: number
  progress: number
}

const INITIAL_STEPS: PipelineStep[] = [
  { id: "ingestion", name: "Ingestion", description: "Parsing & Chunking", icon: Upload, status: "pending", count: 0, progress: 0 },
  { id: "embedding", name: "Embedding", description: "Vectorizacion", icon: Cpu, status: "pending", count: 0, progress: 0 },
  { id: "retrieval", name: "Retrieval", description: "Vector + Graph", icon: Search, status: "pending", count: 0, progress: 0 },
  { id: "generation", name: "Generation", description: "LLM Output", icon: FileOutput, status: "pending", count: 0, progress: 0 },
]

const statusStyles: Record<StepStatus, { bg: string; border: string; icon: string }> = {
  completed: { bg: "bg-primary/10", border: "border-primary/30", icon: "text-primary" },
  running: { bg: "bg-blue-500/10", border: "border-blue-500/30", icon: "text-blue-500" },
  error: { bg: "bg-red-500/10", border: "border-red-500/30", icon: "text-red-500" },
  pending: { bg: "bg-secondary", border: "border-border", icon: "text-muted-foreground" },
}

const stateLabels: Record<PipelineState, { label: string; color: string }> = {
  idle: { label: "Inactivo", color: "text-muted-foreground" },
  running: { label: "Ejecutando", color: "text-blue-500" },
  paused: { label: "Pausado", color: "text-yellow-500" },
  completed: { label: "Completado", color: "text-green-500" },
  error: { label: "Error", color: "text-red-500" },
}

export function PipelineStatus() {
  const [pipelineState, setPipelineState] = useState<PipelineState>("idle")
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS)
  const [currentStepIdx, setCurrentStepIdx] = useState(-1)
  const [currentDoc, setCurrentDoc] = useState("")
  const [overallProgress, setOverallProgress] = useState(0)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  const docs = [
    "Poliza Hogar - Garcia Martinez",
    "Poliza Auto - Sanchez Ruiz",
    "Resumen Anual - Lopez Fernandez",
    "Contrato Servicios - Rodriguez Diaz",
    "Pack Familia AXA 2026",
  ]

  const stopSimulation = useCallback(() => {
    if (intervalId) { clearInterval(intervalId); setIntervalId(null) }
  }, [intervalId])

  const runPipeline = useCallback(() => {
    stopSimulation()
    setPipelineState("running")
    setCurrentStepIdx(0)
    setOverallProgress(0)
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "pending", count: 0, progress: 0 })))

    let stepIdx = 0
    let progress = 0
    let docIdx = 0

    const id = setInterval(() => {
      progress += Math.random() * 8 + 2

      if (progress >= 100) {
        // Complete current step
        setSteps((prev) => prev.map((s, i) =>
          i === stepIdx ? { ...s, status: "completed", progress: 100, count: [15, 94, 134, 5][i] } : s
        ))
        stepIdx++
        progress = 0
        docIdx = (docIdx + 1) % docs.length

        if (stepIdx >= 4) {
          // All done
          clearInterval(id)
          setIntervalId(null)
          setPipelineState("completed")
          setOverallProgress(100)
          setCurrentStepIdx(-1)
          return
        }

        setCurrentStepIdx(stepIdx)
        setSteps((prev) => prev.map((s, i) =>
          i === stepIdx ? { ...s, status: "running", progress: 0 } : s
        ))
      } else {
        setSteps((prev) => prev.map((s, i) =>
          i === stepIdx ? { ...s, status: "running", progress: Math.min(progress, 99) } : s
        ))
      }

      setCurrentDoc(docs[docIdx])
      setOverallProgress(Math.round(((stepIdx * 100 + progress) / 400) * 100))
    }, 300)

    setIntervalId(id)
    // Start first step
    setSteps((prev) => prev.map((s, i) => i === 0 ? { ...s, status: "running" } : s))
    setCurrentDoc(docs[0])
  }, [stopSimulation])

  const pausePipeline = () => {
    stopSimulation()
    setPipelineState("paused")
  }

  const resumePipeline = () => {
    // Simple resume: just restart from current state
    runPipeline()
  }

  const stopPipeline = () => {
    stopSimulation()
    setPipelineState("idle")
    setSteps(INITIAL_STEPS)
    setCurrentStepIdx(-1)
    setOverallProgress(0)
    setCurrentDoc("")
  }

  const retryPipeline = () => {
    runPipeline()
  }

  useEffect(() => { return () => { if (intervalId) clearInterval(intervalId) } }, [intervalId])

  const stateInfo = stateLabels[pipelineState]

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Pipeline RAG</CardTitle>
            <p className="text-sm text-muted-foreground">Estado del pipeline de procesamiento</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${stateInfo.color}`}>
              {stateInfo.label}
            </Badge>
            {pipelineState === "idle" && (
              <Button size="sm" className="gap-1.5" onClick={runPipeline}>
                <Play className="h-3.5 w-3.5" /> Ejecutar
              </Button>
            )}
            {pipelineState === "running" && (
              <>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={pausePipeline}>
                  <Pause className="h-3.5 w-3.5" /> Pausar
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-destructive" onClick={stopPipeline}>
                  <Square className="h-3.5 w-3.5" /> Parar
                </Button>
              </>
            )}
            {pipelineState === "paused" && (
              <>
                <Button size="sm" className="gap-1.5" onClick={resumePipeline}>
                  <Play className="h-3.5 w-3.5" /> Continuar
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-destructive" onClick={stopPipeline}>
                  <Square className="h-3.5 w-3.5" /> Parar
                </Button>
              </>
            )}
            {pipelineState === "completed" && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={retryPipeline}>
                <RotateCcw className="h-3.5 w-3.5" /> Re-ejecutar
              </Button>
            )}
            {pipelineState === "error" && (
              <Button size="sm" className="gap-1.5" onClick={retryPipeline}>
                <RotateCcw className="h-3.5 w-3.5" /> Reintentar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Pipeline steps */}
        <div className="relative flex items-center justify-between">
          <div className="absolute left-8 right-8 top-8 h-0.5 bg-border" />
          {steps.map((step) => {
            const styles = statusStyles[step.status]
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div className={cn("flex h-16 w-16 items-center justify-center rounded-xl border-2", styles.bg, styles.border)}>
                  {step.status === "completed" ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : step.status === "error" ? (
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  ) : step.status === "running" ? (
                    <div className="relative">
                      <step.icon className={cn("h-6 w-6 animate-pulse", styles.icon)} />
                    </div>
                  ) : (
                    <step.icon className={cn("h-6 w-6", styles.icon)} />
                  )}
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">{step.name}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                {step.status === "running" && (
                  <span className="mt-1 text-xs font-medium text-blue-500">{Math.round(step.progress)}%</span>
                )}
                {step.status === "completed" && step.count > 0 && (
                  <span className="mt-1 text-xs font-medium text-primary">{step.count.toLocaleString()}</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Current activity */}
        {(pipelineState === "running" || pipelineState === "paused") && (
          <div className="mt-6 rounded-lg bg-secondary p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`h-2 w-2 rounded-full ${pipelineState === "running" ? "bg-blue-500" : "bg-yellow-500"}`} />
                {pipelineState === "running" && (
                  <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-blue-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {pipelineState === "paused" ? "Pausado" : "Procesando"}: {currentDoc}
                </p>
                <p className="text-xs text-muted-foreground">
                  Etapa: {steps[currentStepIdx]?.name || "?"} · {overallProgress}% completado
                </p>
              </div>
              {pipelineState === "paused" && (
                <Badge variant="outline" className="border-yellow-500/20 bg-yellow-500/10 text-xs text-yellow-500">
                  <Pause className="mr-1 h-3 w-3" /> En pausa
                </Badge>
              )}
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background">
              <div
                className={`h-full rounded-full transition-all ${pipelineState === "paused" ? "bg-yellow-500" : "bg-blue-500"}`}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        )}

        {pipelineState === "completed" && (
          <div className="mt-6 rounded-lg bg-green-500/5 border border-green-500/20 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <p className="text-sm font-medium text-green-500">Pipeline completado con exito</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              15 documentos procesados · 94 entidades · 134 relaciones · 5 documentos generados
            </p>
          </div>
        )}

        {pipelineState === "idle" && (
          <div className="mt-6 rounded-lg bg-secondary p-4 text-center">
            <Clock className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Pipeline inactivo. Pulsa "Ejecutar" para procesar documentos.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
