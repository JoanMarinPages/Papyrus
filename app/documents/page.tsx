"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Download,
  Trash2,
  Eye,
  Edit,
  Calendar,
  Tag,
} from "lucide-react"

const documents = [
  {
    id: "1",
    name: "Contrato de Servicios - Cliente ABC",
    type: "Contrato",
    status: "indexed",
    chunks: 45,
    entities: 23,
    createdAt: "2024-03-15",
    size: "2.4 MB",
  },
  {
    id: "2",
    name: "Propuesta Comercial Q2 2024",
    type: "Propuesta",
    status: "indexed",
    chunks: 28,
    entities: 15,
    createdAt: "2024-03-14",
    size: "1.8 MB",
  },
  {
    id: "3",
    name: "Informe de Cumplimiento Normativo",
    type: "Informe",
    status: "processing",
    chunks: 0,
    entities: 0,
    createdAt: "2024-03-13",
    size: "5.2 MB",
  },
  {
    id: "4",
    name: "Manual de Procedimientos Internos",
    type: "Manual",
    status: "indexed",
    chunks: 156,
    entities: 87,
    createdAt: "2024-03-12",
    size: "12.1 MB",
  },
  {
    id: "5",
    name: "Política de Privacidad v3.0",
    type: "Política",
    status: "indexed",
    chunks: 18,
    entities: 12,
    createdAt: "2024-03-11",
    size: "890 KB",
  },
  {
    id: "6",
    name: "Acuerdo de Confidencialidad NDA",
    type: "Contrato",
    status: "indexed",
    chunks: 12,
    entities: 8,
    createdAt: "2024-03-10",
    size: "456 KB",
  },
  {
    id: "7",
    name: "Plan Estratégico 2024-2026",
    type: "Plan",
    status: "error",
    chunks: 0,
    entities: 0,
    createdAt: "2024-03-09",
    size: "3.2 MB",
  },
  {
    id: "8",
    name: "Reglamento Interno de Trabajo",
    type: "Reglamento",
    status: "indexed",
    chunks: 89,
    entities: 45,
    createdAt: "2024-03-08",
    size: "4.5 MB",
  },
]

const statusStyles = {
  indexed: {
    label: "Indexado",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  processing: {
    label: "Procesando",
    className: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  },
  error: {
    label: "Error",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
}

export default function DocumentsPage() {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const toggleSelectAll = () => {
    if (selectedDocs.length === documents.length) {
      setSelectedDocs([])
    } else {
      setSelectedDocs(documents.map((d) => d.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header
          title="Documentos"
          description="Gestiona todos tus documentos indexados"
        />
        <div className="p-6">
          {/* Filters */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar documentos..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <Tag className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="contract">Contratos</SelectItem>
                    <SelectItem value="proposal">Propuestas</SelectItem>
                    <SelectItem value="report">Informes</SelectItem>
                    <SelectItem value="policy">Políticas</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="indexed">Indexados</SelectItem>
                    <SelectItem value="processing">Procesando</SelectItem>
                    <SelectItem value="error">Con errores</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-40">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Más recientes</SelectItem>
                    <SelectItem value="oldest">Más antiguos</SelectItem>
                    <SelectItem value="name">Por nombre</SelectItem>
                    <SelectItem value="size">Por tamaño</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedDocs.length > 0 && (
            <div className="mt-4 flex items-center gap-4 rounded-lg bg-primary/10 px-4 py-3">
              <span className="text-sm font-medium text-primary">
                {selectedDocs.length} documento(s) seleccionado(s)
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}

          {/* Documents Table */}
          <Card className="mt-4 border-border bg-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedDocs.length === documents.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Chunks</TableHead>
                    <TableHead className="text-right">Entidades</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocs.map((doc) => {
                    const status =
                      statusStyles[doc.status as keyof typeof statusStyles]
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedDocs.includes(doc.id)}
                            onCheckedChange={() => toggleSelect(doc.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-secondary p-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="font-medium">{doc.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={status.className}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {doc.chunks}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {doc.entities}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {doc.size}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {doc.createdAt}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar metadatos
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Descargar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredDocs.length} de {documents.length} documentos
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm">
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
