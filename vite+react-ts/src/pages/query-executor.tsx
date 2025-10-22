import React, { useState } from 'react';
import { ResultsTable } from "../components/results-table";
import { QueryEditor } from "../components/query-editor";
import { QueryActions } from "../components/query-actions";
import { ExecuteButton } from "../components/execute-button";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";

// Define the props interface for QueryExecutor
interface QueryExecutorProps {
  setMessage: React.Dispatch<React.SetStateAction<{ text: string; type: "info" | "success" | "error" }>>;
}

export const QueryExecutor: React.FC<QueryExecutorProps> = ({ setMessage }) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Array<Record<string, string>>>([]);
  const [columns, setColumns] = useState<string[]>([]);

  const handleExecuteQuery = async () => {
    setIsLoading(true);
    setMessage({ text: "Fetching and parsing results of query...", type: "info" });

    try {
      const response = await fetch("http://localhost:8080/sparql/runQuery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: query,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch query results from the server");
      }

      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const parsedData = result.data;
          const parsedColumns = result.meta.fields || [];

          console.log('Parsed Data:', parsedData);
          console.log('Parsed Columns:', parsedColumns);

          setResults(parsedData);
          setColumns(parsedColumns);
          setMessage({
            text: `Query executed successfully. ${parsedData.length} results found.`,
            type: "success",
          });
        },
        error: (error) => {
          setMessage({ text: `Error parsing CSV data: ${error.message}`, type: "error" });
        },
      });
    } catch (error) {
      setMessage({ text: `Error fetching data: ${error.message}`, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = reader.result as string;
      setQuery(fileContent);
      setMessage({ text: "Query loaded successfully!", type: "success" });
    };
    reader.onerror = () => {
      setMessage({ text: "Error loading file.", type: "error" });
    };
    reader.readAsText(file);
  };

  const handleSaveQuery = () => {
    if (!query.trim()) {
      setMessage({ text: "Query is empty, nothing to save.", type: "error" });
      return;
    }

    const blob = new Blob([query], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'query.txt';
    link.click();
    setMessage({ text: "Query saved successfully!", type: "success" });
  };

  const handleClearResults = () => {
    setResults([]);
    setColumns([]);
    setMessage({ text: "Results cleared", type: "info" });
  };

  const handleSaveResults = (format: "json" | "csv") => {
    if (format === "json") {
      const dataStr = JSON.stringify(results, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sparql-results-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage({ text: "Results saved as JSON successfully", type: "success" });
    } else if (format === "csv") {
      const csvHeader = columns.join(",");
      const csvRows = results.map((row) =>
        columns
          .map((col) => {
            const value = row[col] || "";
            if (value.includes(",") || value.includes('"') || value.includes("\n")) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(","),
      );

      const csvContent = [csvHeader, ...csvRows].join("\n");
      const dataBlob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sparql-results-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage({ text: "Results saved as CSV successfully", type: "success" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Query Executor</CardTitle>
          <CardDescription className="text-zinc-400">
            Execute SPARQL queries and view results in table format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <QueryEditor query={query} onChange={setQuery} />
            <div className="flex items-center justify-between">
              <QueryActions onLoad={handleLoadQuery} onSave={handleSaveQuery} />
              <ExecuteButton onClick={handleExecuteQuery} isLoading={isLoading} />
            </div>
          </div>
          <ResultsTable
            results={results}
            columns={[
              { id: 'id', label: 'ID', accessor: 'id' },
              { id: 'name', label: 'Name', accessor: 'name' },
              { id: 'createdAt', label: 'Created At', accessor: 'createdAt' },
            ]}
            onClear={handleClearResults}
            onSave={handleSaveResults}
          />
        </CardContent>
      </Card>
    </div>
  );
};
