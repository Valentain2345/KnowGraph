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
        <label htmlFor="query" className="text-sm font-medium text-zinc-300">
          SPARQL Query
        </label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearClick}
          className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
        >
          Clear Query
        </Button>
      </div>
      <Textarea
        id="query"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your SPARQL query here..."
        className="min-h-[200px] font-mono text-sm bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-purple-500"
      />
    </div>
  )
}
