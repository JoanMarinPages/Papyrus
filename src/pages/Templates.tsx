import { useState } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  FileText,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Play,
  Briefcase,
  Scale,
  Building2,
  FileCode,
  ClipboardList,
  GripVertical,
  X,
  Sparkles,
  Loader2,
} from "lucide-react"

interface TemplateSection {
  id: string
  title: string
  description: string
}

interface Template {
  id: string
  name: string
  description: string
  industry: string
  sections: TemplateSection[]
  usedCount: number
  icon: string
}

const ICON_MAP: Record<string, typeof Scale> = {
  Scale, Briefcase, ClipboardList, FileCode, Building2, FileText,
}

const INDUSTRY_COLORS: Record<string, { color: string; bg: string }> = {
  Legal: { color: "text-chart-2", bg: "bg-chart-2/10" },
  Ventas: { color: "text-primary", bg: "bg-primary/10" },
  "Consultoría": { color: "text-chart-3", bg: "bg-chart-3/10" },
  "Tecnología": { color: "text-chart-4", bg: "bg-chart-4/10" },
  RRHH: { color: "text-chart-5", bg: "bg-chart-5/10" },
  General: { color: "text-muted-foreground", bg: "bg-secondary" },
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "1", name: "Contrato de Servicios",
    description: "Plantilla estandar para contratos de servicios profesionales",
    industry: "Legal", icon: "Scale", usedCount: 45,
    sections: [
      { id: "s1", title: "Partes del Contrato", description: "Identificacion de las partes involucradas" },
      { id: "s2", title: "Objeto del Contrato", description: "Descripcion de los servicios" },
      { id: "s3", title: "Duracion", description: "Periodo de vigencia" },
      { id: "s4", title: "Contraprestacion", description: "Condiciones economicas" },
      { id: "s5", title: "Obligaciones", description: "Responsabilidades de cada parte" },
      { id: "s6", title: "Confidencialidad", description: "Clausula de confidencialidad" },
      { id: "s7", title: "Resolucion", description: "Condiciones de terminacion" },
      { id: "s8", title: "Firmas", description: "Espacio para firmas y fecha" },
    ],
  },
  {
    id: "2", name: "Propuesta Comercial",
    description: "Estructura para propuestas de venta B2B con pricing",
    industry: "Ventas", icon: "Briefcase", usedCount: 78,
    sections: [
      { id: "s1", title: "Resumen Ejecutivo", description: "Vision general de la propuesta" },
      { id: "s2", title: "Problema", description: "Pain points del cliente" },
      { id: "s3", title: "Solucion", description: "Nuestra propuesta de valor" },
      { id: "s4", title: "Pricing", description: "Tabla de precios y opciones" },
      { id: "s5", title: "Timeline", description: "Plan de implementacion" },
      { id: "s6", title: "Proximos Pasos", description: "Llamada a la accion" },
    ],
  },
  {
    id: "3", name: "Informe de Auditoria",
    description: "Formato para informes de auditoria interna y externa",
    industry: "Consultoría", icon: "ClipboardList", usedCount: 23,
    sections: [
      { id: "s1", title: "Alcance", description: "Ambito de la auditoria" },
      { id: "s2", title: "Metodologia", description: "Procedimientos aplicados" },
      { id: "s3", title: "Hallazgos", description: "Resultados encontrados" },
      { id: "s4", title: "Recomendaciones", description: "Acciones sugeridas" },
    ],
  },
  {
    id: "4", name: "Manual Tecnico",
    description: "Documentacion tecnica para productos y servicios",
    industry: "Tecnología", icon: "FileCode", usedCount: 34,
    sections: [
      { id: "s1", title: "Introduccion", description: "Overview del producto" },
      { id: "s2", title: "Requisitos", description: "Prerequisitos y dependencias" },
      { id: "s3", title: "Instalacion", description: "Pasos de instalacion" },
      { id: "s4", title: "Configuracion", description: "Opciones de configuracion" },
      { id: "s5", title: "Uso", description: "Guia de usuario" },
    ],
  },
  {
    id: "5", name: "Politica de Empresa",
    description: "Marco para politicas corporativas y normativas internas",
    industry: "RRHH", icon: "Building2", usedCount: 56,
    sections: [
      { id: "s1", title: "Proposito", description: "Objetivo de la politica" },
      { id: "s2", title: "Alcance", description: "A quien aplica" },
      { id: "s3", title: "Politica", description: "Contenido principal" },
      { id: "s4", title: "Procedimientos", description: "Como se implementa" },
      { id: "s5", title: "Revision", description: "Calendario de revision" },
    ],
  },
  {
    id: "6", name: "Acta de Reunion",
    description: "Plantilla para documentar reuniones y acuerdos",
    industry: "General", icon: "FileText", usedCount: 120,
    sections: [
      { id: "s1", title: "Asistentes", description: "Lista de participantes" },
      { id: "s2", title: "Orden del Dia", description: "Temas a tratar" },
      { id: "s3", title: "Acuerdos", description: "Decisiones tomadas" },
      { id: "s4", title: "Proximos Pasos", description: "Tareas asignadas" },
    ],
  },
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [generatingTemplate, setGeneratingTemplate] = useState<Template | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  // Form state
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formIndustry, setFormIndustry] = useState("General")
  const [formSections, setFormSections] = useState<TemplateSection[]>([
    { id: crypto.randomUUID(), title: "", description: "" },
  ])

  const resetForm = () => {
    setFormName("")
    setFormDesc("")
    setFormIndustry("General")
    setFormSections([{ id: crypto.randomUUID(), title: "", description: "" }])
  }

  const openCreate = () => {
    resetForm()
    setEditingTemplate(null)
    setCreateOpen(true)
  }

  const openEdit = (t: Template) => {
    setFormName(t.name)
    setFormDesc(t.description)
    setFormIndustry(t.industry)
    setFormSections([...t.sections])
    setEditingTemplate(t)
    setCreateOpen(true)
  }

  const handleSave = () => {
    const validSections = formSections.filter((s) => s.title.trim())
    if (!formName.trim()) return

    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id
            ? { ...t, name: formName, description: formDesc, industry: formIndustry, sections: validSections }
            : t
        )
      )
    } else {
      const newTemplate: Template = {
        id: crypto.randomUUID(),
        name: formName,
        description: formDesc,
        industry: formIndustry,
        icon: "FileText",
        usedCount: 0,
        sections: validSections,
      }
      setTemplates((prev) => [newTemplate, ...prev])
    }
    setCreateOpen(false)
    resetForm()
  }

  const handleDuplicate = (t: Template) => {
    const copy: Template = {
      ...t,
      id: crypto.randomUUID(),
      name: `${t.name} (copia)`,
      usedCount: 0,
      sections: t.sections.map((s) => ({ ...s, id: crypto.randomUUID() })),
    }
    setTemplates((prev) => [copy, ...prev])
  }

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  const openGenerate = (t: Template) => {
    setGeneratingTemplate(t)
    setGenerated(false)
    setGenerating(false)
    setGenerateOpen(true)
  }

  const handleGenerate = () => {
    setGenerating(true)
    // Simulate generation
    setTimeout(() => {
      setGenerating(false)
      setGenerated(true)
      if (generatingTemplate) {
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === generatingTemplate.id ? { ...t, usedCount: t.usedCount + 1 } : t
          )
        )
      }
    }, 2500)
  }

  const addSection = () => {
    setFormSections((prev) => [...prev, { id: crypto.randomUUID(), title: "", description: "" }])
  }

  const removeSection = (id: string) => {
    setFormSections((prev) => prev.filter((s) => s.id !== id))
  }

  const updateSection = (id: string, field: "title" | "description", value: string) => {
    setFormSections((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const getIcon = (iconName: string) => ICON_MAP[iconName] || FileText
  const getColors = (industry: string) => INDUSTRY_COLORS[industry] || INDUSTRY_COLORS.General

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header title="Templates" description="Gestiona tus plantillas de documentos" />
        <div className="p-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                {templates.length} templates
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                {templates.reduce((acc, t) => acc + t.usedCount, 0)} docs generados
              </Badge>
            </div>
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Nuevo Template
            </Button>
          </div>

          {/* Templates Grid */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
              const Icon = getIcon(template.icon)
              const colors = getColors(template.industry)
              return (
                <Card key={template.id} className="group border-border bg-card transition-all hover:border-primary/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`rounded-lg p-3 ${colors.bg}`}>
                        <Icon className={`h-6 w-6 ${colors.color}`} />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(template)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(template.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="mt-4 text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="outline">{template.industry}</Badge>
                      <span>{template.sections.length} secciones</span>
                      <span>{template.usedCount} usos</span>
                    </div>
                    <Button className="mt-4 w-full gap-2" variant="secondary" onClick={() => openGenerate(template)}>
                      <Play className="h-4 w-4" />
                      Generar Documento
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Empty state when no templates */}
          {templates.length === 0 && (
            <Card className="mt-6 border-border bg-card">
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-fit rounded-full bg-secondary p-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mt-4 font-medium text-foreground">No hay templates</p>
                <p className="mt-2 text-sm text-muted-foreground">Crea tu primer template para empezar a generar documentos</p>
                <Button className="mt-4" onClick={openCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Template
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Create / Edit Template Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Editar Template" : "Nuevo Template"}</DialogTitle>
            <DialogDescription>
              {editingTemplate ? "Modifica la estructura de tu plantilla" : "Define la estructura de tu nueva plantilla de documentos"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tpl-name">Nombre</Label>
                <Input id="tpl-name" placeholder="Ej: Contrato de Servicios" value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tpl-industry">Industria</Label>
                <Select value={formIndustry} onValueChange={setFormIndustry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(INDUSTRY_COLORS).map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tpl-desc">Descripcion</Label>
              <Textarea id="tpl-desc" placeholder="Describe para que sirve esta plantilla..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Secciones del documento</Label>
                <Button variant="outline" size="sm" onClick={addSection}>
                  <Plus className="mr-1 h-3 w-3" />
                  Seccion
                </Button>
              </div>

              {formSections.map((section, i) => (
                <div key={section.id} className="flex items-start gap-2 rounded-lg border border-border bg-secondary/30 p-3">
                  <GripVertical className="mt-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder={`Seccion ${i + 1} - Titulo`}
                      value={section.title}
                      onChange={(e) => updateSection(section.id, "title", e.target.value)}
                    />
                    <Input
                      placeholder="Descripcion breve de esta seccion"
                      value={section.description}
                      onChange={(e) => updateSection(section.id, "description", e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  {formSections.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeSection(section.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!formName.trim()}>
              {editingTemplate ? "Guardar cambios" : "Crear Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Document Dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generar Documento</DialogTitle>
            <DialogDescription>
              Usando template: {generatingTemplate?.name}
            </DialogDescription>
          </DialogHeader>

          {!generating && !generated && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="doc-name">Nombre del documento</Label>
                <Input id="doc-name" placeholder="Ej: Contrato - Cliente ABC" />
              </div>

              <div className="space-y-2">
                <Label>Contexto adicional (opcional)</Label>
                <Textarea placeholder="Anade informacion relevante que la IA debe considerar al generar el documento..." rows={3} />
              </div>

              <div className="rounded-lg border border-border bg-secondary/30 p-3">
                <p className="text-sm font-medium text-foreground">Secciones que se generaran:</p>
                <ul className="mt-2 space-y-1">
                  {generatingTemplate?.sections.map((s) => (
                    <li key={s.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {s.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {generating && (
            <div className="flex flex-col items-center gap-4 py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium text-foreground">Generando documento...</p>
                <p className="mt-1 text-sm text-muted-foreground">Recuperando contexto del grafo de conocimiento</p>
              </div>
            </div>
          )}

          {generated && (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">Documento generado</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {generatingTemplate?.sections.length} secciones creadas con exito
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cerrar</Button>
                <Button>Ver documento</Button>
              </div>
            </div>
          )}

          {!generating && !generated && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cancelar</Button>
              <Button onClick={handleGenerate} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generar con IA
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
