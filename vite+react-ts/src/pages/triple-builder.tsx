"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
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

export function TripleBuilder({ setQuery, setMessage }: TripleBuilderProps) {
  const [triples, setTriples] = useState<RDFTriple[]>([])
  const [currentTriple, setCurrentTriple] = useState({
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
          ...currentTriple,
        },
      ])
      resetForm()
    }
  }

  const resetForm = () => {
    setCurrentTriple({ subject: "", predicate: "", object: "" })
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
    if (triples.length === 0 ) {
      setQuery("")
      setMessage({
        text: "No valid query generated: Please add at least one triple and specify a graph",
        type: "error",
      })
      return
    }

    let query = ""

    // Add prefixes
    prefixes.forEach((prefix) => {
      if (prefix.prefix && prefix.uri) {
        query += `PREFIX ${prefix.prefix}: <${prefix.uri}>\n`
      }
      if(!prefix.prefix && prefix.uri)
        query += `PREFIX <${prefix.uri}>\n`
    })
    if (query) query += "\n"

    // Add INSERT DATA clause with graph
    query += `INSERT DATA {\n`
    query += graph==="" ? "": `  GRAPH <${graph}> {\n`

    // Add triples
    triples.forEach((triple) => {
      query += `    ${triple.subject} ${triple.predicate} ${triple.object} .\n`
    })

    query += graph===""?"":`  }\n`
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
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <PrefixManager
        prefixes={prefixes}
        setPrefixes={setPrefixes}
        commonPrefixes={commonPrefixes}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Build New Triple</CardTitle>
            <CardDescription className="text-zinc-400">
              Specify the subject, predicate, and object of your RDF triple
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-zinc-300">
                Subject
              </Label>
              <div className="flex gap-2">
                <Input
                  id="subject"
                  placeholder="Enter subject or select from list"
                  value={currentTriple.subject}
                  onChange={(e) => setCurrentTriple({ ...currentTriple, subject: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
                />
                <Select
                  key={`subject-${selectKeys.subject}`}
                  value={currentTriple.subject}
                  onValueChange={(value) => setCurrentTriple({ ...currentTriple, subject: value })}
                >
                  <SelectTrigger className="w-[180px] bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {mockVariables.map((v) => (
                      <SelectItem key={v} value={v} className="text-white">
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="predicate" className="text-zinc-300">
                Predicate
              </Label>
              <div className="flex gap-2">
                <Input
                  id="predicate"
                  placeholder="Enter predicate or select from list"
                  value={currentTriple.predicate}
                  onChange={(e) => setCurrentTriple({ ...currentTriple, predicate: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
                />
                <Select
                  key={`predicate-${selectKeys.predicate}`}
                  value={currentTriple.predicate}
                  onValueChange={(value) => setCurrentTriple({ ...currentTriple, predicate: value })}
                >
                  <SelectTrigger className="w-[180px] bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {mockProperties.map((p) => (
                      <SelectItem key={p} value={p} className="text-white">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="object" className="text-zinc-300">
                Object
              </Label>
              <div className="flex gap-2">
                <Input
                  id="object"
                  placeholder="Enter object or select from list"
                  value={currentTriple.object}
                  onChange={(e) => setCurrentTriple({ ...currentTriple, object: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
                />
                <Select
                  key={`object-${selectKeys.object}`}
                  value={currentTriple.object}
                  onValueChange={(value) => setCurrentTriple({ ...currentTriple, object: value })}
                >
                  <SelectTrigger className="w-[180px] bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {mockVariables.map((v) => (
                      <SelectItem key={v} value={v} className="text-white">
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={addTriple}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Triple
              </Button>

              <Button
                onClick={resetForm}
                variant="outline"
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Built Triples</CardTitle>
              <CardDescription className="text-zinc-400">
                {triples.length} triple{triples.length !== 1 ? "s" : ""} created
              </CardDescription>
            </div>
            {triples.length > 0 && (
              <Button
                onClick={clearAllTriples}
                variant="outline"
                size="sm"
                className="border-red-600/50 text-red-400 hover:bg-red-600/10 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {triples.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No triples yet. Build your first triple to get started.</p>
                </div>
              ) : (
                triples.map((triple) => (
                  <div
                    key={triple.id}
                    className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-emerald-500/50 transition-colors"
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

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Graph Selection & Query Generation</CardTitle>
          <CardDescription className="text-zinc-400">
            Select or enter a graph URI to generate the INSERT DATA query
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="graph" className="text-zinc-300">
              Graph URI
            </Label>
            <div className="flex gap-2">
              <Input
                id="graph"
                placeholder="Enter graph URI (e.g., http://example.org/graph/default)"
                value={graph}
                onChange={(e) => setGraph(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
              />
              <Select
                key={`graph-${selectGraphKey}`}
                value={graph}
                onValueChange={(value) => setGraph(value)}
              >
                <SelectTrigger className="w-[180px] bg-zinc-800/50 border-zinc-700 text-white">
                  <SelectValue placeholder="Select graph..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
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
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={generateInsertQuery}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            disabled={triples.length === 0}
          >
            <Code className="w-4 h-4 mr-2" />
            Generate INSERT DATA Query
          </Button>

          {generatedQuery && (
            <div className="space-y-2">
              <Label className="text-sm text-zinc-300">Generated Query</Label>
              <Textarea
                readOnly
                value={generatedQuery}
                rows={8}
                className="bg-zinc-800/50 border-zinc-700 text-white font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
