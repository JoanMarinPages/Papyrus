
import { useNavigate } from "react-router-dom"
import { FileText, MoreHorizontal, Clock, CheckCircle2, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const documents = [
  {
    id: 1,
    name: "Contrato de Servicios - Cliente ABC",
    type: "Contrato",
    status: "completed",
    updatedAt: "Hace 2 horas",
    sources: 12,
  },
  {
    id: 2,
    name: "Propuesta Comercial Q2 2024",
    type: "Propuesta",
    status: "completed",
    updatedAt: "Hace 5 horas",
    sources: 8,
  },
  {
    id: 3,
    name: "Informe de Cumplimiento Normativo",
    type: "Informe",
    status: "processing",
    updatedAt: "Hace 1 día",
    sources: 24,
  },
  {
    id: 4,
    name: "Manual de Procedimientos Internos",
    type: "Manual",
    status: "completed",
    updatedAt: "Hace 2 días",
    sources: 45,
  },
  {
    id: 5,
    name: "Política de Privacidad Actualizada",
    type: "Política",
    status: "pending",
    updatedAt: "Hace 3 días",
    sources: 6,
  },
]

const statusConfig = {
  completed: {
    label: "Completado",
    icon: CheckCircle2,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  processing: {
    label: "Procesando",
    icon: Loader2,
    className: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  },
  pending: {
    label: "Pendiente",
    icon: Clock,
    className: "bg-muted text-muted-foreground border-border",
  },
}

export function RecentDocuments() {
  const navigate = useNavigate()

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold">
          Documentos Recientes
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/documents")}>
          Ver todos
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {documents.map((doc) => {
            const status = statusConfig[doc.status as keyof typeof statusConfig]
            const StatusIcon = status.icon
            return (
              <div
                key={doc.id}
                className="flex cursor-pointer items-center justify-between px-6 py-4 transition-colors hover:bg-secondary/50 active:bg-secondary/60"
                onClick={(e) => {
                  const target = e.target as HTMLElement
                  if (target.closest("button, [role=menuitem]")) return
                  navigate(`/preview?type=${doc.type.toLowerCase()}&id=${doc.id}`)
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-secondary p-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{doc.name}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.sources} fuentes</span>
                      <span>•</span>
                      <span>{doc.updatedAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={status.className}>
                    <StatusIcon
                      className={`mr-1 h-3 w-3 ${
                        doc.status === "processing" ? "animate-spin" : ""
                      }`}
                    />
                    {status.label}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver documento</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Descargar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
