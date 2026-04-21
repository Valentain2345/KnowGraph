"use client"

import { useState } from "react"
import styled from "styled-components"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Input as BaseInput } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger as BaseSelectTrigger, SelectValue } from "../components/ui/select"
import {
  Plus,
  Trash2,
  RotateCcw,
  Database,
  Code
} from "lucide-react";

import { Badge } from "../components/ui/badge"
import { Textarea } from "../components/ui/textarea"
import { PrefixManager } from "../components/prefix-wizard"

// Tipos mejorados
interface RDFTriple {
  id: string
  subject: { type: 'uri' | 'variable'; value: string; prefix?: string }
  predicate: { type: 'uri'; value: string; prefix?: string }
  object: { type: 'uri' | 'literal'; value: string; prefix?: string; datatype?: string }
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

const mockProperties = ["name", "age", "worksFor", "locatedIn", "createdBy", "title", "email", "birthDate"]
const mockResources = ["Person1", "Person2", "Organization1", "Document1", "Event1"]
const mockLiterals = ["John Doe", "john@example.com", "New York", "Software Engineer"]
const mockGraphs = [
  "http://example.org/graph/default",
  "http://example.org/graph/people",
  "http://example.org/graph/organizations",
]

const commonPrefixes = [
  { prefix: "rdf", uri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#" },
  { prefix: "rdfs", uri: "http://www.w3.org/2000/01/rdf-schema#" },
  { prefix: "xsd", uri: "http://www.w3.org/2001/XMLSchema#" },
  { prefix: "owl", uri: "http://www.w3.org/2002/07/owl#" },
  { prefix: "foaf", uri: "http://xmlns.com/foaf/0.1/" },
  { prefix: "ex", uri: "http://example.org/" }
]

// Styled Components mejorados
const PrefixSelectTrigger = styled(BaseSelectTrigger)`
  min-width: 100px;
  background-color: white;
  border: 1px solid #e5e7eb;
  color: #1f2937;
  font-size: 0.875rem;

  &:hover {
    background-color: #f3f4f6;
  }
`

const WideInput = styled(BaseInput)`
  flex: 1;
  min-width: 200px;
  background-color: white;
  border: 1px solid #e5e7eb;
  color: #1f2937;
`


export function TripleBuilder({ setQuery, setMessage }: TripleBuilderProps) {
  const [triples, setTriples] = useState<RDFTriple[]>([])
  const [currentTriple, setCurrentTriple] = useState({
    subject: "",
    predicate: "",
    object: "",
    objectType: 'literal' as 'uri' | 'literal'
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
    { id: "1", prefix: "ex", uri: "http://example.org/" },
  ])
  const [graph, setGraph] = useState("")
  const [generatedQuery, setGeneratedQuery] = useState("")
  // Formatear una parte de la tripleta según su tipo
  const formatTriplePart = (part: { type: 'uri' | 'literal' | 'variable'; value: string; prefix?: string; datatype?: string }) => {
    if (part.type === 'literal') {
      // Para literales, añadir comillas y tipo de dato si existe
      const datatype = part.datatype ? `^^${part.datatype}` : ''
      return `"${part.value}"${datatype}`
    } else if (part.type === 'uri') {
      // Para URIs, usar prefijo si existe, si no, envolver en <>
      if (part.prefix && part.prefix !== 'none') {
        return `${part.prefix}:${part.value}`
      } else if (part.value.startsWith('http')) {
        return `<${part.value}>`
      } else {
        return part.value
      }
    }
    // Para variables (no debería usarse en INSERT DATA, pero por si acaso)
    return `?${part.value}`
  }

  const addTriple = () => {
    if (currentTriple.subject && currentTriple.predicate && currentTriple.object) {
      // Detectar automáticamente el tipo de objeto
      const objectType: 'uri' | 'literal' = currentTriple.objectType
      let datatype: string | undefined = undefined

      // Si el usuario no especificó, intentar detectar
      if (currentTriple.objectType === 'literal') {
        // Detectar tipos de datos comunes
        if (currentTriple.object.match(/^\d+$/)) {
          datatype = 'xsd:integer'
        } else if (currentTriple.object.match(/^\d+\.\d+$/)) {
          datatype = 'xsd:decimal'
        } else if (currentTriple.object === 'true' || currentTriple.object === 'false') {
          datatype = 'xsd:boolean'
        } else if (currentTriple.object.match(/^\d{4}-\d{2}-\d{2}/)) {
          datatype = 'xsd:date'
        }
      }

      const newTriple: RDFTriple = {
        id: Date.now().toString(),
        subject: {
          type: 'uri',
          value: currentTriple.subject,
          prefix: prefixSelections.subject || undefined
        },
        predicate: {
          type: 'uri',
          value: currentTriple.predicate,
          prefix: prefixSelections.predicate || undefined
        },
        object: {
          type: objectType,
          value: currentTriple.object,
          prefix: prefixSelections.object || undefined,
          datatype
        },
      }

      setTriples([...triples, newTriple])
      resetForm()
    }
  }

  const resetForm = () => {
    setCurrentTriple({ subject: "", predicate: "", object: "", objectType: 'literal' })
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
      }
    })
    if (query) query += "\n"

    // Add INSERT DATA clause with graph
    query += `INSERT DATA {\n`
    if (graph) {
      query += `  GRAPH <${graph}> {\n`
    }

    // Add triples
    triples.forEach((triple) => {
      const subjectStr = formatTriplePart(triple.subject)
      const predicateStr = formatTriplePart(triple.predicate)
      const objectStr = formatTriplePart(triple.object)
      query += `    ${subjectStr} ${predicateStr} ${objectStr} .\n`
    })

    if (graph) {
      query += `  }\n`
    }
    query += `}\n`

    setGeneratedQuery(query)
    setQuery(query)
    setMessage({
      text: "INSERT DATA query generated successfully",
      type: "success",
    })
  }

  const resetGraphSelection = () => {
    setGraph("")
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 bg-white rounded-xl">
      <PrefixManager
        prefixes={prefixes}
        setPrefixes={setPrefixes}
        commonPrefixes={commonPrefixes}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Build New Triple Card */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle>Build New Triple</CardTitle>
            <CardDescription>
              Define the subject, predicate, and object for your RDF triple
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subject */}
            <div className="space-y-2">
              <Label>Subject (Resource URI)</Label>
              <div className="flex gap-2">
                <Select
                  value={prefixSelections.subject}
                  onValueChange={(value) =>
                    setPrefixSelections({ ...prefixSelections, subject: value })
                  }
                >
                  <PrefixSelectTrigger>
                    <SelectValue placeholder="Prefix" />
                  </PrefixSelectTrigger>
                  <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                    <SelectItem value="" className="text-zinc-900 hover:bg-zinc-300">None</SelectItem>
                    {prefixes.map((prefix) => (
                      <SelectItem key={prefix.id} value={prefix.prefix} className="text-zinc-900 hover:bg-zinc-300">
                        {prefix.prefix}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <WideInput
                  placeholder="Resource name (e.g., JohnDoe)"
                  value={currentTriple.subject}
                  onChange={(e) =>
                    setCurrentTriple({ ...currentTriple, subject: e.target.value })
                  }
                />
                <Select
                  value={currentTriple.subject}
                  onValueChange={(value) =>
                    setCurrentTriple({ ...currentTriple, subject: value })
                  }
                >
                  <PrefixSelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Examples" />
                  </PrefixSelectTrigger>
                  <SelectContent className="bg-white border-zinc-100" >
                    {mockResources.map((resource) => (
                      <SelectItem key={resource} value={resource} className="hover:bg-zinc-300 text-zinc-700">
                        {resource}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Predicate */}
            <div className="space-y-2">
              <Label>Predicate (Property)</Label>
              <div className="flex gap-2">
                <Select
                  value={prefixSelections.predicate}
                  onValueChange={(value) =>
                    setPrefixSelections({ ...prefixSelections, predicate: value })
                  }
                >
                  <PrefixSelectTrigger>
                    <SelectValue placeholder="Prefix" />
                  </PrefixSelectTrigger>
                  <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                    <SelectItem value="" className="text-zinc-900 hover:bg-zinc-300">None</SelectItem>
                    {prefixes.map((prefix) => (
                      <SelectItem key={prefix.id} value={prefix.prefix} className="text-zinc-900 hover:bg-zinc-300">
                        {prefix.prefix}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <WideInput
                  placeholder="Property (e.g., name, age)"
                  value={currentTriple.predicate}
                  onChange={(e) =>
                    setCurrentTriple({ ...currentTriple, predicate: e.target.value })
                  }
                />
                <Select
                  value={currentTriple.predicate}
                  onValueChange={(value) =>
                    setCurrentTriple({ ...currentTriple, predicate: value })
                  }
                >
                  <PrefixSelectTrigger className="w-[120px] bg-zinc-200">
                    <SelectValue placeholder="Examples" />
                  </PrefixSelectTrigger>
                  <SelectContent className="bg-white border-zinc-100">
                    {mockProperties.map((property) => (
                      <SelectItem key={property} value={property} className="hover:bg-zinc-300 text-zinc-700">
                        {property}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

<div className="space-y-2">
  <Label className="text-sm font-medium text-gray-700">Object (Value)</Label>

  {/* Tipo selector con diseño moderno */}
  <div className="flex gap-2 p-1.5 bg-gray-50 rounded-lg border border-gray-200 w-fit">
    <button
      type="button"
      onClick={() => setCurrentTriple({...currentTriple, objectType: 'literal'})}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 ${
        currentTriple.objectType === 'literal'
          ? 'bg-white shadow-md border border-gray-300 text-zinc-600 font-medium'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span>Literal</span>

    </button>

    <button
      type="button"
      onClick={() => setCurrentTriple({...currentTriple, objectType: 'uri'})}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 ${
        currentTriple.objectType === 'uri'
          ? 'bg-white shadow-md border border-gray-300 text-zinc-600 font-medium'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span>URI</span>

    </button>
  </div>

  {/* Input y selectores */}
  <div className="flex gap-2 items-stretch">
    {currentTriple.objectType === 'uri' && (
      <div className="relative group">
        <Select
          value={prefixSelections.object}
          onValueChange={(value) =>
            setPrefixSelections({ ...prefixSelections, object: value })
          }
        >
          <PrefixSelectTrigger className="min-w-[130px] h-full bg-white border border-gray-300 hover:border-gray-400 text-gray-800 hover:bg-zinc-300 transition-all">
            <SelectValue placeholder="Prefix" />
          </PrefixSelectTrigger>
          <SelectContent className="bg-white border border-zinc-200 shadow-lg">
            <SelectItem value="" className="text-gray-500 hover:bg-zinc-300">
              <span className="text-sm">None</span>
            </SelectItem>
            {prefixes.map((prefix) => (
              <SelectItem
                key={prefix.id}
                value={prefix.prefix}
                className="text-gray-700 hover:bg-zinc-300"
              >
                <span className="text-sm font-medium">{prefix.prefix}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )}

    <div className="flex-1 relative group">
      <WideInput
        placeholder={
          currentTriple.objectType === 'literal'
            ? "Enter value (e.g., 'John Doe', 30, true)"
            : "Enter resource name (e.g., Person, Document)"
        }
        value={currentTriple.object}
        onChange={(e) =>
          setCurrentTriple({ ...currentTriple, object: e.target.value })
        }
        className={`h-full pl-3 bg-white border ${
          currentTriple.objectType === 'literal'
            ? 'border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
            : 'border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
        } text-gray-900 placeholder-gray-400 transition-all duration-200`}
      />
    </div>

    {/* Selector de ejemplos - se muestra según el tipo */}
    <div className="relative group">
      <Select
        value={currentTriple.object}
        onValueChange={(value) =>
          setCurrentTriple({ ...currentTriple, object: value })
        }
      >
        <PrefixSelectTrigger className="min-w-[140px] h-full bg-white border border-gray-300 hover:border-gray-400 text-gray-800 hover:bg-zinc-300">
          <div className="flex items-center gap-2">
            <span className="text-sm">Examples</span>
          </div>
        </PrefixSelectTrigger>
        <SelectContent className="bg-white border border-zinc-200 shadow-lg max-h-[300px]">
          {currentTriple.objectType === 'literal' ? (
            <>
              <div className="px-3 py-2 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-500">Literal Examples</span>
              </div>
              {mockLiterals.map((literal) => (
                <SelectItem
                  key={literal}
                  value={literal}
                  className="text-gray-700 hover:bg-zinc-300"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm">{literal}</span>
                    {literal.match(/^\d+$/) && (
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                        int
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </>
          ) : (
            <>
              <div className="px-3 py-2 border-b border-zinc-100">
                <span className="text-xs font-medium text-zinc-600">URI Examples</span>
              </div>
              <SelectItem value="Person" className="text-gray-700 hover:bg-zinc-300">

                  <span className="text-sm">Person</span>

              </SelectItem>
              <SelectItem value="Organization" className="text-gray-700 hover:bg-zinc-300">

                  <span className="text-sm">Organization</span>

              </SelectItem>
              <SelectItem value="Document" className="text-gray-700 hover:bg-zinc-300">

                  <span className="text-sm">Document</span>

              </SelectItem>
              <SelectItem value="Event" className="text-gray-700 hover:bg-zinc-300">

                  <span className="text-sm">Event</span>

              </SelectItem>
              <SelectItem value="Location" className="text-gray-700 hover:bg-zinc-300">

                  <span className="text-sm">Location</span>

              </SelectItem>
               <span className="text-xs font-medium text-gray-500">Full URIs</span>

              <SelectItem value="http://example.org/Person" className="text-gray-700 hover:bg-zinc-300">

                  <span className="text-sm truncate">http://example.org/Person</span>

              </SelectItem>
              <SelectItem value="http://xmlns.com/foaf/0.1/Person" className="text-gray-700 hover:bg-zinc-300">

                  <span className="text-sm truncate">foaf:Person (full URI)</span>

              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  </div>


</div>

<div className="flex gap-3 pt-4">
              <Button onClick={addTriple} className="flex-1 bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Triple
              </Button>
              <Button onClick={resetForm} variant="outline" className="hover:bg-zinc-300">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Built Triples Card */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Built Triples</CardTitle>
              <CardDescription>
                {triples.length} triple{triples.length !== 1 ? "s" : ""} created
              </CardDescription>
            </div>
            {triples.length > 0 && (
              <Button onClick={clearAllTriples} variant="ghost" size="sm"
              className="bg-red-300 text-zinc-50 hover:bg-red-400 border-1 border-red-400 rounded-full shadow-md hover:scale-105 transition-all duration-150 ease-in-out">
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {triples.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No triples yet. Build your first triple to get started.</p>
                </div>
              ) : (
                triples.map((triple) => (
                  <div key={triple.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Subject
                          </Badge>
                          <code className="text-sm font-mono">
                            {formatTriplePart(triple.subject)}
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Predicate
                          </Badge>
                          <code className="text-sm font-mono">
                            {formatTriplePart(triple.predicate)}
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={
                            triple.object.type === 'literal'
                              ? "bg-purple-100 text-purple-800"
                              : "bg-orange-100 text-orange-800"
                          }>
                            {triple.object.type === 'literal' ? 'Literal' : 'URI'}
                          </Badge>
                          <code className="text-sm font-mono">
                            {formatTriplePart(triple.object)}
                          </code>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTriple(triple.id)}
                        className="bg-red-300 text-zinc-50 hover:bg-red-400 border-1 border-red-400 rounded-full shadow-md hover:scale-105 transition-all duration-150 ease-in-out"
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

      {/* Graph Selection & Query Generation Card */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle>Graph Selection & Query Generation</CardTitle>
          <CardDescription>
            Select or enter a graph URI to generate the INSERT DATA query
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
  <Label className="text-sm font-medium text-gray-700">Graph URI (Optional)</Label>
  <div className="flex gap-3 items-stretch">
    {/* WideInput - más ancho que el selector */}
    <div className="flex-1 min-w-[300px]">
      <WideInput
        placeholder="Enter graph URI (e.g., http://example.org/graph/default)"
        value={graph}
        onChange={(e) => setGraph(e.target.value)}
        className="w-full h-full bg-white border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-gray-900 placeholder-gray-400 transition-all duration-200"
      />
    </div>

    {/* Select - más estrecho */}
    <div className="w-[280px]">
      <Select value={graph} onValueChange={(value) => setGraph(value)}>
        <BaseSelectTrigger className="w-full h-full bg-white border border-zinc-200 hover:border-zinc-200 text-gray-800 hover:bg-zinc-300">
            <SelectValue placeholder="Select graph..." />
        </BaseSelectTrigger>
        <SelectContent className="bg-white border border-zinc-200 shadow-lg">
          {mockGraphs.map((g) => (
            <SelectItem
              key={g}
              value={g}
              className="text-gray-700 hover:bg-zinc-300 focus:bg-zinc-300"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-md text-zinc-700 truncate">{g}</p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

            {/* Botón de reset - tamaño fijo */}
            <Button
              onClick={resetGraphSelection}
              variant="outline"
              className="px-4 border border-zinc-200 text-gray-600 hover:bg-zinc-300 hover:text-gray-900 hover:border-gray-400 min-w-[48px]"
              title="Clear graph selection"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>


        </div>

          <Button
            onClick={generateInsertQuery}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={triples.length === 0}
          >
            <Code className="w-4 h-4 mr-2" />
            Generate INSERT DATA Query
          </Button>

          {generatedQuery && (
            <div className="space-y-2">
              <Label>Generated Query</Label>
              <Textarea
                readOnly
                value={generatedQuery}
                rows={8}
                className="bg-white text-zinc-900 border-zinc-200 font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
