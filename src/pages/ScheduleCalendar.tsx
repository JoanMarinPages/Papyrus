import { useState } from "react"
import { Link } from "react-router-dom"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  FileText,
  Mail,
  Printer,
  Clock,
  User,
  Building2,
  Send,
  Megaphone,
  BarChart3,
  Shield,
  Eye,
} from "lucide-react"

// --- Types ---
interface ScheduledDoc {
  id: string
  name: string
  type: "poliza" | "resumen" | "publicidad"
  client: string
  clientEmail: string
  status: "scheduled" | "sent" | "printed" | "pending"
  printRequired: boolean
  printer?: string
  responsible?: string
}

interface DaySchedule {
  date: Date
  documents: ScheduledDoc[]
}

// --- Mock data aligned with sample-docs ---
const CLIENTS = [
  { name: "Maria Garcia Martinez", email: "mgarcia@email.com" },
  { name: "Carlos Lopez Fernandez", email: "clopez@email.com" },
  { name: "Pedro Sanchez Ruiz", email: "psanchez@email.com" },
  { name: "Laura Martinez Torres", email: "lmartinez@email.com" },
  { name: "Elena Rodriguez Diaz", email: "erodriguez@email.com" },
]

function generateWeekSchedule(weekStart: Date): DaySchedule[] {
  const days: DaySchedule[] = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    const dayOfWeek = date.getDay() // 0=Sun, 1=Mon, ...

    const documents: ScheduledDoc[] = []

    // Tuesday (2) and Thursday (4) = Polizas
    if (dayOfWeek === 2 || dayOfWeek === 4) {
      const polizas = [
        { name: "Poliza Hogar - Garcia Martinez", client: CLIENTS[0].name, email: CLIENTS[0].email },
        { name: "Poliza Auto - Garcia Martinez", client: CLIENTS[0].name, email: CLIENTS[0].email },
        { name: "Poliza Vida - Lopez Fernandez", client: CLIENTS[1].name, email: CLIENTS[1].email },
        { name: "Poliza Salud Familiar - Lopez Fernandez", client: CLIENTS[1].name, email: CLIENTS[1].email },
        { name: "Poliza Hogar - Sanchez Ruiz", client: CLIENTS[2].name, email: CLIENTS[2].email },
        { name: "Poliza Auto - Sanchez Ruiz", client: CLIENTS[2].name, email: CLIENTS[2].email },
        { name: "Poliza Vida - Martinez Torres", client: CLIENTS[3].name, email: CLIENTS[3].email },
        { name: "Poliza Hogar - Martinez Torres", client: CLIENTS[3].name, email: CLIENTS[3].email },
        { name: "Poliza Comercio - Rodriguez Diaz", client: CLIENTS[4].name, email: CLIENTS[4].email },
        { name: "Poliza Auto - Rodriguez Diaz", client: CLIENTS[4].name, email: CLIENTS[4].email },
      ]

      const subset = dayOfWeek === 2 ? polizas.slice(0, 5) : polizas.slice(5)
      subset.forEach((p, idx) => {
        const isPast = date < new Date()
        documents.push({
          id: `pol-${i}-${idx}`,
          name: p.name,
          type: "poliza",
          client: p.client,
          clientEmail: p.email,
          status: isPast ? (idx % 3 === 0 ? "printed" : "sent") : "scheduled",
          printRequired: true,
          printer: "HP LaserJet Pro M404",
          responsible: ["Joan Marin", "Laura Ruiz", "David Torres"][idx % 3],
        })
      })
    }

    // Friday (5) = Resumenes + Publicidad
    if (dayOfWeek === 5) {
      const fridayDocs = [
        { name: "Resumen Anual - Garcia Martinez", type: "resumen" as const, client: CLIENTS[0].name, email: CLIENTS[0].email },
        { name: "Resumen Anual - Lopez Fernandez", type: "resumen" as const, client: CLIENTS[1].name, email: CLIENTS[1].email },
        { name: "Resumen Anual - Sanchez Ruiz", type: "resumen" as const, client: CLIENTS[2].name, email: CLIENTS[2].email },
        { name: "Pack Familia AXA 2026", type: "publicidad" as const, client: "Todos los clientes", email: "masivo@axa.es" },
        { name: "Seguro de Mascotas AXA", type: "publicidad" as const, client: "Todos los clientes", email: "masivo@axa.es" },
      ]

      fridayDocs.forEach((d, idx) => {
        const isPast = date < new Date()
        documents.push({
          id: `fri-${i}-${idx}`,
          name: d.name,
          type: d.type,
          client: d.client,
          clientEmail: d.email,
          status: isPast ? "sent" : "scheduled",
          printRequired: d.type === "publicidad",
          printer: d.type === "publicidad" ? "Xerox VersaLink C405" : undefined,
          responsible: d.type === "publicidad" ? "Sofia Blanco" : undefined,
        })
      })
    }

    days.push({ date, documents })
  }

  return days
}

const DOC_TYPE_CONFIG = {
  poliza: { label: "Poliza", icon: Shield, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  resumen: { label: "Resumen", icon: BarChart3, color: "bg-green-500/10 text-green-500 border-green-500/20" },
  publicidad: { label: "Publicidad", icon: Megaphone, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
}

const STATUS_CONFIG = {
  scheduled: { label: "Programado", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  sent: { label: "Enviado", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  printed: { label: "Impreso", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  pending: { label: "Pendiente", color: "bg-muted text-muted-foreground border-border" },
}

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]
const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatShortDate(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()].slice(0, 3)}`
}

// --- Components ---

function DayColumn({ day }: { day: DaySchedule }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const isToday = day.date.toDateString() === new Date().toDateString()
  const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6
  const dayName = DAY_NAMES[day.date.getDay()]

  return (
    <div className={`flex-1 border-r border-border last:border-r-0 ${isWeekend ? "bg-secondary/20" : ""}`}>
      {/* Day header */}
      <div className={`border-b border-border p-3 text-center ${isToday ? "bg-primary/10" : ""}`}>
        <p className={`text-xs font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>{dayName}</p>
        <p className={`text-lg font-bold ${isToday ? "text-primary" : "text-foreground"}`}>{day.date.getDate()}</p>
        {day.documents.length > 0 && (
          <Badge variant="outline" className="mt-1 text-[10px]">
            {day.documents.length} docs
          </Badge>
        )}
      </div>

      {/* Documents */}
      <div className="space-y-1 p-1.5">
        {day.documents.map((doc) => {
          const typeConfig = DOC_TYPE_CONFIG[doc.type]
          const statusConfig = STATUS_CONFIG[doc.status]
          const TypeIcon = typeConfig.icon
          const isExpanded = expanded === doc.id

          return (
            <button
              key={doc.id}
              onClick={() => setExpanded(isExpanded ? null : doc.id)}
              className={`w-full rounded-md border p-2 text-left transition-all ${
                isExpanded ? "border-primary/50 bg-primary/5" : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-start gap-1.5">
                <TypeIcon className={`mt-0.5 h-3 w-3 shrink-0 ${typeConfig.color.split(" ")[1]}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium text-foreground">{doc.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{doc.client}</p>
                </div>
              </div>

              <div className="mt-1.5 flex items-center gap-1">
                <Badge variant="outline" className={`border px-1 py-0 text-[9px] ${statusConfig.color}`}>
                  {statusConfig.label}
                </Badge>
                {doc.printRequired && <Printer className="h-2.5 w-2.5 text-muted-foreground" />}
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="mt-2 space-y-1.5 border-t border-border pt-2 text-[10px]">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{doc.clientEmail}</span>
                  </div>
                  {doc.printRequired && doc.printer && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Printer className="h-3 w-3" />
                      <span className="truncate">{doc.printer}</span>
                    </div>
                  )}
                  {doc.responsible && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{doc.responsible}</span>
                    </div>
                  )}
                  <Link
                    to={`/preview?type=${doc.type}`}
                    className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Eye className="h-3 w-3" />
                    Ver documento
                  </Link>
                </div>
              )}
            </button>
          )
        })}

        {day.documents.length === 0 && !isWeekend && (
          <p className="py-4 text-center text-[10px] text-muted-foreground">Sin envios</p>
        )}
      </div>
    </div>
  )
}

// --- Main page ---
export default function ScheduleCalendarPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()))
  const [clientFilter, setClientFilter] = useState("all")

  const weekDays = generateWeekSchedule(currentWeekStart)

  const filteredDays = weekDays.map((day) => ({
    ...day,
    documents: clientFilter === "all"
      ? day.documents
      : day.documents.filter((d) => d.client === clientFilter || d.client === "Todos los clientes"),
  }))

  const totalScheduled = filteredDays.reduce((a, d) => a + d.documents.length, 0)
  const totalPolizas = filteredDays.reduce((a, d) => a + d.documents.filter((doc) => doc.type === "poliza").length, 0)
  const totalResumenes = filteredDays.reduce((a, d) => a + d.documents.filter((doc) => doc.type === "resumen").length, 0)
  const totalPublicidad = filteredDays.reduce((a, d) => a + d.documents.filter((doc) => doc.type === "publicidad").length, 0)

  const weekEnd = new Date(currentWeekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const prevWeek = () => {
    const d = new Date(currentWeekStart)
    d.setDate(d.getDate() - 7)
    setCurrentWeekStart(d)
  }

  const nextWeek = () => {
    const d = new Date(currentWeekStart)
    d.setDate(d.getDate() + 7)
    setCurrentWeekStart(d)
  }

  const goToday = () => setCurrentWeekStart(getWeekStart(new Date()))

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header title="Calendario de Envios" description="Programacion semanal de documentos" />
        <div className="p-6">
          {/* Week navigation + filters */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={prevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  {formatShortDate(currentWeekStart)} - {formatShortDate(weekEnd)}
                </p>
                <p className="text-xs text-muted-foreground">{MONTH_NAMES[currentWeekStart.getMonth()]} {currentWeekStart.getFullYear()}</p>
              </div>
              <Button variant="outline" size="icon" onClick={nextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={goToday}>Hoy</Button>
            </div>

            <div className="flex items-center gap-3">
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-56">
                  <User className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {CLIENTS.map((c) => (
                    <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              <Calendar className="mr-1.5 h-3 w-3" />
              {totalScheduled} docs esta semana
            </Badge>
            <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 px-3 py-1 text-blue-500">
              <Shield className="mr-1.5 h-3 w-3" />
              {totalPolizas} polizas (Mar/Jue)
            </Badge>
            <Badge variant="outline" className="border-green-500/20 bg-green-500/10 px-3 py-1 text-green-500">
              <BarChart3 className="mr-1.5 h-3 w-3" />
              {totalResumenes} resumenes (Vie)
            </Badge>
            <Badge variant="outline" className="border-purple-500/20 bg-purple-500/10 px-3 py-1 text-purple-500">
              <Megaphone className="mr-1.5 h-3 w-3" />
              {totalPublicidad} publicidad (Vie)
            </Badge>
          </div>

          {/* Schedule rules legend */}
          <Card className="mt-4 border-border bg-card">
            <CardContent className="flex flex-wrap items-center gap-6 p-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Reglas de envio:</span>
              <span className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                Polizas → Martes y Jueves (con impresion)
              </span>
              <span className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                Resumenes anuales → Viernes (solo email)
              </span>
              <span className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                Publicidad → Viernes (email + impresion)
              </span>
            </CardContent>
          </Card>

          {/* Calendar grid */}
          <Card className="mt-4 overflow-hidden border-border bg-card">
            <div className="flex">
              {filteredDays.map((day) => (
                <DayColumn key={day.date.toISOString()} day={day} />
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
