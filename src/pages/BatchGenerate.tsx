import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Upload, FileSpreadsheet, FileText, Paintbrush, Zap, Play, CheckCircle2,
  Loader2, ArrowRight, Eye, Printer, Send, Download, AlertCircle,
  Table, Users, Shield, ChevronRight, ChevronDown, Package,
} from "lucide-react"

// --- Types ---
interface DataRow {
  [key: string]: string
}

interface GeneratedDoc {
  id: string
  clientName: string
  docType: string
  status: "pending" | "generated" | "error"
  preview?: boolean
}

// --- Mock Excel data (simulates what user uploads) ---
const MOCK_EXCEL_DATA: DataRow[] = [
  { nombre: "Maria Garcia Martinez", dni: "43.567.891-K", email: "mgarcia@email.com", direccion: "C/ Mallorca 234, 3o 2a", ciudad: "Barcelona", poliza: "HOG-BCN-2026-00142", tipo_poliza: "Hogar", prima: "487,35", continente: "180.000", contenido: "45.000", rc: "300.000" },
  { nombre: "Carlos Lopez Fernandez", dni: "38.912.456-B", email: "clopez@email.com", direccion: "C/ Serrano 89, 4o A", ciudad: "Madrid", poliza: "VID-MAD-2026-00567", tipo_poliza: "Vida", prima: "312,00", capital_fallecimiento: "200.000", capital_accidente: "400.000", invalidez: "200.000" },
  { nombre: "Pedro Sanchez Ruiz", dni: "51.234.678-M", email: "psanchez@email.com", direccion: "Av. Constitucion 45, 2o B", ciudad: "Sevilla", poliza: "AUT-SEV-2026-01102", tipo_poliza: "Auto", prima: "745,60", vehiculo: "VW Golf 2.0 TDI", matricula: "8901-BNT", cobertura: "Todo riesgo" },
  { nombre: "Laura Martinez Torres", dni: "47.890.123-S", email: "lmartinez@email.com", direccion: "C/ Colon 67, 5o 1a", ciudad: "Valencia", poliza: "VID-VLC-2026-00890", tipo_poliza: "Vida", prima: "198,00", capital_fallecimiento: "150.000", enfermedades_graves: "30.000" },
  { nombre: "Elena Rodriguez Diaz", dni: "29.456.789-T", email: "erodriguez@email.com", direccion: "C/ Mayor 12, Bajo", ciudad: "Valencia", poliza: "COM-VLC-2026-00456", tipo_poliza: "Comercio", prima: "1.245,00", actividad: "Tienda de ropa", superficie: "85 m2", rc_explotacion: "600.000" },
]

const AVAILABLE_TEMPLATES = [
  { id: "t1", name: "Poliza de Seguro", type: "poliza", sections: 8 },
  { id: "t2", name: "Resumen Anual", type: "resumen", sections: 5 },
  { id: "t3", name: "Carta de Presentacion", type: "carta", sections: 3 },
  { id: "t4", name: "Publicidad Pack Familia", type: "publicidad", sections: 4 },
]

const AVAILABLE_RULES = [
  { id: "r1", name: "Con carta de presentacion", active: true },
  { id: "r2", name: "Firma digital obligatoria", active: false },
  { id: "r3", name: "Agrupar por cliente", active: true },
  { id: "r4", name: "Formato PDF", active: true },
  { id: "r5", name: "Marca de agua corporativa", active: false },
]

const AVAILABLE_DESIGNS = [
  { id: "d1", name: "Corporativo AXA", color: "#00008f" },
  { id: "d2", name: "Moderno Minimal", color: "#000000" },
  { id: "d3", name: "Elegante Legal", color: "#1a365d" },
]

// --- Component ---
export default function BatchGeneratePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1=data, 2=template+design, 3=rules, 4=preview, 5=generate
  const [data, setData] = useState<DataRow[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [selectedDesign, setSelectedDesign] = useState("d1")
  const [rules, setRules] = useState(AVAILABLE_RULES.map((r) => ({ ...r })))
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<GeneratedDoc[]>([])
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const handleLoadMockData = () => {
    setData(MOCK_EXCEL_DATA)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // For now, just load mock data (real CSV parsing would go here)
    handleLoadMockData()
  }

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r))
  }

  const toggleRowExpand = (idx: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  const handleGenerate = () => {
    setGenerating(true)
    const docs: GeneratedDoc[] = data.map((row, i) => ({
      id: `gen-${i}`,
      clientName: row.nombre || `Cliente ${i + 1}`,
      docType: row.tipo_poliza || "Documento",
      status: "pending" as const,
    }))
    setGenerated(docs)

    // Simulate progressive generation
    let i = 0
    const interval = setInterval(() => {
      if (i >= docs.length) {
        clearInterval(interval)
        setGenerating(false)
        return
      }
      setGenerated((prev) => prev.map((d, idx) =>
        idx === i ? { ...d, status: "generated" } : d
      ))
      i++
    }, 500)
  }

  const columns = data.length > 0 ? Object.keys(data[0]) : []
  const activeRules = rules.filter((r) => r.active)
  const allGenerated = generated.length > 0 && generated.every((d) => d.status === "generated")

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header title="Generar Batch" description="Excel + Template + Reglas = Documentos PDF" />
        <div className="p-6">
          {/* Progress steps */}
          <div className="mb-6 flex items-center gap-2">
            {[
              { n: 1, label: "Datos" },
              { n: 2, label: "Template + Diseno" },
              { n: 3, label: "Reglas" },
              { n: 4, label: "Preview" },
              { n: 5, label: "Generar" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                <button
                  onClick={() => s.n <= step && setStep(s.n)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    step === s.n ? "bg-primary text-primary-foreground" :
                    step > s.n ? "bg-primary/20 text-primary" :
                    "bg-secondary text-muted-foreground"
                  }`}
                >{step > s.n ? "✓" : s.n}</button>
                <span className={`text-xs ${step >= s.n ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                {i < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
              </div>
            ))}
          </div>

          {/* Step 1: Data */}
          {step === 1 && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  Paso 1: Cargar datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Sube un archivo Excel/CSV con los datos de los clientes, o usa los datos de ejemplo de AXA.</p>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="file-upload" className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm font-medium text-foreground">Subir Excel / CSV</p>
                      <p className="text-xs text-muted-foreground">.xlsx, .csv, .tsv</p>
                      <input id="file-upload" type="file" accept=".xlsx,.csv,.tsv" className="hidden" onChange={handleFileUpload} />
                    </Label>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">o</span>
                  </div>
                  <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-border p-8">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                    <p className="mt-2 text-sm font-medium text-foreground">Datos de ejemplo AXA</p>
                    <p className="mb-3 text-xs text-muted-foreground">5 clientes con polizas</p>
                    <Button size="sm" onClick={handleLoadMockData}>Cargar ejemplo</Button>
                  </div>
                </div>

                {data.length > 0 && (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary"><Table className="mr-1 h-3 w-3" />{data.length} filas</Badge>
                      <Badge variant="outline">{columns.length} columnas</Badge>
                    </div>
                    <div className="max-h-72 overflow-auto rounded-lg border border-border">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-secondary">
                          <tr>
                            <th className="p-2 text-left font-medium text-muted-foreground">#</th>
                            {columns.slice(0, 8).map((col) => (
                              <th key={col} className="p-2 text-left font-medium text-muted-foreground">{col}</th>
                            ))}
                            {columns.length > 8 && <th className="p-2 text-muted-foreground">+{columns.length - 8}</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((row, i) => (
                            <tr key={i} className="border-t border-border hover:bg-secondary/20">
                              <td className="p-2 text-muted-foreground">{i + 1}</td>
                              {columns.slice(0, 8).map((col) => (
                                <td key={col} className="max-w-32 truncate p-2 text-foreground">{row[col]}</td>
                              ))}
                              {columns.length > 8 && (
                                <td className="p-2">
                                  <button onClick={() => toggleRowExpand(i)} className="text-primary hover:underline">
                                    {expandedRows.has(i) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Button onClick={() => setStep(2)} className="gap-2">
                      Siguiente: Template + Diseno <ArrowRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Template + Design */}
          {step === 2 && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paintbrush className="h-5 w-5 text-primary" />
                  Paso 2: Template y Diseno
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Template de documento</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {AVAILABLE_TEMPLATES.map((t) => (
                      <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                        className={`rounded-lg border p-4 text-left transition-colors ${
                          selectedTemplate === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                        }`}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">{t.name}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{t.sections} secciones · {t.type}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Diseno visual</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {AVAILABLE_DESIGNS.map((d) => (
                      <button key={d.id} onClick={() => setSelectedDesign(d.id)}
                        className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                          selectedDesign === d.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                        }`}>
                        <div className="h-8 w-8 rounded" style={{ backgroundColor: d.color }} />
                        <span className="text-xs font-medium text-foreground">{d.name}</span>
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => navigate("/designer")}>
                    <Paintbrush className="h-3 w-3" /> Personalizar en el Disenador
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>Atras</Button>
                  <Button onClick={() => setStep(3)} disabled={!selectedTemplate} className="gap-2">
                    Siguiente: Reglas <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Rules */}
          {step === 3 && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Paso 3: Reglas de envio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Selecciona que reglas aplicar a este batch de documentos.</p>

                <div className="space-y-2">
                  {rules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex items-center gap-2">
                        <Zap className={`h-4 w-4 ${rule.active ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-sm ${rule.active ? "text-foreground" : "text-muted-foreground"}`}>{rule.name}</span>
                      </div>
                      <Switch checked={rule.active} onCheckedChange={() => toggleRule(rule.id)} />
                    </div>
                  ))}
                </div>

                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => navigate("/send-rules")}>
                  <Zap className="h-3 w-3" /> Gestionar todas las reglas
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)}>Atras</Button>
                  <Button onClick={() => setStep(4)} className="gap-2">
                    Siguiente: Preview <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Preview */}
          {step === 4 && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Paso 4: Preview del batch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border border-border bg-secondary/20 p-4">
                    <p className="text-xs text-muted-foreground">Documentos</p>
                    <p className="text-2xl font-bold text-foreground">{data.length}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/20 p-4">
                    <p className="text-xs text-muted-foreground">Reglas activas</p>
                    <p className="text-2xl font-bold text-foreground">{activeRules.length}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/20 p-4">
                    <p className="text-xs text-muted-foreground">Template</p>
                    <p className="text-sm font-bold text-foreground">{AVAILABLE_TEMPLATES.find((t) => t.id === selectedTemplate)?.name || "-"}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border">
                  <div className="border-b border-border bg-secondary/20 px-4 py-2 text-xs font-medium text-muted-foreground">
                    Documentos que se van a generar:
                  </div>
                  {data.map((row, i) => (
                    <div key={i} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{row.nombre}</p>
                        <p className="text-xs text-muted-foreground">{row.tipo_poliza} · {row.poliza} · Prima: {row.prima} EUR</p>
                      </div>
                      <div className="flex gap-1">
                        {activeRules.map((r) => (
                          <Badge key={r.id} variant="outline" className="text-[9px]">{r.name.split(" ").slice(0, 2).join(" ")}</Badge>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/preview?type=poliza")}>
                        <Eye className="mr-1 h-3 w-3" /> Preview
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(3)}>Atras</Button>
                  <Button onClick={() => { setStep(5); handleGenerate() }} className="gap-2">
                    <Play className="h-4 w-4" /> Generar {data.length} documentos
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Generate */}
          {step === 5 && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {allGenerated ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                  {allGenerated ? "Batch completado" : "Generando documentos..."}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{generated.filter((d) => d.status === "generated").length} de {generated.length}</span>
                    <span>{Math.round((generated.filter((d) => d.status === "generated").length / generated.length) * 100)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(generated.filter((d) => d.status === "generated").length / generated.length) * 100}%` }} />
                  </div>
                </div>

                {/* Document list */}
                <div className="space-y-2">
                  {generated.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      {doc.status === "generated" ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                      ) : doc.status === "error" ? (
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                      ) : (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{doc.clientName}</p>
                        <p className="text-xs text-muted-foreground">{doc.docType}</p>
                      </div>
                      <Badge variant="outline" className={
                        doc.status === "generated" ? "border-green-500/20 bg-green-500/10 text-green-500" :
                        doc.status === "error" ? "border-red-500/20 bg-red-500/10 text-red-500" :
                        "border-yellow-500/20 bg-yellow-500/10 text-yellow-500"
                      }>
                        {doc.status === "generated" ? "Listo" : doc.status === "error" ? "Error" : "Generando..."}
                      </Badge>
                      {doc.status === "generated" && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate("/preview?type=poliza")}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {allGenerated && (
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => navigate("/preview?type=poliza")}>
                      <Eye className="h-4 w-4" /> Ver documentos
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" /> Descargar todos (ZIP)
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Printer className="h-4 w-4" /> Imprimir batch
                    </Button>
                    <Button className="gap-2" onClick={() => navigate("/shipments")}>
                      <Send className="h-4 w-4" /> Enviar batch
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
