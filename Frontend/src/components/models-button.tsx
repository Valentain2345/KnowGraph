"use client"

import  { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {useSparql} from '../SparqlContext'
interface ReasoningButtonProps {
  onMenuAction: (action: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ModelsButton({ onMenuAction, open, onOpenChange }: ReasoningButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [rules, setRules] = useState("")
  const { currentProvider } = useSparql();

  // --- Handlers ---
  const handleCreateOntModel = async (ontType: string) => {
    try {
      console.log(currentProvider)
      const response = await fetch(`${currentProvider.sparqlUrl}/ontmodel/createModel?type=${ontType}`, {
        method: "GET",
      })
      if (!response.ok) throw new Error(`Failed to create ontology model: ${response.statusText}`)
      const text = await response.text()
      onMenuAction(`${text}`)
    } catch (error) {
      console.error(error)
      onMenuAction("Error creating ontology model")
    }
  }

  const handleCreateInfModel = async (infType: string) => {
    try {
      const response = await fetch(`${currentProvider.sparqlUrl}/infmodel/createModel?type=${infType}`, {
        method: "GET",
      })
      if (!response.ok) throw new Error(`Failed to create inference model: ${response.statusText}`)
      const text = await response.text()
      onMenuAction(`${text}`)
    } catch (error) {
      console.error(error)
      onMenuAction("Error creating inference model")
    }
  }

  // Open dialog for the generic model
  const handleCreateGenericInfModel = () => {
    setShowDialog(true)
  }

  // Submit dialog
  const handleSubmitRules = async () => {
    try {
      const response = await fetch(`${currentProvider.sparqlUrl}/infmodel/createGenericModel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules }),
      })

      if (!response.ok) throw new Error("Failed to create generic model")

      const text = await response.text()
      onMenuAction(` ${text}`)
    } catch (error) {
      console.error(error)
      onMenuAction("Error creating generic model")
    } finally {
      setShowDialog(false)
      setRules("")
    }
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-100 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-lg border border-emerald-500/50 shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:shadow-emerald-500/40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Models
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          {/* Ontology Models */}
         {currentProvider.id === 'knowgraph' ? (
           <DropdownMenuSub>
            <DropdownMenuSubTrigger>New Ontology Model</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleCreateOntModel("OWL2_FULL_MEM_RULES_INF")}>Create OWL 2 Full model</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateOntModel("OWL2_DL_MEM_RULES_INF")}>Create OWL 2 DL model</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateOntModel("OWL2_RL_MEM_RULES_INF")}>Create OWL 2 RL model</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateOntModel("OWL2_EL_MEM_RULES_INF")}>Create OWL 2 EL model</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateOntModel("OWL2_QL_MEM_RULES_INF")}>Create OWL 2 QL model</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateOntModel("RDFS_MEM_RDFS_INF")}>Create RDFS model</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub> ):( <DropdownMenuItem className="text-gray-400 cursor-not-allowed opacity-50">New Ontology Model</DropdownMenuItem>)}

          {/* Inference Models */}
        {currentProvider.id === 'knowgraph' ? (  <DropdownMenuSub>
            <DropdownMenuSubTrigger>New Inference Model</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleCreateInfModel("RDFS")}>RDFS Reasoner</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateInfModel("OWL")}>OWL Reasoner</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateInfModel("MINI")}>Mini OWL Reasoner</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateInfModel("MICRO")}>Micro OWL Reasoner</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateInfModel("TRANSITIVE")}>Transitive Reasoner</DropdownMenuItem>
              <DropdownMenuItem onClick={handleCreateGenericInfModel}>Generic Reasoner</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
     ):(<DropdownMenuItem className="text-gray-400 cursor-not-allowed opacity-50">New Ontology Model</DropdownMenuItem>)}
      </DropdownMenuContent>
      </DropdownMenu>
      {/* Minimal dialog for Generic Reasoner */}
      {showDialog && (
      <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 h-screen">
  <div className="bg-white text-gray-900 p-6 rounded-lg shadow-xl w-[90%] max-w-md border border-blue-300">
    <h2 className="text-xl font-bold mb-4 text-gray-900">
      Enter Rule Set
    </h2>

    <textarea
      value={rules}
      onChange={(e) => setRules(e.target.value)}
      className="w-full h-36 p-3 mb-4 rounded-lg bg-gray-100 border border-blue-300
                 focus:outline-none focus:ring-2 focus:ring-blue-500
                 text-gray-900 placeholder-gray-500 resize-none"
      placeholder="Enter your inference rules here..."
    />

    <div className="flex justify-end gap-3">
      <button
        onClick={() => setShowDialog(false)}
        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700
                   hover:bg-gray-300 transition-colors"
      >
        Cancel
      </button>

      <button
        onClick={handleSubmitRules}
        className="px-4 py-2 rounded-lg bg-blue-600
                   hover:bg-blue-700 transition-colors
                   text-white font-semibold"
      >
        Create
      </button>
    </div>
  </div>
</div>

      )}
    </>
  )
}
