
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"

const templates = [
  {
    id: "1",
    name: "Contrato de Servicios",
    description: "Plantilla estándar para contratos de servicios profesionales",
    industry: "Legal",
    sections: 8,
    usedCount: 45,
    icon: Scale,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    id: "2",
    name: "Propuesta Comercial",
    description: "Estructura para propuestas de venta B2B con pricing",
    industry: "Ventas",
    sections: 6,
    usedCount: 78,
    icon: Briefcase,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "3",
    name: "Informe de Auditoría",
    description: "Formato para informes de auditoría interna y externa",
    industry: "Consultoría",
    sections: 12,
    usedCount: 23,
    icon: ClipboardList,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  {
    id: "4",
    name: "Manual Técnico",
    description: "Documentación técnica para productos y servicios",
    industry: "Tecnología",
    sections: 15,
    usedCount: 34,
    icon: FileCode,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
  {
    id: "5",
    name: "Política de Empresa",
    description: "Marco para políticas corporativas y normativas internas",
    industry: "RRHH",
    sections: 5,
    usedCount: 56,
    icon: Building2,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
  {
    id: "6",
    name: "Acta de Reunión",
    description: "Plantilla para documentar reuniones y acuerdos",
    industry: "General",
    sections: 4,
    usedCount: 120,
    icon: FileText,
    color: "text-muted-foreground",
    bgColor: "bg-secondary",
  },
]

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header
          title="Templates"
          description="Gestiona tus plantillas de documentos"
        />
        <div className="p-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                {templates.length} templates
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                {templates.reduce((acc, t) => acc + t.usedCount, 0)} docs
                generados
              </Badge>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Template
            </Button>
          </div>

          {/* Templates Grid */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="group border-border bg-card transition-all hover:border-primary/50"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`rounded-lg p-3 ${template.bgColor}`}>
                      <template.icon className={`h-6 w-6 ${template.color}`} />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="mt-4 text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge variant="outline">{template.industry}</Badge>
                    <span>{template.sections} secciones</span>
                    <span>{template.usedCount} usos</span>
                  </div>
                  <Button className="mt-4 w-full gap-2" variant="secondary">
                    <Play className="h-4 w-4" />
                    Generar Documento
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Template Editor Preview */}
          <Card className="mt-8 border-border bg-card">
            <CardHeader>
              <CardTitle>Editor de Templates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Crea y personaliza la estructura de tus documentos
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center">
                <div className="mx-auto w-fit rounded-full bg-secondary p-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mt-4 font-medium text-foreground">
                  Selecciona un template para editar
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  O crea uno nuevo desde cero con nuestro editor visual
                </p>
                <Button className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
