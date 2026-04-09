const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("papyrus_token");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail || res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Dashboard
  getDashboardStats: () => request<DashboardStats>("/dashboard/stats"),
  getRecentDocuments: () => request<DocumentOut[]>("/dashboard/recent"),

  // Documents
  listDocuments: (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    type?: string;
    sort?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") query.set(k, String(v));
      });
    }
    const qs = query.toString();
    return request<DocumentList>(`/documents${qs ? `?${qs}` : ""}`);
  },
  getDocument: (id: string) => request<DocumentOut>(`/documents/${id}`),
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("papyrus_token");
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new ApiError(res.status, "Upload failed");
    return res.json() as Promise<{ id: string; name: string; status: string }>;
  },
  deleteDocument: (id: string) =>
    request(`/documents/${id}`, { method: "DELETE" }),
  deleteDocumentsBatch: (ids: string[]) =>
    request("/documents", { method: "DELETE", body: JSON.stringify(ids) }),

  // Templates
  listTemplates: () => request<TemplateOut[]>("/templates"),
  createTemplate: (data: TemplateCreate) =>
    request<TemplateOut>("/templates", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTemplate: (id: string, data: Partial<TemplateCreate>) =>
    request<TemplateOut>(`/templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteTemplate: (id: string) =>
    request(`/templates/${id}`, { method: "DELETE" }),
  duplicateTemplate: (id: string) =>
    request<TemplateOut>(`/templates/${id}/duplicate`, { method: "POST" }),

  // Graph
  getGraphNodes: (params?: { type?: string; search?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") query.set(k, String(v));
      });
    }
    const qs = query.toString();
    return request<GraphNodeOut[]>(`/graph/nodes${qs ? `?${qs}` : ""}`);
  },
  getGraphEdges: () => request<GraphEdgeOut[]>("/graph/edges"),
  getGraphStats: () => request<GraphStats>("/graph/stats"),

  // API Keys
  listApiKeys: () => request<ApiKeyOut[]>("/api-keys"),
  createApiKey: (data: { name: string; type: string }) =>
    request<ApiKeyCreated>("/api-keys", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  regenerateApiKey: (id: string) =>
    request<ApiKeyCreated>(`/api-keys/${id}/regenerate`, { method: "POST" }),
  revokeApiKey: (id: string) =>
    request(`/api-keys/${id}`, { method: "DELETE" }),

  // Analytics
  getAnalytics: (days = 30) =>
    request<AnalyticsOverview>(`/analytics?days=${days}`),

  // Settings
  getRagSettings: () => request<RagSettingsOut>("/settings/rag"),
  updateRagSettings: (data: Partial<RagSettingsOut>) =>
    request<RagSettingsOut>("/settings/rag", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getDatabaseStatus: () =>
    request<{ status: string; provider?: string }>("/settings/database/status"),

  // RAG Pipeline
  ragIngest: (path?: string) =>
    request<RagIngestResult>("/rag/ingest", {
      method: "POST",
      body: JSON.stringify(path ? { path } : {}),
    }),
  ragQuery: (question: string) =>
    request<RagQueryResult>("/rag/query", {
      method: "POST",
      body: JSON.stringify({ question }),
    }),
  ragGraph: (params?: { type?: string; search?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") query.set(k, String(v));
      });
    }
    const qs = query.toString();
    return request<RagGraphData>(`/rag/graph${qs ? `?${qs}` : ""}`);
  },
  ragEntityDetail: (entityId: string) =>
    request<RagEntityDetail>(`/rag/graph/${encodeURIComponent(entityId)}`),
  ragStats: () => request<RagStats>("/rag/stats"),
};

// Types matching backend schemas
export interface DashboardStats {
  documents_indexed: number;
  graph_nodes: number;
  docs_generated: number;
  rag_accuracy: number;
}

export interface DocumentOut {
  id: string;
  name: string;
  type: string;
  status: string;
  file_size: number | null;
  chunks_count: number;
  entities_count: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentList {
  documents: DocumentOut[];
  total: number;
  page: number;
  page_size: number;
}

export interface TemplateOut {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  sections: Record<string, unknown>[];
  used_count: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateCreate {
  name: string;
  description?: string;
  industry?: string;
  sections?: Record<string, unknown>[];
}

export interface GraphNodeOut {
  id: string;
  label: string;
  type: string;
  connections: number;
}

export interface GraphEdgeOut {
  id: string;
  source_id: string;
  target_id: string;
  relation: string;
}

export interface GraphStats {
  total_nodes: number;
  documents: number;
  persons: number;
  organizations: number;
  concepts: number;
  total_edges: number;
}

export interface ApiKeyOut {
  id: string;
  name: string;
  key_prefix: string;
  type: string;
  requests_count: number;
  last_used_at: string | null;
  created_at: string;
}

export interface ApiKeyCreated extends ApiKeyOut {
  full_key: string;
}

export interface AnalyticsOverview {
  time_series: { date: string; processed: number; generated: number }[];
  document_types: { type: string; count: number }[];
  avg_latency_ms: number;
  avg_accuracy: number;
}

export interface RagSettingsOut {
  chunk_size: number;
  chunk_overlap: number;
  embedding_model: string;
  semantic_chunking: boolean;
  top_k: number;
  vector_weight: number;
  reranking: boolean;
  crag: boolean;
  llm_model: string;
  temperature: number;
  max_tokens: number;
  auto_citation: boolean;
}

// RAG types
export interface RagIngestResult {
  status: string;
  storage: string;
  documents_processed: number;
  entities_extracted: number;
  relationships_extracted: number;
  graph_stats: { total_nodes: number; total_edges: number; types: Record<string, number> };
}

export interface RagQueryResult {
  answer: string;
  sources: { entity_id: string; label: string; type: string; relation: string }[];
  confidence: number;
  reasoning: string[];
}

export interface RagGraphNode {
  id: string;
  label: string;
  type: string;
  connections: number;
  properties: Record<string, string>;
}

export interface RagGraphEdge {
  source: string;
  target: string;
  relation: string;
}

export interface RagGraphData {
  nodes: RagGraphNode[];
  edges: RagGraphEdge[];
  storage?: string;
}

export interface RagEntityDetail {
  id: string;
  label: string;
  type: string;
  properties: Record<string, string>;
  neighbors: { id: string; label: string; type: string; relation: string }[];
}

export interface RagStats {
  status: string;
  documents: number;
  entities: number;
  relationships: number;
  graph: { total_nodes: number; total_edges: number; types: Record<string, number> };
}
