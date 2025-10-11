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

interface DataButtonProps {
  onMenuAction: (action: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DataButton({ onMenuAction, open, onOpenChange }: DataButtonProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-100 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg border border-blue-500/50 shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-blue-500/40">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
            />
          </svg>
          Data
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onMenuAction("open-local-file")}>Open Local File</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onMenuAction("open-remote-file")}>Open Remote File</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onMenuAction("open-many")}>Open many</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Export results</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onMenuAction("export-rdf-xml")}>RDF/XML</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMenuAction("export-turtle")}>Turtle</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMenuAction("export-ntriples")}>N-Triples</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMenuAction("export-rdf-json")}>RDF/JSON</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
