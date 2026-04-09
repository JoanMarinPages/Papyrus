import { useState, useRef } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Sparkles,
  Send,
  Loader2,
  Palette,
  Type,
  Image,
  LayoutTemplate,
  Download,
  Printer,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  User,
  Bot,
} from "lucide-react"

// --- Design config types ---
interface DesignConfig {
  // Brand
  companyName: string
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  accentColor: string

  // Typography
  headingFont: string
  bodyFont: string
  headingSize: number
  bodySize: number

  // Layout
  headerStyle: "banner" | "minimal" | "centered" | "sidebar"
  showLogo: boolean
  showBorder: boolean
  borderRadius: number
  padding: number

  // Content placeholders
  documentTitle: string
  subtitle: string
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  changes?: Partial<DesignConfig>
}

const FONTS = [
  "Arial", "Helvetica", "Georgia", "Times New Roman", "Garamond",
  "Roboto", "Open Sans", "Lato", "Montserrat", "Playfair Display",
  "Inter", "Poppins", "Source Sans Pro", "Merriweather", "Raleway",
]

const HEADER_STYLES = {
  banner: "Banner completo",
  minimal: "Minimalista",
  centered: "Centrado",
  sidebar: "Lateral",
}

const PRESET_THEMES: { name: string; config: Partial<DesignConfig> }[] = [
  {
    name: "Corporativo AXA",
    config: {
      primaryColor: "#00008f", secondaryColor: "#f5f5f5", accentColor: "#ff1721",
      headingFont: "Montserrat", bodyFont: "Open Sans", headerStyle: "banner",
      showBorder: true, borderRadius: 0, padding: 40,
    },
  },
  {
    name: "Moderno Minimal",
    config: {
      primaryColor: "#000000", secondaryColor: "#ffffff", accentColor: "#6366f1",
      headingFont: "Inter", bodyFont: "Inter", headerStyle: "minimal",
      showBorder: false, borderRadius: 12, padding: 48,
    },
  },
  {
    name: "Elegante Legal",
    config: {
      primaryColor: "#1a365d", secondaryColor: "#f7fafc", accentColor: "#c69c6d",
      headingFont: "Playfair Display", bodyFont: "Source Sans Pro", headerStyle: "centered",
      showBorder: true, borderRadius: 0, padding: 48,
    },
  },
  {
    name: "Fresco Startup",
    config: {
      primaryColor: "#059669", secondaryColor: "#ecfdf5", accentColor: "#f59e0b",
      headingFont: "Poppins", bodyFont: "Lato", headerStyle: "banner",
      showBorder: false, borderRadius: 16, padding: 36,
    },
  },
]

const DEFAULT_CONFIG: DesignConfig = {
  companyName: "AXA Seguros",
  logoUrl: "",
  primaryColor: "#00008f",
  secondaryColor: "#f5f5f5",
  accentColor: "#ff1721",
  headingFont: "Montserrat",
  bodyFont: "Open Sans",
  headingSize: 28,
  bodySize: 14,
  headerStyle: "banner",
  showLogo: true,
  showBorder: true,
  borderRadius: 0,
  padding: 40,
  documentTitle: "Poliza de Seguro de Hogar",
  subtitle: "Ref: AXA-HOG-2026-00142",
}

// --- AI Design Assistant (local, no API needed) ---
function processAICommand(input: string, current: DesignConfig): { response: string; changes: Partial<DesignConfig> } {
  const q = input.toLowerCase()
  const changes: Partial<DesignConfig> = {}
  const responses: string[] = []

  // Color changes
  if (q.includes("azul") || q.includes("blue")) {
    changes.primaryColor = "#1e40af"
    responses.push("Color principal cambiado a azul")
  }
  if (q.includes("rojo") || q.includes("red")) {
    changes.primaryColor = "#dc2626"
    responses.push("Color principal cambiado a rojo")
  }
  if (q.includes("verde") || q.includes("green")) {
    changes.primaryColor = "#059669"
    responses.push("Color principal cambiado a verde")
  }
  if (q.includes("negro") || q.includes("black") || q.includes("oscuro") || q.includes("dark")) {
    changes.primaryColor = "#111827"
    changes.secondaryColor = "#1f2937"
    responses.push("Esquema oscuro aplicado")
  }
  if (q.includes("dorado") || q.includes("gold") || q.includes("premium") || q.includes("lujo")) {
    changes.primaryColor = "#1a365d"
    changes.accentColor = "#c69c6d"
    changes.headingFont = "Playfair Display"
    responses.push("Estilo premium aplicado con acentos dorados y tipografia elegante")
  }

  // Typography
  if (q.includes("serif") || q.includes("clasic") || q.includes("elegante") || q.includes("formal")) {
    changes.headingFont = "Playfair Display"
    changes.bodyFont = "Garamond"
    responses.push("Tipografia serif elegante aplicada")
  }
  if (q.includes("sans") || q.includes("moderno") || q.includes("limpio") || q.includes("clean")) {
    changes.headingFont = "Inter"
    changes.bodyFont = "Inter"
    responses.push("Tipografia sans-serif moderna aplicada")
  }
  if (q.includes("grande") || q.includes("bigger") || q.includes("mas grande")) {
    changes.headingSize = Math.min(48, current.headingSize + 4)
    changes.bodySize = Math.min(20, current.bodySize + 2)
    responses.push("Tamano de texto aumentado")
  }
  if (q.includes("pequen") || q.includes("smaller") || q.includes("mas pequen")) {
    changes.headingSize = Math.max(18, current.headingSize - 4)
    changes.bodySize = Math.max(10, current.bodySize - 2)
    responses.push("Tamano de texto reducido")
  }
  for (const font of FONTS) {
    if (q.includes(font.toLowerCase())) {
      changes.headingFont = font
      changes.bodyFont = font
      responses.push(`Tipografia cambiada a ${font}`)
      break
    }
  }

  // Layout
  if (q.includes("minimalista") || q.includes("minimal") || q.includes("simple")) {
    changes.headerStyle = "minimal"
    changes.showBorder = false
    changes.borderRadius = 0
    responses.push("Layout minimalista aplicado")
  }
  if (q.includes("banner") || q.includes("cabecera grande") || q.includes("header grande")) {
    changes.headerStyle = "banner"
    responses.push("Header tipo banner aplicado")
  }
  if (q.includes("centrado") || q.includes("centered")) {
    changes.headerStyle = "centered"
    responses.push("Header centrado aplicado")
  }
  if (q.includes("redondeado") || q.includes("rounded") || q.includes("bordes redondos")) {
    changes.borderRadius = 16
    responses.push("Bordes redondeados aplicados")
  }
  if (q.includes("sin borde") || q.includes("no border") || q.includes("quita el borde")) {
    changes.showBorder = false
    responses.push("Bordes eliminados")
  }
  if (q.includes("con borde") || q.includes("anade borde") || q.includes("pon borde")) {
    changes.showBorder = true
    responses.push("Bordes anadidos")
  }
  if (q.includes("mas espacio") || q.includes("mas padding") || q.includes("mas margen")) {
    changes.padding = Math.min(64, current.padding + 8)
    responses.push("Espaciado aumentado")
  }
  if (q.includes("compacto") || q.includes("menos espacio") || q.includes("tight")) {
    changes.padding = Math.max(16, current.padding - 8)
    responses.push("Diseno mas compacto")
  }

  // Presets
  if (q.includes("corporativo") || q.includes("axa") || q.includes("seguros")) {
    Object.assign(changes, PRESET_THEMES[0].config)
    responses.push("Tema corporativo AXA aplicado")
  }
  if (q.includes("startup") || q.includes("fresco") || q.includes("joven")) {
    Object.assign(changes, PRESET_THEMES[3].config)
    responses.push("Tema fresco startup aplicado")
  }
  if (q.includes("legal") || q.includes("abogado") || q.includes("notaria")) {
    Object.assign(changes, PRESET_THEMES[2].config)
    responses.push("Tema legal elegante aplicado")
  }

  if (responses.length === 0) {
    return {
      response: "Puedo ayudarte con:\n- **Colores**: \"ponlo azul\", \"estilo premium dorado\", \"esquema oscuro\"\n- **Tipografia**: \"tipografia moderna\", \"fuente elegante serif\", \"usa Montserrat\"\n- **Layout**: \"header minimalista\", \"bordes redondeados\", \"mas compacto\"\n- **Temas**: \"estilo corporativo\", \"tema legal\", \"look de startup\"",
      changes: {},
    }
  }

  return { response: responses.join(". ") + ".", changes }
}

// --- Document Preview Component ---
function DocumentPreviewPanel({ config }: { config: DesignConfig }) {
  const headerBg = config.primaryColor
  const headerFg = isLightColor(config.primaryColor) ? "#000" : "#fff"

  return (
    <div
      className="mx-auto overflow-hidden bg-white shadow-lg"
      style={{
        maxWidth: "210mm",
        borderRadius: config.borderRadius,
        border: config.showBorder ? `1px solid ${config.primaryColor}30` : "none",
      }}
    >
      {/* Header */}
      {config.headerStyle === "banner" && (
        <div style={{ backgroundColor: headerBg, padding: `${config.padding * 0.6}px ${config.padding}px`, color: headerFg }}>
          <div style={{ fontFamily: config.headingFont, fontSize: config.headingSize, fontWeight: 700 }}>
            {config.companyName}
          </div>
          <div style={{ fontFamily: config.bodyFont, fontSize: config.bodySize, opacity: 0.8, marginTop: 4 }}>
            {config.documentTitle}
          </div>
          {config.subtitle && (
            <div style={{ fontFamily: config.bodyFont, fontSize: config.bodySize - 2, opacity: 0.6, marginTop: 2 }}>
              {config.subtitle}
            </div>
          )}
        </div>
      )}

      {config.headerStyle === "minimal" && (
        <div style={{ padding: `${config.padding * 0.5}px ${config.padding}px`, borderBottom: `3px solid ${config.primaryColor}` }}>
          <div style={{ fontFamily: config.headingFont, fontSize: config.headingSize * 0.7, fontWeight: 700, color: config.primaryColor }}>
            {config.companyName}
          </div>
          <div style={{ fontFamily: config.bodyFont, fontSize: config.bodySize, color: "#666", marginTop: 2 }}>
            {config.documentTitle} — {config.subtitle}
          </div>
        </div>
      )}

      {config.headerStyle === "centered" && (
        <div style={{ padding: `${config.padding}px`, textAlign: "center", borderBottom: `2px solid ${config.primaryColor}20` }}>
          <div style={{ fontFamily: config.headingFont, fontSize: config.headingSize, fontWeight: 700, color: config.primaryColor }}>
            {config.companyName}
          </div>
          <div style={{ fontFamily: config.bodyFont, fontSize: config.bodySize + 2, color: "#333", marginTop: 8 }}>
            {config.documentTitle}
          </div>
          <div style={{ fontFamily: config.bodyFont, fontSize: config.bodySize - 1, color: "#999", marginTop: 4 }}>
            {config.subtitle}
          </div>
        </div>
      )}

      {config.headerStyle === "sidebar" && (
        <div style={{ display: "flex", borderBottom: `1px solid ${config.primaryColor}20` }}>
          <div style={{ width: 6, backgroundColor: config.primaryColor }} />
          <div style={{ padding: `${config.padding * 0.5}px ${config.padding}px`, flex: 1 }}>
            <div style={{ fontFamily: config.headingFont, fontSize: config.headingSize * 0.8, fontWeight: 700, color: config.primaryColor }}>
              {config.companyName}
            </div>
            <div style={{ fontFamily: config.bodyFont, fontSize: config.bodySize, color: "#555", marginTop: 4 }}>
              {config.documentTitle}
            </div>
          </div>
          <div style={{ padding: `${config.padding * 0.5}px`, display: "flex", alignItems: "center" }}>
            <span style={{ fontFamily: config.bodyFont, fontSize: config.bodySize - 2, color: "#999" }}>{config.subtitle}</span>
          </div>
        </div>
      )}

      {/* Body */}
      <div style={{ padding: `${config.padding}px` }}>
        {/* Client info block */}
        <div style={{
          backgroundColor: config.secondaryColor,
          padding: config.padding * 0.5,
          borderRadius: config.borderRadius * 0.5,
          marginBottom: config.padding * 0.6,
        }}>
          <div style={{
            fontFamily: config.headingFont,
            fontSize: config.bodySize - 1,
            fontWeight: 600,
            color: config.primaryColor,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 8,
          }}>
            Datos del tomador
          </div>
          <div style={{ fontFamily: config.bodyFont, fontSize: config.bodySize, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            <span><span style={{ color: "#888" }}>Nombre:</span> <b>Maria Garcia Martinez</b></span>
            <span><span style={{ color: "#888" }}>DNI:</span> <b>43.567.891-K</b></span>
            <span><span style={{ color: "#888" }}>Direccion:</span> <b>C/ Mallorca 234, 3o 2a</b></span>
            <span><span style={{ color: "#888" }}>Ciudad:</span> <b>08036 Barcelona</b></span>
          </div>
        </div>

        {/* Table */}
        <div style={{ fontFamily: config.headingFont, fontSize: config.bodySize - 1, fontWeight: 600, color: config.primaryColor, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          Coberturas contratadas
        </div>
        <table style={{ width: "100%", fontFamily: config.bodyFont, fontSize: config.bodySize, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${config.primaryColor}30` }}>
              <th style={{ textAlign: "left", padding: "8px 4px", color: "#888", fontWeight: 500 }}>Cobertura</th>
              <th style={{ textAlign: "right", padding: "8px 4px", color: "#888", fontWeight: 500 }}>Capital</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Continente", "180.000 EUR"], ["Contenido", "45.000 EUR"],
              ["Responsabilidad Civil", "300.000 EUR"], ["Robo", "15.000 EUR"],
              ["Danos por agua", "Incluido"], ["Asistencia 24h", "Incluido"],
            ].map(([cov, val], i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${config.primaryColor}10` }}>
                <td style={{ padding: "8px 4px" }}>{cov}</td>
                <td style={{ padding: "8px 4px", textAlign: "right", fontWeight: 600 }}>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{
          marginTop: config.padding,
          paddingTop: config.padding * 0.4,
          borderTop: `1px solid ${config.primaryColor}20`,
          textAlign: "center",
          fontFamily: config.bodyFont,
          fontSize: config.bodySize - 3,
          color: "#bbb",
        }}>
          Documento generado por Papyrus para {config.companyName}
        </div>
      </div>
    </div>
  )
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "")
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 155
}

// --- Main Page ---
export default function DesignerPage() {
  const [config, setConfig] = useState<DesignConfig>(DEFAULT_CONFIG)
  const [chatInput, setChatInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hola! Soy tu asistente de diseno. Dime como quieres que sea el documento: colores, tipografia, layout... O elige un tema predefinido." },
  ])
  const [thinking, setThinking] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const updateConfig = (changes: Partial<DesignConfig>) => {
    setConfig((prev) => ({ ...prev, ...changes }))
  }

  const handleSendMessage = () => {
    if (!chatInput.trim() || thinking) return

    const userMsg: ChatMessage = { role: "user", content: chatInput }
    setMessages((prev) => [...prev, userMsg])
    setChatInput("")
    setThinking(true)

    setTimeout(() => {
      const { response, changes } = processAICommand(chatInput, config)
      updateConfig(changes)
      const botMsg: ChatMessage = { role: "assistant", content: response, changes }
      setMessages((prev) => [...prev, botMsg])
      setThinking(false)
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
    }, 400)
  }

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG)
    setMessages([{ role: "assistant", content: "Diseno reseteado al predeterminado. ¿Que quieres cambiar?" }])
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header title="Disenador de Documentos" description="Disena con IA o controles manuales" />
        <div className="p-6">
          <div className="grid gap-6 lg:grid-cols-5">

            {/* Left: Controls + AI Chat */}
            <div className="space-y-4 lg:col-span-2">
              {/* Preset themes */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Palette className="h-4 w-4 text-primary" />
                    Temas predefinidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_THEMES.map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => updateConfig(theme.config)}
                        className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-left text-xs transition-colors hover:border-primary/50 hover:bg-secondary/30"
                      >
                        <div className="flex gap-1">
                          <div className="h-4 w-4 rounded" style={{ backgroundColor: theme.config.primaryColor }} />
                          <div className="h-4 w-4 rounded" style={{ backgroundColor: theme.config.accentColor }} />
                        </div>
                        <span className="font-medium text-foreground">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Manual controls */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <LayoutTemplate className="h-4 w-4 text-primary" />
                    Controles manuales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px]">Primario</Label>
                      <input type="color" value={config.primaryColor} onChange={(e) => updateConfig({ primaryColor: e.target.value })} className="h-8 w-full cursor-pointer rounded border border-border" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Secundario</Label>
                      <input type="color" value={config.secondaryColor} onChange={(e) => updateConfig({ secondaryColor: e.target.value })} className="h-8 w-full cursor-pointer rounded border border-border" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Acento</Label>
                      <input type="color" value={config.accentColor} onChange={(e) => updateConfig({ accentColor: e.target.value })} className="h-8 w-full cursor-pointer rounded border border-border" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px]">Fuente titulo</Label>
                      <Select value={config.headingFont} onValueChange={(v) => updateConfig({ headingFont: v })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Fuente cuerpo</Label>
                      <Select value={config.bodyFont} onValueChange={(v) => updateConfig({ bodyFont: v })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px]">Estilo cabecera</Label>
                    <Select value={config.headerStyle} onValueChange={(v: any) => updateConfig({ headerStyle: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(HEADER_STYLES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px]">Tamano titulo: {config.headingSize}px</Label>
                    <Slider value={[config.headingSize]} min={16} max={48} step={1} onValueChange={([v]) => updateConfig({ headingSize: v })} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-[10px]">Bordes</Label>
                    <Switch checked={config.showBorder} onCheckedChange={(v) => updateConfig({ showBorder: v })} />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px]">Radio bordes: {config.borderRadius}px</Label>
                    <Slider value={[config.borderRadius]} min={0} max={24} step={1} onValueChange={([v]) => updateConfig({ borderRadius: v })} />
                  </div>

                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleReset}>
                    <RotateCcw className="h-3 w-3" />
                    Resetear
                  </Button>
                </CardContent>
              </Card>

              {/* AI Chat */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Asistente de Diseno IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 max-h-52 space-y-2 overflow-y-auto rounded-lg bg-secondary/20 p-3">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                        {msg.role === "assistant" && (
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Bot className="h-3 w-3 text-primary" />
                          </div>
                        )}
                        <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                          msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                        }`}>
                          <span className="whitespace-pre-wrap">{msg.content}</span>
                          {msg.changes && Object.keys(msg.changes).length > 0 && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] opacity-70">
                              <CheckCircle2 className="h-3 w-3" />
                              {Object.keys(msg.changes).length} cambios aplicados
                            </div>
                          )}
                        </div>
                        {msg.role === "user" && (
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                            <User className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                    {thinking && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Pensando...
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Ej: ponlo azul con tipografia moderna..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="text-xs"
                    />
                    <Button size="icon" onClick={handleSendMessage} disabled={thinking || !chatInput.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Live Preview */}
            <div className="lg:col-span-3">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Vista previa en vivo</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <Printer className="h-3 w-3" />
                        Imprimir
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <Download className="h-3 w-3" />
                        Guardar template
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border bg-gray-100 p-6 dark:bg-gray-900">
                    <DocumentPreviewPanel config={config} />
                  </div>

                  {/* Config summary */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-[10px]">{config.headingFont}</Badge>
                    <Badge variant="outline" className="text-[10px]">{config.bodyFont}</Badge>
                    <Badge variant="outline" className="text-[10px]">{HEADER_STYLES[config.headerStyle]}</Badge>
                    <Badge variant="outline" className="text-[10px]">{config.headingSize}px titulo</Badge>
                    <Badge variant="outline" className="text-[10px]">
                      <div className="mr-1 h-2.5 w-2.5 rounded" style={{ backgroundColor: config.primaryColor }} />
                      {config.primaryColor}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
