
import { useRef } from "react"
import { Button } from "./ui/button"
import { Upload, Download } from "lucide-react"

interface QueryActionsProps {
  onLoad: () => void
  onSave: () => void
}

export function QueryActions({ onLoad, onSave }: QueryActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLoadClick = () => {
    fileInputRef.current?.click()
  }
  return (
    <div className="flex gap-2">
    <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.sparql,.rq"
        onChange={onLoad}
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleLoadClick}
        className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
      >
        <Upload className="h-4 w-4 mr-2" />
        Load Query
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onSave}
        className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
      >
        <Download className="h-4 w-4 mr-2" />
        Save Query
      </Button>
    </div>
  )
}
