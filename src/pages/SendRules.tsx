import { useState, useRef } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import {
  Plus, Trash2, Clock, Mail, Printer, Calendar, FileText,
  Shield, BarChart3, Megaphone, CheckCircle2, Edit, Copy, Zap,
  Send, Bot, User, Loader2, Sparkles, AlertTriangle, FileCheck,
  Users, Package, Stamp, PenLine, Eye,
} from "lucide-react"

// --- Types ---
interface RuleCondition {
  id: string
  type: "cover_letter" | "signature" | "approval" | "grouping" | "delay" | "copies" | "format" | "watermark" | "custom"
  label: string
  value: string
  active: boolean
}

interface SendRule {
  id: string
  name: string
  description: string
  documentType: string
  days: string[]
  time: string
  channels: ("email" | "print")[]
  printer?: string
  recipients: string
  conditions: RuleCondition[]
  active: boolean
  priority: number
  lastRun?: string
  nextRun?: string
  docsAffected: number
  source: "manual" | "natural"
  originalPrompt?: string
}

// --- Constants ---
const DAY_LABELS: Record<string, string> = {
  mon: "Lun", tue: "Mar", wed: "Mie", thu: "Jue", fri: "Vie", sat: "Sab", sun: "Dom"
}

const DOC_TYPES: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  poliza: { label: "Polizas", icon: Shield, color: "text-blue-500" },
  siniestro: { label: "Siniestros", icon: AlertTriangle, color: "text-red-500" },
  resumen: { label: "Resumenes", icon: BarChart3, color: "text-green-500" },
  publicidad: { label: "Publicidad", icon: Megaphone, color: "text-purple-500" },
  contrato: { label: "Contratos", icon: FileCheck, color: "text-orange-500" },
  factura: { label: "Facturas", icon: FileText, color: "text-cyan-500" },
  todos: { label: "Todos", icon: FileText, color: "text-muted-foreground" },
}

const CONDITION_TYPES: Record<string, { label: string; icon: typeof FileCheck; description: string }> = {
  cover_letter: { label: "Carta de presentacion", icon: PenLine, description: "Adjuntar carta de presentacion al envio" },
  signature: { label: "Firma digital", icon: Stamp, description: "Requiere firma digital antes de enviar" },
  approval: { label: "Aprobacion previa", icon: CheckCircle2, description: "Necesita aprobacion de un responsable" },
  grouping: { label: "Agrupar por cliente", icon: Package, description: "Juntar docs del mismo cliente en un envio" },
  copies: { label: "Copias adicionales", icon: Copy, description: "Enviar copias a otros destinatarios" },
  format: { label: "Formato obligatorio", icon: FileText, description: "Convertir a formato especifico (PDF)" },
  watermark: { label: "Marca de agua", icon: Eye, description: "Anadir marca de agua al documento" },
  delay: { label: "Retraso programado", icon: Clock, description: "Esperar X horas/dias antes de enviar" },
  custom: { label: "Condicion personalizada", icon: Zap, description: "Condicion definida por el usuario" },
}

const PRINTERS = ["HP LaserJet Pro M404", "Xerox VersaLink C405", "Canon imageCLASS MF743", "Epson WorkForce Pro"]

// --- NL Parser ---
function parseNaturalLanguageRule(input: string): { rule: Partial<SendRule>; explanation: string } {
  const q = input.toLowerCase()
  const rule: Partial<SendRule> = { conditions: [], channels: [] }
  const explanations: string[] = []

  // Document type
  if (q.includes("poliza") || q.includes("póliza")) { rule.documentType = "poliza"; explanations.push("Tipo: Polizas") }
  else if (q.includes("siniestro")) { rule.documentType = "siniestro"; explanations.push("Tipo: Siniestros") }
  else if (q.includes("resumen")) { rule.documentType = "resumen"; explanations.push("Tipo: Resumenes") }
  else if (q.includes("publicidad") || q.includes("promo")) { rule.documentType = "publicidad"; explanations.push("Tipo: Publicidad") }
  else if (q.includes("contrato")) { rule.documentType = "contrato"; explanations.push("Tipo: Contratos") }
  else if (q.includes("factura")) { rule.documentType = "factura"; explanations.push("Tipo: Facturas") }
  else { rule.documentType = "todos"; explanations.push("Tipo: Todos los documentos") }

  // Days
  const dayMap: Record<string, string> = {
    lunes: "mon", martes: "tue", miercoles: "wed", miércoles: "wed",
    jueves: "thu", viernes: "fri", sabado: "sat", sábado: "sat", domingo: "sun",
  }
  const days: string[] = []
  for (const [word, code] of Object.entries(dayMap)) {
    if (q.includes(word)) days.push(code)
  }
  if (q.includes("todos los dias") || q.includes("cada dia") || q.includes("diario")) {
    days.push("mon", "tue", "wed", "thu", "fri")
  }
  if (q.includes("entre semana") || q.includes("laborable")) {
    days.push("mon", "tue", "wed", "thu", "fri")
  }
  if (days.length > 0) {
    rule.days = [...new Set(days)]
    explanations.push(`Dias: ${rule.days.map((d) => DAY_LABELS[d]).join(", ")}`)
  }

  // Time
  const timeMatch = q.match(/(\d{1,2})[:\s]?(\d{2})?\s*(am|pm|h|hora)?/)
  if (timeMatch) {
    let hour = parseInt(timeMatch[1])
    if (timeMatch[3] === "pm" && hour < 12) hour += 12
    const min = timeMatch[2] || "00"
    rule.time = `${hour.toString().padStart(2, "0")}:${min}`
    explanations.push(`Hora: ${rule.time}h`)
  }

  // Channels
  if (q.includes("email") || q.includes("correo") || q.includes("enviar") || q.includes("mandar")) {
    (rule.channels as string[]).push("email")
    explanations.push("Canal: Email")
  }
  if (q.includes("imprimir") || q.includes("impresion") || q.includes("impresora") || q.includes("print")) {
    (rule.channels as string[]).push("print")
    explanations.push("Canal: Impresion")
  }
  if (rule.channels!.length === 0) rule.channels = ["email"]

  // Recipients
  if (q.includes("todos") || q.includes("masivo")) { rule.recipients = "todos"; explanations.push("Destinatarios: Todos") }
  else if (q.includes("departamento")) { rule.recipients = "departamento"; explanations.push("Destinatarios: Departamento") }
  else { rule.recipients = "cliente"; explanations.push("Destinatarios: Cliente del documento") }

  // Conditions
  const conditions: RuleCondition[] = []

  if (q.includes("carta de presentacion") || q.includes("carta") || q.includes("cover")) {
    conditions.push({ id: crypto.randomUUID(), type: "cover_letter", label: "Carta de presentacion", value: "Adjuntar carta personalizada", active: true })
    explanations.push("Condicion: Con carta de presentacion")
  }
  if (q.includes("firma") || q.includes("firmar") || q.includes("firmado")) {
    conditions.push({ id: crypto.randomUUID(), type: "signature", label: "Firma digital", value: "Requiere firma antes de enviar", active: true })
    explanations.push("Condicion: Requiere firma digital")
  }
  if (q.includes("aprobar") || q.includes("aprobacion") || q.includes("supervisar") || q.includes("revisar")) {
    conditions.push({ id: crypto.randomUUID(), type: "approval", label: "Aprobacion previa", value: "Requiere aprobacion del responsable", active: true })
    explanations.push("Condicion: Necesita aprobacion")
  }
  if (q.includes("agrupar") || q.includes("juntar") || q.includes("juntos") || q.includes("mismo cliente") || q.includes("un solo envio")) {
    conditions.push({ id: crypto.randomUUID(), type: "grouping", label: "Agrupar por cliente", value: "Juntar documentos del mismo cliente", active: true })
    explanations.push("Condicion: Agrupar por cliente")
  }
  if (q.includes("copia") || q.includes("cc") || q.includes("con copia")) {
    conditions.push({ id: crypto.randomUUID(), type: "copies", label: "Copias adicionales", value: "Enviar copia al departamento", active: true })
    explanations.push("Condicion: Copias adicionales")
  }
  if (q.includes("pdf") || q.includes("formato")) {
    conditions.push({ id: crypto.randomUUID(), type: "format", label: "Formato PDF", value: "Convertir a PDF antes de enviar", active: true })
    explanations.push("Condicion: Formato PDF obligatorio")
  }
  if (q.includes("marca de agua") || q.includes("watermark")) {
    conditions.push({ id: crypto.randomUUID(), type: "watermark", label: "Marca de agua", value: "Anadir marca de agua corporativa", active: true })
    explanations.push("Condicion: Con marca de agua")
  }
  if (q.includes("esperar") || q.includes("retraso") || q.includes("delay") || q.includes("despues de")) {
    conditions.push({ id: crypto.randomUUID(), type: "delay", label: "Retraso", value: "Esperar 24h antes de enviar", active: true })
    explanations.push("Condicion: Retraso programado")
  }
  if (q.includes("no enviar sin") || q.includes("obligatorio") || q.includes("siempre con")) {
    const custom = q.match(/no enviar sin (.+?)(?:\.|,|$)/)?.[1] || q.match(/siempre con (.+?)(?:\.|,|$)/)?.[1] || "condicion personalizada"
    conditions.push({ id: crypto.randomUUID(), type: "custom", label: custom, value: custom, active: true })
    explanations.push(`Condicion: ${custom}`)
  }

  rule.conditions = conditions

  // Generate name
  const typeLabel = DOC_TYPES[rule.documentType || "todos"]?.label || "Documentos"
  const dayStr = rule.days?.map((d) => DAY_LABELS[d]).join("/") || ""
  rule.name = `${typeLabel}${dayStr ? " - " + dayStr : ""}${conditions.length > 0 ? " (con condiciones)" : ""}`

  return { rule, explanation: explanations.join("\n") }
}

// --- Default rules ---
const DEFAULT_RULES: SendRule[] = [
  {
    id: "r1", name: "Polizas - Martes/Jueves", description: "Envio de polizas con carta de presentacion e impresion",
    documentType: "poliza", days: ["tue", "thu"], time: "09:00",
    channels: ["email", "print"], printer: "HP LaserJet Pro M404",
    recipients: "cliente", active: true, priority: 1, source: "natural",
    originalPrompt: "Las polizas se envian los martes y jueves a las 9h por email e impresora, siempre con carta de presentacion",
    conditions: [
      { id: "c1", type: "cover_letter", label: "Carta de presentacion", value: "Carta personalizada con datos del cliente", active: true },
      { id: "c2", type: "format", label: "Formato PDF", value: "Convertir a PDF", active: true },
    ],
    lastRun: "08/04/2026 09:00", nextRun: "10/04/2026 09:00", docsAffected: 10,
  },
  {
    id: "r2", name: "Siniestros - Inmediato", description: "Los siniestros se procesan y envian inmediatamente con aprobacion",
    documentType: "siniestro", days: ["mon", "tue", "wed", "thu", "fri"], time: "08:00",
    channels: ["email"], recipients: "cliente", active: true, priority: 0, source: "natural",
    originalPrompt: "Los siniestros se envian inmediatamente todos los dias laborables, requieren aprobacion del responsable y firma digital",
    conditions: [
      { id: "c3", type: "approval", label: "Aprobacion previa", value: "Responsable de siniestros debe aprobar", active: true },
      { id: "c4", type: "signature", label: "Firma digital", value: "Firma del perito", active: true },
    ],
    docsAffected: 5,
  },
  {
    id: "r3", name: "Resumenes - Viernes", description: "Resumenes anuales agrupados por cliente los viernes",
    documentType: "resumen", days: ["fri"], time: "10:00",
    channels: ["email"], recipients: "cliente", active: true, priority: 2, source: "natural",
    originalPrompt: "Los resumenes se envian los viernes a las 10h, agrupando los documentos del mismo cliente en un solo envio",
    conditions: [
      { id: "c5", type: "grouping", label: "Agrupar por cliente", value: "Un envio por cliente con todos sus resumenes", active: true },
    ],
    lastRun: "04/04/2026 10:00", nextRun: "11/04/2026 10:00", docsAffected: 3,
  },
  {
    id: "r4", name: "Publicidad - Viernes", description: "Material promocional los viernes con impresion y marca de agua",
    documentType: "publicidad", days: ["fri"], time: "11:00",
    channels: ["email", "print"], printer: "Xerox VersaLink C405",
    recipients: "todos", active: true, priority: 3, source: "natural",
    originalPrompt: "La publicidad se envia los viernes a las 11h a todos los clientes, por email e impresora, con marca de agua corporativa",
    conditions: [
      { id: "c6", type: "watermark", label: "Marca de agua", value: "Logo AXA semitransparente", active: true },
    ],
    lastRun: "04/04/2026 11:00", nextRun: "11/04/2026 11:00", docsAffected: 2,
  },
  {
    id: "r5", name: "Contratos - No enviar sin firma", description: "Los contratos solo se envian si estan firmados",
    documentType: "contrato", days: ["mon", "wed", "fri"], time: "14:00",
    channels: ["email", "print"], printer: "Canon imageCLASS MF743",
    recipients: "cliente", active: true, priority: 1, source: "natural",
    originalPrompt: "No enviar contratos sin firma digital. Se envian lunes, miercoles y viernes con carta de presentacion",
    conditions: [
      { id: "c7", type: "signature", label: "Firma digital obligatoria", value: "No enviar sin firma", active: true },
      { id: "c8", type: "cover_letter", label: "Carta de presentacion", value: "Carta formal", active: true },
    ],
    docsAffected: 8,
  },
]

// --- Component ---
export default function SendRulesPage() {
  const [rules, setRules] = useState<SendRule[]>(DEFAULT_RULES)
  const [nlInput, setNlInput] = useState("")
  const [nlProcessing, setNlProcessing] = useState(false)
  const [nlPreview, setNlPreview] = useState<{ rule: Partial<SendRule>; explanation: string } | null>(null)
  const [editDialog, setEditDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<SendRule | null>(null)

  // NL Rule creation
  const handleNlSubmit = () => {
    if (!nlInput.trim()) return
    setNlProcessing(true)
    setTimeout(() => {
      const result = parseNaturalLanguageRule(nlInput)
      setNlPreview(result)
      setNlProcessing(false)
    }, 600)
  }

  const confirmNlRule = () => {
    if (!nlPreview) return
    const newRule: SendRule = {
      id: crypto.randomUUID(),
      name: nlPreview.rule.name || "Nueva regla",
      description: nlInput,
      documentType: nlPreview.rule.documentType || "todos",
      days: nlPreview.rule.days || [],
      time: nlPreview.rule.time || "09:00",
      channels: (nlPreview.rule.channels as ("email" | "print")[]) || ["email"],
      printer: nlPreview.rule.channels?.includes("print") ? PRINTERS[0] : undefined,
      recipients: nlPreview.rule.recipients || "cliente",
      conditions: nlPreview.rule.conditions || [],
      active: true,
      priority: rules.length,
      source: "natural",
      originalPrompt: nlInput,
      docsAffected: 0,
    }
    setRules((prev) => [newRule, ...prev])
    setNlInput("")
    setNlPreview(null)
  }

  const toggleActive = (id: string) => setRules((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r))
  const deleteRule = (id: string) => setRules((prev) => prev.filter((r) => r.id !== id))
  const duplicateRule = (r: SendRule) => setRules((prev) => [...prev, { ...r, id: crypto.randomUUID(), name: `${r.name} (copia)`, active: false }])

  const toggleCondition = (ruleId: string, condId: string) => {
    setRules((prev) => prev.map((r) => r.id === ruleId ? {
      ...r, conditions: r.conditions.map((c) => c.id === condId ? { ...c, active: !c.active } : c),
    } : r))
  }

  const removeCondition = (ruleId: string, condId: string) => {
    setRules((prev) => prev.map((r) => r.id === ruleId ? {
      ...r, conditions: r.conditions.filter((c) => c.id !== condId),
    } : r))
  }

  const addCondition = (ruleId: string, type: string) => {
    const condType = CONDITION_TYPES[type]
    if (!condType) return
    setRules((prev) => prev.map((r) => r.id === ruleId ? {
      ...r, conditions: [...r.conditions, { id: crypto.randomUUID(), type: type as any, label: condType.label, value: condType.description, active: true }],
    } : r))
  }

  const activeRules = rules.filter((r) => r.active).length
  const totalConditions = rules.reduce((a, r) => a + r.conditions.filter((c) => c.active).length, 0)

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header title="Reglas de Envio" description="Configura cuando y como se envian los documentos" />
        <div className="p-6">
          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2.5"><Zap className="h-5 w-5 text-primary" /></div>
                <div><p className="text-2xl font-bold text-foreground">{rules.length}</p><p className="text-xs text-muted-foreground">Reglas</p></div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-green-500/10 p-2.5"><CheckCircle2 className="h-5 w-5 text-green-500" /></div>
                <div><p className="text-2xl font-bold text-foreground">{activeRules}</p><p className="text-xs text-muted-foreground">Activas</p></div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-purple-500/10 p-2.5"><Shield className="h-5 w-5 text-purple-500" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalConditions}</p><p className="text-xs text-muted-foreground">Condiciones</p></div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-blue-500/10 p-2.5"><FileText className="h-5 w-5 text-blue-500" /></div>
                <div><p className="text-2xl font-bold text-foreground">{rules.reduce((a, r) => a + (r.active ? r.docsAffected : 0), 0)}</p><p className="text-xs text-muted-foreground">Docs afectados</p></div>
              </CardContent>
            </Card>
          </div>

          {/* Natural Language Rule Creator */}
          <Card className="mt-6 border-primary/30 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5 text-primary" />
                Crear regla con lenguaje natural
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Textarea
                  placeholder='Ej: "Las polizas se envian los martes y jueves a las 9h, siempre con carta de presentacion y firma digital. Agrupar documentos del mismo cliente."'
                  rows={3}
                  value={nlInput}
                  onChange={(e) => setNlInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleNlSubmit() } }}
                  className="resize-none text-sm"
                />
                <div className="flex items-center gap-2">
                  <Button onClick={handleNlSubmit} disabled={nlProcessing || !nlInput.trim()} className="gap-2">
                    {nlProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {nlProcessing ? "Analizando..." : "Crear regla"}
                  </Button>
                  <div className="flex-1" />
                  <div className="flex flex-wrap gap-1">
                    {[
                      "No enviar contratos sin firma digital",
                      "Polizas los miercoles con carta de presentacion",
                      "Siniestros inmediatos con aprobacion",
                      "Agrupar resumenes del mismo cliente los viernes",
                    ].map((s) => (
                      <button key={s} onClick={() => setNlInput(s)}
                        className="rounded border border-border px-2 py-1 text-[10px] text-muted-foreground hover:border-primary/50 hover:text-primary">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* NL Preview */}
                {nlPreview && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <p className="mb-2 text-xs font-medium text-primary">Regla interpretada:</p>
                    <p className="mb-1 text-sm font-semibold text-foreground">{nlPreview.rule.name}</p>
                    <pre className="mb-3 whitespace-pre-wrap text-xs text-muted-foreground">{nlPreview.explanation}</pre>
                    {nlPreview.rule.conditions && nlPreview.rule.conditions.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1">
                        {nlPreview.rule.conditions.map((c) => {
                          const ct = CONDITION_TYPES[c.type]
                          const Icon = ct?.icon || Zap
                          return (
                            <Badge key={c.id} variant="outline" className="gap-1 text-[10px]">
                              <Icon className="h-3 w-3" />{c.label}
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={confirmNlRule} className="gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar y crear
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setNlPreview(null)}>Descartar</Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rules list */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Reglas configuradas ({rules.length})</h2>
            </div>

            {rules.map((rule) => {
              const typeConfig = DOC_TYPES[rule.documentType] || DOC_TYPES.todos
              const TypeIcon = typeConfig.icon
              return (
                <Card key={rule.id} className={`border-border bg-card transition-opacity ${!rule.active ? "opacity-50" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-secondary p-2.5">
                        <TypeIcon className={`h-5 w-5 ${typeConfig.color}`} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">{rule.name}</h3>
                          <Badge variant="outline" className="text-[10px]">{typeConfig.label}</Badge>
                          {rule.source === "natural" && (
                            <Badge variant="outline" className="gap-1 border-primary/20 bg-primary/10 text-[10px] text-primary">
                              <Sparkles className="h-2.5 w-2.5" />IA
                            </Badge>
                          )}
                        </div>

                        {rule.description && (
                          <p className="mt-1 text-xs text-muted-foreground">{rule.description}</p>
                        )}

                        {/* Schedule info */}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <div className="flex gap-0.5">
                              {Object.entries(DAY_LABELS).map(([key, label]) => (
                                <span key={key} className={`rounded px-1 py-0.5 text-[9px] ${
                                  rule.days.includes(key) ? "bg-primary/20 font-medium text-primary" : "bg-secondary/50 text-muted-foreground/40"
                                }`}>{label}</span>
                              ))}
                            </div>
                          </div>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{rule.time}h</span>
                          {rule.channels.includes("email") && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />Email</span>}
                          {rule.channels.includes("print") && <span className="flex items-center gap-1"><Printer className="h-3.5 w-3.5" />{rule.printer}</span>}
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{rule.recipients}</span>
                        </div>

                        {/* Conditions */}
                        {rule.conditions.length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            <p className="text-[10px] font-medium text-muted-foreground">Condiciones:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {rule.conditions.map((cond) => {
                                const ct = CONDITION_TYPES[cond.type]
                                const Icon = ct?.icon || Zap
                                return (
                                  <div key={cond.id} className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] ${
                                    cond.active
                                      ? "border-primary/30 bg-primary/5 text-foreground"
                                      : "border-border bg-secondary/30 text-muted-foreground line-through"
                                  }`}>
                                    <Icon className="h-3 w-3 shrink-0" />
                                    <span>{cond.label}</span>
                                    <button onClick={() => toggleCondition(rule.id, cond.id)}
                                      className="ml-1 text-muted-foreground hover:text-foreground">
                                      {cond.active ? "✓" : "○"}
                                    </button>
                                    <button onClick={() => removeCondition(rule.id, cond.id)}
                                      className="text-muted-foreground hover:text-destructive">×</button>
                                  </div>
                                )
                              })}
                              {/* Add condition button */}
                              <Select onValueChange={(v) => addCondition(rule.id, v)}>
                                <SelectTrigger className="h-auto w-auto gap-1 border-dashed px-2 py-1 text-[11px]">
                                  <Plus className="h-3 w-3" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(CONDITION_TYPES).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>
                                      <div className="flex items-center gap-2">
                                        <v.icon className="h-3 w-3" />
                                        <span>{v.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        {/* Original prompt */}
                        {rule.originalPrompt && (
                          <p className="mt-2 rounded bg-secondary/30 px-2 py-1 text-[10px] italic text-muted-foreground">
                            "{rule.originalPrompt}"
                          </p>
                        )}

                        {/* Timing */}
                        {(rule.lastRun || rule.nextRun) && (
                          <div className="mt-2 flex gap-4 text-[10px] text-muted-foreground">
                            {rule.lastRun && <span>Ultima: {rule.lastRun}</span>}
                            {rule.nextRun && <span className="text-primary">Proxima: {rule.nextRun}</span>}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <Switch checked={rule.active} onCheckedChange={() => toggleActive(rule.id)} />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateRule(rule)}><Copy className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteRule(rule.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
