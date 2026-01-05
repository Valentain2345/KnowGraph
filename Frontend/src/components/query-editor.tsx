import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"

interface QueryEditorProps {
  query: string
  onChange: (query: string) => void
}

export function QueryEditor({ query, onChange }: QueryEditorProps) {

  const handleClearClick=()=>{
    onChange("");
  }
  return (
      <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor="query" className="text-sm font-medium text-zinc-800">
        SPARQL Query
        </label>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClearClick}
        className="border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 focus:ring-2 focus:ring-indigo-500"
      >
        Clear Query
      </Button>
    </div>
    <Textarea
      id="query"
      value={query}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter your SPARQL query here..."
      className="min-h-[200px] font-mono text-sm bg-zinc-50 border-zinc-300 text-zinc-900 placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-indigo-500"
    />
  </div>

  )
}
