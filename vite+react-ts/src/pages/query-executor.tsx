import React, { useState,useEffect,useRef } from "react"
import { ResultsTable } from "../components/results-table"
import { QueryEditor } from "../components/query-editor"
import { QueryActions } from "../components/query-actions"
import { ExecuteButton } from "../components/execute-button"
import Papa from "papaparse"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card"
import styled from "styled-components"

interface QueryExecutorProps {
  setMessage: React.Dispatch<
    React.SetStateAction<{ text: string; type: "info" | "success" | "error" }>
  >
  query: string
  setQuery: React.Dispatch<React.SetStateAction<string>>

  setVariables: React.Dispatch<React.SetStateAction<string[]>>
  setQueryResults: React.Dispatch<React.SetStateAction<Array<Record<string, string>>>>
}

export const QueryExecutor: React.FC<QueryExecutorProps> = ({
  setMessage,
  query,
  setQuery,
  setVariables,
  setQueryResults,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<Array<Record<string, string>>>([])
  const [columns, setColumns] = useState<string[]>([])
  const [showChat, setShowChat] = useState(false)
  const [executionQuery,setExecutionQuery]= useState("")



  // ---- EXECUTE QUERY ----
  const handleExecuteQuery = async () => {
    setIsLoading(true)
    setMessage({ text: "Fetching and parsing results of query...", type: "info" })

    try {
      const response = await fetch("http://localhost:8080/sparql/runQuery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: executionQuery,
      })

      if (!response.ok)
        throw new Error("Failed to fetch query results from the server")
      const csvText = await response.text()

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const parsedData = result.data as Array<Record<string, string>>

          const parsedColumns = result.meta.fields || []
          console.log(parsedData)
          console.log(parsedColumns)
          setResults(parsedData)
          setVariables(parsedColumns)
          setQueryResults(parsedData)
          setColumns(parsedColumns)
          setMessage({
            text: `Query executed successfully. ${parsedData.length} results found.`,
            type: "success",
          })
        },
        error: (error) => {
          setMessage({ text: `Error parsing CSV data: ${error.message}`, type: "error" })
        },
      })
    } catch (error) {
      setMessage({ text: `Error fetching data: ${(error as Error).message}`, type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  // ---- FILE HANDLERS ----
  const handleLoadQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const fileContent = reader.result as string
      handleChangeQuery(fileContent)
      setMessage({ text: "Query loaded successfully!", type: "success" })
    }
    reader.onerror = () => {
      setMessage({ text: "Error loading file.", type: "error" })
    }
    reader.readAsText(file)
  }

  const handleSaveQuery = () => {
    if (!query.trim()) {
      setMessage({ text: "Query is empty, nothing to save.", type: "error" })
      return
    }
    const blob = new Blob([query], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "query.txt"
    link.click()
    URL.revokeObjectURL(url)
    setMessage({ text: "Query saved successfully!", type: "success" })
  }

  // ---- RESULTS HANDLERS ----
  const handleClearResults = () => {
    setResults([])
    setColumns([])
    setMessage({ text: "Results cleared", type: "info" })
  }

  const handleSaveResults = (format: "json" | "csv") => {
    if (format === "json") {
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
      const csvHeader = columns.join(",")
      const csvRows = results.map((row) =>
        columns
          .map((col) => {
            const value = row[col] || ""
            if (value.includes(",") || value.includes('"') || value.includes("\n")) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(",")
      )

      const csvContent = [csvHeader, ...csvRows].join("\n")
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

 const handleChangeQuery = (newQuery: string) => {
   setQuery(newQuery);
   setExecutionQuery(newQuery);
}

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 relative">
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Query Executor</CardTitle>
          <CardDescription className="text-zinc-400">
            Execute SPARQL queries and view results in table format.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <QueryEditor query={query} onChange={handleChangeQuery} />

          <div className="flex items-center justify-between">
            <QueryActions onLoad={handleLoadQuery} onSave={handleSaveQuery} />

            <div className="flex gap-2">
              <FancyButton onClick={() => setShowChat((prev) => !prev)}>
                <span className="text">Ask an LLM</span>
              </FancyButton>
              <ExecuteButton onClick={handleExecuteQuery} isLoading={isLoading} />
            </div>
          </div>

          <ResultsTable
            results={results}
            columns={columns.map((col) => ({
              id: col,
              label: col.charAt(0).toUpperCase() + col.slice(1),
              accessor: col,
            }))}
            onClear={handleClearResults}
            onSave={handleSaveResults}
          />
        </CardContent>
      </Card>

      {/* LLM Assistant Panel */}
      {showChat && (
        <ChatWidget setShowChat={setShowChat}/>
      )}
    </div>
  )
}





interface ChatWidgetProps {
  setShowChat: (show: boolean) => void;
}



const ChatWidget: React.FC<ChatWidgetProps> = ({ setShowChat }) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.botpress.cloud/webchat/v3.3/inject.js";
    script.async = true;

    script.onload = () => {
      const bp = (window as any).botpress;
      if (!bp) return console.error("Botpress SDK not loaded");

      bp.init({
        botId: "2948a19e-16b4-4d74-aaf2-bbd7698701a5",
        clientId: "8fd91274-19c5-41e6-8781-800d32bd4227",
        selector: "#bp-webchat",
        configuration: {
          version: "v2",
          botName: "Sparql Agent",
          color: "#3276EA",
          variant: "solid",
          headerVariant: "glass",
          themeMode: "dark",
          fontFamily: "inter",
          radius: 1,
          feedbackEnabled: false,
          embeddedChatId: "bp-embedded-webchat",
          proactiveMessageEnabled: false,
        },
      });

      bp.on("webchat:ready", () => {
        bp.open();
      });
    };

    document.body.appendChild(script);

    return () => {
      (window as any).botpressWebChat?.close?.();
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Overlay>
      <ChatWindow>
        <Header>
          <Title>AI Assistant</Title>
          <CloseButton
            onClick={() => {
              (window as any).botpressWebChat?.close?.();
              setShowChat(false);
            }}
          >
            ✕
          </CloseButton>
        </Header>
        <ChatContainer id="bp-embedded-webchat" ref={chatContainerRef} />
      </ChatWindow>
    </Overlay>
  );
};

export default ChatWidget;

//
// ─── STYLED COMPONENTS ───────────────────────────────────────────────
//

const Overlay = styled.div`
  position: fixed;
  right: 1rem;
  bottom: 5rem;
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
`;

const ChatWindow = styled.div`
  pointer-events: auto;
  width: 90vw;
  max-width: 420px;
  height: 60vh;
  min-height: 400px;
  background: #0f0f10;
  border: 1px solid #2d2d2f;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(6px);
  transition: all 0.3s ease-in-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #18181b;
  border-bottom: 1px solid #2d2d2f;
`;

const Title = styled.h3`
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
`;

const CloseButton = styled.button`
  color: #a1a1aa;
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: #fff;
  }
`;

const ChatContainer = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

// ---- Styled Fancy Button ----
const FancyButton = styled.button`
  align-items: center;
  background-image: linear-gradient(144deg, #af40ff, #5b42f3 50%, #00ddeb);
  border: 0;
  border-radius: 8px;
  box-shadow: rgba(151, 65, 252, 0.2) 0 15px 30px -5px;
  color: #ffffff;
  display: flex;
  font-size: 16px;
  font-weight: 500;
  justify-content: center;
  line-height: 1em;
  padding: 3px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 150px;

  span {
    background-color: rgb(5, 6, 45);
    padding: 12px 20px;
    border-radius: 6px;
    width: 100%;
    height: 100%;
    transition: 300ms;
  }

  &:hover span {
    background: none;
  }

  &:active {
    transform: scale(0.94);
  }
`
