"use client"

import { useState } from "react"
import { MenuBar } from "./menu-bar"
import { QueryEditor } from "./query-editor"
import { QueryActions } from "./query-actions"
import { ExecuteButton } from "./execute-button"
import { ResultsTable } from "./results-table"
import { MessagePanel } from "./message-panel"

export function SparqlQueryInterface() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<Array<Record<string, string>>>([])
  const [columns, setColumns] = useState<string[]>([])
const [message, setMessage] = useState<{ text: string; type: "info" | "success" | "error" }>({
  text: "Ready to execute queries",
  type: "info",
})


  const handleExecuteQuery = async () => {
    setIsLoading(true)
    setMessage({ text: "Executing query...", type: "info" })

    // Simulate API call
    setTimeout(() => {
      const mockResults = [
        { subject: "http://example.org/person/1", name: "John Doe", age: "30" },
        { subject: "http://example.org/person/2", name: "Jane Smith", age: "25" },
        { subject: "http://example.org/person/3", name: "Bob Johnson", age: "35" },
      ]
      setResults(mockResults)
      setColumns(["subject", "name", "age"])
      setMessage({ text: `Query executed successfully. ${mockResults.length} results found.`, type: "success" })
      setIsLoading(false)
    }, 1500)
  }

  const handleLoadQuery = () => {
    setMessage({ text: "Load query functionality not implemented", type: "info" })
  }

  const handleSaveQuery = () => {
    setMessage({ text: "Save query functionality not implemented", type: "info" })
  }

  const handleMenuAction = (action: string) => {
    setMessage({ text: `Menu action: ${action}`, type: "info" })
  }

  const handleClearResults = () => {
    setResults([])
    setColumns([])
    setMessage({ text: "Results cleared", type: "info" })
  }

  const handleSaveResults = (format: "json" | "csv") => {
    if (format === "json") {
      // Save as JSON
      const dataStr = JSON.stringify(results, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `sparql-results-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
      setMessage({ text: "Results saved as JSON successfully", type: "success" })
    } else if (format === "csv") {
      // Save as CSV
      // Create CSV header
      const csvHeader = columns.join(",")

      // Create CSV rows
      const csvRows = results.map((row) =>
        columns
          .map((col) => {
            const value = row[col] || ""
            // Escape quotes and wrap in quotes if contains comma or quote
            if (value.includes(",") || value.includes('"') || value.includes("\n")) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(","),
      )

      // Combine header and rows
      const csvContent = [csvHeader, ...csvRows].join("\n")

      // Create and download CSV file
      const dataBlob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `sparql-results-${Date.now()}.csv`
      link.click()
      URL.revokeObjectURL(url)
      setMessage({ text: "Results saved as CSV successfully", type: "success" })
    }
  }

  const handleClearLogs = () => {
    setMessage({ text: "Ready to execute queries", type: "info" })
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      <MenuBar onMenuAction={handleMenuAction} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="space-y-4">
            <QueryEditor query={query} onChange={setQuery} />

            <div className="flex items-center justify-between">
              <QueryActions onLoad={handleLoadQuery} onSave={handleSaveQuery} />
              <ExecuteButton onClick={handleExecuteQuery} isLoading={isLoading} />
            </div>
          </div>

          <ResultsTable results={results} columns={columns} onClear={handleClearResults} onSave={handleSaveResults} />
        </div>
      </div>

      <MessagePanel message={message.text} type={message.type} onClear={handleClearLogs} />
    </div>
  )
}
