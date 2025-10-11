"use client"

import { Button } from "./ui/button"
import { Play, Loader2 } from "lucide-react"

interface ExecuteButtonProps {
  onClick: () => void
  isLoading: boolean
}

export function ExecuteButton({ onClick, isLoading }: ExecuteButtonProps) {
  return (
    <Button onClick={onClick} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white">
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Executing...
        </>
      ) : (
        <>
          <Play className="h-4 w-4 mr-2" />
          Execute Query
        </>
      )}
    </Button>
  )
}
