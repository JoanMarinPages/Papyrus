"use client"

import { Upload, Cpu, Search, FileOutput, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const pipelineSteps = [
  {
    id: "ingestion",
    name: "Ingestion",
    description: "Parsing & Chunking",
    icon: Upload,
    status: "completed",
    count: 847,
  },
  {
    id: "embedding",
    name: "Embedding",
    description: "Vectorización",
    icon: Cpu,
    status: "completed",
    count: 12456,
  },
  {
    id: "retrieval",
    name: "Retrieval",
    description: "Vector + Graph",
    icon: Search,
    status: "active",
    count: 156,
  },
  {
    id: "generation",
    name: "Generation",
    description: "LLM Output",
    icon: FileOutput,
    status: "pending",
    count: 0,
  },
]

const statusStyles = {
  completed: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: "text-primary",
    line: "bg-primary",
  },
  active: {
    bg: "bg-chart-2/10",
    border: "border-chart-2/30",
    icon: "text-chart-2",
    line: "bg-border",
  },
  pending: {
    bg: "bg-secondary",
    border: "border-border",
    icon: "text-muted-foreground",
    line: "bg-border",
  },
}

export function PipelineStatus() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Pipeline RAG</CardTitle>
        <p className="text-sm text-muted-foreground">
          Estado del pipeline de procesamiento
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative flex items-center justify-between">
          {/* Connecting line */}
          <div className="absolute left-8 right-8 top-8 h-0.5 bg-border" />
          
          {pipelineSteps.map((step, index) => {
            const styles = statusStyles[step.status as keyof typeof statusStyles]
            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center"
              >
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-xl border-2",
                    styles.bg,
                    styles.border
                  )}
                >
                  {step.status === "completed" ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : (
                    <step.icon className={cn("h-6 w-6", styles.icon)} />
                  )}
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  {step.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
                {step.count > 0 && (
                  <span className="mt-1 text-xs font-medium text-primary">
                    {step.count.toLocaleString()}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Current Activity */}
        <div className="mt-8 rounded-lg bg-secondary p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-chart-2" />
              <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-chart-2" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Procesando: Informe de Cumplimiento Normativo
              </p>
              <p className="text-xs text-muted-foreground">
                Etapa actual: Retrieval híbrido (Vector + Graph) · 67% completado
              </p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background">
            <div className="h-full w-[67%] rounded-full bg-chart-2 transition-all" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
