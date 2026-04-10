/**
 * Document separation marks for batch printing.
 * OMR: optical lines on the left margin
 * Barcode: Code128-style barcode on top/bottom
 * QR: QR code with document metadata
 * Separator: visual page break between documents
 */

interface MarksConfig {
  type: "none" | "omr" | "barcode" | "qr" | "separator"
  position: "left" | "top" | "bottom" | "both"
  showPageNumber: boolean
  showClientId: boolean
  showBatchCode: boolean
}

interface DocumentMarksProps {
  config: MarksConfig
  pageNumber: number
  totalPages: number
  isFirstPage: boolean
  isLastPage: boolean
  clientName: string
  clientId: string
  batchCode: string
  documentId: string
}

// Simulated Code128 barcode pattern
function BarcodePattern({ value, width = 200, height = 30 }: { value: string; width?: number; height?: number }) {
  // Generate pseudo-barcode bars from string
  const bars: boolean[] = []
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    for (let bit = 7; bit >= 0; bit--) {
      bars.push(((code >> bit) & 1) === 1)
    }
  }
  // Add start/stop patterns
  const allBars = [true, true, false, true, false, ...bars, true, false, true, true, false]
  const barWidth = width / allBars.length

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {allBars.map((bar, i) => (
        bar && <rect key={i} x={i * barWidth} y={0} width={barWidth * 0.9} height={height - 8} fill="black" />
      ))}
      <text x={width / 2} y={height - 1} textAnchor="middle" fontSize={7} fontFamily="monospace" fill="black">
        {value}
      </text>
    </svg>
  )
}

// Simulated QR code
function QRPattern({ value, size = 60 }: { value: string; size?: number }) {
  const grid = 15
  const cellSize = size / grid
  // Generate pseudo-QR pattern from string hash
  const cells: boolean[][] = Array.from({ length: grid }, () => Array(grid).fill(false))

  // Fixed patterns (corners)
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const border = i === 0 || i === 4 || j === 0 || j === 4 || (i === 2 && j === 2)
      cells[i][j] = border
      cells[i][grid - 1 - j] = border
      cells[grid - 1 - i][j] = border
    }
  }
  // Data from value
  let hash = 0
  for (let i = 0; i < value.length; i++) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0
  for (let i = 6; i < grid - 1; i++) {
    for (let j = 6; j < grid - 1; j++) {
      cells[i][j] = ((hash >> ((i * grid + j) % 31)) & 1) === 1
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" />
      {cells.map((row, i) =>
        row.map((cell, j) =>
          cell && <rect key={`${i}-${j}`} x={j * cellSize} y={i * cellSize} width={cellSize} height={cellSize} fill="black" />
        )
      )}
    </svg>
  )
}

// OMR marks (optical lines on margin)
function OMRMarks({ isFirstPage, isLastPage, pageNumber }: { isFirstPage: boolean; isLastPage: boolean; pageNumber: number }) {
  // OMR uses 3-5 marks on the left margin
  // Mark 1: Start of document (first page only)
  // Mark 2: Continue (middle pages)
  // Mark 3: End of document (last page only)
  // Mark 4: Duplex indicator
  // Mark 5: Timing mark (always present)
  return (
    <div className="absolute left-0 top-0 flex h-full w-3 flex-col items-center py-8" style={{ gap: "12mm" }}>
      {/* Timing mark (always) */}
      <div className="h-3 w-2 bg-black" />
      {/* Start mark */}
      {isFirstPage && <div className="h-3 w-2 bg-black" />}
      {!isFirstPage && <div className="h-3 w-2" />}
      {/* Continue/middle */}
      {!isFirstPage && !isLastPage && <div className="h-3 w-2 bg-black" />}
      {(isFirstPage || isLastPage) && <div className="h-3 w-2" />}
      {/* End mark */}
      {isLastPage && <div className="h-3 w-2 bg-black" />}
      {!isLastPage && <div className="h-3 w-2" />}
      {/* Page number mark (binary) */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`h-2 w-2 ${((pageNumber >> (3 - i)) & 1) ? "bg-black" : ""}`} />
      ))}
    </div>
  )
}

export function DocumentMarks({
  config,
  pageNumber,
  totalPages,
  isFirstPage,
  isLastPage,
  clientName,
  clientId,
  batchCode,
  documentId,
}: DocumentMarksProps) {
  if (config.type === "none") return null

  const metaText = [
    config.showClientId && clientId,
    config.showBatchCode && batchCode,
    config.showPageNumber && `Pag ${pageNumber}/${totalPages}`,
  ].filter(Boolean).join(" | ")

  return (
    <>
      {/* OMR marks on left margin */}
      {config.type === "omr" && (
        <OMRMarks isFirstPage={isFirstPage} isLastPage={isLastPage} pageNumber={pageNumber} />
      )}

      {/* Top marks */}
      {(config.position === "top" || config.position === "both") && config.type !== "omr" && (
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-1">
          {config.type === "barcode" && (
            <BarcodePattern value={`${batchCode}-${documentId}-P${pageNumber}`} width={180} height={25} />
          )}
          {config.type === "qr" && (
            <QRPattern value={JSON.stringify({ batch: batchCode, doc: documentId, client: clientId, page: pageNumber })} size={45} />
          )}
          <span style={{ fontSize: 7, fontFamily: "monospace", color: "#999" }}>{metaText}</span>
        </div>
      )}

      {/* Bottom marks */}
      {(config.position === "bottom" || config.position === "both") && config.type !== "omr" && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-1">
          <span style={{ fontSize: 7, fontFamily: "monospace", color: "#999" }}>{metaText}</span>
          {config.type === "barcode" && (
            <BarcodePattern value={`${batchCode}-${documentId}-P${pageNumber}`} width={150} height={20} />
          )}
          {config.type === "qr" && (
            <QRPattern value={JSON.stringify({ batch: batchCode, doc: documentId, page: pageNumber })} size={35} />
          )}
        </div>
      )}

      {/* Separator page indicator */}
      {config.type === "separator" && isLastPage && (
        <div className="mt-4 border-t-2 border-dashed border-gray-300 pt-4 text-center">
          <p style={{ fontSize: 9, color: "#bbb", fontFamily: "monospace" }}>
            ─── FIN DOCUMENTO: {clientName} ({documentId}) ── BATCH: {batchCode} ── PAG {pageNumber}/{totalPages} ───
          </p>
        </div>
      )}

      {/* Separator page indicator for first page */}
      {config.type === "separator" && isFirstPage && pageNumber > 1 && (
        <div className="mb-4 border-b-2 border-dashed border-gray-300 pb-4 text-center">
          <p style={{ fontSize: 9, color: "#bbb", fontFamily: "monospace" }}>
            ─── INICIO DOCUMENTO: {clientName} ───
          </p>
        </div>
      )}
    </>
  )
}

// Separator component between documents in batch preview
export function DocumentSeparator({
  type,
  clientName,
  batchCode,
  docIndex,
  totalDocs,
}: {
  type: "none" | "omr" | "barcode" | "qr" | "separator"
  clientName: string
  batchCode: string
  docIndex: number
  totalDocs: number
}) {
  if (type === "none") return null

  return (
    <div className="my-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-center dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-center gap-4">
        <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          {type === "omr" && <span>◆ OMR MARK</span>}
          {type === "barcode" && <BarcodePattern value={`SEP-${docIndex}`} width={80} height={15} />}
          {type === "qr" && <QRPattern value={`sep-${docIndex}`} size={25} />}
          {type === "separator" && <span>✂ CORTAR AQUI</span>}
          <span>|</span>
          <span>Doc {docIndex + 1}/{totalDocs}</span>
          <span>|</span>
          <span>Siguiente: {clientName}</span>
          <span>|</span>
          <span>Batch: {batchCode}</span>
        </div>
        <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
      </div>
    </div>
  )
}

export type { MarksConfig }
export { BarcodePattern, QRPattern }
