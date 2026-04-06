import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  FileText,
  Upload,
  Network,
  Settings,
  FileCode,
  BarChart3,
  Key,
  ChevronDown,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const mainNav = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Documentos",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "Subir Archivos",
    href: "/upload",
    icon: Upload,
  },
  {
    title: "Knowledge Graph",
    href: "/graph",
    icon: Network,
  },
]

const configNav = [
  {
    title: "Templates",
    href: "/templates",
    icon: FileCode,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "API Keys",
    href: "/api-keys",
    icon: Key,
  },
  {
    title: "Configuración",
    href: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <FileText className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-foreground">Papyrus</span>
      </div>

      {/* Workspace Selector */}
      <div className="border-b border-border p-4">
        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm hover:bg-secondary/80">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">Mi Empresa</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-1">
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary">
              <Building2 className="h-4 w-4" />
              Workspace Secundario
            </button>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Configuración
          </p>
          <div className="space-y-1">
            {configNav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Usage Stats */}
      <div className="border-t border-border p-4">
        <div className="rounded-lg bg-secondary p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Documentos</span>
            <span className="text-foreground">847 / 1,000</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-background">
            <div className="h-full w-[84.7%] rounded-full bg-primary" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Plan Pro · Renovación en 12 días
          </p>
        </div>
      </div>
    </aside>
  )
}
