import { useState } from "react";
import styled from "styled-components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Sparkles, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface Dataset {
  id: string;
  type: "default" | "named";
  uri: string;
}

interface DatasetManagerProps {
  datasets: Dataset[];
  setDatasets: React.Dispatch<React.SetStateAction<Dataset[]>>;
}

// Styled components
const DatasetCard = styled(Card)`
  background: rgba(255, 255, 255, 0.8); /* Light background with slight transparency */
  border: 1px solid #e2e8f0; /* Light border for a clean look */
  border-radius: 0.5rem; /* Rounded corners */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Light shadow for depth */
`;


const DatasetHeader = styled(CardHeader)`
  padding-bottom: 0.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #f9fafb; /* Light header background */
  border-bottom: 1px solid #e2e8f0; /* Subtle border at the bottom */
`;

const DatasetContent = styled(CardContent)`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #ffffff; /* White background for content */
  border-radius: 0.5rem; /* Rounded corners for content */
`;
const TableContainer = styled.div`
  position: relative;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 #f9fafb;

  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #e2e8f0;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: #f9fafb;
  }
`;
const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 3fr 8fr 1fr;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f3f4f6; /* Light background for table header */
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
`;
const TableRow = styled.div`
  display: grid;
  grid-template-columns: 3fr 8fr 1fr;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #fafafa; /* Light background for table rows */
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  transition: background-color 0.3s ease-in-out;

  &:hover {
    background: #f3f4f6; /* Slightly darker background on hover */
  }
`;

const ScrollShadowLeft = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 1rem;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.5), transparent);
  pointer-events: none;
`;
const ScrollShadowRight = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 1rem;
  background: linear-gradient(to left, rgba(255, 255, 255, 0.5), transparent);
  pointer-events: none;
`;
const AddButton = styled(Button)`
  width: 100%;
  border: 1px solid #e2e8f0;
  color: #333333; /* Dark text color for contrast */
  background: transparent;
  height: 2.25rem;
  border-radius: 0.5rem;

  &:hover {
    background: #f3f4f6;
  }

  &:active {
    transform: scale(0.98); /* Subtle scale effect on click */
  }
`;

export function DatasetManager({ datasets, setDatasets }: DatasetManagerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const addDataset = () => {
    setDatasets([
      ...datasets,
      {
        id: Date.now().toString(),
                type: "default",
                uri: "",
      },
    ]);
  };

  const updateDataset = (id: string, field: keyof Dataset, value: string) => {
    setDatasets(datasets.map((dataset) => (dataset.id === id ? { ...dataset, [field]: value } : dataset)));
  };

  const deleteDataset = (id: string) => {
    setDatasets(datasets.filter((dataset) => dataset.id !== id));
  };

  return (
    <DatasetCard className="bg-white border border-zinc-200 shadow-lg rounded-lg">
  <DatasetHeader className="bg-white pb-3 flex justify-between items-center rounded-t-lg">
    <div>
      <CardTitle className="text-zinc-900 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-emerald-500" />
        Dataset Management
      </CardTitle>
      <CardDescription className="text-zinc-600">
        Specify default and named graphs for your SPARQL query
      </CardDescription>
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsCollapsed(!isCollapsed)}
      className="text-zinc-600 hover:text-zinc-900"
    >
      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
    </Button>
  </DatasetHeader>

  {!isCollapsed && (
    <DatasetContent className="space-y-4 bg-zinc-50 rounded-b-lg ">
      <TableContainer className="overflow-x-auto bg-white rounded-lg">
        <TableHeader className="bg-zinc-200 border-b border-zinc-200 rounded-t-lg">
          <Label className="text-sm text-zinc-700 font-medium">Graph Type</Label>
          <Label className="text-sm text-zinc-700 font-medium">Graph URI</Label>
          <Label className="text-sm text-zinc-700 font-medium text-center">Actions</Label>
        </TableHeader>

        <div style={{ maxHeight: "12rem", overflowY: "auto", paddingRight: "0.5rem" }}>
          {datasets.map((dataset) => (
            <TableRow
              key={dataset.id}
              className="bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 rounded-lg"
            >
              <Select
                value={dataset.type}
                onValueChange={(value) => updateDataset(dataset.id, "type", value)}
              >
               <SelectTrigger className="bg-zinc-100 border-zinc-300 text-zinc-900 text-sm h-8 hover:bg-zinc-200">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-100 border-zinc-300">
                  <SelectItem value="default" className="text-zinc-900 h-8 hover:bg-zinc-200"  >Default Graph</SelectItem>
                  <SelectItem value="named" className="text-zinc-900 h-8 hover:bg-zinc-200">Named Graph</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="e.g., http://example.com/graph"
                value={dataset.uri}
                onChange={(e) => updateDataset(dataset.id, "uri", e.target.value)}
                className="bg-zinc-100 border-zinc-300 text-zinc-900 text-sm h-8"
              />
             <div className="flex items-center justify-center">
              <Button
                variant="ghost"
                size="default"
                onClick={() => deleteDataset(dataset.id)}
                className="h-12 w-12 text-white bg-red-300 hover:bg-red-400 border-1 border-red-400 rounded-full shadow-md hover:scale-105 transition-all duration-150 ease-in-out"
              >
                 <Trash2 className="w-8 h-8 text-white" />
              </Button>
            </div>
            </TableRow>
          ))}
        </div>

        <ScrollShadowLeft />
        <ScrollShadowRight />
      </TableContainer>

      <AddButton
        onClick={addDataset}
        className="border-zinc-300 text-zinc-800 hover:bg-zinc-100 rounded-lg"
      >
        <Plus className="mr-2 w-4 h-4" /> Add Dataset
      </AddButton>
    </DatasetContent>
  )}
</DatasetCard>

  );
}
