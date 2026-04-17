import { useState } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { DEFAULT_PROCESS_PROFILES, PROFILE_COLOR_CLASSES } from "@/lib/process-profiles"
import type { ProcessProfile } from "@/lib/types"
import {
  Moon, Zap, Sparkles, FileEdit, Plus, Edit, Clock, Bell,
  AlertCircle, Package, Printer, GitBranch,
} from "lucide-react"

const ICON_MAP: Record<string, typeof Moon> = {
  Moon, Zap, Sparkles, FileEdit,
}

export default function ProcessProfilesPage() {
  const [profiles, setProfiles] = useState<ProcessProfile[]>(DEFAULT_PROCESS_PROFILES)
  const [editingProfile, setEditingProfile] = useState<ProcessProfile | null>(null)

  const toggleActive = (id: string) => {
    setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, active: !p.active } : p))
  }

  const saveProfile = () => {
    if (!editingProfile) return
    setProfiles((prev) => {
      const exists = prev.find((p) => p.id === editingProfile.id)
      if (exists) return prev.map((p) => p.id === editingProfile.id ? editingProfile : p)
      return [...prev, { ...editingProfile, id: `profile-${Date.now()}` }]
    })
    setEditingProfile(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header
          title="Perfiles de Proceso"
          description="Configura distintos tipos de procesamiento: diario, urgente, campañas..."
        />
        <div className="p-6">
          {/* Intro */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-3 p-4">
              <GitBranch className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="flex-1 text-sm text-muted-foreground">
                <p>
                  Los <strong className="text-foreground">Perfiles de Proceso</strong> permiten aplicar
                  diferentes pipelines y configuraciones según el tipo de trabajo: batch nocturno diario,
                  procesos urgentes con SLA ajustado, campañas estacionales con A/B testing, o procesos ad-hoc.
                </p>
                <p className="mt-1">
                  Cada regla de envío y workflow puede asociarse a un perfil para definir cómo se ejecuta.
                </p>
              </div>
              <InfoTooltip
                description="Los perfiles de proceso determinan SLA, prioridad, pipeline, ensobrado y notificaciones."
                legacy="Equivalente a los distintos PROCESSINGQUEUE del sistema legacy (PDFQueue, PostscriptQueue, HTTPQueue, DEEMAILQueue)"
              />
            </CardContent>
          </Card>

          {/* New profile button */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {profiles.filter((p) => p.active).length} de {profiles.length} perfiles activos
            </p>
            <Button size="sm" className="gap-1.5" onClick={() => setEditingProfile({
              id: "",
              name: "",
              type: "adhoc",
              icon: "FileEdit",
              color: "blue",
              priority: 3,
              schedule: { mode: "immediate" },
              pipelineSteps: [],
              sendRuleIds: [],
              postprocessing: {},
              notifications: { channel: "email" },
              active: true,
              description: "",
            })}>
              <Plus className="h-4 w-4" /> Nuevo perfil
            </Button>
          </div>

          {/* Profile cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {profiles.map((profile) => {
              const Icon = ICON_MAP[profile.icon] || FileEdit
              const colors = PROFILE_COLOR_CLASSES[profile.color] || PROFILE_COLOR_CLASSES.blue

              return (
                <Card key={profile.id} className={`border-border bg-card ${!profile.active ? "opacity-60" : ""}`}>
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="mb-4 flex items-start gap-3">
                      <div className={`rounded-lg p-2.5 ${colors.card}`}>
                        <Icon className={`h-5 w-5 ${colors.icon}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{profile.name}</h3>
                          <Badge variant="outline" className={`text-[10px] ${colors.badge}`}>
                            Prio {profile.priority}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {profile.type === "daily" && "Procesamiento diario batch"}
                          {profile.type === "urgent" && "Procesamiento inmediato"}
                          {profile.type === "campaign" && "Campaña programada"}
                          {profile.type === "adhoc" && "Procesamiento ad-hoc"}
                        </p>
                      </div>
                      <Switch checked={profile.active} onCheckedChange={() => toggleActive(profile.id)} />
                    </div>

                    {/* Description */}
                    {profile.description && (
                      <p className="mb-3 text-xs text-muted-foreground">{profile.description}</p>
                    )}

                    {/* Attributes grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-md bg-secondary/40 p-2">
                        <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" /> Horario
                        </p>
                        <p className="mt-0.5 font-medium">
                          {profile.schedule.mode === "immediate" && "Inmediato"}
                          {profile.schedule.mode === "batch" && `Batch ${profile.schedule.cron || ""}`}
                          {profile.schedule.mode === "scheduled" && "Programado"}
                        </p>
                      </div>
                      <div className="rounded-md bg-secondary/40 p-2">
                        <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <AlertCircle className="h-2.5 w-2.5" /> SLA
                        </p>
                        <p className="mt-0.5 font-medium">
                          {profile.slaMinutes ? `${profile.slaMinutes} min` : "—"}
                        </p>
                      </div>
                      <div className="rounded-md bg-secondary/40 p-2">
                        <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Package className="h-2.5 w-2.5" /> Pipeline
                        </p>
                        <p className="mt-0.5 font-medium">{profile.pipelineSteps.length} pasos</p>
                      </div>
                      <div className="rounded-md bg-secondary/40 p-2">
                        <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Printer className="h-2.5 w-2.5" /> Postproceso
                        </p>
                        <p className="mt-0.5 font-medium">
                          {profile.postprocessing.envelopeConfigId ? "Con ensobrado" : "Sin ensobrado"}
                        </p>
                      </div>
                    </div>

                    {/* Pipeline steps preview */}
                    <div className="mt-3">
                      <p className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">Pipeline</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.pipelineSteps.slice(0, 4).map((step, i) => (
                          <Badge key={i} variant="outline" className="text-[9px]">{step}</Badge>
                        ))}
                        {profile.pipelineSteps.length > 4 && (
                          <Badge variant="outline" className="text-[9px]">+{profile.pipelineSteps.length - 4}</Badge>
                        )}
                      </div>
                    </div>

                    {/* Notifications */}
                    {(profile.notifications.onComplete || profile.notifications.onError) && (
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Bell className="h-3 w-3" />
                        <span>
                          Notifica vía {profile.notifications.channel || "email"}
                          {profile.notifications.onError && profile.notifications.onError.length > 0 && " (errores a soporte)"}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-[10px] text-muted-foreground">ID: {profile.id}</span>
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => setEditingProfile(profile)}>
                        <Edit className="h-3 w-3" /> Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>

      {/* Edit dialog */}
      <Dialog open={!!editingProfile} onOpenChange={(v) => !v && setEditingProfile(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProfile?.id ? "Editar perfil" : "Nuevo perfil de proceso"}</DialogTitle>
          </DialogHeader>
          {editingProfile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nombre</Label>
                  <Input
                    value={editingProfile.name}
                    onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                    placeholder="Campaña Navidad 2026"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs">
                    Tipo
                    <InfoTooltip description="Define la naturaleza del proceso: diario, urgente, campaña, ad-hoc" />
                  </Label>
                  <Select value={editingProfile.type} onValueChange={(v: ProcessProfile["type"]) => setEditingProfile({ ...editingProfile, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario (batch nocturno)</SelectItem>
                      <SelectItem value="urgent">Urgente (inmediato)</SelectItem>
                      <SelectItem value="campaign">Campaña (programada)</SelectItem>
                      <SelectItem value="adhoc">Ad-hoc (manual)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Descripción</Label>
                <Textarea
                  value={editingProfile.description || ""}
                  onChange={(e) => setEditingProfile({ ...editingProfile, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs">
                    Prioridad
                    <InfoTooltip description="1 = máxima prioridad (urgente), 5 = mínima (baja prioridad)" />
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={editingProfile.priority}
                    onChange={(e) => setEditingProfile({ ...editingProfile, priority: parseInt(e.target.value) || 3 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs">
                    SLA (min)
                    <InfoTooltip description="Tiempo máximo de procesamiento en minutos. Se dispara alerta si se supera." />
                  </Label>
                  <Input
                    type="number"
                    value={editingProfile.slaMinutes || ""}
                    onChange={(e) => setEditingProfile({ ...editingProfile, slaMinutes: parseInt(e.target.value) || undefined })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Color</Label>
                  <Select value={editingProfile.color} onValueChange={(v) => setEditingProfile({ ...editingProfile, color: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="green">Verde</SelectItem>
                      <SelectItem value="red">Rojo</SelectItem>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="purple">Morado</SelectItem>
                      <SelectItem value="yellow">Amarillo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  Horario
                  <InfoTooltip
                    description="Cuándo se ejecuta el proceso"
                    legacy="Equivalente a los batches diarios del sistema legacy (03:00, 09:00, etc.)"
                  />
                </Label>
                <Select
                  value={editingProfile.schedule.mode}
                  onValueChange={(v: ProcessProfile["schedule"]["mode"]) => setEditingProfile({ ...editingProfile, schedule: { ...editingProfile.schedule, mode: v } })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Inmediato (al llegar el trabajo)</SelectItem>
                    <SelectItem value="batch">Batch recurrente (cron)</SelectItem>
                    <SelectItem value="scheduled">Programado (fecha concreta)</SelectItem>
                  </SelectContent>
                </Select>
                {editingProfile.schedule.mode === "batch" && (
                  <Input
                    className="font-mono text-xs"
                    placeholder="0 3 * * *   (diario a las 03:00)"
                    value={editingProfile.schedule.cron || ""}
                    onChange={(e) => setEditingProfile({ ...editingProfile, schedule: { ...editingProfile.schedule, cron: e.target.value } })}
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  Pipeline Steps
                  <InfoTooltip description="Pasos del pipeline que se aplicarán en este perfil. Uno por línea." />
                </Label>
                <Textarea
                  rows={6}
                  className="font-mono text-xs"
                  value={editingProfile.pipelineSteps.join("\n")}
                  onChange={(e) => setEditingProfile({ ...editingProfile, pipelineSteps: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingProfile(null)}>Cancelar</Button>
                <Button size="sm" onClick={saveProfile}>Guardar perfil</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
