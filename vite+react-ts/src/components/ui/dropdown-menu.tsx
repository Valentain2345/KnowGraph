"use client"

import { createContext, useContext, useState, type ReactNode, type HTMLAttributes } from "react"

interface DropdownContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined)

interface DropdownMenuProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownContext.Provider>
  )
}

export function DropdownMenuTrigger({ children, asChild }: { children: ReactNode; asChild?: boolean }) {
  const context = useContext(DropdownContext)
  if (!context) throw new
  Error("DropdownMenuTrigger must be used within DropdownMenu")
  if(asChild){console.log("as child")};
  return <div onClick={() => context.setOpen(!context.open)}>
  {children}
  </div> }


export function DropdownMenuContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  const context = useContext(DropdownContext)
  if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu")

  if (!context.open) return null

  return (
    <div
      className={`absolute left-0 mt-2 w-48 rounded-md border border-gray-700 bg-gray-900 shadow-lg z-50 ${className}`}
    >
      <div className="py-1" onClick={() => context.setOpen(false)}>
        {children}
      </div>
    </div>
  )
}

export function DropdownMenuItem({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer ${className}`} {...props}>
      {children}
    </div>
  )
}

export function DropdownMenuSeparator({ className = "" }: { className?: string }) {
  return <div className={`h-px bg-gray-800 my-1 ${className}`} />
}

export function DropdownMenuSub({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export function DropdownMenuSubTrigger({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer flex items-center justify-between">
      {children}
      <span className="ml-2">›</span>
    </div>
  )
}

export function DropdownMenuSubContent({ children }: { children: ReactNode }) {
  const context = useContext(DropdownContext)
  if (!context) throw new Error("DropdownMenuSubContent must be used within DropdownMenuSub")

  if (!context.open) return null

  return (
    <div className="absolute left-full top-0 ml-1 w-48 rounded-md border border-gray-700 bg-gray-900 shadow-lg">
      <div className="py-1">{children}</div>
    </div>
  )
}
