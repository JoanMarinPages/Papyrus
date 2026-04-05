"use client"

import { FileText, Network, Zap, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const stats = [
  {
    title: "Documentos Indexados",
    value: "847",
    change: "+12%",
    changeType: "positive" as const,
    icon: FileText,
    description: "vs. mes anterior",
  },
  {
    title: "Nodos en Grafo",
    value: "3,542",
    change: "+8%",
    changeType: "positive" as const,
    icon: Network,
    description: "entidades detectadas",
  },
  {
    title: "Docs Generados",
    value: "156",
    change: "+23%",
    changeType: "positive" as const,
    icon: Zap,
    description: "este mes",
  },
  {
    title: "Precisión RAG",
    value: "94.2%",
    change: "+2.1%",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "tasa de citación",
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-primary/10 p-2">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <span
                className={`text-xs font-medium ${
                  stat.changeType === "positive"
                    ? "text-primary"
                    : "text-destructive"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
