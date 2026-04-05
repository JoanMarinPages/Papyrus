"use client"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Database,
  Brain,
  Shield,
  Bell,
  CreditCard,
  Users,
  Webhook,
} from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header
          title="Configuración"
          description="Gestiona la configuración de tu workspace"
        />
        <div className="p-6">
          <Tabs defaultValue="rag" className="space-y-6">
            <TabsList className="bg-secondary">
              <TabsTrigger value="rag" className="gap-2">
                <Brain className="h-4 w-4" />
                Pipeline RAG
              </TabsTrigger>
              <TabsTrigger value="database" className="gap-2">
                <Database className="h-4 w-4" />
                Base de Datos
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                Seguridad
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                Notificaciones
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Facturación
              </TabsTrigger>
            </TabsList>

            {/* RAG Pipeline Settings */}
            <TabsContent value="rag" className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuración de Ingestion
                  </CardTitle>
                  <CardDescription>
                    Ajusta los parámetros del pipeline de procesamiento de documentos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tamaño de Chunk (tokens)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          defaultValue={[512]}
                          max={1024}
                          min={128}
                          step={64}
                          className="flex-1"
                        />
                        <span className="w-16 text-right text-sm text-muted-foreground">
                          512
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Tamaño óptimo: 256-512 tokens para mejor precisión
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Overlap (%)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          defaultValue={[15]}
                          max={50}
                          min={0}
                          step={5}
                          className="flex-1"
                        />
                        <span className="w-16 text-right text-sm text-muted-foreground">
                          15%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Superposición entre chunks para contexto continuo
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Modelo de Embeddings</Label>
                    <Select defaultValue="voyage-3-large">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="voyage-3-large">
                          Voyage-3-large (Recomendado)
                        </SelectItem>
                        <SelectItem value="openai-3-large">
                          OpenAI text-embedding-3-large
                        </SelectItem>
                        <SelectItem value="cohere-embed">
                          Cohere Embed v3
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">Chunking Semántico</p>
                      <p className="text-sm text-muted-foreground">
                        Divide documentos basándose en estructura semántica
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Configuración de Retrieval
                  </CardTitle>
                  <CardDescription>
                    Parámetros del sistema de búsqueda híbrido (Vector + Graph)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Top K (resultados)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          defaultValue={[10]}
                          max={50}
                          min={3}
                          step={1}
                          className="flex-1"
                        />
                        <span className="w-16 text-right text-sm text-muted-foreground">
                          10
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Peso Vector vs Graph</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          defaultValue={[60]}
                          max={100}
                          min={0}
                          step={5}
                          className="flex-1"
                        />
                        <span className="w-16 text-right text-sm text-muted-foreground">
                          60/40
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">Reranking con Cross-Encoder</p>
                      <p className="text-sm text-muted-foreground">
                        Mejora la precisión reordenando resultados
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">Corrective RAG (CRAG)</p>
                      <p className="text-sm text-muted-foreground">
                        Verificación automática de calidad antes de generar
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Modelo de Generación</CardTitle>
                  <CardDescription>
                    Configuración del LLM para generación de documentos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Modelo LLM</Label>
                    <Select defaultValue="claude-sonnet">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="claude-sonnet">
                          Claude Sonnet 3.5 (Recomendado)
                        </SelectItem>
                        <SelectItem value="claude-opus">Claude Opus</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Temperatura</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          defaultValue={[0.3]}
                          max={1}
                          min={0}
                          step={0.1}
                          className="flex-1"
                        />
                        <span className="w-16 text-right text-sm text-muted-foreground">
                          0.3
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Max Tokens</Label>
                      <Input type="number" defaultValue={4096} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">Citación Automática</p>
                      <p className="text-sm text-muted-foreground">
                        Cada párrafo cita la fuente original
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Database Settings */}
            <TabsContent value="database" className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Conexión a Base de Datos</CardTitle>
                  <CardDescription>
                    Configuración de PostgreSQL con pgvector
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <span className="font-medium text-foreground">
                        Conectado a Supabase
                      </span>
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      Activo
                    </Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Host</Label>
                      <Input value="db.supabase.co" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Puerto</Label>
                      <Input value="5432" disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Base de datos</Label>
                    <Input value="papyrus_production" disabled />
                  </div>
                  <Button variant="outline">Probar Conexión</Button>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>LightRAG (GraphRAG)</CardTitle>
                  <CardDescription>
                    Configuración del grafo de conocimiento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <span className="font-medium text-foreground">
                        LightRAG Activo
                      </span>
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      3,542 nodos
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">Auto-extracción de entidades</p>
                      <p className="text-sm text-muted-foreground">
                        Detecta automáticamente personas, organizaciones y conceptos
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestión de Usuarios
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Usuarios activos</p>
                      <p className="text-sm text-muted-foreground">
                        5 de 10 asientos utilizados
                      </p>
                    </div>
                    <Button variant="outline">Gestionar usuarios</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="h-5 w-5" />
                    API Keys
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Production Key</p>
                        <p className="font-mono text-sm text-muted-foreground">
                          pk_live_****************************
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Copiar
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline">Generar nueva API Key</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Preferencias de Notificaciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      title: "Documento procesado",
                      description: "Cuando un documento termina de indexarse",
                    },
                    {
                      title: "Errores de procesamiento",
                      description: "Cuando falla el procesamiento de un documento",
                    },
                    {
                      title: "Uso de API",
                      description: "Alertas de uso cerca del límite",
                    },
                    {
                      title: "Actualizaciones del sistema",
                      description: "Nuevas funcionalidades y mejoras",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing */}
            <TabsContent value="billing" className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Plan Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg bg-primary/10 p-6">
                    <div>
                      <Badge className="mb-2">Plan Pro</Badge>
                      <p className="text-2xl font-bold text-foreground">
                        $99/mes
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Renovación: 15 de Abril, 2024
                      </p>
                    </div>
                    <Button>Cambiar plan</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Uso del Mes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Documentos", used: 847, limit: 1000 },
                    { label: "Generaciones", used: 156, limit: 500 },
                    { label: "API Calls", used: 12450, limit: 50000 },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="text-foreground">
                          {item.used.toLocaleString()} / {item.limit.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(item.used / item.limit) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
