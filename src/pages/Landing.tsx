import { Link } from "react-router-dom"
import {
  FileText,
  Network,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  Check,
  Sparkles,
  Building2,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Network,
    title: "Knowledge Graph",
    description:
      "Construye automaticamente grafos de conocimiento a partir de tus documentos. Entiende relaciones entre entidades, conceptos y personas.",
  },
  {
    icon: Zap,
    title: "Hybrid RAG",
    description:
      "Combina busqueda vectorial y de grafos para una recuperacion de informacion precisa con razonamiento multi-hop.",
  },
  {
    icon: FileText,
    title: "Generacion Inteligente",
    description:
      "Genera documentos profesionales basados en el conocimiento real de tu empresa, con citaciones automaticas.",
  },
  {
    icon: Shield,
    title: "Multi-Tenant Seguro",
    description:
      "Cada empresa tiene su propio espacio aislado. Tus datos nunca se mezclan con los de otros clientes.",
  },
  {
    icon: BarChart3,
    title: "Analytics en Tiempo Real",
    description:
      "Monitoriza la precision del RAG, el rendimiento del pipeline y el uso de documentos en tiempo real.",
  },
  {
    icon: Sparkles,
    title: "Templates Configurables",
    description:
      "Crea plantillas por industria y reutilizalas. Contratos, informes, propuestas - todo personalizable.",
  },
]

const plans = [
  {
    name: "Starter",
    price: "Gratis",
    description: "Para equipos pequenos que empiezan",
    features: [
      "Hasta 100 documentos",
      "1 usuario",
      "GraphRAG basico",
      "5 generaciones/mes",
    ],
    cta: "Empezar gratis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "49€/mes",
    description: "Para empresas en crecimiento",
    features: [
      "Hasta 10.000 documentos",
      "10 usuarios",
      "GraphRAG + VectorRAG completo",
      "Generaciones ilimitadas",
      "API access",
      "Soporte prioritario",
    ],
    cta: "Probar 14 dias gratis",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Para grandes organizaciones",
    features: [
      "Documentos ilimitados",
      "Usuarios ilimitados",
      "Infraestructura dedicada",
      "SLA 99.9%",
      "SSO / SAML",
      "Soporte 24/7",
    ],
    cta: "Contactar ventas",
    highlighted: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">Papyrus</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Funcionalidades
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Precios
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Iniciar sesion
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gap-2">
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 md:py-32">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            Hybrid RAG: GraphRAG + VectorRAG
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Genera documentos
            <br />
            <span className="text-primary">inteligentes</span> con IA
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            Papyrus construye un grafo de conocimiento a partir de tus documentos y genera
            contenido preciso, citado y contextualizado. Para empresas de todos los tamanos.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/register">
              <Button size="lg" className="gap-2 px-8 text-base">
                Empezar gratis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="px-8 text-base">
                Ver demo
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-16 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>+200 empresas</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>+1M documentos procesados</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>94% precision RAG</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Todo lo que necesitas para documentos inteligentes
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Desde la ingestion de documentos hasta la generacion con IA, Papyrus cubre todo el pipeline.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border bg-card transition-colors hover:border-primary/30">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline visual */}
      <section className="border-t border-border bg-secondary/30 px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">Pipeline Hybrid RAG</h2>
          <p className="mb-12 text-muted-foreground">
            Asi funciona Papyrus por dentro: de documentos crudos a conocimiento accionable.
          </p>
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            {[
              { step: "1", label: "Subida", desc: "PDF, DOCX, TXT..." },
              { step: "2", label: "Parsing", desc: "Extraccion de texto" },
              { step: "3", label: "Chunking", desc: "Segmentos semanticos" },
              { step: "4", label: "Embeddings", desc: "Vectores + Grafo" },
              { step: "5", label: "Generacion", desc: "Documentos con IA" },
            ].map((item, i) => (
              <div key={item.step} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                {i < 4 && (
                  <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Planes para todos</h2>
            <p className="text-muted-foreground">
              Desde startups hasta grandes corporaciones. Empieza gratis, escala cuando quieras.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`border-border bg-card ${plan.highlighted ? "border-primary ring-1 ring-primary" : ""}`}
              >
                <CardContent className="p-6">
                  {plan.highlighted && (
                    <div className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Mas popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  <p className="mt-4 text-3xl font-bold text-foreground">{plan.price}</p>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="mt-6 block">
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <FileText className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">Papyrus</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Papyrus. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
