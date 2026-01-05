
import { TableEmptyState } from "./table-empty-state"
import { TableRowItem } from "./table-row-item"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Trash2, Download, ChevronDown } from "lucide-react"

interface ResultsTableProps {
  results: Array<Record<string, string>>
  columns: (string|Column)[]
  onClear: () => void
  onSave: (format: "json" | "csv") => void
}

interface Column {
  id: string;
  label?: string;
  accessor?: string;
}

export function ResultsTable({ results, columns, onClear, onSave }: ResultsTableProps) {
  if (results.length === 0) {
    return <TableEmptyState />
  }

  return (
    <div className="flex flex-col gap-2">
  <div className="flex items-center justify-between">
    <h3 className="text-sm font-medium text-zinc-900">Query Results</h3>
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-3 py-1.5 h-auto">
            <Download className="h-4 w-4 mr-1.5" />
            Save Results
            <ChevronDown className="h-4 w-4 ml-1.5" />
          </Button>
        </DropdownMenuTrigger>

        {/* Remove `asChild` and wrap `DropdownMenuContent` with a div to handle alignment */}
        <DropdownMenuContent className="w-40">
          <div className="flex flex-col items-end">
            <DropdownMenuItem onClick={() => onSave("json")}>Save as JSON</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSave("csv")}>Save as CSV</DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button onClick={onClear} className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 h-auto">
        <Trash2 className="h-4 w-4 mr-1.5" />
        Clear Results
      </Button>
    </div>
  </div>

  <div className="border border-zinc-300 rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-zinc-100 border-b border-zinc-300">
          <tr>
            {columns.map((column, index) => {
              const key = typeof column === "string" ? column : column.id ?? index;
              const label = typeof column === "string" ? column : column.label ?? column.accessor ?? column.id ?? "Unknown";
              return <th key={key} className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">{label}</th>
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {results.map((row, index) => (
            <TableRowItem key={index} row={row} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>

  )
}
