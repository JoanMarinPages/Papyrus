-- Papyrus: Initial database schema
-- Run this in Supabase SQL Editor

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'processing',
  file_path TEXT,
  file_size BIGINT,
  chunks_count INT DEFAULT 0,
  entities_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_documents_tenant ON documents(tenant_id);
CREATE INDEX IF NOT EXISTS ix_documents_tenant_status ON documents(tenant_id, status);

-- Chunks (with vector embeddings)
CREATE TABLE IF NOT EXISTS chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1024),
  chunk_index INT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_chunks_document ON chunks(document_id);

-- Graph Nodes
CREATE TABLE IF NOT EXISTS graph_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  label VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_graph_nodes_tenant ON graph_nodes(tenant_id);
CREATE INDEX IF NOT EXISTS ix_graph_nodes_tenant_type ON graph_nodes(tenant_id, type);

-- Graph Edges
CREATE TABLE IF NOT EXISTS graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  source_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  relation VARCHAR(200) NOT NULL,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS ix_graph_edges_tenant ON graph_edges(tenant_id);
CREATE INDEX IF NOT EXISTS ix_graph_edges_source ON graph_edges(source_id);
CREATE INDEX IF NOT EXISTS ix_graph_edges_target ON graph_edges(target_id);

-- Templates
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(300) NOT NULL,
  description TEXT,
  industry VARCHAR(100),
  sections JSONB DEFAULT '[]',
  used_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_templates_tenant ON templates(tenant_id);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(200) NOT NULL,
  key_hash VARCHAR(128) NOT NULL,
  key_prefix VARCHAR(12) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'development',
  requests_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_api_keys_tenant ON api_keys(tenant_id);

-- RAG Settings (one per tenant)
CREATE TABLE IF NOT EXISTS rag_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE,
  chunk_size INT DEFAULT 512,
  chunk_overlap FLOAT DEFAULT 0.15,
  embedding_model VARCHAR(100) DEFAULT 'voyage-3-large',
  semantic_chunking BOOLEAN DEFAULT true,
  top_k INT DEFAULT 10,
  vector_weight FLOAT DEFAULT 0.6,
  reranking BOOLEAN DEFAULT true,
  crag BOOLEAN DEFAULT true,
  llm_model VARCHAR(100) DEFAULT 'claude-sonnet-4-20250514',
  temperature FLOAT DEFAULT 0.3,
  max_tokens INT DEFAULT 4096,
  auto_citation BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT DO NOTHING;

-- RLS policies (basic - tenant isolation)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_settings ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (backend uses service key)
CREATE POLICY "Service role full access" ON documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON chunks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON graph_nodes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON graph_edges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON api_keys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON rag_settings FOR ALL USING (true) WITH CHECK (true);
