import { useState } from "react";
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
import { GraphVariableSelector } from "./graph-selector";

interface VisualizationButtonProps {
  onMenuAction: (action: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variables: string[];
  queryResults: Array<Record<string, string>>;
}
interface GraphOutput {
  nodes: Array<{
    id: string;
    name: string;
    val: number;
  }>;
  links: Array<{
    source: string;
    target: string;
    label?: string;
  }>;
}

// Define possible pending actions for clarity
type PendingGraphAction = "graph2d" | "graph3d" | null;

export function VisualizationButton({
  onMenuAction,
  open,
  onOpenChange,
  variables,
  queryResults,
}: VisualizationButtonProps) {
  const navigate = useNavigate();

  // ---------- Graph building state ----------
  const [showSelector, setShowSelector] = useState(false);
  const [graphData, setGraphData] = useState<GraphOutput | null>(null);

  // *** NEW STATE ***
  const [pendingAction, setPendingAction] = useState<PendingGraphAction>(null);

  // ---------- Selector callbacks ----------
  const handleComplete = (config: GraphOutput) => {
    setGraphData(config);
    setShowSelector(false);
    console.log("Graph built:", config);

    // *** NEW LOGIC: Check for and execute a pending action ***
    if (pendingAction === "graph2d") {
        navigate("/graph2d", { state: { graphData: config } });
    } else if (pendingAction === "graph3d") {
        navigate("/graph3d", { state: { graphData: config } });
    }
    // Clear the action after execution
    setPendingAction(null);
  };

  const handleCancel = () => {
    setShowSelector(false);
    // *** NEW LOGIC: Clear the action on cancel
    setPendingAction(null);
  }

  // ---------- Open the builder ----------
  const openGraphBuilder = () => setShowSelector(true);

  // ---------- Helper: ensure a graph exists ----------
  // *** MODIFIED to accept the requested visualization type ***
  const ensureGraph = (next: () => void, actionType: PendingGraphAction) => {
    if (graphData) {
      next(); // graph already built → go straight to the view
    } else {
      // No graph → store the requested action and force the user to build one
      setPendingAction(actionType);
      openGraphBuilder();
    }
  };

  // ---------- Navigation handlers (simplified) ----------
  const handleGraph3D = () => {
    navigate("/graph3d", { state: { graphData } });
  };

  const handleGraph2D = () => {
    navigate("/graph2d", { state: { graphData } });
  };

  // ---------- UI (Changes in how ensureGraph is called) ----------
  return (
    <>
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-100 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg border border-purple-500/50 shadow-lg shadow-purple-500/20 transition-all duration-200 hover:shadow-purple-500/40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Visualization
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56">
          {/* ---- Graph Section ---- */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Graph</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {/* *** MODIFIED CALL: Pass "graph2d" as the pending action type *** */}
              <DropdownMenuItem onClick={() => ensureGraph(handleGraph2D, "graph2d")}>
                Graph in 2D
                {!graphData && <span className="ml-2 text-xs text-gray-400">(build first)</span>}
              </DropdownMenuItem>

              {/* *** MODIFIED CALL: Pass "graph3d" as the pending action type *** */}
              <DropdownMenuItem
                onClick={() => ensureGraph(handleGraph3D, "graph3d")}
                // Note: I removed the `disabled={showSelector}` as the new logic handles pending action gracefully
              >
                Graph in 3D
                {!graphData && <span className="ml-2 text-xs text-gray-400">(build first)</span>}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={openGraphBuilder}>
                Build Custom Graph
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* ---- Visuals Section ---- */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Visuals</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onMenuAction("show-umap")}>UMAP</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMenuAction("show-tsne")}>t-SNE</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMenuAction("show-pca")}>PCA</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* ---- Tables Section ---- */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Tables</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onMenuAction("show-table-scatter")}>Scatter</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMenuAction("show-table-pie")}>Pie</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMenuAction("show-table-histogram")}>Histogram</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ---- Graph Builder Modal ---- */}
      {showSelector && (
        <GraphVariableSelector
          variables={variables}
          queryResults={queryResults}
          onComplete={handleComplete}
          onCancel={handleCancel}
          // Optionally pass the current graph so the selector can pre-fill it
          initialGraph={graphData}
        />
      )}
    </>
  );
}
