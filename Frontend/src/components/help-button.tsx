"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "./ui/dropdown-menu";
import { useSparql } from "../SparqlContext";
import { Check } from "lucide-react";
interface HelpButtonProps {
  onMenuAction: (action: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
}

export function HelpButton({
  onMenuAction,
  open,
  onOpenChange,
  setQuery,
}: HelpButtonProps) {
  const { currentProvider, setProvider, setCustomProvider } = useSparql();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [localQueryOnPayload, setLocalQueryOnPayload] = useState(true);
  const [localResponseFormat, setLocalResponseFormat] = useState<"csv" | "json">("csv");
  const [localQueryPath, setLocalQueryPath] = useState("");

  // Ping respects mode (GET/POST) and format
  const pingEndpoint = async (
    url: string,
    usePayload: boolean,
    format: "csv" | "json"
  ): Promise<boolean> => {
    const askQuery = "ASK WHERE { ?s ?p ?o }";
    try {
      if (usePayload) {
        const formBody = new URLSearchParams({ query: askQuery });
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formBody,
        });
        return response.ok;
      } else {
        const params = new URLSearchParams({ query: askQuery });
        if (format === "csv") params.append("format", "csv");
        const fullUrl = `${url}?${params.toString()}`;
        const response = await fetch(fullUrl, { method: "GET" });
        return response.ok;
      }
    } catch {
      return false;
    }
  };

  const canLoadExamples = currentProvider.id === "knowgraph";

  const handleLoadExample = async (exampleName: string) => {
    if (!canLoadExamples) return;
    let response;
    try {
      if (exampleName === "example1") {
        response = await fetch(
          `${currentProvider.sparqlUrl}/sparql/loadExample1`
        );
        const queryEx = await fetch(
          `${currentProvider.sparqlUrl}/sparql/loadExampleQuery1`
        );
        const queryT = await queryEx.text();
        setQuery(queryT);
      } else {
        response = await fetch(
          `${currentProvider.sparqlUrl}/sparql/loadExample2`
        );
        const queryEx = await fetch(
          `${currentProvider.sparqlUrl}/sparql/loadExampleQuery2`
        );
        const queryT = await queryEx.text();
        setQuery(queryT);
      }
      if (response.ok) onMenuAction("Loaded example into server");
      else onMenuAction("Failed to load example in server");
    } catch (error) {
      onMenuAction("An error occurred when loading example");
    }
  };

  const handleLoadProvider = async (providerName: string) => {
    if (providerName === "custom") {
      setIsModalOpen(true);
      setCustomUrl("");
      setLocalQueryOnPayload(true);
      setLocalResponseFormat("csv");
      setLocalQueryPath("");
      return;
    }

    // For non‑custom providers, just set them (no ping here, or ping first)
    setProvider(providerName);
    // Optionally ping to confirm reachability, but not required
    onMenuAction(`Provider set to ${providerName}`);
  };

  const handleCustomSubmit = async () => {
    if (!customUrl.trim()) return;
    const isOk = await pingEndpoint(
      customUrl,
      localQueryOnPayload,
      localResponseFormat
    );
    if (isOk) {
      setCustomProvider(
        customUrl,
        localQueryOnPayload,
        localResponseFormat,
        localQueryPath || undefined
      );
      onMenuAction("Custom provider set successfully");
      setIsModalOpen(false);
      setCustomUrl("");
    } else {
      onMenuAction("Failed to reach custom endpoint");
    }
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-100 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 rounded-lg border border-amber-500/50 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:shadow-amber-500/40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Help
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {canLoadExamples ? (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Examples</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleLoadExample("example1")}>
                  Person Heavy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLoadExample("example2")}>
                  Person Heavy extended
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ) :( <DropdownMenuItem className="text-gray-400 cursor-not-allowed opacity-50" >
                  Examples
                </DropdownMenuItem>)}

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>SPARQL Provider</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem className="flex justify-between items-center w-full" onClick={() => handleLoadProvider("knowgraph")}>
                Know Graph (default)
                {currentProvider.id === "knowgraph" && <Check className=" h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem className="flex justify-between items-center w-full" onClick={() => handleLoadProvider("wikidata")}>
                Wikidata
                {currentProvider.id === "wikidata" && <Check className=" h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem className="flex justify-between items-center w-full" onClick={() => handleLoadProvider("dbpedia")}>
                DBpedia
                {currentProvider.id === "dbpedia" && <Check className=" h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLoadProvider("custom")}>
                Custom Provider...
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom Provider Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 h-screen">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full border border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Configure Custom SPARQL Endpoint
            </h3>

            <input
              type="url"
              placeholder="Endpoint URL"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full p-3 text-gray-900 bg-gray-100 rounded-lg border border-gray-300
                         placeholder-gray-500 focus:outline-none focus:ring-2
                         focus:ring-blue-500 focus:border-blue-500 mb-4"
            />

            {/* Query transmission mode */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query transmission mode
              </label>
              <div className="flex rounded-lg overflow-hidden border border-gray-300">
                <button
                  onClick={() => setLocalQueryOnPayload(true)}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    localQueryOnPayload
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Payload (POST)
                </button>
                <button
                  onClick={() => setLocalQueryOnPayload(false)}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    !localQueryOnPayload
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  URL (GET)
                </button>
              </div>
            </div>

            {/* Response format */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response format
              </label>
              <div className="flex rounded-lg overflow-hidden border border-gray-300">
                <button
                  onClick={() => setLocalResponseFormat("csv")}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    localResponseFormat === "csv"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  CSV
                </button>
                <button
                  onClick={() => setLocalResponseFormat("json")}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    localResponseFormat === "json"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  JSON
                </button>
              </div>
            </div>

            {/* Optional path for POST mode */}
            {localQueryOnPayload && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Query path (optional, e.g. /sparql/runQuery)
                </label>
                <input
                  type="text"
                  placeholder="/sparql/runQuery"
                  value={localQueryPath}
                  onChange={(e) => setLocalQueryPath(e.target.value)}
                  className="w-full p-3 text-gray-900 bg-gray-100 rounded-lg border border-gray-300
                             placeholder-gray-500 focus:outline-none focus:ring-2
                             focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setCustomUrl("");
                }}
                className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg
                           hover:bg-gray-300 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleCustomSubmit}
                className="px-6 py-2 text-white bg-blue-600 rounded-lg
                           hover:bg-blue-700 transition"
              >
                Set Provider
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
