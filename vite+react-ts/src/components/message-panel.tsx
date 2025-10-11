"use client"

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react"
import { Button } from "./ui/button"

interface MessagePanelProps {
  message: string
  type: "info" | "success" | "error"
  onClear: () => void
}

export function MessagePanel({ message, type, onClear }: MessagePanelProps) {
  const icons = {
    info: <Info className="h-4 w-4" />,
    success: <CheckCircle2 className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
  }

  const colors = {
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    success: "bg-green-500/10 border-green-500/20 text-green-400",
    error: "bg-red-500/10 border-red-500/20 text-red-400",
  }

  return (
    <div className="border-t border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between m-4">
        <div className={`flex items-center gap-2 px-4 py-3 border rounded-lg flex-1 ${colors[type]}`}>
          {icons[type]}
          <span className="text-sm font-mono">{message}</span>
        </div>
        <Button onClick={onClear} className="ml-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm px-3 py-2 h-auto">
          <X className="h-4 w-4 mr-1.5" />
          Clear Logs
        </Button>
      </div>
    </div>
  )
}
