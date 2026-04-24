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
import  {DimReductionSelector}  from "./visuals-selector";


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

interface VisualsParamsOut {
  jobId:string
   method: 'umap' | 'tsne' | 'pca';
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
  const visualizerUrl = import.meta.env.VITE_VISUALIZER_URL

  // ---------- Graph building state ----------
  const [showSelector, setShowSelector] = useState(false);
  const [graphData, setGraphData] = useState<GraphOutput >({
  nodes: [],
  links: [],
});
  const [pendingAction, setPendingAction] = useState<PendingGraphAction>(null);
  const [showVisualSelector,setShowVisualSelector]=useState(false);
  const [selectedMethod,setSelectedMethod]=useState<'umap'| 'tsne' | 'pca' >('umap')
  const [jobId,setJobId]=useState<string>('')
  // ---------- Selector callbacks ----------
  const handleComplete = (config: GraphOutput) => {
    setGraphData(config);
    setShowSelector(false);

    if (pendingAction === "graph2d") {
        navigate("/graph2d", { state: { graphData: config } });
    } else if (pendingAction === "graph3d") {
        navigate("/graph3d", { state: { graphData: config } });
    }
    setPendingAction(null);
  };


  const handleCancel = () => {
    setShowSelector(false);
    setPendingAction(null);
  }

  const isGraphDataEmpty = () => {
  return graphData.nodes.length === 0 && graphData.links.length === 0;
};

  // ---------- Open the builder ----------
  const openGraphBuilder = () => setShowSelector(true);

  // ---------- Helper: ensure a graph exists ----------
  const ensureGraph = (next: () => void, actionType: PendingGraphAction) => {
    if (!isGraphDataEmpty) {
      next(); // graph already built → go straight to the view
    } else {
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

// ---------- Upload: always expects a CSV string ----------
const uploadCsvData = async (csvString: string): Promise<string> => {
  try {
    if (!csvString || csvString.trim() === '') {
      onMenuAction('No data to upload');
      return '';
    }

    const formData = new FormData();
    const blob = new Blob([csvString], { type: 'text/csv' });
    formData.append('csv', blob, 'data.csv');

    const response = await fetch(`${visualizerUrl}/upload`, {
      method: 'POST',
      body: formData,
    });


    if (response.ok) {
      const jsonResponse = await response.json();

      return jsonResponse.job_id as string;

    } else {
      onMenuAction('Upload failed');
      return '';
    }
  } catch (error) {
    onMenuAction('Error uploading the data');
    return '';
  }
};

// ---------- Helper: convert queryResults + selected variables to CSV ----------
const arrayToCSV = (array: Record<string, string>[], selectedVariables: string[]): string => {
  const header = selectedVariables.join(',');
  const rows = array.map((row) =>
    selectedVariables
      .map((varName) => {
        const value = row[varName] || '';
        // Escape quotes and wrap in double quotes if needed
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',')
  );
  return [header, ...rows].join('\n');
};

// ---------- Parse/filter queryResults based on selected variables ----------
const parseCSV = (queryResults: any[], selectedVariables: string[]): Record<string, string>[] => {
  return queryResults.map((row) => {
    const filteredRow: Record<string, string> = {};
    selectedVariables.forEach((varName) => {
      if (row[varName] !== undefined && row[varName] !== null) {
        filteredRow[varName] = String(row[varName]);
      }
    });
    return filteredRow;
  });
};

// ---------- Handle dimensionality reduction (UMAP, t‑SNE, PCA) ----------
const handleDimReductionRun = async (
  selectedVariables: string[],
  dims: number,
  method: "umap" | "tsne" | "pca",
) => {

  // Step 1: Filter the data to only selected variables
  const filteredData = parseCSV(queryResults, selectedVariables);


  // Step 2: Convert filtered data to CSV string
  const csvData = arrayToCSV(filteredData, selectedVariables);

  // Step 3: Upload only if no jobId yet or variables have changed
  let newJobId = jobId;
  newJobId = await uploadCsvData(csvData);
  setJobId(newJobId);


  // Step 4: Navigate to the appropriate visualisation view
  const visualsParams: VisualsParamsOut = { jobId: newJobId, method };
  if (dims === 2) {
    navigate("/visuals2d", { state: visualsParams });
  } else {
    navigate("/visuals3d", { state: visualsParams });
  }
};


  const handleShowVisualSelector = (method: 'umap' | 'tsne' | 'pca' ) => {
    setSelectedMethod(method)
    setShowVisualSelector(true)
  }



  // ---------- UI (Changes in how ensureGraph is called) ----------
  return (
    <>
      <DropdownMenu  open={open} onOpenChange={onOpenChange}>
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

        <DropdownMenuContent className="w-56 border border-zinc-200 shadow-md rounded-lg">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className=" text-zinc-900 font-medium">Graph</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className=" text-zinc-900 bg-white">
              <DropdownMenuItem className=" text-zinc-700" onClick={() => ensureGraph(handleGraph2D, "graph2d")}>
                Graph in 2D
              {isGraphDataEmpty() && <span className="ml-2 text-xs text-zinc-600">(build first)</span>}

              </DropdownMenuItem>

              <DropdownMenuItem className=" text-zinc-700" onClick={() => ensureGraph(handleGraph3D, "graph3d")}>
                Graph in 3D
                {isGraphDataEmpty() && <span className="ml-2 text-xs text-zinc-600">(build first)</span>}
              </DropdownMenuItem>

              <DropdownMenuItem className=" text-zinc-700" onClick={openGraphBuilder}>
                Build Custom Graph
              </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      {/* ---- Visuals Section ---- */}
      <DropdownMenuSub >
        <DropdownMenuSubTrigger className=" text-zinc-900 font-medium">Visuals</DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="text-zinc-900">
          <DropdownMenuItem onClick={() => handleShowVisualSelector('umap')}>UMAP</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShowVisualSelector('tsne')}>t-SNE</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShowVisualSelector('pca')}>PCA</DropdownMenuItem>
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
          initialGraph={graphData}
        />
      )}

      {showVisualSelector && (
         <DimReductionSelector
          variables={variables}
          method={selectedMethod}
          onCancel={() =>
            {
              setShowVisualSelector(false)

            }

          }
          onRun={handleDimReductionRun}
        />

      )}

    </>
  );
}
