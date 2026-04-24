/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import { WBK } from 'wikibase-sdk';

export interface SparqlProviderConfig {
  id: string;
  label: string;
  sparqlUrl: string;
  queryOnPayload: boolean;
  queryPath?: string;          // e.g. '/sparql/runQuery' for internal backend
  responseFormat: 'csv' | 'json';
  wbk?: ReturnType<typeof WBK>;
}

const wdk = WBK({
  instance: 'https://www.wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql',
});

const providers: Record<string, SparqlProviderConfig> = {
  knowgraph: {
    id: 'knowgraph',
    label: 'Know Graph (default)',
    sparqlUrl: import.meta.env.VITE_SPARQL_BACKEND_URL,
    queryOnPayload: true,
    queryPath: '/sparql/runQuery',
    responseFormat: 'csv',
  },
  wikidata: {
    id: 'wikidata',
    label: 'Wikidata',
    sparqlUrl: 'https://query.wikidata.org/sparql',
    queryOnPayload: false,
    responseFormat: 'json',
    wbk: wdk,
  },
  dbpedia: {
    id: 'dbpedia',
    label: 'DBpedia',
    sparqlUrl: 'https://dbpedia.org/sparql',
    queryOnPayload: false,
    responseFormat: 'csv',
  },
};

interface SparqlContextType {
  currentProvider: SparqlProviderConfig;
  setProvider: (id: string) => void;
  setCustomProvider: (
    url: string,
    queryOnPayload: boolean,
    responseFormat: 'csv' | 'json',
    queryPath?: string
  ) => void;
}

const defaultProvider = providers.knowgraph;

const SparqlContext = createContext<SparqlContextType>({
  currentProvider: defaultProvider,
  setProvider: () => {},
  setCustomProvider: () => {},
});

export function SparqlProvider({ children }: { children: ReactNode }) {
  const [currentProvider, setCurrentProvider] =
    useState<SparqlProviderConfig>(defaultProvider);

  const setProvider = (id: string) => {
    if (providers[id]) {
      setCurrentProvider(providers[id]);
    } else {
      console.warn(`Provider ${id} not found`);
    }
  };

  const setCustomProvider = (
    url: string,
    queryOnPayload: boolean,
    responseFormat: 'csv' | 'json',
    queryPath?: string
  ) => {
    setCurrentProvider({
      id: 'custom',
      label: 'Custom',
      sparqlUrl: url,
      queryOnPayload,
      responseFormat,
      queryPath,
    });
  };

  return (
    <SparqlContext.Provider
      value={{ currentProvider, setProvider, setCustomProvider }}
    >
      {children}
    </SparqlContext.Provider>
  );
}

export function useSparql() {
  return useContext(SparqlContext);
}
