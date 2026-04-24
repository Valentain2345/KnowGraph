import React, { useState, useEffect, useRef } from "react"
import { ResultsTable } from "../components/results-table"
import { QueryEditor } from "../components/query-editor"
import { QueryActions } from "../components/query-actions"
import { ExecuteButton } from "../components/execute-button"
import { useSparql } from '../SparqlContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card"
import styled from "styled-components"
import { executeSparqlQuery } from "../lib/sparqlExecutor";
import { ChevronDown } from "lucide-react";

interface QueryExecutorProps {
  setMessage: React.Dispatch<React.SetStateAction<{ text: string; type: "info" | "success" | "error" }>>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  variables: string[];
  setVariables: React.Dispatch<React.SetStateAction<string[]>>;
  queryResults: Array<Record<string, string>>;
  setQueryResults: React.Dispatch<React.SetStateAction<Array<Record<string, string>>>>;
}

export const QueryExecutor: React.FC<QueryExecutorProps> = ({
  setMessage,
  query,
  setQuery,
  variables,
  setVariables,
  queryResults,
  setQueryResults,

}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { currentProvider } = useSparql();
  const [pageSize,setPageSize]=useState(50)

  // Compute pagination values
  const totalPages = Math.ceil(queryResults.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const displayedResults = queryResults.slice(startIdx, startIdx + pageSize);

  // ---- EXECUTE QUERY ----
  const handleExecuteQuery = async () => {
  setIsLoading(true);
  setMessage({ text: "Fetching and parsing results of query...", type: "info" });

  try {
    const { variables: cols, results: data } = await executeSparqlQuery(
      currentProvider,
      query
    );


    setVariables(cols);
    setQueryResults(data);
    setCurrentPage(1);
    setMessage({
      text: `Query executed successfully. ${data.length} results found.`,
      type: "success",
    });
  } catch (error: any) {
    setMessage({
      text: `Error fetching data: ${error.message}`,
      type: "error",
    });
  } finally {
    setIsLoading(false);
  }
};
  // ---- FILE HANDLERS ----
  const handleLoadQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = reader.result as string;
      handleChangeQuery(fileContent);
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
    const blob = new Blob([query], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "query.txt";
    link.click();
    URL.revokeObjectURL(url);
    setMessage({ text: "Query saved successfully!", type: "success" });
  };

  // ---- RESULTS HANDLERS ----
  const handleClearResults = () => {
    setQueryResults([]);
    setVariables([]);
    setCurrentPage(1);
    setMessage({ text: "Results cleared", type: "info" });
  };

  const handleSaveResults = (format: "json" | "csv") => {
    if (format === "json") {
      const dataStr = JSON.stringify(queryResults, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sparql-results-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage({ text: "Results saved as JSON successfully", type: "success" });
    } else if (format === "csv") {
      const csvHeader = variables.join(",");
      const csvRows = queryResults.map((row) =>
        variables
          .map((col) => {
            const value = row[col] || "";
            if (value.includes(",") || value.includes('"') || value.includes("\n")) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
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

  const handleChangeQuery = (newQuery: string) => setQuery(newQuery);

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 space-y-6 relative rounded-lg shadow-lg">
      <Card className="bg-white border border-zinc-200 rounded-lg shadow-lg">
        <CardHeader className="bg-white">
          <CardTitle className="text-zinc-900 text-lg font-semibold">Query Executor</CardTitle>
          <CardDescription className="text-zinc-600 text-sm">
            Execute SPARQL queries and view results in table format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-white">
          <QueryEditor query={query} onChange={handleChangeQuery} />

          <div className="flex items-center justify-between">
            <QueryActions onLoad={handleLoadQuery} onSave={handleSaveQuery} />
            <div className="flex gap-2">
              <FancyButton onClick={() => setShowChat((prev) => !prev)} className="bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none rounded-lg px-4 py-2 transition duration-300">
                <span className="text-zinc-600 text-sm">Ask an LLM</span>
              </FancyButton>
              <ExecuteButton onClick={handleExecuteQuery} isLoading={isLoading} />
            </div>
          </div>

          <ResultsTable
            results={displayedResults}   // only current page
            columns={variables.map((col) => ({
              id: col,
              label: col.charAt(0).toUpperCase() + col.slice(1),
              accessor: col,
            }))}
            onClear={handleClearResults}
            onSave={handleSaveResults}
          />

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm rounded border border-zinc-300 bg-white hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm rounded border border-zinc-300 bg-white hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-700">Show</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing page size
              }}
              className="appearance-none px-3 py-1 pr-8 text-sm rounded border border-zinc-300 bg-white hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          </div>
          <span className="text-sm text-zinc-700">per page</span>
        </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showChat && <ChatWidget setShowChat={setShowChat} />}
    </div>
  );
};





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
          themeMode: "white",
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
  background: #ffffff; /* Lighter background */
  border: 1px solid #e0e0e0; /* Softer border */
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); /* Lighter shadow */
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
  background: #f9fafb; /* Lighter background for header */
  border-bottom: 1px solid #e0e0e0; /* Softer border */
`;

const Title = styled.h3`
  color: #333; /* Darker text for contrast */
  font-weight: 600;
  font-size: 1rem;
`;

const CloseButton = styled.button`
  color: #9ca3af; /* Light gray color for close button */
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: #1f2937; /* Darker color on hover for visibility */
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
line-height: 1em; padding: 3px;
cursor: pointer; transition: all 0.3s;
min-width: 150px;

span {
  background-color: rgb(5, 6, 45);
  padding: 12px 20px; border-radius: 6px;
  width: 100%;
  height: 100%;
  transition: 300ms;
  background:white
}
&:hover span {
  background: none;
}

&:active {
  transform: scale(0.94);
}
`;

