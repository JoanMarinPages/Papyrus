import { useState } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { INDUSTRY_CATALOGS } from "@/lib/mock-data-extended"
import type { DocumentTypeDefinition } from "@/lib/types"
import {
  Shield, Scale, Landmark, Stethoscope, Package, Plus, Upload, Download,
  Search, MoreHorizontal, Edit, Trash2, FileText,
} from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ICON_MAP: Record<string, typeof Shield> = {
  Shield, Scale, Landmark, Stethoscope, Package,
}

export default function DocumentTypesPage() {
  const [catalogs, setCatalogs] = useState(INDUSTRY_CATALOGS)
  const [activeIndustry, setActiveIndustry] = useState(catalogs[0].id)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingType, setEditingType] = useState<DocumentTypeDefinition | null>(null)
  const [showImportDialog, setShowImportDialog] = useState(false)

  const currentCatalog = catalogs.find((c) => c.id === activeIndustry)

  const filteredTypes = currentCatalog?.documentTypes.filter(
    (t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const toggleActive = (typeId: string) => {
    setCatalogs((prev) => prev.map((c) => c.id !== activeIndustry ? c : {
      ...c,
      documentTypes: c.documentTypes.map((t) => t.id === typeId ? { ...t, active: !t.active } : t),
    }))
  }

  const removeType = (typeId: string) => {
    setCatalogs((prev) => prev.map((c) => c.id !== activeIndustry ? c : {
      ...c,
      documentTypes: c.documentTypes.filter((t) => t.id !== typeId),
    }))
  }

  const totalActive = currentCatalog?.documentTypes.filter((t) => t.active).length || 0
  const totalTypes = currentCatalog?.documentTypes.length || 0

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header
          title="Tipos Documentales"
          description="Catálogos de tipos de documento configurables por industria"
        />
        <div className="p-6">
          {/* Intro */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-3 p-4">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="flex-1 text-sm text-muted-foreground">
                <p>
                  Aquí configuras qué tipos de documento maneja tu empresa. Cada tipo tiene un código único,
                  campos requeridos y formatos de salida. Los Templates y Reglas de Envío referencian estos tipos.
                </p>
                <div className="mt-2 flex gap-2">
                  <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <Upload className="h-3.5 w-3.5" />
                        Importar catálogo legacy
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Importar desde Papyrus Legacy</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 text-sm">
                        <p className="text-muted-foreground">
                          Importa los tipos documentales que ya tenías configurados en tu Papyrus ISIS.
                          Formatos soportados:
                        </p>
                        <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
                          <li>XML de triggers del sistema antiguo (SAMPLEDIST)</li>
                          <li>CSV con columnas: código, nombre, descripción, formato</li>
                          <li>INI de configuración (DAEMONS.ini)</li>
                        </ul>
                        <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                          <p className="mt-2 text-sm">Arrastra el fichero aquí o haz click para seleccionar</p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setShowImportDialog(false)}>Cancelar</Button>
                          <Button size="sm">Importar</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    Exportar catálogo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industry tabs */}
          <Tabs value={activeIndustry} onValueChange={setActiveIndustry}>
            <TabsList className="grid w-full grid-cols-5 bg-secondary">
              {catalogs.map((c) => {
                const Icon = ICON_MAP[c.icon] || FileText
                return (
                  <TabsTrigger key={c.id} value={c.id} className="gap-2">
                    <Icon className="h-4 w-4" />
                    {c.displayName}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {catalogs.map((catalog) => (
              <TabsContent key={catalog.id} value={catalog.id} className="mt-6 space-y-4">
                {/* Stats + actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-2xl font-bold">{catalog.documentTypes.length}</p>
                      <p className="text-xs text-muted-foreground">Tipos totales</p>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div>
                      <p className="text-2xl font-bold text-primary">{totalActive}</p>
                      <p className="text-xs text-muted-foreground">Activos</p>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div>
                      <p className="text-2xl font-bold text-muted-foreground">{totalTypes - totalActive}</p>
                      <p className="text-xs text-muted-foreground">Inactivos</p>
                    </div>
                  </div>
                  <Button size="sm" className="gap-1.5" onClick={() => setEditingType({
                    id: "", code: "", name: "", industry: catalog.industry, description: "",
                    requiredFields: [], outputFormats: ["pdf"], active: true,
                  })}>
                    <Plus className="h-4 w-4" /> Nuevo tipo
                  </Button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o código..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Document types list */}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTypes.map((type) => (
                    <Card key={type.id} className={`border-border bg-card transition-opacity ${!type.active ? "opacity-60" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate font-semibold">{type.name}</h3>
                            </div>
                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{type.code}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingType(type)}>
                                <Edit className="mr-2 h-3.5 w-3.5" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => removeType(type.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{type.description}</p>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {type.outputFormats.map((f) => (
                            <Badge key={f} variant="outline" className="text-[10px]">{f.toUpperCase()}</Badge>
                          ))}
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                          <span className="text-[10px] text-muted-foreground">
                            {type.requiredFields.length} campos requeridos
                          </span>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`active-${type.id}`} className="text-xs text-muted-foreground">
                              Activo
                            </Label>
                            <Switch
                              id={`active-${type.id}`}
                              checked={type.active}
                              onCheckedChange={() => toggleActive(type.id)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredTypes.length === 0 && (
                  <Card className="border-dashed border-border">
                    <CardContent className="p-8 text-center">
                      <FileText className="mx-auto h-10 w-10 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {searchTerm ? "No hay tipos que coincidan con la búsqueda" : "No hay tipos configurados para esta industria"}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>

      {/* Edit dialog */}
      <Dialog open={!!editingType} onOpenChange={(v) => !v && setEditingType(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingType?.id ? "Editar tipo documental" : "Nuevo tipo documental"}</DialogTitle>
          </DialogHeader>
          {editingType && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs">
                    Código
                    <InfoTooltip
                      description="Código único identificador del tipo documental. Ejemplo: POL-HOG para Póliza de Hogar."
                      legacy="DVC2801, FNC1101, GCC0901 eran códigos tipo documental en Papyrus legacy"
                    />
                  </Label>
                  <Input
                    value={editingType.code}
                    onChange={(e) => setEditingType({ ...editingType, code: e.target.value })}
                    placeholder="POL-HOG"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nombre</Label>
                  <Input
                    value={editingType.name}
                    onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                    placeholder="Póliza de Hogar"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Descripción</Label>
                <Input
                  value={editingType.description}
                  onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  Campos requeridos
                  <InfoTooltip description="Campos obligatorios que debe contener el documento. Separar por comas." />
                </Label>
                <Input
                  value={editingType.requiredFields.join(", ")}
                  onChange={(e) => setEditingType({ ...editingType, requiredFields: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  placeholder="tomador, dni, direccion"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingType(null)}>Cancelar</Button>
                <Button size="sm" onClick={() => {
                  setCatalogs((prev) => prev.map((c) => {
                    if (c.id !== activeIndustry) return c
                    if (editingType.id) {
                      return { ...c, documentTypes: c.documentTypes.map((t) => t.id === editingType.id ? editingType : t) }
                    }
                    return { ...c, documentTypes: [...c.documentTypes, { ...editingType, id: `type-${Date.now()}` }] }
                  }))
                  setEditingType(null)
                }}>
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
