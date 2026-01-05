import { createContext, useContext, useState, type ReactNode, type HTMLAttributes } from "react"

// Context to share the dropdown state across components
interface DropdownContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined)

// Main Dropdown Menu component with controlled/ uncontrolled state
interface DropdownMenuProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownContext.Provider>
  )
}

// Trigger for the dropdown menu (button or clickable element)
interface DropdownMenuTriggerProps {
  children: ReactNode
  asChild?: boolean
}

export function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
  const context = useContext(DropdownContext)
  if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu")

  return <div onClick={() => context.setOpen(!context.open)}>{children}</div>
}

// The content of the dropdown menu, which is conditionally rendered based on 'open'
interface DropdownMenuContentProps {
  children: ReactNode
  className?: string
}

export function DropdownMenuContent({ children, className = "" }: DropdownMenuContentProps) {
  const context = useContext(DropdownContext)
  if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu")

  if (!context.open) return null

  return (
    <div
      className={`absolute left-0 mt-2 w-48 rounded-md border border-zinc-200 bg-zinc-100 shadow-lg z-50 ${className}`}
    >
      <div className="py-1" onClick={() => context.setOpen(false)}>
        {children}
      </div>
    </div>
  )
}

// Item inside the dropdown menu
interface DropdownMenuItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function DropdownMenuItem({ children, className = "", ...props }: DropdownMenuItemProps) {
  return (
    <div className={`px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-300 cursor-pointer ${className}`} {...props}>
      {children}
    </div>
  )
}

// Separator in the dropdown menu
interface DropdownMenuSeparatorProps {
  className?: string
}

export function DropdownMenuSeparator({ className = "" }: DropdownMenuSeparatorProps) {
  return <div className={`h-px bg-gray-800 my-1 ${className}`} />
}

// Submenu container inside the dropdown
interface DropdownMenuSubProps {
  children: ReactNode
}

export function DropdownMenuSub({ children }: DropdownMenuSubProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

// Trigger for the submenu
interface DropdownMenuSubTriggerProps {
  children: ReactNode
  className?: string
}

export function DropdownMenuSubTrigger({ children, className = "" }: DropdownMenuSubTriggerProps) {
  return (
    <div
      className={`px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-300 cursor-pointer flex items-center justify-between ${className}`}
    >
      {children}
      <span className="ml-2">›</span>
    </div>
  )
}

// Content inside the submenu
interface DropdownMenuSubContentProps {
  children: ReactNode
  className?: string
}

export function DropdownMenuSubContent({ children, className = "" }: DropdownMenuSubContentProps) {
  const context = useContext(DropdownContext)
  if (!context) throw new Error("DropdownMenuSubContent must be used within DropdownMenuSub")

  if (!context.open) return null

  return (
    <div
      className={`absolute left-full top-0 ml-1 w-48 rounded-md border border-zinc-200 bg-zinc-100 shadow-lg ${className}`}
    >
      <div className="py-1">{children}</div>
    </div>
  )
}
