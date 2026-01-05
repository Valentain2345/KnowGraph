import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Sparkles, Plus, Trash2 } from "lucide-react"
import { Badge } from "./ui/badge"

interface Prefix {
  id: string
  prefix: string
  uri: string
}

interface PrefixManagerProps {
  prefixes: Prefix[]
  setPrefixes: React.Dispatch<React.SetStateAction<Prefix[]>>
  commonPrefixes: { prefix: string; uri: string }[]
}

export function PrefixManager({ prefixes, setPrefixes, commonPrefixes }: PrefixManagerProps) {
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

  return (
   <Card className="bg-white border border-zinc-200 shadow-lg">
  <CardHeader className="pb-3">
    <CardTitle className="text-zinc-900 flex items-center gap-2">
      <Sparkles className="w-5 h-5 text-emerald-500" />
      Prefix Management
    </CardTitle>
    <CardDescription className="text-zinc-600">
      Define namespace prefixes for your SPARQL query (empty prefix allowed)
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-4">
    {/* Common Prefixes Quick Add */}
    <div className="flex flex-wrap gap-2">
      <Label className="text-sm text-zinc-600 font-medium flex items-center">Common prefixes:</Label>
      {commonPrefixes.map((commonPrefix) => (
        <Badge
          key={commonPrefix.prefix || "(empty)"}
          variant="secondary"
          className="cursor-pointer hover:bg-zinc-100 transition-colors"
          onClick={() => addCommonPrefix(commonPrefix)}
        >
          {commonPrefix.prefix === "" ? "(empty)" : commonPrefix.prefix}
        </Badge>
      ))}
    </div>

    {/* Prefix Table */}
    <div className="overflow-hidden">
      <div className="min-w-full space-y-2">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-zinc-100 rounded-lg border border-zinc-200">
          <Label className="text-sm text-zinc-700 font-medium col-span-5">Prefix Name</Label>
          <Label className="text-sm text-zinc-700 font-medium col-span-6">Namespace URI</Label>
          <Label className="text-sm text-zinc-700 font-medium text-center col-span-1">Actions</Label>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
          {prefixes.map((prefix) => (
            <div
              key={prefix.id}
              className="grid grid-cols-12 gap-3 p-3 rounded-lg bg-zinc-50 border border-zinc-200"
            >
              <Input
                placeholder="(empty for default namespace)"
                value={prefix.prefix}
                onChange={(e) => updatePrefix(prefix.id, "prefix", e.target.value)}
                className="col-span-5 bg-white border-zinc-300 text-zinc-900 text-sm"
              />
              <Input
                placeholder="e.g., https://example.org/"
                value={prefix.uri}
                onChange={(e) => updatePrefix(prefix.id, "uri", e.target.value)}
                className="col-span-6 bg-white border-zinc-300 text-zinc-900 text-sm"
              />
              <div className="flex items-center justify-center col-span-1">
                <Button
                  variant="ghost"
                  size="default"
                  onClick={() => deletePrefix(prefix.id)}
                 className="h-12 w-12 text-white bg-red-300 hover:bg-red-400 border-1 border-red-400 rounded-full shadow-md hover:scale-105 transition-all duration-150 ease-in-out"
              >
                 <Trash2 className="w-8 h-8 text-white" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <Button onClick={addPrefix} variant="outline" className="w-full border-zinc-300 text-zinc-700 hover:bg-zinc-100">
      <Plus className="mr-2 w-4 h-4" /> Add Prefix
    </Button>
  </CardContent>
</Card>
  )
}
