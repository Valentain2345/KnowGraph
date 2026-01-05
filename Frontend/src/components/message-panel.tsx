"use client"

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react"
import { Button } from "./ui/button"

interface MessagePanelProps {
  message: string
  type: "info" | "success" | "error"
  onClear: () => void
  zIndex?: number;
}

export function MessagePanel({ message, type, onClear }: MessagePanelProps) {
 const icons = {
  info: <Info className="h-4 w-4" />,
  success: <CheckCircle2 className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />,
}

const colors = {
  info: "bg-blue-500/10 border-blue-500/20 text-blue-500",  // Light blue background with blue text
  success: "bg-green-500/10 border-green-500/20 text-green-500",  // Light green background with green text
  error: "bg-red-500/10 border-red-500/20 text-red-500",  // Light red background with red text
}

return (
  <div className="border-t border-zinc-200 bg-white">
    <div className="flex items-center justify-between m-4">
      <div className={`flex items-center gap-2 px-4 py-3 border rounded-lg flex-1 ${colors[type]}`}>
        {icons[type]}
        <span className="text-sm font-mono text-zinc-800">{message}</span> {/* Darker text for contrast */}
      </div>
      <Button onClick={onClear} className="ml-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 text-sm px-3 py-2 h-auto">
        <X className="h-4 w-4 mr-1.5" />
        Clear Logs
      </Button>
    </div>
  </div>
)

}
