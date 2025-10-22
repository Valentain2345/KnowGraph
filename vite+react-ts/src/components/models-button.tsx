"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

interface ReasoningButtonProps {
  onMenuAction: (action: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ModelsButton({ onMenuAction, open, onOpenChange }: ReasoningButtonProps) {
  return (
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
        <DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>New Ontology Model</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onMenuAction("create-owl model")}>Create OWL 2 Full model</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMenuAction("create-owl")}>Create OWL 2 DL model</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMenuAction("create-owl")}>Create OWL 2 RL model</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMenuAction("create-owl")}>Create OWL 2 EL model</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMenuAction("create-owl")}>Create OWL 2 QL model</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMenuAction("create-rdfs")}>Create 2 RDFS model</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
        </DropdownMenuSub>



       <DropdownMenuSub>
        <DropdownMenuSubTrigger>New Inference Model</DropdownMenuSubTrigger>
         <DropdownMenuSubContent>
           <DropdownMenuItem onClick={() => onMenuAction("action-2")}>RDFS Reasoner</DropdownMenuItem>
           <DropdownMenuItem onClick={() => onMenuAction("action-2")}>OWL Reasoner</DropdownMenuItem>
           <DropdownMenuItem onClick={() => onMenuAction("action-2")}>Mini OWL Reasoner</DropdownMenuItem>
           <DropdownMenuItem onClick={() => onMenuAction("action-2")}>Micro OWL Reasoner</DropdownMenuItem>
           <DropdownMenuItem onClick={() => onMenuAction("action-2")}>Transitive Reasoner</DropdownMenuItem>
           <DropdownMenuItem onClick={() => onMenuAction("action-2")}>Generic Reasoner</DropdownMenuItem>
         </DropdownMenuSubContent>
       </DropdownMenuSub>


      </DropdownMenuContent>
    </DropdownMenu>
  )
}
