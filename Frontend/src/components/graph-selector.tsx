import { useState } from "react"
import { Check, X, ArrowRight, Network } from "lucide-react"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { ScrollArea } from "./ui/scroll-area"

interface GraphVariableSelectorProps {
  variables: string[]
  queryResults: Array<Record<string, string>>
  onComplete: (config: GraphOutput) => void
  onCancel: () => void
  initialGraph:GraphOutput
}

 interface GraphOutput {
  nodes: Array<{
    id: string
    name: string
    val: number
  }>
  links: Array<{
    source: string
    target: string
    label?: string
  }>
}

export function GraphVariableSelector({ variables, queryResults, onComplete, onCancel }: GraphVariableSelectorProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [selectedEdges, setSelectedEdges] = useState<string[]>([])
  const [connections, setConnections] = useState<Map<string, Map<string, string[]>>>(new Map())

  const toggleNode = (variable: string) => {
    setSelectedNodes((prev) => (prev.includes(variable) ? prev.filter((v) => v !== variable) : [...prev, variable]))
  }

  const toggleEdge = (variable: string) => {
    setSelectedEdges((prev) => (prev.includes(variable) ? prev.filter((v) => v !== variable) : [...prev, variable]))
  }

  const handleStepOneAccept = () => {
  if (selectedNodes.length === 0) {
    alert("Please select at least one node variable")
    return
  }

  // Deep initialize connections: every src → every tgt → empty array
  const newConnections = new Map<string, Map<string, string[]>>()
  selectedNodes.forEach((src) => {
    const targetMap = new Map<string, string[]>()
    selectedNodes.forEach((tgt) => {
        targetMap.set(tgt, [])
    })
    newConnections.set(src, targetMap)
  })
  setConnections(newConnections)
  setStep(2)
}

const toggleConnection = (src: string, tgt: string, edge: string) => {
  setConnections((prev) => {
    // Deep clone the entire structure
    const newConnections = new Map<string, Map<string, string[]>>()

    prev.forEach((targetMap, srcKey) => {
      const newTargetMap = new Map<string, string[]>()
      targetMap.forEach((edges, tgtKey) => {
        let newEdges = [...edges]
        if (srcKey === src && tgtKey === tgt) {
          if (edges.includes(edge)) {
            newEdges = edges.filter((e) => e !== edge)
          } else {
            newEdges = [...edges, edge]
          }
        }
        newTargetMap.set(tgtKey, newEdges)
      })
      newConnections.set(srcKey, newTargetMap)
    })

    return newConnections
  })
}

  const handleStepTwoAccept = () => {
    const nodeIds = new Set<string>()
    const nodes: Array<{ id: string; name: string; val: number }> = []
    const links: Array<{ source: string; target: string; label?: string }> = []

    // Process each row from query results
    queryResults.forEach((row) => {
      // Generate nodes from selected node variables
      selectedNodes.forEach((nodeVar) => {
        const nodeId = row[nodeVar]
        if (nodeId && !nodeIds.has(nodeId)) {
          nodes.push({
            id: nodeId,
            name: nodeId,
            val: 1, // Default value, can be customized based on frequency
          })
          nodeIds.add(nodeId)
        }
      })

      // Generate edges based on connections
      connections.forEach((targetMap, src) => {
        targetMap.forEach((edgeVars, tgt) => {
          // For each edge variable connecting src to tgt
          edgeVars.forEach((edgeVar) => {
            const label = row[edgeVar]
            const source = row[src]
            const target = row[tgt]

            if (source && target && label) {
              links.push({
                source,
                target,
                label,
              })
            }
          })
        })
      })
    })

    onComplete({
      nodes,
      links,
    })
  }

  return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4 items-center z-50 h-screen">
  <div className="relative w-full max-w-2xl animate-in fade-in zoom-in duration-300">
    {/* Glassmorphism container */}
    <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-2xl backdrop-blur-xl">
      {/* Gradient accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500" />

      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-orange-600 shadow-lg shadow-pink-500/50">
              <Network className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {step === 1 ? "Select Variables" : "Define Connections"}
              </h2>
              <p className="text-sm text-gray-600">Step {step} of 2</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="default"
            onClick={onCancel}
            className="h-12 w-12 rounded-full text-gray-600 hover:bg-zinc-300 hover:text-gray-800"
          >
            <X className="h-8 w-8" />
          </Button>
        </div>

        {/* Step 1: Variable Selection */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Node Variables */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-teal-600">Node Variables</Label>
              <ScrollArea className="h-[200px] rounded-2xl border border-gray-200 bg-gray-100 p-4">
                <div className="space-y-3">
                  {variables.map((variable) => (
                    <div
                      key={`node-${variable}`}
                      className="flex items-center space-x-3 rounded-xl p-2 transition-colors hover:bg-gray-200"
                    >
                      <Checkbox
                        id={`node-${variable}`}
                        checked={selectedNodes.includes(variable)}
                        onCheckedChange={() => toggleNode(variable)}
                        className="border-teal-400/50 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                      />
                      <Label
                        htmlFor={`node-${variable}`}
                        className="flex-1 cursor-pointer text-base font-medium text-gray-900"
                      >
                        {variable}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Edge Variables */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-orange-600">Edge Variables</Label>
              <ScrollArea className="h-[200px] rounded-2xl border border-gray-200 bg-gray-100 p-4">
                <div className="space-y-3">
                  {variables.map((variable) => (
                    <div
                      key={`edge-${variable}`}
                      className="flex items-center space-x-3 rounded-xl p-2 transition-colors hover:bg-gray-200"
                    >
                      <Checkbox
                        id={`edge-${variable}`}
                        checked={selectedEdges.includes(variable)}
                        onCheckedChange={() => toggleEdge(variable)}
                        className="border-orange-400/50 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                      <Label
                        htmlFor={`edge-${variable}`}
                        className="flex-1 cursor-pointer text-base font-medium text-gray-900"
                      >
                        {variable}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleStepOneAccept}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-pink-600 to-orange-600 py-6 text-lg font-bold text-white shadow-lg shadow-pink-500/50 transition-all hover:shadow-xl hover:shadow-pink-500/60 hover:scale-[1.02]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Continue
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-orange-500 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
            </Button>
          </div>
        )}

        {/* Step 2: Connection Definition */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-sm text-gray-800/80">For each node pair, select which edges connect them:</p>

            <ScrollArea className="h-[400px] rounded-2xl border border-gray-200 bg-gray-100 p-4 overflow-auto">
              <div className="space-y-4">
                {selectedNodes.map((src) =>
                  selectedNodes.map((tgt) => {
                    const edges = connections.get(src)?.get(tgt) || []
                    return (
                      <div
                        key={`${src}-${tgt}`}
                        className="rounded-xl border border-gray-200 bg-gray-100 p-4 transition-all hover:border-gray-300 hover:bg-gray-200"
                      >
                        <div className="mb-3 flex items-center gap-2 text-gray-900">
                          <span className="rounded-lg  px-3 py-1 text-sm font-semibold text-[#20313C]"   style={{ backgroundColor: "#86BBD8" }}>
                            {src}
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <span className="rounded-lg px-3 py-1 text-sm font-semibold text-[#20313C]"   style={{ backgroundColor: "#86BBD8" }}>
                            {tgt}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedEdges.map((edge) => (
                            <label
                              key={edge}
                              className="flex cursor-pointer items-center gap-2 rounded-lg border border-orange-400/30 bg-orange-500/10 px-3 py-2 transition-all hover:border-orange-400/50 hover:bg-orange-500/20"
                            >
                              <Checkbox
                                checked={edges.includes(edge)}
                                onCheckedChange={() => toggleConnection(src, tgt, edge)}
                                className="border-orange-400/50 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                              />
                              <span className="text-sm font-medium text-gray-900">{edge}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  }),
                )}
              </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => setStep(1)}
                variant="ghost"
                className="group relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 to-pink-600 py-6 text-lg font-bold text-white shadow-lg shadow-pink-500/50 transition-all hover:shadow-xl hover:shadow-pink-500/60 hover:scale-[1.02]"
              >
                Back
              </Button>
              <Button
                onClick={handleStepTwoAccept}
                className="group relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-r from-pink-600 to-orange-600 py-6 text-lg font-bold text-white shadow-lg shadow-pink-500/50 transition-all hover:shadow-xl hover:shadow-pink-500/60 hover:scale-[1.02]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Check className="h-5 w-5" />
                  Complete
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-orange-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</div>

  )
}
