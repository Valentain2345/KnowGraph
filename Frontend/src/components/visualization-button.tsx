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
  queryResponseRaw:string
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
  queryResponseRaw,
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
  const [oldVariables,setOldVariables]=useState<string[]>()
  // ---------- Selector callbacks ----------
  const handleComplete = (config: GraphOutput) => {
    setGraphData(config);
    setShowSelector(false);

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
    setPendingAction(null);
  }

  const isGraphDataEmpty = () => {
  return graphData.nodes.length === 0 && graphData.links.length === 0;
};

  // ---------- Open the builder ----------
  const openGraphBuilder = () => setShowSelector(true);

  // ---------- Helper: ensure a graph exists ----------
  // *** MODIFIED to accept the requested visualization type ***
  const ensureGraph = (next: () => void, actionType: PendingGraphAction) => {
    if (!isGraphDataEmpty) {
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

const uploadResultsToServer = async ():Promise<string> => {
  try {
    // Ensure there's valid raw CSV data to upload
    if (!queryResponseRaw || queryResponseRaw.trim() === '') {
      onMenuAction('No data to upload');
      return '';
    }

  // Create a FormData object to send the raw CSV as a file
    const formData = new FormData();
    const blob = new Blob([queryResponseRaw], { type: 'text/csv' });
    formData.append('csv', blob, 'data.csv');

    // Send the FormData object to the server
    const response = await fetch(`${visualizerUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    // Check if the response is successful
    if (response.ok) {
      const jsonResponse = await response.json();

      const newJobId = jsonResponse.job_id as string;
      return newJobId;
    } else {
      onMenuAction("Upload failed")
      return '';
    }
  } catch (error) {
    onMenuAction('Error uploading the data')
  }
  return '';
};

const uploadResultsToServerCustom = async (newCsvData: string):Promise<string> => {
  try {
    // Ensure there's valid raw CSV data to upload
    if (typeof newCsvData !== 'string' || newCsvData.trim() === '') {
      onMenuAction('No data to upload');
      return '';
    }

    // Create a FormData object to send the raw CSV as a file
    const formData = new FormData();
    const blob = new Blob([newCsvData], { type: 'text/csv' });
    formData.append('csv', blob, 'data.csv');

    // Send the FormData object to the server
    const response = await fetch(`${visualizerUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    // Check if the response is successful
    if (response.ok) {
      const jsonResponse = await response.json();
      const newJobId = jsonResponse.job_id as string;
      return newJobId;
    } else {
      onMenuAction('Upload failed')
      return '';
    }
  } catch (error) {
     onMenuAction('Error uploading the data')
  }
  return '';
};



const arrayToCSV = (array: Record<string, string>[], selectedVariables: string[]): string => {
  // Create header row based on selectedVariables
  const header = selectedVariables.join(',');

  // Create data rows based on the selectedVariables and object keys
  const rows = array.map((row) =>
    selectedVariables
      .map((varName) => `"${row[varName]}"`)
      .join(',')
  );

  return [header, ...rows].join('\n');
};

  // Callback to handle running the dimensionality reduction
  const handleDimReductionRun = async (
    selectedVariables: string[],
    dims: number,
    method: "umap" | "tsne" | "pca",
    isUpload: boolean
  ) => {
    let newJobId=jobId;
    if(!jobId || selectedVariables!==oldVariables ){
      if (isUpload) {
        newJobId= await uploadResultsToServer();
      } else {
          // Step 1: Filter the data based on selected variables
      const parsedData = parseCSV(queryResults, selectedVariables); // Filtered query results

      // Step 2: Convert the filtered data into CSV string
      const csvData = arrayToCSV(parsedData, selectedVariables);

      // Step 3: Upload the CSV data
       newJobId= await uploadResultsToServerCustom(csvData);
      }


    setJobId(newJobId);
    setOldVariables(selectedVariables);
    }
    const visualsParams: VisualsParamsOut = { jobId:newJobId, method };


     if (dims === 2) {
        navigate("/visuals2d", { state: visualsParams });

      } else {
        navigate("/visuals3d", { state: visualsParams });
      }


  };

  // Function to parse CSV using selected variables
const parseCSV = (queryResults: any[], selectedVariables: string[]): Record<string, string>[] => {
  return queryResults.map((row) => {
    const filteredRow: Record<string, string> = {};
    selectedVariables.forEach((varName) => {
      if (row[varName]) {
        filteredRow[varName] = row[varName];
      }
    });
    return filteredRow;
  });
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
          onCancel={() => setShowVisualSelector(false)}
          onRun={handleDimReductionRun}
        />

      )}

    </>
  );
}
