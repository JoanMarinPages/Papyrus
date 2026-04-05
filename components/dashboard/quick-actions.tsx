"use client"

import { Upload, FileText, Wand2, Settings2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const actions = [
  {
    title: "Subir Documentos",
    description: "Arrastra archivos o haz clic para subir",
    icon: Upload,
    href: "/upload",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Generar Documento",
    description: "Usa tus templates y datos",
    icon: Wand2,
    href: "/generate",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    title: "Ver Templates",
    description: "Gestiona tus plantillas",
    icon: FileText,
    href: "/templates",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  {
    title: "Configurar RAG",
    description: "Ajusta parámetros del pipeline",
    icon: Settings2,
    href: "/settings",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
]

export function QuickActions() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action) => (
            <a
              key={action.title}
              href={action.href}
              className="group flex items-center gap-4 rounded-lg border border-border bg-background p-4 transition-all hover:border-primary/50 hover:bg-secondary"
            >
              <div className={`rounded-lg p-3 ${action.bgColor}`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <div>
                <p className="font-medium text-foreground group-hover:text-primary">
                  {action.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
