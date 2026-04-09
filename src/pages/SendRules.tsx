import { useState } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import {
  Plus, Settings, Trash2, Clock, Mail, Printer, Calendar, FileText,
  Shield, BarChart3, Megaphone, CheckCircle2, Edit, Copy, Zap,
} from "lucide-react"

interface SendRule {
  id: string
  name: string
  documentType: string
  days: string[]
  time: string
  channels: ("email" | "print")[]
  printer?: string
  recipients: string
  active: boolean
  lastRun?: string
  nextRun?: string
  docsAffected: number
}

const DAY_LABELS: Record<string, string> = {
  mon: "Lun", tue: "Mar", wed: "Mie", thu: "Jue", fri: "Vie", sat: "Sab", sun: "Dom"
}

const DOC_TYPE_CONFIG: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  poliza: { label: "Polizas", icon: Shield, color: "text-blue-500" },
  resumen: { label: "Resumenes", icon: BarChart3, color: "text-green-500" },
  publicidad: { label: "Publicidad", icon: Megaphone, color: "text-purple-500" },
  contrato: { label: "Contratos", icon: FileText, color: "text-orange-500" },
  informe: { label: "Informes", icon: BarChart3, color: "text-cyan-500" },
  todos: { label: "Todos", icon: FileText, color: "text-muted-foreground" },
}

const PRINTERS = [
  "HP LaserJet Pro M404",
  "Xerox VersaLink C405",
  "Canon imageCLASS MF743",
  "Epson WorkForce Pro",
  "Sin impresora",
]

const DEFAULT_RULES: SendRule[] = [
  {
    id: "r1", name: "Polizas - Martes/Jueves",
    documentType: "poliza", days: ["tue", "thu"], time: "09:00",
    channels: ["email", "print"], printer: "HP LaserJet Pro M404",
    recipients: "cliente", active: true, lastRun: "08/04/2026 09:00",
    nextRun: "10/04/2026 09:00", docsAffected: 10,
  },
  {
    id: "r2", name: "Resumenes anuales - Viernes",
    documentType: "resumen", days: ["fri"], time: "10:00",
    channels: ["email"], recipients: "cliente", active: true,
    lastRun: "04/04/2026 10:00", nextRun: "11/04/2026 10:00", docsAffected: 3,
  },
  {
    id: "r3", name: "Publicidad - Viernes",
    documentType: "publicidad", days: ["fri"], time: "11:00",
    channels: ["email", "print"], printer: "Xerox VersaLink C405",
    recipients: "todos", active: true, lastRun: "04/04/2026 11:00",
    nextRun: "11/04/2026 11:00", docsAffected: 2,
  },
]

export default function SendRulesPage() {
  const [rules, setRules] = useState<SendRule[]>(DEFAULT_RULES)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<SendRule | null>(null)

  // Form state
  const [formName, setFormName] = useState("")
  const [formDocType, setFormDocType] = useState("poliza")
  const [formDays, setFormDays] = useState<string[]>([])
  const [formTime, setFormTime] = useState("09:00")
  const [formEmail, setFormEmail] = useState(true)
  const [formPrint, setFormPrint] = useState(false)
  const [formPrinter, setFormPrinter] = useState(PRINTERS[0])
  const [formRecipients, setFormRecipients] = useState("cliente")

  const resetForm = () => {
    setFormName(""); setFormDocType("poliza"); setFormDays([]); setFormTime("09:00")
    setFormEmail(true); setFormPrint(false); setFormPrinter(PRINTERS[0]); setFormRecipients("cliente")
  }

  const openCreate = () => { resetForm(); setEditingRule(null); setDialogOpen(true) }

  const openEdit = (r: SendRule) => {
    setFormName(r.name); setFormDocType(r.documentType); setFormDays([...r.days])
    setFormTime(r.time); setFormEmail(r.channels.includes("email"))
    setFormPrint(r.channels.includes("print")); setFormPrinter(r.printer || PRINTERS[0])
    setFormRecipients(r.recipients); setEditingRule(r); setDialogOpen(true)
  }

  const handleSave = () => {
    if (!formName.trim() || formDays.length === 0) return
    const channels: ("email" | "print")[] = []
    if (formEmail) channels.push("email")
    if (formPrint) channels.push("print")

    if (editingRule) {
      setRules((prev) => prev.map((r) => r.id === editingRule.id ? {
        ...r, name: formName, documentType: formDocType, days: formDays,
        time: formTime, channels, printer: formPrint ? formPrinter : undefined,
        recipients: formRecipients,
      } : r))
    } else {
      setRules((prev) => [...prev, {
        id: crypto.randomUUID(), name: formName, documentType: formDocType,
        days: formDays, time: formTime, channels,
        printer: formPrint ? formPrinter : undefined,
        recipients: formRecipients, active: true, docsAffected: 0,
      }])
    }
    setDialogOpen(false)
  }

  const toggleDay = (day: string) => {
    setFormDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day])
  }

  const toggleActive = (id: string) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r))
  }

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  const duplicateRule = (r: SendRule) => {
    setRules((prev) => [...prev, { ...r, id: crypto.randomUUID(), name: `${r.name} (copia)`, active: false }])
  }

  const activeRules = rules.filter((r) => r.active).length
  const totalDocs = rules.filter((r) => r.active).reduce((a, r) => a + r.docsAffected, 0)

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header title="Reglas de Envio" description="Configura cuando y como se envian los documentos" />
        <div className="p-6">
          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2.5"><Zap className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{rules.length}</p>
                  <p className="text-xs text-muted-foreground">Reglas totales</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-green-500/10 p-2.5"><CheckCircle2 className="h-5 w-5 text-green-500" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeRules}</p>
                  <p className="text-xs text-muted-foreground">Activas</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-blue-500/10 p-2.5"><FileText className="h-5 w-5 text-blue-500" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalDocs}</p>
                  <p className="text-xs text-muted-foreground">Docs afectados</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Reglas configuradas</h2>
            <Button size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Nueva Regla
            </Button>
          </div>

          {/* Rules list */}
          <div className="mt-4 space-y-3">
            {rules.map((rule) => {
              const typeConfig = DOC_TYPE_CONFIG[rule.documentType] || DOC_TYPE_CONFIG.todos
              const TypeIcon = typeConfig.icon
              return (
                <Card key={rule.id} className={`border-border bg-card transition-opacity ${!rule.active ? "opacity-50" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="rounded-lg bg-secondary p-2.5">
                        <TypeIcon className={`h-5 w-5 ${typeConfig.color}`} />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">{rule.name}</h3>
                          <Badge variant="outline" className="text-[10px]">{typeConfig.label}</Badge>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          {/* Days */}
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <div className="flex gap-1">
                              {Object.entries(DAY_LABELS).map(([key, label]) => (
                                <span key={key} className={`rounded px-1.5 py-0.5 text-[10px] ${
                                  rule.days.includes(key)
                                    ? "bg-primary/20 font-medium text-primary"
                                    : "bg-secondary text-muted-foreground/50"
                                }`}>{label}</span>
                              ))}
                            </div>
                          </div>

                          {/* Time */}
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{rule.time}h</span>

                          {/* Channels */}
                          {rule.channels.includes("email") && (
                            <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />Email</span>
                          )}
                          {rule.channels.includes("print") && (
                            <span className="flex items-center gap-1"><Printer className="h-3.5 w-3.5" />{rule.printer}</span>
                          )}

                          {/* Docs */}
                          <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{rule.docsAffected} docs</span>
                        </div>

                        {/* Last/Next run */}
                        {(rule.lastRun || rule.nextRun) && (
                          <div className="mt-2 flex gap-4 text-[10px] text-muted-foreground">
                            {rule.lastRun && <span>Ultima ejecucion: {rule.lastRun}</span>}
                            {rule.nextRun && <span className="text-primary">Proxima: {rule.nextRun}</span>}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Switch checked={rule.active} onCheckedChange={() => toggleActive(rule.id)} />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(rule)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateRule(rule)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteRule(rule.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {rules.length === 0 && (
              <Card className="border-border bg-card">
                <CardContent className="py-12 text-center">
                  <Settings className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 font-medium text-foreground">No hay reglas configuradas</p>
                  <p className="mt-1 text-sm text-muted-foreground">Crea una regla para automatizar los envios</p>
                  <Button className="mt-4" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nueva Regla</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit Rule Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Editar Regla" : "Nueva Regla de Envio"}</DialogTitle>
            <DialogDescription>Configura cuando y como se envian los documentos automaticamente</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>Nombre de la regla</Label>
              <Input placeholder="Ej: Polizas - Martes/Jueves" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Tipo de documento</Label>
              <Select value={formDocType} onValueChange={setFormDocType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DOC_TYPE_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dias de envio</Label>
              <div className="flex gap-2">
                {Object.entries(DAY_LABELS).map(([key, label]) => (
                  <button key={key} onClick={() => toggleDay(key)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      formDays.includes(key)
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/50"
                    }`}>{label}</button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hora de envio</Label>
              <Input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} className="w-32" />
            </div>

            <div className="space-y-3">
              <Label>Canales de envio</Label>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Email</span>
                </div>
                <Switch checked={formEmail} onCheckedChange={setFormEmail} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Printer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Impresion</span>
                  </div>
                  <Switch checked={formPrint} onCheckedChange={setFormPrint} />
                </div>
                {formPrint && (
                  <Select value={formPrinter} onValueChange={setFormPrinter}>
                    <SelectTrigger className="ml-6 w-auto"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRINTERS.filter((p) => p !== "Sin impresora").map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Destinatarios</Label>
              <Select value={formRecipients} onValueChange={setFormRecipients}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente del documento</SelectItem>
                  <SelectItem value="todos">Todos los clientes</SelectItem>
                  <SelectItem value="departamento">Departamento responsable</SelectItem>
                  <SelectItem value="custom">Lista personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!formName.trim() || formDays.length === 0}>
              {editingRule ? "Guardar" : "Crear Regla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
