import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Checkbox } from "../components/ui/checkbox"
import { Textarea } from "../components/ui/textarea"
import { Sparkles, Plus, Code, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "../components/ui/badge"

const mockConcepts = ["Person", "Organization", "Document", "Event", "Location"]
const mockProperties = ["hasName", "hasAge", "worksFor", "locatedIn", "createdBy"]
const operators = ["=", "<>", "<", "<=", ">", ">=", "contains", "starts with", "ends with"]
const commonPrefixes = [
  { prefix: "rdf", uri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#" },
  { prefix: "rdfs", uri: "http://www.w3.org/2000/01/rdf-schema#" },
  { prefix: "xsd", uri: "http://www.w3.org/2001/XMLSchema#" },
  { prefix: "owl", uri: "http://www.w3.org/2002/07/owl#" },
  { prefix: "foaf", uri: "http://xmlns.com/foaf/0.1/" },
]

interface QueryRow {
  id: string
  subject: string
  concept: string
  property: string
  alias: string
  visible: boolean
  optional: boolean
  operator: string
  value: string
}

interface Prefix {
  id: string
  prefix: string
  uri: string
}

export function SparqlQueryWizard() {
  const [rows, setRows] = useState<QueryRow[]>([
    {
      id: "1",
      subject: "",
      concept: "",
      property: "",
      alias: "",
      visible: true,
      optional: false,
      operator: "",
      value: "",
    },
  ])
  const [prefixes, setPrefixes] = useState<Prefix[]>([
    { id: "1", prefix: "rdf", uri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#" },
    { id: "2", prefix: "xsd", uri: "http://www.w3.org/2001/XMLSchema#" },
  ])
  const [generatedQuery, setGeneratedQuery] = useState("")
  const [distinct, setDistinct] = useState(false)
  const [limit, setLimit] = useState(100)
  const [isLimitEnabled, setIsLimitEnabled] = useState(true)
  const [isButtonPressed, setIsButtonPressed] = useState<boolean>(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Prefix management
  const addPrefix = () => {
    setPrefixes([
      ...prefixes,
      {
        id: Date.now().toString(),
        prefix: "",
        uri: "",
      },
    ])
  }

  const updatePrefix = (id: string, field: keyof Prefix, value: string) => {
    setPrefixes(prefixes.map((prefix) => (prefix.id === id ? { ...prefix, [field]: value } : prefix)))
  }

  const deletePrefix = (id: string) => {
    setPrefixes(prefixes.filter((prefix) => prefix.id !== id))
  }

  const addCommonPrefix = (commonPrefix: { prefix: string; uri: string }) => {
    setPrefixes([
      ...prefixes,
      {
        id: Date.now().toString(),
        prefix: commonPrefix.prefix,
        uri: commonPrefix.uri,
      },
    ])
  }

  // Query row management
  const addRow = () => {
    setRows([
      ...rows,
      {
        id: Date.now().toString(),
        subject: "",
        concept: "",
        property: "",
        alias: "",
        visible: true,
        optional: false,
        operator: "",
        value: "",
      },
    ])
  }

  const updateRow = (id: string, field: keyof QueryRow, value: any) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  const deleteRow = (id: string) => {
    setRows(rows.filter((row) => row.id !== id))
  }

  // Limit controls
  const startHolding = (type: 'increment' | 'decrement') => {
    setIsButtonPressed(true)
    intervalRef.current = setInterval(() => {
      if (type === 'increment') {
        setLimit(prev => prev + 1)
      } else {
        setLimit(prev => (prev > 1 ? prev - 1 : 1))
      }
    }, 100)
  }

  const stopHolding = () => {
    setIsButtonPressed(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleIncrement = () => {
    setLimit((prev) => prev + 1)
  }

  const handleDecrement = () => {
    setLimit((prev) => (prev > 1 ? prev - 1 : 1))
  }

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 1) {
      setLimit(value)
    }
  }

  // Query generation
  const generateQuery = () => {
    let query = ""

    // Add prefixes
    prefixes.forEach((prefix) => {
      if (prefix.prefix && prefix.uri) {
        query += `PREFIX ${prefix.prefix}: <${prefix.uri}>\n`
      }
    })
    if (query) query += "\n"

    // Add SELECT clause
    query += `SELECT${distinct ? " DISTINCT" : ""}`

    const visibleRows = rows.filter((r) => r.visible && r.alias)
    visibleRows.forEach((row) => {
      query += ` ?${row.alias}`
    })

    query += "\nWHERE\n{\n"

    // Add triple patterns
    rows.forEach((row) => {
      if (row.subject && row.concept && row.property && row.alias) {
        if (row.optional) {
          query += "  OPTIONAL {\n"
          query += `    ?${row.subject} rdf:type ${row.concept} .\n`
          query += `    ?${row.subject} ${row.property} ?${row.alias} .\n`
          query += "  }\n"
        } else {
          query += `  ?${row.subject} rdf:type ${row.concept} .\n`
          query += `  ?${row.subject} ${row.property} ?${row.alias} .\n`
        }
      }
    })

    // Add FILTERs
    const filters = rows.filter((r) => r.operator && r.value && r.alias)
    if (filters.length > 0) {
      query += "  FILTER ("
      filters.forEach((row, idx) => {
        if (idx > 0) query += " && "
        if (row.operator === "contains") {
          query += `regex(?${row.alias}, "${row.value}", "i")`
        } else if (row.operator === "starts with") {
          query += `strStarts(?${row.alias}, "${row.value}")`
        } else if (row.operator === "ends with") {
          query += `strEnds(?${row.alias}, "${row.value}")`
        } else {
          query += `?${row.alias} ${row.operator} "${row.value}"`
        }
      })
      query += ")\n"
    }

    query += "}\n"

    // Add LIMIT
    if (isLimitEnabled) {
      query += `LIMIT ${limit}\n`
    }

    setGeneratedQuery(query)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Prefix Management Card */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Prefix Management
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Define namespace prefixes for your SPARQL query
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Common Prefixes Quick Add */}
          <div className="flex flex-wrap gap-2">
            <Label className="text-sm text-zinc-400 font-medium flex items-center">Common prefixes:</Label>
            {commonPrefixes.map((commonPrefix) => (
              <Badge
                key={commonPrefix.prefix}
                variant="secondary"
                className="cursor-pointer hover:bg-zinc-700 transition-colors"
                onClick={() => addCommonPrefix(commonPrefix)}
              >
                {commonPrefix.prefix}
              </Badge>
            ))}
          </div>

          {/* Prefix Table */}
          <div className="overflow-hidden">
            <div className="min-w-full space-y-2">
              <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <Label className="text-sm text-zinc-300 font-medium col-span-5">Prefix Name</Label>
                <Label className="text-sm text-zinc-300 font-medium col-span-6">Namespace URI</Label>
                <Label className="text-sm text-zinc-300 font-medium text-center col-span-1">Actions</Label>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {prefixes.map((prefix, idx) => (
                  <div key={prefix.id} className="grid grid-cols-12 gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                    <Input
                      placeholder="e.g., rdf"
                      value={prefix.prefix}
                      onChange={(e) => updatePrefix(prefix.id, "prefix", e.target.value)}
                      className="col-span-5 bg-zinc-900/50 border-zinc-700 text-white text-sm"
                    />
                    <Input
                      placeholder="e.g., http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                      value={prefix.uri}
                      onChange={(e) => updatePrefix(prefix.id, "uri", e.target.value)}
                      className="col-span-6 bg-zinc-900/50 border-zinc-700 text-white text-sm"
                    />
                    <div className="flex items-center justify-center col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePrefix(prefix.id)}
                        className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={addPrefix} variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <Plus className="mr-2 w-4 h-4" /> Add Prefix
          </Button>
        </CardContent>
      </Card>

      {/* Query Builder Card */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-400" />
            Query Builder
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Build your SPARQL query using the visual wizard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Query Rows Table */}
          <div className="overflow-hidden">
            <div className="min-w-[1000px] space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <Label className="text-sm text-zinc-300 font-medium col-span-1">Subject</Label>
                <Label className="text-sm text-zinc-300 font-medium col-span-2">Concept</Label>
                <Label className="text-sm text-zinc-300 font-medium col-span-2">Property</Label>
                <Label className="text-sm text-zinc-300 font-medium col-span-1">Alias</Label>
                <Label className="text-sm text-zinc-300 font-medium col-span-2">Operator</Label>
                <Label className="text-sm text-zinc-300 font-medium col-span-2">Value</Label>
                <Label className="text-sm text-zinc-300 font-medium text-center col-span-1">Visible</Label>
                <Label className="text-sm text-zinc-300 font-medium text-center col-span-1">Optional</Label>
              </div>

              {/* Scrollable Rows Container */}
              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {rows.map((row, idx) => (
                  <div key={row.id} className="grid grid-cols-12 gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                    {/* Subject */}
                    <Input
                      placeholder="s1"
                      value={row.subject}
                      onChange={(e) => updateRow(row.id, "subject", e.target.value)}
                      className="col-span-1 bg-zinc-900/50 border-zinc-700 text-white text-sm"
                    />
                    {/* Concept */}
                    <Select
                      value={row.concept}
                      onValueChange={(value) => updateRow(row.id, "concept", value)}
                    >
                      <SelectTrigger className="col-span-2 bg-zinc-900/50 border-zinc-700 text-white text-sm">
                        <SelectValue placeholder="Concept" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockConcepts.map((concept) => (
                          <SelectItem key={concept} value={concept}>
                            {concept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Property */}
                    <Select
                      value={row.property}
                      onValueChange={(value) => updateRow(row.id, "property", value)}
                    >
                      <SelectTrigger className="col-span-2 bg-zinc-900/50 border-zinc-700 text-white text-sm">
                        <SelectValue placeholder="Property" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProperties.map((property) => (
                          <SelectItem key={property} value={property}>
                            {property}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Alias */}
                    <Input
                      placeholder="alias"
                      value={row.alias}
                      onChange={(e) => updateRow(row.id, "alias", e.target.value)}
                      className="col-span-1 bg-zinc-900/50 border-zinc-700 text-white text-sm"
                    />
                    {/* Operator */}
                    <Select
                      value={row.operator}
                      onValueChange={(value) => updateRow(row.id, "operator", value)}
                    >
                      <SelectTrigger className="col-span-2 bg-zinc-900/50 border-zinc-700 text-white text-sm">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((operator) => (
                          <SelectItem key={operator} value={operator}>
                            {operator}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Value */}
                    <Input
                      placeholder="value"
                      value={row.value}
                      onChange={(e) => updateRow(row.id, "value", e.target.value)}
                      className="col-span-2 bg-zinc-900/50 border-zinc-700 text-white text-sm"
                    />
                    {/* Visible Checkbox */}
                    <div className="flex justify-center items-center col-span-1">
                      <Checkbox
                        checked={row.visible}
                        onCheckedChange={(checked) => updateRow(row.id, "visible", checked)}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                    </div>
                    {/* Optional Checkbox */}
                    <div className="flex justify-center items-center col-span-1">
                      <Checkbox
                        checked={row.optional}
                        onCheckedChange={(checked) => updateRow(row.id, "optional", checked)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </div>
                    {/* Row Actions */}
                    <div className="flex items-center justify-end gap-2 col-span-12 pt-2 border-t border-zinc-700/50">
                      <Badge variant="outline" className="text-zinc-400">
                        Row {idx + 1}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRow(row.id)}
                        className="h-8 text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={addRow} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="mr-2 w-4 h-4" /> Add Row
          </Button>

          {/* Query Options */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-800">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="distinct"
                  checked={distinct}
                  onCheckedChange={(checked) => setDistinct(checked as boolean)}
                  className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <Label htmlFor="distinct" className="text-zinc-300 cursor-pointer">
                  Return distinct results
                </Label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="limitCheckbox"
                  checked={isLimitEnabled}
                  onCheckedChange={(checked) => setIsLimitEnabled(checked as boolean)}
                  className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <Label htmlFor="limitCheckbox" className="text-zinc-300 cursor-pointer">
                  Limit results
                </Label>
              </div>

              {isLimitEnabled && (
                <div className="flex items-center gap-3 pl-7">
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      onMouseDown={() => startHolding('decrement')}
                      onMouseUp={stopHolding}
                      onMouseLeave={stopHolding}
                      onClick={handleDecrement}
                      className="h-9 px-3 bg-zinc-800 border border-zinc-700 rounded-l-lg hover:bg-zinc-700 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    <Input
                      type="number"
                      value={limit}
                      onChange={handleLimitChange}
                      min={1}
                      className="h-9 w-20 text-center bg-zinc-900 border-x-0 border-zinc-700 rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />

                    <button
                      type="button"
                      onMouseDown={() => startHolding('increment')}
                      onMouseUp={stopHolding}
                      onMouseLeave={stopHolding}
                      onClick={handleIncrement}
                      className="h-9 px-3 bg-zinc-800 border border-zinc-700 rounded-r-lg hover:bg-zinc-700 transition-colors"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-zinc-400">results</span>
                </div>
              )}
            </div>
          </div>

          {/* Generate Query Button */}
          <Button onClick={generateQuery} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            Generate SPARQL Query <Code className="ml-2 w-4 h-4" />
          </Button>

          {/* Generated Query Output */}
          <div className="space-y-2">
            <Label className="text-sm text-zinc-300">Generated Query</Label>
            <Textarea
              readOnly
              value={generatedQuery}
              rows={8}
              className="bg-zinc-800/50 border-zinc-700 text-white font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
