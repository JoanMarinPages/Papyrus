
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  FileText,
  Zap,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

const documentData = [
  { name: "Ene", docs: 45, generated: 12 },
  { name: "Feb", docs: 78, generated: 23 },
  { name: "Mar", docs: 156, generated: 45 },
  { name: "Abr", docs: 234, generated: 67 },
  { name: "May", docs: 345, generated: 89 },
  { name: "Jun", docs: 456, generated: 112 },
  { name: "Jul", docs: 567, generated: 134 },
  { name: "Ago", docs: 678, generated: 145 },
  { name: "Sep", docs: 756, generated: 156 },
]

const typeData = [
  { name: "Contratos", value: 35, color: "#2dd4bf" },
  { name: "Propuestas", value: 25, color: "#60a5fa" },
  { name: "Informes", value: 20, color: "#fbbf24" },
  { name: "Políticas", value: 12, color: "#a78bfa" },
  { name: "Otros", value: 8, color: "#fb7185" },
]

const performanceData = [
  { name: "Lun", latency: 1.2, accuracy: 94 },
  { name: "Mar", latency: 1.1, accuracy: 95 },
  { name: "Mié", latency: 1.3, accuracy: 93 },
  { name: "Jue", latency: 1.0, accuracy: 96 },
  { name: "Vie", latency: 1.1, accuracy: 95 },
  { name: "Sáb", latency: 0.9, accuracy: 97 },
  { name: "Dom", latency: 0.8, accuracy: 98 },
]

const stats = [
  {
    title: "Documentos Procesados",
    value: "847",
    change: "+12.5%",
    changeType: "positive",
    icon: FileText,
    description: "vs. mes anterior",
  },
  {
    title: "Documentos Generados",
    value: "156",
    change: "+23.1%",
    changeType: "positive",
    icon: Zap,
    description: "este mes",
  },
  {
    title: "Tiempo Promedio",
    value: "1.2s",
    change: "-0.3s",
    changeType: "positive",
    icon: Clock,
    description: "por consulta",
  },
  {
    title: "Precisión RAG",
    value: "94.2%",
    change: "+2.1%",
    changeType: "positive",
    icon: TrendingUp,
    description: "tasa de citación",
  },
]

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header
          title="Analytics"
          description="Métricas y estadísticas del sistema"
        />
        <div className="p-6">
          {/* Time Range Selector */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                Último mes
              </Badge>
            </div>
            <Select defaultValue="30d">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 días</SelectItem>
                <SelectItem value="30d">Últimos 30 días</SelectItem>
                <SelectItem value="90d">Últimos 90 días</SelectItem>
                <SelectItem value="1y">Último año</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs font-medium ${
                        stat.changeType === "positive"
                          ? "text-primary"
                          : "text-destructive"
                      }`}
                    >
                      {stat.changeType === "positive" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="border-border bg-card lg:col-span-2">
              <CardHeader>
                <CardTitle>Documentos Procesados vs Generados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={documentData}>
                      <defs>
                        <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #333",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="docs"
                        stroke="#2dd4bf"
                        fillOpacity={1}
                        fill="url(#colorDocs)"
                        name="Procesados"
                      />
                      <Area
                        type="monotone"
                        dataKey="generated"
                        stroke="#60a5fa"
                        fillOpacity={1}
                        fill="url(#colorGen)"
                        name="Generados"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Tipos de Documento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #333",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {typeData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium text-foreground">
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Rendimiento del Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #333",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="latency"
                        fill="#2dd4bf"
                        radius={[4, 4, 0, 0]}
                        name="Latencia (s)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Precisión RAG</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} domain={[80, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #333",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#a78bfa"
                        fillOpacity={1}
                        fill="url(#colorAcc)"
                        name="Precisión (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Queries */}
          <Card className="mt-6 border-border bg-card">
            <CardHeader>
              <CardTitle>Consultas Más Frecuentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    query: "Condiciones de pago contratos",
                    count: 234,
                    accuracy: 96,
                  },
                  {
                    query: "Política de privacidad GDPR",
                    count: 189,
                    accuracy: 94,
                  },
                  { query: "Términos de servicio", count: 156, accuracy: 95 },
                  { query: "Cláusulas de confidencialidad", count: 134, accuracy: 93 },
                  { query: "Procedimientos internos", count: 112, accuracy: 97 },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-secondary p-4"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                      <span className="font-medium text-foreground">
                        {item.query}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {item.count}
                        </p>
                        <p className="text-xs text-muted-foreground">consultas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary">
                          {item.accuracy}%
                        </p>
                        <p className="text-xs text-muted-foreground">precisión</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
