
import { useRef } from "react"
import { Button } from "./ui/button"
import { Upload, Download } from "lucide-react"

interface QueryActionsProps {
  onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void
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
        className="border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-900 focus:ring-2 focus:ring-indigo-500"
      >
        <Upload className="h-4 w-4 mr-2" />
        Load Query
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onSave}
        className="border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-900 focus:ring-2 focus:ring-indigo-500"
      >
        <Download className="h-4 w-4 mr-2" />
        Save Query
      </Button>
    </div>

  )
}
