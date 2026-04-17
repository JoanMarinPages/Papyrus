import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface InfoTooltipProps {
  description: string
  legacy?: string
  className?: string
  size?: "sm" | "md"
}

/**
 * InfoTooltip: small ℹ️ icon that reveals a description on hover.
 *
 * Used throughout Papyrus to explain what each field does and, when relevant,
 * reference the equivalent concept from the legacy Papyrus (ISIS) system so
 * migrating users recognize what they're looking at.
 */
export function InfoTooltip({ description, legacy, className, size = "sm" }: InfoTooltipProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex cursor-help items-center justify-center text-muted-foreground/60 transition-colors hover:text-primary",
            className,
          )}
          onClick={(e) => e.preventDefault()}
          aria-label="Más información"
        >
          <Info className={iconSize} />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-card text-card-foreground shadow-lg ring-1 ring-border">
        <div className="space-y-1.5 p-1 text-left">
          <p className="text-xs leading-relaxed">{description}</p>
          {legacy && (
            <p className="border-t border-border/50 pt-1.5 text-[10px] text-muted-foreground">
              <span className="font-semibold">Papyrus legacy:</span> {legacy}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
