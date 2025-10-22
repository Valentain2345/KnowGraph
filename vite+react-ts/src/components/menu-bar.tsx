"use client";

import { useState } from "react";
import { VisualizationButton } from "./visualization-button";
import { DataButton } from "./data-button";
import { HelpButton } from "./help-button";
import { ModelsButton } from "./models-button";

interface MenuBarProps {
  onMenuAction: (action: string) => void;
  zIndex: number; // Accepting zIndex prop here
}

export function MenuBar({ onMenuAction, zIndex }: MenuBarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div
      className="flex items-center gap-6 px-6 py-3 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm"
      style={{ zIndex }} // Applying zIndex prop to the MenuBar container
    >
      <div className="flex items-center gap-2 mr-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">KG</span>
        </div>
        <span className="text-sm font-semibold text-zinc-100">KnowGraph</span>
      </div>

      <div className="flex items-center gap-3">
        <VisualizationButton
          onMenuAction={onMenuAction}
          open={openMenu === "visualization"}
          onOpenChange={(open) => setOpenMenu(open ? "visualization" : null)}
          zIndex={zIndex + 1} // Ensure dropdowns are above the menu bar
        />
        <DataButton
          onMenuAction={onMenuAction}
          open={openMenu === "data"}
          onOpenChange={(open) => setOpenMenu(open ? "data" : null)}
          zIndex={zIndex + 1}
        />
        <ModelsButton
          onMenuAction={onMenuAction}
          open={openMenu === "Models"}
          onOpenChange={(open) => setOpenMenu(open ? "Models" : null)}
          zIndex={zIndex + 1}
        />
        <HelpButton
          onMenuAction={onMenuAction}
          open={openMenu === "help"}
          onOpenChange={(open) => setOpenMenu(open ? "help" : null)}
          zIndex={zIndex + 1}
        />
      </div>
    </div>
  );
}
