"use client"

import { Textarea } from "./ui/textarea"

interface QueryEditorProps {
  query: string
  onChange: (query: string) => void
}

export function QueryEditor({ query, onChange }: QueryEditorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="query" className="text-sm font-medium text-zinc-300">
        SPARQL Query
      </label>
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
