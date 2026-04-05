"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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
import {
  Key,
  Plus,
  Copy,
  MoreHorizontal,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Code,
  Shield,
} from "lucide-react"

const apiKeys = [
  {
    id: "1",
    name: "Production API",
    key: "pk_live_a1b2c3d4e5f6g7h8i9j0",
    type: "production",
    lastUsed: "Hace 2 horas",
    created: "15 Mar 2024",
    requests: 12450,
  },
  {
    id: "2",
    name: "Development API",
    key: "pk_test_z9y8x7w6v5u4t3s2r1q0",
    type: "development",
    lastUsed: "Hace 1 día",
    created: "10 Mar 2024",
    requests: 3421,
  },
  {
    id: "3",
    name: "Staging API",
    key: "pk_test_m1n2b3v4c5x6z7a8s9d0",
    type: "development",
    lastUsed: "Hace 5 días",
    created: "5 Mar 2024",
    requests: 890,
  },
]

export default function ApiKeysPage() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const toggleKeyVisibility = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const maskKey = (key: string) => {
    return key.substring(0, 8) + "••••••••••••••••"
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header
          title="API Keys"
          description="Gestiona las claves de acceso a la API"
        />
        <div className="p-6">
          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Key className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">3</p>
                  <p className="text-sm text-muted-foreground">API Keys activas</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-chart-2/10 p-3">
                  <Code className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">16.7K</p>
                  <p className="text-sm text-muted-foreground">
                    Requests este mes
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-chart-3/10 p-3">
                  <Shield className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">99.9%</p>
                  <p className="text-sm text-muted-foreground">Uptime API</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Keys Table */}
          <Card className="mt-6 border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Claves de API</CardTitle>
                <CardDescription>
                  Gestiona y revoca tus claves de acceso
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva API Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear nueva API Key</DialogTitle>
                    <DialogDescription>
                      Genera una nueva clave de acceso para tu aplicación
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input placeholder="Mi aplicación" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select defaultValue="development">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="production">Production</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Permisos</Label>
                      <Select defaultValue="full">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona permisos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Acceso completo</SelectItem>
                          <SelectItem value="read">Solo lectura</SelectItem>
                          <SelectItem value="write">Solo escritura</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline">Cancelar</Button>
                    <Button>Crear API Key</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Nombre</TableHead>
                    <TableHead>Clave</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Último uso</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-secondary p-2">
                            <Key className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{apiKey.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Creada: {apiKey.created}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-secondary px-2 py-1 font-mono text-sm">
                            {showKeys[apiKey.id]
                              ? apiKey.key
                              : maskKey(apiKey.key)}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {showKeys[apiKey.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {copiedKey === apiKey.id && (
                            <span className="text-xs text-primary">Copiado!</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            apiKey.type === "production"
                              ? "border-primary/30 text-primary"
                              : "border-chart-3/30 text-chart-3"
                          }
                        >
                          {apiKey.type === "production" ? "Production" : "Development"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {apiKey.lastUsed}
                      </TableCell>
                      <TableCell className="font-mono">
                        {apiKey.requests.toLocaleString()}
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
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Regenerar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Revocar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* API Documentation */}
          <Card className="mt-6 border-border bg-card">
            <CardHeader>
              <CardTitle>Inicio Rápido</CardTitle>
              <CardDescription>
                Ejemplo de uso de la API con tu clave
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-[#0d1117] p-4">
                <pre className="overflow-x-auto text-sm">
                  <code className="text-[#c9d1d9]">
                    {`curl -X POST https://api.papyrus.io/v1/generate \\
  -H "Authorization: Bearer pk_live_xxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "template_id": "contract-services",
    "context": {
      "client_name": "Cliente ABC",
      "service_type": "Consultoría IT"
    }
  }'`}
                  </code>
                </pre>
              </div>
              <div className="mt-4 flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Code className="h-4 w-4" />
                  Ver documentación
                </Button>
                <Button variant="ghost" className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copiar código
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Webhooks Section */}
          <Card className="mt-6 border-border bg-card">
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Recibe notificaciones cuando se completen acciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center">
                <div className="mx-auto w-fit rounded-full bg-secondary p-4">
                  <RefreshCw className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mt-4 font-medium text-foreground">
                  No hay webhooks configurados
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Configura webhooks para recibir notificaciones en tiempo real
                </p>
                <Button className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
