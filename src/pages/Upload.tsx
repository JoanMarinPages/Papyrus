
import { useState, useCallback } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  FileSpreadsheet,
  File,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
}

const fileTypeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  docx: FileText,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  default: File,
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase() || ""
  return fileTypeIcons[ext] || fileTypeIcons.default
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const simulateUpload = (file: File) => {
    const uploadedFile: UploadedFile = {
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      progress: 0,
    }

    setFiles((prev) => [...prev, uploadedFile])

    // Simulate upload progress
    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id === uploadedFile.id) {
            const newProgress = Math.min(f.progress + Math.random() * 30, 100)
            if (newProgress >= 100) {
              clearInterval(interval)
              return { ...f, progress: 100, status: "processing" }
            }
            return { ...f, progress: newProgress }
          }
          return f
        })
      )
    }, 500)

    // Simulate processing completion
    setTimeout(() => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id ? { ...f, status: "completed" } : f
        )
      )
    }, 4000)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    droppedFiles.forEach(simulateUpload)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    selectedFiles.forEach(simulateUpload)
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <Header
          title="Subir Archivos"
          description="Sube documentos para indexar en tu base de conocimiento"
        />
        <div className="p-6">
          {/* Upload Zone */}
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                )}
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.xlsx,.csv,.md"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={handleFileInput}
                />
                <div className="rounded-full bg-primary/10 p-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <p className="mt-4 text-lg font-medium text-foreground">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Soporta PDF, DOCX, TXT, XLSX, CSV, MD (máx. 50MB por archivo)
                </p>
                <div className="mt-4 flex gap-2">
                  <Badge variant="secondary">PDF</Badge>
                  <Badge variant="secondary">DOCX</Badge>
                  <Badge variant="secondary">XLSX</Badge>
                  <Badge variant="secondary">CSV</Badge>
                  <Badge variant="secondary">TXT</Badge>
                  <Badge variant="secondary">MD</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {files.length > 0 && (
            <Card className="mt-6 border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Archivos Subidos</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {files.map((file) => {
                    const FileIcon = getFileIcon(file.name)
                    return (
                      <div
                        key={file.id}
                        className="flex items-center gap-4 px-6 py-4"
                      >
                        <div className="rounded-lg bg-secondary p-2">
                          <FileIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">
                              {file.name}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                          {file.status === "uploading" && (
                            <div className="mt-2">
                              <Progress value={file.progress} className="h-1" />
                              <p className="mt-1 text-xs text-muted-foreground">
                                Subiendo... {Math.round(file.progress)}%
                              </p>
                            </div>
                          )}
                          {file.status === "processing" && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-chart-2">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Procesando con RAG...
                            </p>
                          )}
                          {file.status === "completed" && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-primary">
                              <CheckCircle2 className="h-3 w-3" />
                              Indexado correctamente
                            </p>
                          )}
                          {file.status === "error" && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                              <AlertCircle className="h-3 w-3" />
                              Error al procesar
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing Info */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">847</p>
                    <p className="text-sm text-muted-foreground">
                      Documentos totales
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-chart-2/10 p-3">
                    <Loader2 className="h-6 w-6 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">3</p>
                    <p className="text-sm text-muted-foreground">
                      En procesamiento
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-chart-3/10 p-3">
                    <CheckCircle2 className="h-6 w-6 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">12.4K</p>
                    <p className="text-sm text-muted-foreground">
                      Chunks indexados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
