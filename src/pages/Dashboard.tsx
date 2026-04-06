import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentDocuments } from "@/components/dashboard/recent-documents"
import { KnowledgeGraphPreview } from "@/components/dashboard/knowledge-graph-preview"
import { PipelineStatus } from "@/components/dashboard/pipeline-status"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header
          title="Dashboard"
          description="Bienvenido de vuelta, Juan"
        />
        <div className="p-6">
          <StatsCards />
          
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <KnowledgeGraphPreview />
            <PipelineStatus />
          </div>
          
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentDocuments />
            </div>
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  )
}
