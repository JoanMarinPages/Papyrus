import { useState, useRef } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft, Download, Printer, Send, Eye, FileText, Shield, BarChart3, Megaphone,
  CheckCircle2,
} from "lucide-react"
import {
  CLIENTS, POLICIES, SUMMARIES, PROMOS,
  getClient, getClientPolicies, getClientSummary, getPolicyTypeLabel,
  type ClientData, type PolicyData, type SummaryData, type PromoData,
} from "@/lib/demo-data"

// --- Document renderers ---

function PolicyDocument({ policy, client }: { policy: PolicyData; client: ClientData }) {
  return (
    <div className="mx-auto max-w-[210mm] bg-white text-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-blue-600 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">AXA Seguros</h1>
          <p className="text-sm text-gray-500">Poliza de Seguro de {getPolicyTypeLabel(policy.type)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Ref: {policy.ref}</p>
          <p className="text-xs text-gray-400">Poliza: {policy.policyNumber}</p>
        </div>
      </div>

      {/* Client info */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">Datos del tomador</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-500">Nombre:</span> <span className="font-medium">{client.name}</span></div>
          <div><span className="text-gray-500">DNI:</span> <span className="font-medium">{client.dni}</span></div>
          <div><span className="text-gray-500">Direccion:</span> <span className="font-medium">{client.address}</span></div>
          <div><span className="text-gray-500">Ciudad:</span> <span className="font-medium">{client.city}</span></div>
        </div>
      </div>

      {/* Coverages */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-600">Coberturas contratadas</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-2 text-left font-medium text-gray-500">Cobertura</th>
              <th className="pb-2 text-right font-medium text-gray-500">Capital / Detalle</th>
            </tr>
          </thead>
          <tbody>
            {policy.coverages.map((c, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2">{c.name}</td>
                <td className="py-2 text-right font-medium">{c.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Contract details */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase text-gray-400">Datos del contrato</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Efecto:</span> <span className="font-medium">{policy.effectDate}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Vencimiento:</span> <span className="font-medium">{policy.expiryDate}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Prima anual:</span> <span className="font-bold text-blue-600">{policy.annualPremium.toFixed(2)} EUR</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Pago:</span> <span className="font-medium">{policy.paymentMethod}</span></div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase text-gray-400">Detalles adicionales</h3>
          <div className="space-y-1 text-sm">
            {Object.entries(policy.extras).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="capitalize text-gray-500">{k}:</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
        <p>Documento generado automaticamente por Papyrus para AXA Seguros</p>
        <p>Fecha de emision: {new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}</p>
      </div>
    </div>
  )
}

function SummaryDocument({ summary, client }: { summary: SummaryData; client: ClientData }) {
  return (
    <div className="mx-auto max-w-[210mm] bg-white text-black">
      <div className="flex items-center justify-between border-b-4 border-green-600 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-green-600">AXA Seguros</h1>
          <p className="text-sm text-gray-500">Resumen Anual de Seguros</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Periodo: {summary.period}</p>
          <p>Cliente: {client.name}</p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-600">Polizas activas</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200">
            <th className="pb-2 text-left font-medium text-gray-500">Poliza</th>
            <th className="pb-2 text-left font-medium text-gray-500">Tipo</th>
            <th className="pb-2 text-right font-medium text-gray-500">Prima anual</th>
            <th className="pb-2 text-right font-medium text-gray-500">Estado</th>
          </tr></thead>
          <tbody>
            {summary.policies.map((p, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2 font-mono text-xs">{p.number}</td>
                <td className="py-2">{p.type}</td>
                <td className="py-2 text-right font-medium">{p.premium.toFixed(2)} EUR</td>
                <td className="py-2 text-right"><span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">{p.status}</span></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300">
              <td colSpan={2} className="py-2 font-semibold">Total primas anuales</td>
              <td className="py-2 text-right font-bold text-green-600">{summary.totalPremium.toFixed(2)} EUR</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{summary.claims}</p>
          <p className="text-xs text-gray-500">Siniestros</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{summary.claimsCost.toLocaleString()} EUR</p>
          <p className="text-xs text-gray-500">Indemnizaciones</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4 text-center">
          <p className="text-sm font-bold text-green-600">{summary.loyaltyDiscount}</p>
          <p className="text-xs text-gray-500">Ahorro fidelidad</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-green-700">Recomendaciones personalizadas</h3>
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
          {summary.recommendations.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      <div className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
        <p>Resumen generado por Papyrus para AXA Seguros</p>
        <p>Envio programado: Viernes</p>
      </div>
    </div>
  )
}

function PromoDocument({ promo }: { promo: PromoData }) {
  return (
    <div className="mx-auto max-w-[210mm] bg-white text-black">
      <div className="rounded-t-lg bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-center text-white">
        <p className="text-sm font-medium uppercase tracking-wider opacity-80">AXA Seguros presenta</p>
        <h1 className="mt-2 text-3xl font-bold">{promo.name}</h1>
        <p className="mt-2 text-lg opacity-90">{promo.headline}</p>
      </div>

      <div className="p-6">
        <p className="text-center text-gray-600">{promo.description}</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {promo.features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-purple-100 bg-purple-50 p-3 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-purple-600" />
              <span>{f}</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-center font-semibold text-purple-700">Comparativa de precios</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200">
              <th className="pb-2 text-left font-medium text-gray-500">Concepto</th>
              <th className="pb-2 text-right font-medium text-gray-500">Precio individual</th>
              <th className="pb-2 text-right font-medium text-gray-500">Precio Pack</th>
            </tr></thead>
            <tbody>
              {promo.pricing.map((p, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2">{p.item}</td>
                  <td className="py-2 text-right text-gray-400 line-through">{p.before}</td>
                  <td className="py-2 text-right font-bold text-purple-600">{p.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-4 text-center">
          <p className="text-sm text-gray-500">Ahorro total</p>
          <p className="text-2xl font-bold text-purple-600">{promo.totalSaving}</p>
          <p className="mt-1 text-xs text-gray-400">Oferta valida hasta {promo.validUntil}</p>
        </div>

        <div className="mt-6 text-center">
          <p className="font-semibold text-purple-700">{promo.cta}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 p-4 text-center text-xs text-gray-400">
        <p>Material promocional generado por Papyrus para AXA Seguros</p>
      </div>
    </div>
  )
}

// --- Main page ---
export default function DocumentPreviewPage() {
  const [params] = useSearchParams()
  const [selectedClient, setSelectedClient] = useState(params.get("client") || "c1")
  const [selectedType, setSelectedType] = useState(params.get("type") || "poliza")
  const [selectedPolicy, setSelectedPolicy] = useState(params.get("policy") || "")
  const [selectedPromo, setSelectedPromo] = useState("promo1")
  const [sent, setSent] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const client = getClient(selectedClient)
  const clientPolicies = getClientPolicies(selectedClient)
  const summary = getClientSummary(selectedClient)

  const currentPolicy = selectedPolicy
    ? POLICIES.find((p) => p.id === selectedPolicy)
    : clientPolicies[0]

  const currentPromo = PROMOS.find((p) => p.id === selectedPromo)

  const handlePrint = () => {
    const content = printRef.current
    if (!content) return
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`<html><head><title>Documento AXA</title><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: system-ui, sans-serif; padding: 40px; }
      table { border-collapse: collapse; width: 100%; }
      td, th { padding: 8px 4px; }
    </style></head><body>${content.innerHTML}</body></html>`)
    win.document.close()
    win.print()
  }

  const handleSend = () => {
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header title="Previsualizacion" description="Vista previa del documento generado" />
        <div className="p-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/schedule">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </Link>

            <Select value={selectedType} onValueChange={(v) => { setSelectedType(v); setSent(false) }}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="poliza"><div className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-blue-500" />Poliza</div></SelectItem>
                <SelectItem value="resumen"><div className="flex items-center gap-2"><BarChart3 className="h-3.5 w-3.5 text-green-500" />Resumen</div></SelectItem>
                <SelectItem value="publicidad"><div className="flex items-center gap-2"><Megaphone className="h-3.5 w-3.5 text-purple-500" />Publicidad</div></SelectItem>
              </SelectContent>
            </Select>

            {selectedType !== "publicidad" && (
              <Select value={selectedClient} onValueChange={(v) => { setSelectedClient(v); setSelectedPolicy(""); setSent(false) }}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLIENTS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedType === "poliza" && clientPolicies.length > 0 && (
              <Select value={selectedPolicy || clientPolicies[0]?.id} onValueChange={(v) => { setSelectedPolicy(v); setSent(false) }}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clientPolicies.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{getPolicyTypeLabel(p.type)} - {p.policyNumber.split("-").slice(-1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedType === "publicidad" && (
              <Select value={selectedPromo} onValueChange={(v) => { setSelectedPromo(v); setSent(false) }}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROMOS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                PDF
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={handleSend}
                disabled={sent}
              >
                {sent ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                {sent ? "Enviado!" : "Enviar"}
              </Button>
            </div>
          </div>

          {/* Info bar */}
          <div className="mt-4 flex items-center gap-4 rounded-lg border border-border bg-secondary/30 px-4 py-2 text-xs text-muted-foreground">
            <Badge variant="outline" className={
              selectedType === "poliza" ? "border-blue-500/20 bg-blue-500/10 text-blue-500" :
              selectedType === "resumen" ? "border-green-500/20 bg-green-500/10 text-green-500" :
              "border-purple-500/20 bg-purple-500/10 text-purple-500"
            }>
              {selectedType === "poliza" ? "Martes / Jueves" : "Viernes"}
            </Badge>
            <span>Generado con datos del grafo de conocimiento AXA</span>
            <span className="ml-auto">Powered by Papyrus Hybrid RAG</span>
          </div>

          {/* Document preview */}
          <Card className="mt-4 overflow-hidden border-border">
            <CardContent className="p-8" ref={printRef}>
              {selectedType === "poliza" && currentPolicy && client && (
                <PolicyDocument policy={currentPolicy} client={client} />
              )}
              {selectedType === "resumen" && summary && client && (
                <SummaryDocument summary={summary} client={client} />
              )}
              {selectedType === "resumen" && !summary && (
                <div className="py-12 text-center text-muted-foreground">
                  <FileText className="mx-auto h-10 w-10" />
                  <p className="mt-3">No hay resumen disponible para este cliente</p>
                </div>
              )}
              {selectedType === "publicidad" && currentPromo && (
                <PromoDocument promo={currentPromo} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
