import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Upload, Cpu, Search, FileOutput, CheckCircle2, Play, Pause,
  RotateCcw, Square, Clock, AlertCircle, ChevronDown, ChevronRight,
  FileText, Maximize2, Eye, Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StepStatus = "pending" | "running" | "completed" | "error"
type PipelineState = "idle" | "running" | "paused" | "completed" | "error"
type DocStatus = "queued" | "processing" | "done" | "error"

interface PipelineStep {
  id: string
  name: string
  description: string
  icon: typeof Upload
  status: StepStatus
  count: number
  progress: number
}

interface PipelineDoc {
  name: string
  status: DocStatus
  step: string
  progress: number
}

const STEP_DEFS: Omit<PipelineStep, "status" | "count" | "progress">[] = [
  { id: "ingestion", name: "Ingestion", description: "Parsing & Chunking", icon: Upload },
  { id: "embedding", name: "Embedding", description: "Vectorizacion", icon: Cpu },
  { id: "retrieval", name: "Retrieval", description: "Vector + Graph", icon: Search },
  { id: "generation", name: "Generation", description: "LLM Output", icon: FileOutput },
]

const DOC_NAMES = [
  "Poliza Hogar - Garcia Martinez",
  "Poliza Auto - Garcia Martinez",
  "Poliza Vida - Lopez Fernandez",
  "Poliza Auto - Sanchez Ruiz",
  "Pack Familia AXA 2026",
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

function makeInitialSteps(): PipelineStep[] {
  return STEP_DEFS.map((s) => ({ ...s, status: "pending" as StepStatus, count: 0, progress: 0 }))
}

function makeInitialDocs(): PipelineDoc[] {
  return DOC_NAMES.map((name) => ({ name, status: "queued", step: "", progress: 0 }))
}

export function PipelineStatus() {
  const navigate = useNavigate()
  const [pipelineState, setPipelineState] = useState<PipelineState>("idle")
  const [steps, setSteps] = useState<PipelineStep[]>(makeInitialSteps())
  const [docs, setDocs] = useState<PipelineDoc[]>(makeInitialDocs())
  const [currentStepIdx, setCurrentStepIdx] = useState(-1)
  const [currentDocIdx, setCurrentDocIdx] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)
  const [showDocs, setShowDocs] = useState(false)

  // Use refs for simulation state so pause/resume works
  const simRef = useRef({ stepIdx: 0, stepProgress: 0, docIdx: 0, intervalId: null as NodeJS.Timeout | null })

  const clearSim = useCallback(() => {
    if (simRef.current.intervalId) {
      clearInterval(simRef.current.intervalId)
      simRef.current.intervalId = null
    }
  }, [])

  const tick = useCallback(() => {
    const sim = simRef.current
    sim.stepProgress += Math.random() * 8 + 2

    if (sim.stepProgress >= 100) {
      // Complete step
      setSteps((prev) => prev.map((s, i) =>
        i === sim.stepIdx ? { ...s, status: "completed", progress: 100, count: [15, 94, 134, 5][i] } : s
      ))
      sim.stepIdx++
      sim.stepProgress = 0
      sim.docIdx = (sim.docIdx + 1) % DOC_NAMES.length

      // Update doc statuses
      setDocs((prev) => prev.map((d, i) =>
        i < sim.docIdx ? { ...d, status: "done", progress: 100, step: "Completado" } :
        i === sim.docIdx ? { ...d, status: "processing", step: STEP_DEFS[Math.min(sim.stepIdx, 3)]?.name || "", progress: 0 } :
        d
      ))

      if (sim.stepIdx >= 4) {
        clearSim()
        setPipelineState("completed")
        setOverallProgress(100)
        setCurrentStepIdx(-1)
        setDocs((prev) => prev.map((d) => ({ ...d, status: "done", progress: 100, step: "Completado" })))
        return
      }

      setCurrentStepIdx(sim.stepIdx)
      setSteps((prev) => prev.map((s, i) =>
        i === sim.stepIdx ? { ...s, status: "running", progress: 0 } : s
      ))
    } else {
      setSteps((prev) => prev.map((s, i) =>
        i === sim.stepIdx ? { ...s, status: "running", progress: Math.min(sim.stepProgress, 99) } : s
      ))
      // Update current doc progress
      setDocs((prev) => prev.map((d, i) =>
        i === sim.docIdx ? { ...d, status: "processing", step: STEP_DEFS[sim.stepIdx]?.name || "", progress: Math.round(sim.stepProgress) } : d
      ))
    }

    setCurrentDocIdx(sim.docIdx)
    setOverallProgress(Math.round(((sim.stepIdx * 100 + sim.stepProgress) / 400) * 100))
  }, [clearSim])

  const startSimulation = useCallback(() => {
    clearSim()
    const id = setInterval(tick, 300)
    simRef.current.intervalId = id
  }, [clearSim, tick])

  const runPipeline = useCallback(() => {
    // Full reset
    simRef.current = { stepIdx: 0, stepProgress: 0, docIdx: 0, intervalId: null }
    setPipelineState("running")
    setCurrentStepIdx(0)
    setCurrentDocIdx(0)
    setOverallProgress(0)
    setSteps(makeInitialSteps().map((s, i) => i === 0 ? { ...s, status: "running" } : s))
    setDocs(makeInitialDocs().map((d, i) => i === 0 ? { ...d, status: "processing", step: "Ingestion" } : d))
    startSimulation()
  }, [startSimulation])

  const pausePipeline = useCallback(() => {
    clearSim()
    setPipelineState("paused")
    // Steps and docs keep their current state - no reset
  }, [clearSim])

  const resumePipeline = useCallback(() => {
    setPipelineState("running")
    // Continue from where we left off - simRef still has the state
    startSimulation()
  }, [startSimulation])

  const stopPipeline = useCallback(() => {
    clearSim()
    simRef.current = { stepIdx: 0, stepProgress: 0, docIdx: 0, intervalId: null }
    setPipelineState("idle")
    setSteps(makeInitialSteps())
    setDocs(makeInitialDocs())
    setCurrentStepIdx(-1)
    setOverallProgress(0)
  }, [clearSim])

  useEffect(() => { return clearSim }, [clearSim])

  const stateInfo = stateLabels[pipelineState]
  const completedDocs = docs.filter((d) => d.status === "done").length

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Pipeline RAG</CardTitle>
            <p className="text-sm text-muted-foreground">Estado del pipeline de procesamiento</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${stateInfo.color}`}>{stateInfo.label}</Badge>
            {pipelineState === "idle" && (
              <Button size="sm" className="gap-1.5" onClick={runPipeline}><Play className="h-3.5 w-3.5" /> Ejecutar</Button>
            )}
            {pipelineState === "running" && (
              <>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={pausePipeline}><Pause className="h-3.5 w-3.5" /> Pausar</Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-destructive" onClick={stopPipeline}><Square className="h-3.5 w-3.5" /> Parar</Button>
              </>
            )}
            {pipelineState === "paused" && (
              <>
                <Button size="sm" className="gap-1.5" onClick={resumePipeline}><Play className="h-3.5 w-3.5" /> Continuar</Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-destructive" onClick={stopPipeline}><Square className="h-3.5 w-3.5" /> Parar</Button>
              </>
            )}
            {pipelineState === "completed" && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={runPipeline}><RotateCcw className="h-3.5 w-3.5" /> Re-ejecutar</Button>
            )}
            {pipelineState === "error" && (
              <Button size="sm" className="gap-1.5" onClick={runPipeline}><RotateCcw className="h-3.5 w-3.5" /> Reintentar</Button>
            )}
            <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => navigate("/processing")} title="Ver a pantalla completa">
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
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
                  {step.status === "completed" ? <CheckCircle2 className="h-6 w-6 text-primary" />
                  : step.status === "error" ? <AlertCircle className="h-6 w-6 text-red-500" />
                  : step.status === "running" ? <step.icon className={cn("h-6 w-6 animate-pulse", styles.icon)} />
                  : <step.icon className={cn("h-6 w-6", styles.icon)} />}
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">{step.name}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                {step.status === "running" && <span className="mt-1 text-xs font-medium text-blue-500">{Math.round(step.progress)}%</span>}
                {step.status === "completed" && step.count > 0 && <span className="mt-1 text-xs font-medium text-primary">{step.count.toLocaleString()}</span>}
              </div>
            )
          })}
        </div>

        {/* Current activity + progress */}
        {(pipelineState === "running" || pipelineState === "paused") && (
          <div className="mt-6 rounded-lg bg-secondary p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`h-2 w-2 rounded-full ${pipelineState === "running" ? "bg-blue-500" : "bg-yellow-500"}`} />
                {pipelineState === "running" && <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-blue-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {pipelineState === "paused" ? "Pausado" : "Procesando"}: {DOC_NAMES[currentDocIdx]}
                </p>
                <p className="text-xs text-muted-foreground">
                  Etapa: {steps[currentStepIdx]?.name || "?"} · {overallProgress}% · {completedDocs}/{docs.length} docs
                </p>
              </div>
              {pipelineState === "paused" && (
                <Badge variant="outline" className="border-yellow-500/20 bg-yellow-500/10 text-xs text-yellow-500">
                  <Pause className="mr-1 h-3 w-3" /> En pausa
                </Badge>
              )}
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background">
              <div className={`h-full rounded-full transition-all ${pipelineState === "paused" ? "bg-yellow-500" : "bg-blue-500"}`}
                style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        )}

        {pipelineState === "completed" && (
          <div className="mt-6 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <p className="text-sm font-medium text-green-500">Pipeline completado</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{docs.length} documentos · 94 entidades · 134 relaciones</p>
          </div>
        )}

        {pipelineState === "idle" && (
          <div className="mt-6 rounded-lg bg-secondary p-4 text-center">
            <Clock className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Pipeline inactivo. Pulsa "Ejecutar" para procesar.</p>
          </div>
        )}

        {/* Document tree */}
        {pipelineState !== "idle" && (
          <div className="mt-4">
            <button onClick={() => setShowDocs(!showDocs)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary/50">
              {showDocs ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <FileText className="h-3.5 w-3.5" />
              Documentos ({completedDocs}/{docs.length})
            </button>

            {showDocs && (
              <div className="mt-1 space-y-1 pl-2">
                {docs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs">
                    {doc.status === "done" ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                    : doc.status === "processing" ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-blue-500" />
                    : doc.status === "error" ? <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                    : <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />}

                    <span className="min-w-0 flex-1 truncate font-medium text-foreground">{doc.name}</span>

                    {doc.status === "processing" && (
                      <>
                        <span className="shrink-0 text-[10px] text-blue-500">{doc.step}</span>
                        <div className="h-1 w-16 shrink-0 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${doc.progress}%` }} />
                        </div>
                      </>
                    )}
                    {doc.status === "done" && (
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0"
                        onClick={() => navigate(`/preview?type=poliza&client=c${i + 1}`)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                    {doc.status === "queued" && (
                      <span className="text-[10px] text-gray-400">En cola</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
