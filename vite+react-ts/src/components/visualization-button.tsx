"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface VisualizationButtonProps {
  onMenuAction: (action: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function VisualizationButton({
  onMenuAction,
  open,
  onOpenChange,
}: VisualizationButtonProps) {
  const navigate = useNavigate();

  const handleGraph3D = () => {
    // Sample graph data
    const sampleData = {
      nodes: [
        { id: "A", name: "Node A", group: 1 },
        { id: "B", name: "Node B", group: 1 },
        { id: "C", name: "Node C", group: 2 },
        { id: "D", name: "Node D", group: 2 },
      ],
      links: [
        { source: "A", target: "B", value: 1 },
        { source: "B", target: "C", value: 2 },
        { source: "C", target: "D", value: 1 },
      ],
    };

    try {
      // Navigate and pass data using state
      navigate("/graph3d", { state: { graphData: sampleData } });
    } catch (error) {
      console.error("Navigation to 3D graph failed:", error);
    }
  };



  const handleGraph2D = () => {
    // Sample graph data
    const sampleData = {
      nodes: [
        { id: "A", name: "Node A", group: 1 },
        { id: "B", name: "Node B", group: 1 },
        { id: "C", name: "Node C", group: 2 },
        { id: "D", name: "Node D", group: 2 },
      ],
      links: [
        { source: "A", target: "B", value: 1 },
        { source: "B", target: "C", value: 2 },
        { source: "C", target: "D", value: 1 },
      ],
    };

    try {
      // Navigate and pass data using state
      navigate("/graph2d", { state: { graphData: sampleData } });
    } catch (error) {
      console.error("Navigation to 2D graph failed:", error);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-100 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg border border-purple-500/50 shadow-lg shadow-purple-500/20 transition-all duration-200 hover:shadow-purple-500/40">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Visualization
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Show Graph</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={handleGraph2D}>
              Graph in 2D
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleGraph3D}>
              Graph in 3D
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Show Table</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onMenuAction("show-table-scatter")}>
              Scatter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMenuAction("show-table-pie")}>
              Pie
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onMenuAction("show-table-histogram")}
            >
              Histogram
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
