// src/utils/sparqlExecutor.ts

import Papa from "papaparse";
import type { SparqlProviderConfig } from "../SparqlContext";

export interface SparqlResult {
  variables: string[];
  results: Array<Record<string, string>>;
  raw: string;
}

/**
 * Signature of a provider‑specific executor.
 * Receives the SPARQL query and the full configuration,
 * returns a standardised SparqlResult.
 */
type SparqlExecutorFn = (
  query: string,
  config: SparqlProviderConfig
) => Promise<SparqlResult>;

// ─── Provider Executors ────────────────────────────────────

/**
 * KnowGraph – sends a POST with the query as plain text,
 * expects CSV back.
 */
async function executeKnowGraph(
  query: string,
  config: SparqlProviderConfig
): Promise<SparqlResult> {
  const targetUrl = config.sparqlUrl + (config.queryPath ?? "/sparql/runQuery");
  const response = await fetch(targetUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: query,
  });

  if (!response.ok) {
    throw new Error(`KnowGraph query failed: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();
  return parseCsv(csvText);
}

/**
 * Wikidata – uses the Wikidata SDK (wbk) to build a fully encoded URL,
 * expects standard SPARQL JSON.
 */
async function executeWikidata(
  query: string,
  config: SparqlProviderConfig
): Promise<SparqlResult> {
  if (!config.wbk) {
    throw new Error("Wikidata WBK instance not available");
  }
  const url = config.wbk.sparqlQuery(query);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Wikidata query failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  return parseSparqlJson(json);
}

/**
 * DBpedia – uses GET with ?query= and explicit &format=csv.
 * Actually uses the generic executor below, but we keep a separate entry
 * in the registry for clarity.
 */
async function executeDbpedia(
  query: string,
  config: SparqlProviderConfig
): Promise<SparqlResult> {
  // DBpedia expects GET, CSV by default.
  const params = new URLSearchParams({ query, format: "csv" });
  const response = await fetch(`${config.sparqlUrl}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`DBpedia query failed: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();
  return parseCsv(csvText);
}

/**
 * Generic executor – respects queryOnPayload and responseFormat
 * from the provider config. Used for custom endpoints and as a fallback.
 */
async function executeGeneric(
  query: string,
  config: SparqlProviderConfig
): Promise<SparqlResult> {
  const { sparqlUrl, queryOnPayload, queryPath, responseFormat } = config;
  let response: Response;

  if (!queryOnPayload) {
    const params = new URLSearchParams({ query });
    if (responseFormat === "csv") {
      params.append("format", "csv");
    }
    response = await fetch(`${sparqlUrl}?${params.toString()}`);
  } else {
    const targetUrl = sparqlUrl + (queryPath ?? "");
    response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: query,
    });
  }

  if (!response.ok) {
    throw new Error(`Generic query failed: ${response.status} ${response.statusText}`);
  }

  if (responseFormat === "json") {
    const json = await response.json();
    return parseSparqlJson(json);
  } else {
    const csvText = await response.text();
    return parseCsv(csvText);
  }
}

// ─── Registry ────────────────────────────────────────────

/**
 * Maps provider IDs to their executor functions.
 * Fallback: if an ID isn't found, executeGeneric is used.
 */
const executorRegistry: Record<string, SparqlExecutorFn> = {
  knowgraph: executeKnowGraph,
  wikidata: executeWikidata,
  dbpedia: executeDbpedia,
  custom: executeGeneric,   // custom providers default to generic
};

// ─── Public API ──────────────────────────────────────────

/**
 * Execute a SPARQL query against the configured provider.
 * Automatically chooses the right executor based on provider.id.
 */
export async function executeSparqlQuery(
  provider: SparqlProviderConfig,
  query: string
): Promise<SparqlResult> {
  const executor = executorRegistry[provider.id] ?? executeGeneric;
  return executor(query, provider);
}

// ─── Response Parsers (shared) ───────────────────────────

/** Parse CSV text into SparqlResult */
function parseCsv(csvText: string): Promise<SparqlResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data as Array<Record<string, string>>;
        const fields = result.meta.fields || [];
        resolve({ variables: fields, results: data, raw: csvText });
      },
      error: (err :any) => reject(new Error(`CSV parse error: ${err.message}`)),
    });
  });
}

/** Parse standard SPARQL JSON response into SparqlResult */
function parseSparqlJson(json: any): SparqlResult {
  const raw = JSON.stringify(json, null, 2);
  if (!json.head || !json.results) {
    throw new Error("Invalid JSON SPARQL response: missing head/results");
  }
  const vars: string[] = json.head.vars || [];
  const bindings = json.results.bindings || [];
  const results: Array<Record<string, string>> = bindings.map((b: any) => {
    const row: Record<string, string> = {};
    vars.forEach((v) => {
      row[v] = b[v]?.value ?? "";
    });
    return row;
  });
  return { variables: vars, results, raw };
}
