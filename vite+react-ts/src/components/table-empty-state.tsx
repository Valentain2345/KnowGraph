import { Database } from "lucide-react"

export function TableEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-zinc-800 rounded-lg bg-zinc-900/50">
      <Database className="h-12 w-12 text-zinc-600 mb-4" />
      <h3 className="text-lg font-medium text-zinc-400 mb-2">No Results Yet</h3>
      <p className="text-sm text-zinc-500 text-center max-w-sm">
        Execute a SPARQL query to see results here. Your query results will be displayed in a table format.
      </p>
    </div>
  )
}
