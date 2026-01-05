"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface MenuItem {
  label: string
  action: () => void
}

interface MenuDropdownProps {
  label: string
  items: MenuItem[]
}

export function MenuDropdown({ label, items }: MenuDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Wrapping with a div to apply className */}
        <div className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
          {label}
          <ChevronDown className="h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-zinc-900 border-zinc-800 shadow-xl">
        {items.map((item, index) => (
          <div key={index}>
            <DropdownMenuItem
              onClick={item.action}
              className="text-zinc-300 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              {item.label}
            </DropdownMenuItem>
            {index < items.length - 1 && <DropdownMenuSeparator className="bg-zinc-800" />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
