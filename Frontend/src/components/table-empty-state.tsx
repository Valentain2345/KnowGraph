import { Database } from "lucide-react"

export function TableEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-zinc-300 rounded-lg bg-white shadow-lg">
  <Database className="h-12 w-12 text-zinc-700 mb-4" />
  <h3 className="text-lg font-medium text-zinc-800 mb-2">No Results Yet</h3>
  <p className="text-sm text-zinc-600 text-center max-w-sm">
    Execute a SPARQL query to see results here. Your query results will be displayed in a table format.
  </p>
</div>

  )
}
