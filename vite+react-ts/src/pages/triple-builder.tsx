"use client"

import { useState } from "react"
import styled from "styled-components"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Input as BaseInput } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger as BaseSelectTrigger, SelectValue } from "../components/ui/select"
import { Plus, Trash2, RotateCcw, Database, Code } from "lucide-react"
import { Badge } from "../components/ui/badge"
import { Textarea } from "../components/ui/textarea"
import { PrefixManager } from "../components/prefix-wizard"

interface RDFTriple {
  id: string
  subject: string
  predicate: string
  object: string
}

interface Prefix {
  id: string
  prefix: string
  uri: string
}

interface TripleBuilderProps {
  setQuery: React.Dispatch<React.SetStateAction<string>>
  setMessage: React.Dispatch<React.SetStateAction<{ text: string; type: "info" | "success" | "error" }>>
}

const mockConcepts = ["Person", "Organization", "Document", "Event", "Location"]
const mockProperties = ["hasName", "hasAge", "worksFor", "locatedIn", "createdBy", "hasTitle"]
const mockVariables = ["?person", "?org", "?doc", "?event", "?location"]
const mockGraphs = [
  "http://example.org/graph/default",
  "http://example.org/graph/people",
  "http://example.org/graph/organizations",
  "http://example.org/graph/events",
]

const commonPrefixes = [
  { prefix: "rdf", uri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#" },
  { prefix: "rdfs", uri: "http://www.w3.org/2000/01/rdf-schema#" },
  { prefix: "xsd", uri: "http://www.w3.org/2001/XMLSchema#" },
  { prefix: "owl", uri: "http://www.w3.org/2002/07/owl#" },
  { prefix: "foaf", uri: "http://xmlns.com/foaf/0.1/" },
]

// Styled Components
const PrefixSelectTrigger = styled(BaseSelectTrigger)`
  width: 80px;
  background-color: rgba(39, 39, 42, 0.7);
  border: 1px solid rgba(82, 82, 91, 0.8);
  color: white;
  font-size: 0.875rem;
  transition: background-color 0.2s, border-color 0.2s;

  &:hover {
    background-color: rgba(63, 63, 70, 0.5);
  }

  &:focus {
    outline: none;
    ring: 2px solid rgba(16, 185, 129, 0.5);
  }
`

const WideInput = styled(BaseInput)`
  flex: 2;
  width: 300px;
  background-color: rgba(39, 39, 42, 0.7);
  border: 1px solid rgba(82, 82, 91, 0.8);
  color: white;
  font-size: 0.875rem;
  padding: 0.5rem;
  transition: border-color 0.2s, ring 0.2s;

  &::placeholder {
    color: rgba(113, 113, 122, 0.6);
  }

  &:focus {
    outline: none;
    border-color: rgba(16, 185, 129, 0.5);
    ring: 2px solid rgba(16, 185, 129, 0.5);
  }
`

const GraphSelector=styled(BaseSelectTrigger)`
  width: 300px;
  background-color: rgba(39, 39, 42, 0.7);
  border: 1px solid rgba(82, 82, 91, 0.8);
  color: white;
  font-size: 0.875rem;
  transition: background-color 0.2s, border-color 0.2s;

  &:hover {
    background-color: rgba(63, 63, 70, 0.5);
  }

  &:focus {
    outline: none;
    ring: 2px solid rgba(16, 185, 129, 0.5);
  }
`

export function TripleBuilder({ setQuery, setMessage }: TripleBuilderProps) {
  const [triples, setTriples] = useState<RDFTriple[]>([])
  const [currentTriple, setCurrentTriple] = useState({
    subject: "",
    predicate: "",
    object: "",
  })
  const [prefixSelections, setPrefixSelections] = useState({
    subject: "",
    predicate: "",
    object: "",
  })
  const [selectKeys, setSelectKeys] = useState({
    subject: 0,
    predicate: 0,
    object: 0,
  })
  const [prefixes, setPrefixes] = useState<Prefix[]>([
    { id: "1", prefix: "rdf", uri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#" },
  ])
  const [graph, setGraph] = useState("")
  const [generatedQuery, setGeneratedQuery] = useState("")
  const [selectGraphKey, setSelectGraphKey] = useState(0)

  const addTriple = () => {
    if (currentTriple.subject && currentTriple.predicate && currentTriple.object) {
      setTriples([
        ...triples,
        {
          id: Date.now().toString(),
          subject: prefixSelections.subject ? `${prefixSelections.subject}:${currentTriple.subject}` : currentTriple.subject,
          predicate: prefixSelections.predicate ? `${prefixSelections.predicate}:${currentTriple.predicate}` : currentTriple.predicate,
          object: prefixSelections.object ? `${prefixSelections.object}:${currentTriple.object}` : currentTriple.object,
        },
      ])
      resetForm()
    }
  }

  const resetForm = () => {
    setCurrentTriple({ subject: "", predicate: "", object: "" })
    setPrefixSelections({ subject: "", predicate: "", object: "" })
    setSelectKeys({
      subject: selectKeys.subject + 1,
      predicate: selectKeys.predicate + 1,
      object: selectKeys.object + 1,
    })
  }

  const removeTriple = (id: string) => {
    setTriples(triples.filter((t) => t.id !== id))
  }

  const clearAllTriples = () => {
    setTriples([])
    setGeneratedQuery("")
    setQuery("")
    setMessage({ text: "Triples and generated query cleared", type: "info" })
  }

  const generateInsertQuery = () => {
    if (triples.length === 0) {
      setQuery("")
      setMessage({
        text: "No valid query generated: Please add at least one triple",
        type: "error",
      })
      return
    }

    let query = ""

    // Add prefixes
    prefixes.forEach((prefix) => {
      if (prefix.prefix && prefix.uri) {
        query += `PREFIX ${prefix.prefix}: <${prefix.uri}>\n`
      } else if (prefix.uri) {
        query += `PREFIX <${prefix.uri}>\n`
      }
    })
    if (query) query += "\n"

    // Add INSERT DATA clause with graph
    query += `INSERT DATA {\n`
    query += graph === "" ? "" : `  GRAPH <${graph}> {\n`

    // Add triples
    triples.forEach((triple) => {
      query += `    ${triple.subject} ${triple.predicate} ${triple.object} .\n`
    })

    query += graph === "" ? "" : `  }\n`
    query += `}\n`

    setGeneratedQuery(query)
    setQuery(query)
    setMessage({
      text: "INSERT DATA query generated and pasted into Query Executor",
      type: "success",
    })
  }

  const resetGraphSelection = () => {
    setGraph("")
    setSelectGraphKey((prev) => prev + 1)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 bg-zinc-950/95 rounded-xl shadow-2xl shadow-black/50">
      <PrefixManager
        prefixes={prefixes}
        setPrefixes={setPrefixes}
        commonPrefixes={commonPrefixes}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-zinc-900/70 border-zinc-800/80 shadow-lg shadow-black/30 backdrop-blur-sm">
          <CardHeader className="border-b border-zinc-800/50">
            <CardTitle className="text-white text-2xl font-semibold">Build New Triple</CardTitle>
            <CardDescription className="text-zinc-400">
              Define the subject, predicate, and object for your RDF triple
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {[
              { label: "Subject", field: "subject", options: mockVariables },
              { label: "Predicate", field: "predicate", options: mockProperties },
              { label: "Object", field: "object", options: mockVariables },
            ].map(({ label, field, options }) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field} className="text-zinc-300 font-medium">
                  {label}
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={prefixSelections[field as keyof typeof prefixSelections]}
                    onValueChange={(value) =>
                      setPrefixSelections({ ...prefixSelections, [field]: value })
                    }
                  >
                    <PrefixSelectTrigger>
                      <SelectValue placeholder="Prefix..." />
                    </PrefixSelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700/80 text-white">
                      <SelectItem value="" className="text-white">
                        None
                      </SelectItem>
                      {prefixes.map((prefix) => (
                        <SelectItem
                          key={prefix.id}
                          value={prefix.prefix}
                          className="text-white font-mono"
                        >
                          {prefix.prefix || "<No Prefix>"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <WideInput
                    id={field}
                    placeholder={`Enter ${label.toLowerCase()} or select from list`}
                    value={currentTriple[field as keyof typeof currentTriple]}
                    onChange={(e) =>
                      setCurrentTriple({ ...currentTriple, [field]: e.target.value })
                    }
                  />
                  <Select
                    key={`${field}-${selectKeys[field as keyof typeof selectKeys]}`}
                    value={currentTriple[field as keyof typeof currentTriple]}
                    onValueChange={(value) =>
                      setCurrentTriple({ ...currentTriple, [field]: value })
                    }
                  >
                    <BaseSelectTrigger className="w-[100px] bg-zinc-800/70 border-zinc-700/80 text-white focus:ring-2 focus:ring-emerald-500/50">
                      <SelectValue placeholder="Select..." />
                    </BaseSelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700/80">
                      {options.map((option) => (
                        <SelectItem key={option} value={option} className="text-white">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <Button
                onClick={addTriple}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Triple
              </Button>
              <Button
                onClick={resetForm}
                variant="outline"
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white focus:ring-2 focus:ring-emerald-500/50"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/70 border-zinc-800/80 shadow-lg shadow-black/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800/50">
            <div>
              <CardTitle className="text-white text-2xl font-semibold">Built Triples</CardTitle>
              <CardDescription className="text-zinc-400">
                {triples.length} triple{triples.length !== 1 ? "s" : ""} created
              </CardDescription>
            </div>
            {triples.length > 0 && (
              <Button
                onClick={clearAllTriples}
                variant="outline"
                size="sm"
                className="border-red-600/50 text-red-400 hover:bg-red-600/20 hover:text-red-300 focus:ring-2 focus:ring-red-500/50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {triples.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No triples yet. Build your first triple to get started.</p>
                </div>
              ) : (
                triples.map((triple) => (
                  <div
                    key={triple.id}
                    className="p-4 rounded-lg bg-zinc-800/70 border border-zinc-700/80 hover:border-emerald-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            Subject
                          </Badge>
                          <span className="text-white font-mono text-sm">{triple.subject}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                            Predicate
                          </Badge>
                          <span className="text-white font-mono text-sm">{triple.predicate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                            Object
                          </Badge>
                          <span className="text-white font-mono text-sm">{triple.object}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTriple(triple.id)}
                        className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900/70 border-zinc-800/80 shadow-lg shadow-black/30 backdrop-blur-sm">
        <CardHeader className="border-b border-zinc-800/50">
          <CardTitle className="text-white text-2xl font-semibold">Graph Selection & Query Generation</CardTitle>
          <CardDescription className="text-zinc-400">
            Select or enter a graph URI to generate the INSERT DATA query
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="graph" className="text-zinc-300 font-medium">
              Graph URI
            </Label>
            <div className="flex gap-2">
              <WideInput
                id="graph"
                placeholder="Enter graph URI (e.g., http://example.org/graph/default)"
                value={graph}
                onChange={(e) => setGraph(e.target.value)}
                className=" flex-1 bg-zinc-800/70 border-zinc-700/80 text-white placeholder:text-zinc-500/60 focus:ring-2 focus:ring-emerald-500/50"
              />
              <Select
                key={`graph-${selectGraphKey}`}
                value={graph}
                onValueChange={(value) => setGraph(value)}
              >
                <GraphSelector className="w-[300px] bg-zinc-800/70 border-zinc-700/80 text-white focus:ring-2 focus:ring-emerald-500/50">
                  <SelectValue placeholder="Select graph..." />
                </GraphSelector>
                <SelectContent className="bg-zinc-800 border-zinc-700/80">
                  {mockGraphs.map((g) => (
                    <SelectItem key={g} value={g} className="text-white">
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={resetGraphSelection}
                variant="outline"
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white focus:ring-2 focus:ring-emerald-500/50"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={generateInsertQuery}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-200"
            disabled={triples.length === 0}
          >
            <Code className="w-4 h-4 mr-2" />
            Generate INSERT DATA Query
          </Button>

          {generatedQuery && (
            <div className="space-y-2">
              <Label className="text-sm text-zinc-300 font-medium">Generated Query</Label>
              <Textarea
                readOnly
                value={generatedQuery}
                rows={8}
                className="bg-zinc-800/70 border-zinc-700/80 text-white font-mono text-sm resize-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
