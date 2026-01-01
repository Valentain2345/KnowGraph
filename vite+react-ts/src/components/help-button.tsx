"use client"

import { DropdownMenu, DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "./ui/dropdown-menu"

interface HelpButtonProps {
  onMenuAction: (action: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  setQuery:React.Dispatch<React.SetStateAction<string>>;
}

export function HelpButton({ onMenuAction, open, onOpenChange,setQuery }: HelpButtonProps) {
  const handleLoadExample= async (exampleName:string)=>{
    let response;
    try{
      if(exampleName==="example1"){
        response = await fetch('http://localhost:8080/sparql/loadExample1')
        const queryEx = await fetch('http://localhost:8080/sparql/loadExampleQuery1')
        const queryT= await queryEx.text()
        setQuery(queryT)
      }else{
        response = await fetch('http://localhost:8080/sparql/loadExample2')
        const queryEx = await fetch('http://localhost:8080/sparql/loadExampleQuery2')
        const queryT= await queryEx.text()
        setQuery(queryT)
      }
        if(response.ok)
          onMenuAction("Loaded example into server")
        else
          onMenuAction("Failed to load example in server")


    } catch (error) {
        onMenuAction("An error ocurred when loading example")
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>

      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-100 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 rounded-lg border border-amber-500/50 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:shadow-amber-500/40">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Help
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Examples</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={()=>handleLoadExample("example1")}>Person Heavy</DropdownMenuItem>
            <DropdownMenuItem onClick={()=>handleLoadExample("example2")}>Person Heavy extended</DropdownMenuItem>
          </DropdownMenuSubContent>
      </DropdownMenuSub>


       <DropdownMenuSub>
        <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem >Bright Theme</DropdownMenuItem>
            <DropdownMenuItem >Night Theme</DropdownMenuItem>
          </DropdownMenuSubContent>
      </DropdownMenuSub>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
