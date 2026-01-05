"use client";

import { useState } from "react";
import { VisualizationButton } from "./visualization-button";
import { DataButton } from "./data-button";
import { HelpButton } from "./help-button";
import { ModelsButton } from "./models-button";
import { useNavigate } from "react-router-dom";

interface MenuBarProps {

  zIndex: number;
  variables: string[];
  queryResults: Array<Record<string, string>>;
  queryResponseRaw:string;
  setQuery:React.Dispatch<React.SetStateAction<string>>;
   onMenuAction: (action: string) => void;
}

export function MenuBar({ onMenuAction, zIndex,variables,queryResults,queryResponseRaw  ,setQuery }: MenuBarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
   const navigate = useNavigate();

   const handleHome= ()=>{
     navigate("/")
  }

  return (
      <div
      className="flex items-center gap-6 px-6 py-3 border-b border-zinc-200 bg-white backdrop-blur-sm"
      style={{ zIndex }}
    >
      <div className="flex items-center gap-2 mr-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm" onClick={handleHome}>KG</span>
        </div>
        <span className="text-sm font-semibold text-zinc-900">KnowGraph</span>
      </div>

      <div className="flex items-center gap-3">
        <VisualizationButton
          onMenuAction={onMenuAction}
          open={openMenu === "visualization"}
          onOpenChange={(open) => setOpenMenu(open ? "visualization" : null)}

          variables={variables}
          queryResults={queryResults}
          queryResponseRaw={queryResponseRaw}
        />
        <DataButton
          onMenuAction={onMenuAction}
          open={openMenu === "data"}
          onOpenChange={(open) => setOpenMenu(open ? "data" : null)}

        />
        <ModelsButton
          onMenuAction={onMenuAction}
          open={openMenu === "Models"}
          onOpenChange={(open) => setOpenMenu(open ? "Models" : null)}
        />
        <HelpButton
          onMenuAction={onMenuAction}
          open={openMenu === "help"}
          onOpenChange={(open) => setOpenMenu(open ? "help" : null)}
          setQuery={setQuery}
        />
      </div>
    </div>
  );
}
