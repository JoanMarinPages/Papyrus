import { useState } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { MOCK_WORKFLOWS } from "@/lib/mock-data-extended"
import { DEFAULT_PROCESS_PROFILES, PROFILE_COLOR_CLASSES } from "@/lib/process-profiles"
import type { Workflow, WorkflowTriggerType } from "@/lib/types"
import {
  Workflow as WorkflowIcon, Plus, Upload, Search, Webhook, Calendar, Hand,
  FileInput, Play, CheckCircle2, FileCode, ArrowRight, MoreHorizontal, Edit, Trash2,
} from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const TRIGGER_ICONS: Record<WorkflowTriggerType, typeof FileInput> = {
  file_arrival: FileInput,
  document_created: FileCode,
  schedule: Calendar,
  manual: Hand,
  webhook: Webhook,
}

const TRIGGER_LABELS: Record<WorkflowTriggerType, string> = {
  file_arrival: "Llegada de fichero",
  document_created: "Documento creado",
  schedule: "Programado",
  manual: "Manual",
  webhook: "Webhook",
}

const ACTION_LABELS: Record<string, string> = {
  convert: "Convertir",
  extract: "Extraer entidades",
  index: "Indexar",
  generate: "Generar",
  send: "Enviar",
  postprocess: "Postprocesar",
  notify: "Notificar",
  archive: "Archivar",
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_WORKFLOWS)
  const [searchTerm, setSearchTerm] = useState("")
  const [showImport, setShowImport] = useState(false)

  const filtered = workflows.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleActive = (id: string) => {
    setWorkflows((prev) => prev.map((w) => w.id === id ? { ...w, active: !w.active } : w))
  }

  const runNow = (id: string) => {
    setWorkflows((prev) => prev.map((w) => w.id === id ? {
      ...w, lastRun: new Date().toISOString(), runCount: w.runCount + 1,
    } : w))
  }

  const remove = (id: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header
          title="Workflows"
          description="Automatiza secuencias de procesamiento con triggers y acciones"
        />
        <div className="p-6">
          {/* Intro */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-3 p-4">
              <WorkflowIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="flex-1 text-sm text-muted-foreground">
                <p>
                  Los <strong className="text-foreground">Workflows</strong> definen secuencias automatizadas:
                  <em>cuando X ocurre, ejecuta Y → Z → W</em>. Por ejemplo: "cuando llega un Excel de pólizas →
                  convertir → extraer entidades → generar PDFs → ensobrar → enviar".
                </p>
              </div>
              <InfoTooltip
                description="Los workflows ejecutan una secuencia de acciones cuando se cumple un trigger y sus condiciones."
                legacy="Equivalente a los triggers XML del Papyrus legacy (SAMPLEDIST → TASK → OUTPUTPART)"
              />
            </CardContent>
          </Card>

          {/* Header actions */}
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar workflows..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={showImport} onOpenChange={setShowImport}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Upload className="h-4 w-4" />
                  Importar Trigger XML
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Importar Trigger XML Legacy</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    Importa triggers XML del Papyrus legacy. Formato esperado:
                  </p>
                  <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 font-mono text-[10px] leading-relaxed text-green-400">
{`<SAMPLEDIST>
  <TASK>
    <DESCRIPTION>PDF_de_AFP</DESCRIPTION>
    <PROCESSINGQUEUE>PDFQueue</PROCESSINGQUEUE>
    <COMPLETEDQUEUE>CompletedQueue</COMPLETEDQUEUE>
    <ERRORQUEUE>ErrorQueue</ERRORQUEUE>
  </TASK>
  <OUTPUTPART>
    <AFPDS_NAME>input.afp</AFPDS_NAME>
    <PDF_NAME>output.pdf</PDF_NAME>
  </OUTPUTPART>
</SAMPLEDIST>`}
                  </pre>
                  <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm">Arrastra ficheros XML aquí</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowImport(false)}>Cancelar</Button>
                    <Button size="sm">Importar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Nuevo Workflow
            </Button>
          </div>

          {/* Workflows list */}
          <div className="space-y-3">
            {filtered.map((wf) => {
              const TriggerIcon = TRIGGER_ICONS[wf.triggerType]
              const profile = DEFAULT_PROCESS_PROFILES.find((p) => p.id === wf.processProfileId)
              const profileColors = profile ? PROFILE_COLOR_CLASSES[profile.color] : null

              return (
                <Card key={wf.id} className={`border-border bg-card ${!wf.active ? "opacity-60" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2.5">
                        <TriggerIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{wf.name}</h3>
                          <Badge variant="outline" className="text-[10px]">
                            <TriggerIcon className="mr-1 h-2.5 w-2.5" />
                            {TRIGGER_LABELS[wf.triggerType]}
                          </Badge>
                          {profile && profileColors && (
                            <Badge variant="outline" className={`text-[10px] ${profileColors.badge}`}>
                              Perfil: {profile.name}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{wf.description}</p>

                        {/* Conditions */}
                        {wf.conditions.length > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-1">
                            <span className="text-[10px] font-semibold text-muted-foreground">Condiciones:</span>
                            {wf.conditions.map((c, i) => (
                              <Badge key={i} variant="outline" className="font-mono text-[9px]">
                                {c.field} {c.operator} {Array.isArray(c.value) ? c.value.join(",") : c.value}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Action sequence */}
                        <div className="mt-3 flex flex-wrap items-center gap-1">
                          {wf.actions.map((a, i) => (
                            <div key={a.id} className="flex items-center">
                              <Badge variant="outline" className="border-primary/30 bg-primary/5 text-[10px] text-primary">
                                {a.order}. {ACTION_LABELS[a.type] || a.type}
                              </Badge>
                              {i < wf.actions.length - 1 && <ArrowRight className="mx-0.5 h-3 w-3 text-muted-foreground" />}
                            </div>
                          ))}
                        </div>

                        {/* Metadata */}
                        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" /> {wf.runCount} ejecuciones
                          </span>
                          {wf.lastRun && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Última: {new Date(wf.lastRun).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex shrink-0 items-center gap-2">
                        <Switch checked={wf.active} onCheckedChange={() => toggleActive(wf.id)} />
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => runNow(wf.id)} title="Ejecutar ahora">
                          <Play className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-3.5 w-3.5" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => remove(wf.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-3.5 w-3.5" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <Card className="border-dashed border-border">
              <CardContent className="p-8 text-center">
                <WorkflowIcon className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No hay workflows</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
